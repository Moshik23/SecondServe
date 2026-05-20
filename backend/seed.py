"""
Seed script to populate database with demo data
Run this after starting the backend
"""

from database import SessionLocal, engine, Base
from models import User, Product
from auth import get_password_hash
from datetime import datetime, timedelta
import bcrypt

def seed_database():
    db = SessionLocal()
    
    try:
        # Create tables
        Base.metadata.create_all(bind=engine)
        
        # Check if demo users already exist
        vendor = db.query(User).filter(User.email == "vendor@demo.com").first()
        customer = db.query(User).filter(User.email == "customer@demo.com").first()
        
        # Use a simpler password hash for compatibility
        demo_password_hash = bcrypt.hashpw("demo123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        if not vendor:
            vendor = User(
                email="vendor@demo.com",
                name="Demo Hawker",
                hashed_password=demo_password_hash,
                role="vendor",
                location='{"lat": 1.3521, "lng": 103.8198}',
                created_at=datetime.utcnow()
            )
            db.add(vendor)
            print("Created vendor user")
        else:
            print("Vendor user already exists")
        
        if not customer:
            customer = User(
                email="customer@demo.com",
                name="Demo Customer",
                hashed_password=demo_password_hash,
                role="customer",
                location='{"lat": 1.3521, "lng": 103.8198}',
                created_at=datetime.utcnow()
            )
            db.add(customer)
            print("Created customer user")
        else:
            print("Customer user already exists")
        
        db.commit()
        
        # Refresh to get IDs
        db.refresh(vendor)
        
        # Check if products already exist
        existing_products = db.query(Product).filter(Product.vendor_id == vendor.id).count()
        if existing_products == 0:
            # Create demo products
            products = [
                {
                    'name': 'Chicken Rice',
                    'description': 'Authentic Singaporean chicken rice with fragrant rice and tender chicken',
                    'category': 'Main Course',
                    'original_quantity': 20,
                    'stock': 15,
                    'original_price': 6.00,
                    'price': 6.00,
                    'discount_percentage': 0,
                    'expiry_date': datetime.utcnow() + timedelta(hours=24),
                    'vendor_id': vendor.id
                },
                {
                    'name': 'Laksa',
                    'description': 'Spicy coconut noodle soup with seafood',
                    'category': 'Noodles',
                    'original_quantity': 15,
                    'stock': 12,
                    'original_price': 8.00,
                    'price': 7.20,
                    'discount_percentage': 10,
                    'expiry_date': datetime.utcnow() + timedelta(hours=18),
                    'vendor_id': vendor.id
                },
                {
                    'name': 'Char Kway Teow',
                    'description': 'Stir-fried noodles with cockles and Chinese sausage',
                    'category': 'Noodles',
                    'original_quantity': 10,
                    'stock': 8,
                    'original_price': 7.00,
                    'price': 5.25,
                    'discount_percentage': 25,
                    'expiry_date': datetime.utcnow() + timedelta(hours=12),
                    'vendor_id': vendor.id
                },
                {
                    'name': 'Roti Prata',
                    'description': 'Crispy flatbread with curry dipping sauce',
                    'category': 'Snacks',
                    'original_quantity': 25,
                    'stock': 20,
                    'original_price': 2.00,
                    'price': 1.20,
                    'discount_percentage': 40,
                    'expiry_date': datetime.utcnow() + timedelta(hours=8),
                    'vendor_id': vendor.id
                },
                {
                    'name': 'Nasi Lemak',
                    'description': 'Coconut rice with sambal, fried egg, and anchovies',
                    'category': 'Main Course',
                    'original_quantity': 12,
                    'stock': 10,
                    'original_price': 5.00,
                    'price': 2.50,
                    'discount_percentage': 50,
                    'expiry_date': datetime.utcnow() + timedelta(hours=6),
                    'vendor_id': vendor.id
                }
            ]
            
            for product_data in products:
                product = Product(**product_data)
                db.add(product)
            
            db.commit()
            print(f"Created {len(products)} demo products")
        else:
            print(f"Products already exist ({existing_products} products)")
        
        print("\n✅ Database seeded successfully!")
        print("\nDemo accounts:")
        print("  Vendor: vendor@demo.com / demo123")
        print("  Customer: customer@demo.com / demo123")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
