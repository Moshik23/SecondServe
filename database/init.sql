-- Initialize database with demo data
-- This file is used for PostgreSQL initialization

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insert demo users (passwords are hashed with bcrypt)
-- For demo: vendor@demo.com / demo123, customer@demo.com / demo123
INSERT INTO users (email, name, hashed_password, role, location, created_at) VALUES
('vendor@demo.com', 'Demo Hawker', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7bG8BGyJ6e', 'vendor', '{"lat": 1.3521, "lng": 103.8198}', NOW()),
('customer@demo.com', 'Demo Customer', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7bG8BGyJ6e', 'customer', '{"lat": 1.3521, "lng": 103.8198}', NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert demo products
INSERT INTO products (name, description, category, original_quantity, stock, original_price, price, discount_percentage, expiry_date, vendor_id, created_at, updated_at) VALUES
('Chicken Rice', 'Authentic Singaporean chicken rice with fragrant rice and tender chicken', 'Main Course', 20, 15, 6.00, 6.00, 0, NOW() + INTERVAL '24 hours', 1, NOW(), NOW()),
('Laksa', 'Spicy coconut noodle soup with seafood', 'Noodles', 15, 12, 8.00, 7.20, 10, NOW() + INTERVAL '18 hours', 1, NOW(), NOW()),
('Char Kway Teow', 'Stir-fried noodles with cockles and Chinese sausage', 'Noodles', 10, 8, 7.00, 5.25, 25, NOW() + INTERVAL '12 hours', 1, NOW(), NOW()),
('Roti Prata', 'Crispy flatbread with curry dipping sauce', 'Snacks', 25, 20, 2.00, 1.20, 40, NOW() + INTERVAL '8 hours', 1, NOW(), NOW()),
('Nasi Lemak', 'Coconut rice with sambal, fried egg, and anchovies', 'Main Course', 12, 10, 5.00, 2.50, 50, NOW() + INTERVAL '6 hours', 1, NOW(), NOW())
ON CONFLICT DO NOTHING;
