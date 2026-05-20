# FoodHawk Platform - Demo Script

## Preparation Checklist

### Before the Demo
- [ ] Start Docker Compose: `docker-compose up -d`
- [ ] Verify backend is running: http://localhost:8000/health
- [ ] Verify frontend is accessible: http://localhost
- [ ] Clear browser cache
- [ ] Have demo accounts ready:
  - Vendor: vendor@demo.com / demo123
  - Customer: customer@demo.com / demo123
- [ ] Open browser tabs for:
  - Vendor dashboard
  - Customer app
  - API documentation (http://localhost:8000/docs)
  - Terminal with logs visible
- [ ] Prepare screenshots as backup

## Demo Script

### Part 1: Introduction (2 minutes)

**Speaker**: "Today I'll be demonstrating FoodHawk, a cloud-native platform that helps food hawkers reduce waste by selling surplus food at discounted prices."

**Actions**:
1. Show the landing page (login screen)
2. Highlight the modern, clean UI
3. Point out demo account credentials

**Speaker**: "The platform connects vendors who have surplus food with customers looking for affordable meals. Let me walk you through both user experiences."

---

### Part 2: Vendor Dashboard Demo (5 minutes)

#### Step 1: Vendor Login (30 seconds)

**Actions**:
1. Click on "Vendor: vendor@demo.com / demo123" button
2. Observe automatic login
3. Show vendor dashboard

**Speaker**: "I'm logging in as a vendor. Notice the clean dashboard with key metrics at the top: total revenue, total sales, active products, and waste prevented."

#### Step 2: Product Management (2 minutes)

**Actions**:
1. Click "Products" tab
2. Show existing products with stock levels and discounts
3. Click "Add Product"
4. Fill in form:
   - Name: "Hainanese Chicken Rice"
   - Description: "Authentic Singaporean chicken rice with fragrant rice and tender chicken"
   - Category: "Main Course"
   - Original Quantity: 20
   - Current Stock: 15
   - Price: 6.00
   - Expiry Date: Set to 6 hours from now
5. Click "Create"

**Speaker**: "Vendors can easily add surplus food listings. I'm adding chicken rice that expires in 6 hours. The system will automatically apply a 50% discount based on our dynamic pricing algorithm."

#### Step 3: Dynamic Pricing Demo (1 minute)

**Actions**:
1. Show the newly created product
2. Point out the discount badge (50%)
3. Explain the pricing tiers
4. Show the time-to-expiry indicator

**Speaker**: "Notice the 50% discount badge. Our smart pricing engine automatically increases discounts as food approaches expiry time. This incentivizes customers to buy soon-to-expire items, reducing waste."

#### Step 4: Real-time Updates (1 minute)

**Actions**:
1. Keep vendor dashboard open
2. Switch to customer tab (but don't login yet)
3. Explain WebSocket functionality

**Speaker**: "The platform uses WebSockets for real-time updates. When a customer places an order, vendors receive instant notifications. When prices change, customers see updates immediately."

#### Step 5: Orders Tab (30 seconds)

**Actions**:
1. Click "Orders" tab
2. Show order management interface
3. Explain order status workflow

**Speaker**: "Vendors can manage orders through this interface, confirming or completing orders as they come in."

---

### Part 3: Customer App Demo (5 minutes)

#### Step 1: Customer Login (30 seconds)

**Actions**:
1. Open new browser tab or incognito window
2. Navigate to http://localhost
3. Click "Customer: customer@demo.com / demo123"
4. Show customer home page

**Speaker**: "Now let me switch to the customer experience. Customers can browse nearby food deals and save money."

#### Step 2: Browse Products (2 minutes)

**Actions**:
1. Show product grid with food images
2. Point out discount badges
3. Click "Discounted" filter
4. Show only discounted items
5. Click on a product to see details
6. Show price comparison (original vs discounted)

**Speaker**: "Customers can browse all available food or filter for discounted items. Each product shows the discount percentage, stock level, and time to expiry. This chicken rice is 50% off!"

#### Step 3: Location-based Discovery (30 seconds)

**Actions**:
1. Point out "nearby" indicators
2. Explain location-based search
3. Show distance to vendors

**Speaker**: "The platform uses location-based discovery to show food from nearby vendors, making it convenient for customers to pick up their orders."

#### Step 4: Place Order (1.5 minutes)

**Actions**:
1. Click "Add to Cart" on a product
2. Show cart indicator updating
3. Navigate to "My Orders"
4. Show the newly placed order
5. Observe order status

**Speaker**: "Customers can easily add items to their cart and place orders. The order status is tracked in real-time."

#### Step 5: Real-time Notification (30 seconds)

**Actions**:
1. Switch back to vendor dashboard tab
2. Show the new order appearing
3. Click "Confirm" on the order
4. Switch back to customer tab
5. Show order status updated to "confirmed"

**Speaker**: "Notice how the order appears instantly in the vendor dashboard. I'll confirm it, and the customer sees the status update in real-time thanks to our WebSocket implementation."

---

### Part 4: Analytics Dashboard (2 minutes)

**Actions**:
1. Switch to vendor dashboard
2. Click "Analytics" tab
3. Show weekly sales chart
4. Show category distribution
5. Show key performance indicators

**Speaker**: "The analytics dashboard provides vendors with insights into their sales performance, helping them optimize their inventory and reduce waste further."

---

### Part 5: Technical Overview (3 minutes)

#### Step 1: API Documentation (1 minute)

**Actions**:
1. Open http://localhost:8000/docs in new tab
2. Show Swagger UI
3. Click on a few endpoints
4. Show request/response schemas
5. Try a GET request to /api/products

**Speaker**: "The backend is built with FastAPI, which automatically generates interactive API documentation. This makes it easy for developers to understand and test the API."

#### Step 2: Docker & Infrastructure (1 minute)

**Actions**:
1. Show terminal with docker-compose ps
2. Explain containerized services
3. Show Terraform files
4. Explain infrastructure as code

**Speaker**: "The entire application is containerized with Docker. We use Docker Compose for local development and Terraform for cloud deployment. This ensures consistency across environments."

#### Step 3: CI/CD Pipeline (1 minute)

**Actions**:
1. Show GitHub Actions workflow file
2. Explain the CI/CD stages
3. Show .github/workflows directory
4. Explain automated testing and deployment

**Speaker**: "Our CI/CD pipeline with GitHub Actions automates testing, building, and deployment. Every push triggers automated tests, and successful builds are deployed automatically."

---

### Part 6: Dynamic Pricing Deep Dive (2 minutes)

**Actions**:
1. Show pricing_engine.py code
2. Explain the discount algorithm
3. Show the background task implementation
4. Explain WebSocket broadcast

**Speaker**: "The dynamic pricing engine runs as a background task, checking product expiry times every 5 minutes. It applies discounts based on time-to-expiry and broadcasts updates via WebSocket to all connected clients."

**Show the pricing table**:
```
| Time to Expiry | Discount |
| > 48 hours     | 0%       |
| 24-48 hours    | 10%      |
| 12-24 hours    | 25%      |
| 6-12 hours     | 40%      |
| 3-6 hours      | 50%      |
| 1-3 hours      | 60%      |
| < 1 hour       | 70%      |
```

**Speaker**: "This tiered discount structure maximizes sales while ensuring food is sold before it expires."

---

### Part 7: Security & Architecture (2 minutes)

#### Step 1: Security Features (1 minute)

**Actions**:
1. Show auth.py code
2. Explain JWT authentication
3. Show password hashing
4. Explain RBAC (role-based access control)

**Speaker**: "Security is built in from the start. We use JWT tokens for authentication, bcrypt for password hashing, and role-based access control to ensure vendors can only manage their own products."

#### Step 2: Architecture Diagram (1 minute)

**Actions**:
1. Show docs/architecture.md
2. Explain the three-tier architecture
3. Point out data flow
4. Explain scalability considerations

**Speaker**: "The system follows a three-tier architecture with clear separation of concerns. This design enables horizontal scaling and maintainsability."

---

### Part 8: Deployment Options (2 minutes)

**Actions**:
1. Show docker-compose.yml
2. Explain local development setup
3. Show Terraform configuration
4. Explain cloud deployment to AWS
5. Mention free-tier alternatives (Render, Railway)

**Speaker**: "The platform can be deployed locally with Docker Compose, or to the cloud using Terraform. We've included configurations for AWS ECS, but it can also be deployed to free-tier platforms like Render or Railway for cost-effective hosting."

---

### Part 9: Summary & Q&A (2 minutes)

**Actions**:
1. Summarize key features
2. Highlight DevOps practices demonstrated
3. Mention future enhancements
4. Open for questions

**Speaker**: "To summarize, FoodHawk demonstrates:
- Full-stack cloud-native application development
- Real-time WebSocket implementation
- Dynamic pricing engine
- Automated CI/CD pipeline
- Infrastructure as Code with Terraform
- Container orchestration with Docker

This MVP shows how modern DevOps practices can be applied to solve real-world problems like food waste. The platform is scalable, maintainable, and ready for production deployment."

**Speaker**: "Are there any questions about the implementation, architecture, or deployment?"

---

## Backup Plans

### If Docker Compose Fails
1. Use screenshots prepared in advance
2. Focus on code walkthrough
3. Explain architecture without live demo
4. Show GitHub repository structure

### If Backend API Fails
1. Show API documentation screenshots
2. Explain endpoint design
3. Discuss data models
4. Focus on frontend demo with mock data

### If Frontend Fails
1. Show component code
2. Explain React architecture
3. Discuss state management
4. Focus on backend API demo

### If Real-time Features Don't Work
1. Explain WebSocket implementation
2. Show code for connection manager
3. Discuss use cases
4. Explain fallback to polling

### If Internet Connection Fails
1. Use local screenshots
2. Focus on code review
3. Discuss architecture offline
4. Explain deployment process

## Common Questions & Answers

**Q: How does the dynamic pricing handle edge cases?**
A: The pricing engine has safeguards for products without expiry dates (no discount applied) and uses transactions to ensure data consistency.

**Q: What happens if WebSocket connection fails?**
A: The frontend has reconnection logic, and critical updates are also available through REST API polling as a fallback.

**Q: How do you handle concurrent orders for the same product?**
A: Database transactions with row-level locking ensure stock integrity. The API checks stock before allowing order placement.

**Q: Can this scale to thousands of vendors?**
A: Yes, the stateless API design, horizontal scaling with Docker, and database read replicas enable scaling to handle increased load.

**Q: What's the estimated production cost?**
A: Using AWS with minimal resources (t3.micro instances), the estimated cost is $60-100/month. Free-tier alternatives like Render can reduce this to near-zero.

**Q: How do you handle payment processing?**
A: This MVP uses a mock payment flow. For production, Stripe integration would be straightforward with our existing order structure.

**Q: What's the mobile app strategy?**
A: The platform is designed to support a React Native mobile app, which would share the same API and real-time features as the web application.

---

## Demo Tips

### Do's
- Practice the demo multiple times before presentation
- Keep the pace steady - don't rush
- Explain the "why" behind technical decisions
- Highlight DevOps practices prominently
- Show real-time features working
- Have backup plans ready
- Keep the demo under 20 minutes

### Don'ts
- Don't get stuck debugging during demo
- Don't spend too much time on code details
- Don't skip the real-time features demo
- Don't forget to mention security
- Don't ignore the business value
- Don't run over time
- Don't assume technical knowledge from audience

### Technical Setup Checklist
- [ ] Docker Desktop running
- [ ] All services started successfully
- [ ] No port conflicts (80, 8000, 5432)
- [ ] Browser cache cleared
- [ ] Internet connection stable
- [ ] Backup screenshots prepared
- [ ] Terminal with logs visible
- [ ] Multiple browser tabs ready
- [ ] Demo accounts tested
- [ ] API documentation accessible

---

## Post-Demo Follow-up

### Immediate Actions
- Collect questions and feedback
- Note any issues encountered
- Share repository link
- Provide contact information

### Documentation to Share
- README.md (deployment guide)
- System design document
- Architecture diagram
- Presentation slides
- Demo recording (if available)

### Next Steps for Audience
- Clone the repository
- Run locally with Docker Compose
- Review the codebase
- Try the demo accounts
- Explore the API documentation

---

**Demo Duration**: Approximately 20-25 minutes  
**Preparation Time**: 30 minutes  
**Backup Required**: Screenshots and code walkthrough ready
