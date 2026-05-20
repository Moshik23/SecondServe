from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Product
import asyncio
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PricingEngine:
    """
    Smart pricing engine that auto-discounts food nearing expiry
    to maximize sales and minimize waste.
    """
    
    def __init__(self):
        self.check_interval = 300  # Check every 5 minutes
    
    async def run_dynamic_pricing(self):
        """Background task to continuously update prices based on expiry"""
        while True:
            try:
                await self.update_prices()
                await asyncio.sleep(self.check_interval)
            except Exception as e:
                logger.error(f"Error in pricing engine: {e}")
                await asyncio.sleep(self.check_interval)
    
    async def update_prices(self):
        """Update prices based on time to expiry"""
        db = SessionLocal()
        try:
            products = db.query(Product).filter(
                Product.stock > 0,
                Product.expiry_date.isnot(None)
            ).all()
            
            for product in products:
                new_price, discount = self.calculate_discount(product)
                
                if discount != product.discount_percentage:
                    product.price = new_price
                    product.discount_percentage = discount
                    logger.info(
                        f"Updated price for {product.name}: "
                        f"${new_price:.2f} ({discount:.0f}% discount)"
                    )
            
            db.commit()
            logger.info(f"Updated prices for {len(products)} products")
            
        finally:
            db.close()
    
    def calculate_discount(self, product: Product) -> tuple:
        """
        Calculate discount based on time to expiry.
        Returns: (new_price, discount_percentage)
        """
        if not product.expiry_date:
            return product.original_price, 0
        
        time_to_expiry = product.expiry_date - datetime.utcnow()
        hours_remaining = time_to_expiry.total_seconds() / 3600
        
        # Discount tiers
        if hours_remaining > 48:
            discount = 0
        elif hours_remaining > 24:
            discount = 10  # 10% discount
        elif hours_remaining > 12:
            discount = 25  # 25% discount
        elif hours_remaining > 6:
            discount = 40  # 40% discount
        elif hours_remaining > 3:
            discount = 50  # 50% discount
        elif hours_remaining > 1:
            discount = 60  # 60% discount
        else:
            discount = 70  # 70% discount (near expiry)
        
        new_price = product.original_price * (1 - discount / 100)
        return round(new_price, 2), discount

# Singleton instance
pricing_engine = PricingEngine()
