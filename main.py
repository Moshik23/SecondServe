# ================================================================================
# PRODUCTION BACKEND SOURCE CODE: MAIN.PY
# TARGET LOCATION: REPOSITORY ROOT PATH (dev-containerization BRANCH)
# PROJECT TARGET: SECONDSERVE SURPLUS RECOVERY ENGINE (FULL STACK)
# COMPLIANCE STANDARD: RULE6FIST MANDATORY FULL RECODE DELIVERABLE
# ================================================================================

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
import pyodbc
import os

# Initialize the core FastAPI engine instance
app = FastAPI(
    title="SecondServe Core API",
    description="Cloud-Native Surplus Recovery Backend integrating Azure SQL",
    version="1.0.0"
)

# Configure cross-origin resource sharing to expose endpoints safely to the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection parameters derived directly from Phase 1 Infrastructure Runbook
DB_SERVER = "tcp:sqlserver-secondserve-3226.database.windows.net,1433"
DB_NAME = "db-secondserve"
DB_USER = "ssadmin"
DB_PASS = "SecurePassSecondServe2026!"
DRIVER = "{ODBC Driver 18 for SQL Server}"

class ProductCreateSchema(BaseModel):
    vendor_id: int = Field(..., description="The unique database ID of the registered hawker vendor", example=1)
    product_name: str = Field(..., max_length=150, description="The name of the surplus item being listed", example="Mutton Biryani")
    category: str = Field(..., max_length=100, description="Food category mapping classification", example="Meals")
    original_price: float = Field(..., gt=0.0, description="The original retail value of the food portion")
    discount_price: float = Field(..., ge=0.0, description="The reduced surplus price offered to customers")
    quantity_available: int = Field(..., gt=0, description="The total number of portions available for recovery")
    image_url: str = Field("/assets/default-food.jpg", max_length=500, description="Storage path for image visibility")

def get_db_connection():
    conn_str = f"DRIVER={DRIVER};SERVER={DB_SERVER};DATABASE={DB_NAME};UID={DB_USER};PWD={DB_PASS};Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;"
    return pyodbc.connect(conn_str)

# --------------------------------------------------------------------------------
# CORE BACKEND API ROUTES
# --------------------------------------------------------------------------------
@app.get("/api/v1/diagnostics/database")
def db_health_check():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        conn.close()
        return {"database_status": "connected", "message": "Successfully authenticated with db-secondserve"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/products")
def get_active_products():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT p.ProductID, p.ProductName, p.CurrentDiscountPrice, p.QuantityAvailable, v.StallLocation 
            FROM Products p
            JOIN Vendors v ON p.VendorID = v.VendorID
            WHERE p.QuantityAvailable > 0
        """)
        rows = cursor.fetchall()
        
        products = []
        for row in rows:
            products.append({
                "ProductID": row.ProductID,
                "ProductName": row.ProductName,
                "DiscountPrice": float(row.CurrentDiscountPrice),
                "Quantity": row.QuantityAvailable,
                "Location": row.StallLocation
            })
        conn.close()
        return {"status": "success", "data": products}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/products", status_code=status.HTTP_201_CREATED)
def create_surplus_listing(payload: ProductCreateSchema):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT VendorID FROM Vendors WHERE VendorID = ?", payload.vendor_id)
        vendor_exists = cursor.fetchone()
        if not vendor_exists:
            conn.close()
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Vendor validation failed: ID {payload.vendor_id} does not exist.")
        
        insert_query = """
            INSERT INTO Products (VendorID, ProductName, Category, OriginalPrice, CurrentDiscountPrice, QuantityAvailable, ImageUrl, CreatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, GETDATE())
        """
        
        cursor.execute(
            insert_query,
            payload.vendor_id,
            payload.product_name,
            payload.category,
            payload.original_price,
            payload.discount_price,
            payload.quantity_available,
            payload.image_url
        )
        
        conn.commit()
        conn.close()
        
        return {
            "status": "success",
            "message": "Surplus product record successfully injected into SecondServe Shelf",
            "item_details": {
                "product_name": payload.product_name,
                "quantity": payload.quantity_available,
                "discount_price": payload.discount_price
            }
        }
    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Critical transaction drop on Azure SQL: {str(e)}")

# --------------------------------------------------------------------------------
# FRONTEND MOUNTING LAYER
# --------------------------------------------------------------------------------
# This intercepts root traffic and serves the compiled React Webpack 'dist' folder
dist_path = os.path.join(os.path.dirname(__file__), "dist")
if os.path.exists(dist_path):
    app.mount("/", StaticFiles(directory=dist_path, html=True), name="frontend")
else:
    @app.get("/")
    def read_root():
        return {"status": "online", "project": "SecondServe", "message": "Backend active, awaiting React compilation layers."}
