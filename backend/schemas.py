from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str = "customer"
    location: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    original_quantity: int = 0
    stock: int = 0
    price: float
    expiry_date: Optional[datetime] = None
    image_url: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    vendor_id: int
    original_price: float
    discount_percentage: float
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    product_id: int
    quantity: int = 1

class OrderCreate(OrderBase):
    pass

class OrderResponse(OrderBase):
    id: int
    user_id: int
    total_price: float
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
