from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
import json
import asyncio
from typing import List
import uvicorn

from database import get_db, engine, Base
from models import User, Product, Order
from schemas import (
    UserCreate, UserLogin, UserResponse, ProductCreate, 
    ProductResponse, OrderCreate, OrderResponse
)
from auth import create_access_token, verify_token, get_password_hash, verify_password
from pricing_engine import PricingEngine
from websocket_manager import ConnectionManager

# Lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown
    pass

app = FastAPI(
    title="FoodHawk Platform API",
    description="Cloud-native food waste reduction platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket connection manager
manager = ConnectionManager()
pricing_engine = PricingEngine()

# Background task for dynamic pricing
@app.on_event("startup")
async def start_pricing_engine():
    asyncio.create_task(pricing_engine.run_dynamic_pricing())

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Auth endpoints
@app.post("/api/auth/register", response_model=UserResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        name=user.name,
        hashed_password=hashed_password,
        role=user.role,
        location=user.location
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@app.post("/api/auth/login")
async def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": db_user.email, "role": db_user.role})
    return {"access_token": access_token, "token_type": "bearer", "user": UserResponse.from_orm(db_user)}

# Product endpoints
@app.get("/api/products", response_model=List[ProductResponse])
async def get_products(db: Session = Depends(get_db), skip: int = 0, limit: int = 50):
    products = db.query(Product).filter(Product.stock > 0).offset(skip).limit(limit).all()
    return products

@app.get("/api/products/nearby", response_model=List[ProductResponse])
async def get_nearby_products(
    lat: float, 
    lng: float, 
    radius: float = 5.0,
    db: Session = Depends(get_db)
):
    # Simplified nearby search (in production, use PostGIS)
    products = db.query(Product).filter(Product.stock > 0).all()
    # Filter by distance (simplified)
    nearby = [p for p in products if p.vendor and p.vendor.location]
    return nearby[:20]

@app.get("/api/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.post("/api/products", response_model=ProductResponse)
async def create_product(
    product: ProductCreate, 
    current_user: User = Depends(verify_token),
    db: Session = Depends(get_db)
):
    if current_user.role != "vendor":
        raise HTTPException(status_code=403, detail="Only vendors can create products")
    
    db_product = Product(
        **product.dict(),
        vendor_id=current_user.id,
        original_price=product.price,
        discount_percentage=0
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    # Notify WebSocket clients
    await manager.broadcast(json.dumps({"type": "product_created", "product": ProductResponse.from_orm(db_product).dict()}))
    
    return db_product

@app.put("/api/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product: ProductCreate,
    current_user: User = Depends(verify_token),
    db: Session = Depends(get_db)
):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    if db_product.vendor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your product")
    
    for key, value in product.dict().items():
        setattr(db_product, key, value)
    
    db.commit()
    db.refresh(db_product)
    
    # Notify WebSocket clients
    await manager.broadcast(json.dumps({"type": "product_updated", "product": ProductResponse.from_orm(db_product).dict()}))
    
    return db_product

@app.delete("/api/products/{product_id}")
async def delete_product(
    product_id: int,
    current_user: User = Depends(verify_token),
    db: Session = Depends(get_db)
):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    if db_product.vendor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your product")
    
    db.delete(db_product)
    db.commit()
    
    await manager.broadcast(json.dumps({"type": "product_deleted", "product_id": product_id}))
    
    return {"message": "Product deleted"}

# Order endpoints
@app.post("/api/orders", response_model=OrderResponse)
async def create_order(
    order: OrderCreate,
    current_user: User = Depends(verify_token),
    db: Session = Depends(get_db)
):
    # Check stock
    product = db.query(Product).filter(Product.id == order.product_id).first()
    if not product or product.stock < order.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    # Update stock
    product.stock -= order.quantity
    
    # Create order
    db_order = Order(
        **order.dict(),
        user_id=current_user.id,
        total_price=product.price * order.quantity,
        status="pending"
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    # Notify WebSocket clients
    await manager.broadcast(json.dumps({
        "type": "order_created",
        "order": OrderResponse.from_orm(db_order).dict()
    }))
    
    return db_order

@app.get("/api/orders", response_model=List[OrderResponse])
async def get_orders(
    current_user: User = Depends(verify_token),
    db: Session = Depends(get_db)
):
    if current_user.role == "vendor":
        orders = db.query(Order).join(Product).filter(Product.vendor_id == current_user.id).all()
    else:
        orders = db.query(Order).filter(Order.user_id == current_user.id).all()
    return orders

@app.put("/api/orders/{order_id}/status")
async def update_order_status(
    order_id: int,
    status: str,
    current_user: User = Depends(verify_token),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if current_user.role == "vendor":
        product = db.query(Product).filter(Product.id == order.product_id).first()
        if product.vendor_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not your order")
    elif current_user.role == "customer":
        if order.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not your order")
    
    order.status = status
    db.commit()
    
    await manager.broadcast(json.dumps({
        "type": "order_updated",
        "order_id": order_id,
        "status": status
    }))
    
    return {"message": "Order status updated"}

# WebSocket endpoint for real-time updates
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_personal_message(f"Received: {data}", websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Vendor dashboard analytics
@app.get("/api/vendor/analytics")
async def get_vendor_analytics(
    current_user: User = Depends(verify_token),
    db: Session = Depends(get_db)
):
    if current_user.role != "vendor":
        raise HTTPException(status_code=403, detail="Vendor access required")
    
    products = db.query(Product).filter(Product.vendor_id == current_user.id).all()
    orders = db.query(Order).join(Product).filter(Product.vendor_id == current_user.id).all()
    
    total_revenue = sum(o.total_price for o in orders if o.status == "completed")
    total_sales = len(orders)
    active_products = len([p for p in products if p.stock > 0])
    
    return {
        "total_revenue": total_revenue,
        "total_sales": total_sales,
        "active_products": active_products,
        "waste_prevented": sum(p.original_quantity - p.stock for p in products)
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
