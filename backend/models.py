from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="customer")  # vendor, customer, admin
    location = Column(String)  # JSON string with lat, lng
    created_at = Column(DateTime, default=datetime.utcnow)
    
    products = relationship("Product", back_populates="vendor")
    orders = relationship("Order", back_populates="user")

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String)
    original_quantity = Column(Integer, default=0)
    stock = Column(Integer, default=0)
    original_price = Column(Float, default=0.0)
    price = Column(Float, default=0.0)
    discount_percentage = Column(Float, default=0.0)
    expiry_date = Column(DateTime)
    image_url = Column(String)
    vendor_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    vendor = relationship("User", back_populates="products")
    orders = relationship("Order", back_populates="product")

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, default=1)
    total_price = Column(Float, default=0.0)
    status = Column(String, default="pending")  # pending, confirmed, completed, cancelled
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="orders")
    product = relationship("Product", back_populates="orders")
