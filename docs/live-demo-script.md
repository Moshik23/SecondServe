# FoodHawk Platform - Live Demo Walkthrough Script

## Demo Overview
- **Duration**: 7 minutes
- **Audience**: Class or Interview
- **Format**: Live demonstration with explanation
- **Goal**: Showcase cloud architecture, CI/CD, and key features

## Preparation Checklist

**Before Demo:**
- [ ] Start Docker Compose: `docker-compose up -d`
- [ ] Seed database: `docker-compose exec backend python seed.py`
- [ ] Open browser to http://localhost
- [ ] Open terminal with docker-compose ps visible
- [ ] Open GitHub repository in another tab
- [ ] Prepare architecture diagram slide
- [ ] Have backup screenshots ready

**During Demo:**
- [ ] Keep screen visible to audience
- [ ] Speak clearly and at moderate pace
- [ ] Point to elements as you explain
- [ ] Maintain eye contact with audience
- [ ] Be prepared for technical issues

## Demo Script

### Step 1: Explain Problem Statement (0:00 - 0:40)

**Presenter Talking Points:**
"Let me start by explaining the problem we're solving. Every day, food hawkers and small restaurants have surplus food at the end of the day. Without a way to sell it quickly, this food goes to waste - representing lost revenue for vendors and missed savings for customers. Globally, 1.3 billion tons of food are wasted annually. Our platform connects these two groups in real-time, using smart pricing to ensure food is sold before it expires."

**Actions:**
- Show problem statement slide or infographic
- Point to food waste statistics
- Use hand gestures to emphasize scale

**Timing**: 40 seconds

---

### Step 2: Show System Architecture (0:40 - 1:20)

**Presenter Talking Points:**
"Now let's look at the system architecture. We use a modern three-tier architecture. The presentation layer is the user interface - React web applications for vendors and customers. The application layer is our FastAPI backend with microservices for authentication, product management, and dynamic pricing. The data layer is PostgreSQL with Redis caching. Everything runs in Docker containers for consistency across environments."

**Actions:**
- Display architecture diagram from docs/architecture.md
- Point to each layer as you explain
- Show the data flow arrows
- Mention containerization benefits

**Timing**: 40 seconds

---

### Step 3: Show Web Application (1:20 - 2:00)

**Presenter Talking Points:**
"Let me show you the web application. I'll open the platform in the browser. Here's the login screen - we have demo accounts for testing. Let me log in as a vendor. This is the vendor dashboard where hawkers can manage their products, view orders, and check analytics. The interface is clean and intuitive, designed for ease of use."

**Actions:**
- Navigate to http://localhost in browser
- Click "Vendor: vendor@demo.com / demo123"
- Show vendor dashboard
- Point to navigation tabs (Products, Orders, Analytics)
- Briefly show each section

**Timing**: 40 seconds

---

### Step 4: Show Mobile Application (2:00 - 2:20)

**Presenter Talking Points:**
"The web application is mobile-responsive and works great on mobile browsers. For a dedicated mobile experience, we plan to build a React Native Expo app in the future. The mobile app would include push notifications for deals, location-based discovery, and offline mode support. For now, the responsive web app provides full functionality on any device."

**Actions:**
- Show responsive design by resizing browser window
- Mention mobile app as future enhancement
- Show how the UI adapts to mobile view
- Explain React Native Expo plan

**Timing**: 20 seconds

---

### Step 5: Upload Surplus Food (2:20 - 3:00)

**Presenter Talking Points:**
"Now let me show how a vendor would upload surplus food. I'll click on the Products tab and add a new listing. I'll enter the product details: 'Chicken Rice' with a description, category, quantity of 20 with 15 available, original price of $6.00, and set the expiry time to 6 hours from now. When I click create, the system automatically applies a 50% discount because it's expiring soon."

**Actions:**
- Click "Products" tab
- Click "Add Product" button
- Fill in form:
  - Name: "Chicken Rice"
  - Description: "Authentic Singaporean chicken rice"
  - Category: "Main Course"
  - Original Quantity: 20
  - Current Stock: 15
  - Price: 6.00
  - Expiry Date: Set to 6 hours from now
- Click "Create"
- Point out the 50% discount badge
- Show the product in the list

**Timing**: 40 seconds

---

### Step 6: Demonstrate Dynamic Pricing (3:00 - 3:40)

**Presenter Talking Points:**
"This is our key innovation - the dynamic pricing engine. It automatically increases discounts based on time-to-expiry. At 48 hours, it's 0% discount. At 24 hours, 10%. At 12 hours, 25%. At 6 hours, 50%. At 1 hour, 60%. And in the final hour, 70% off. This incentivizes customers to buy soon-to-expire items, ensuring food is sold before it becomes waste. It's like airline pricing - cheaper closer to departure."

**Actions:**
- Show pricing table from documentation
- Point to the newly created product with 50% discount
- Explain the discount tiers
- Show how price changes would appear in real-time
- Mention the background task that runs every 5 minutes

**Timing**: 40 seconds

---

### Step 7: Show Real-time Inventory Updates (3:40 - 4:20)

**Presenter Talking Points:**
"One of the most powerful features is real-time inventory tracking using WebSocket. When a customer places an order, the vendor dashboard instantly updates. Let me show you this. I'll open a new browser tab and log in as a customer. Now I'll browse products and place an order for the Chicken Rice. Watch the vendor dashboard - the order appears instantly. This is our WebSocket implementation keeping both parties in sync."

**Actions:**
- Open new browser tab (or incognito window)
- Navigate to http://localhost
- Click "Customer: customer@demo.com / demo123"
- Browse products and click on Chicken Rice
- Click "Add to Cart" then place order
- Switch back to vendor tab
- Point to the new order appearing instantly
- Explain WebSocket technology

**Timing**: 40 seconds

---

### Step 8: Trigger CI/CD Pipeline (4:20 - 5:00)

**Presenter Talking Points:**
"Now let me show our CI/CD pipeline. In a real deployment, when we push code to GitHub, it automatically triggers our pipeline. Let me show you the GitHub Actions workflow. It runs code quality checks, automated tests, builds Docker images, scans for security vulnerabilities, and deploys to staging. For production, it requires manual approval. This ensures only tested, secure code reaches production."

**Actions:**
- Open GitHub repository in new tab
- Navigate to .github/workflows/ci-cd.yml
- Show the workflow stages
- Explain each stage briefly
- Point to the quality gates
- Mention automated deployment

**Timing**: 40 seconds

---

### Step 9: Show Docker Containers (5:00 - 5:40)

**Presenter Talking Points:**
"All our services run in Docker containers. Let me show you the running containers. I'll open the terminal and run `docker-compose ps`. You can see we have four containers: the backend, frontend, database, and Redis. Each container is isolated but can communicate with each other. This ensures the application runs exactly the same on my laptop as it does in production."

**Actions:**
- Open terminal
- Run `docker-compose ps`
- Point to each container
- Explain container benefits
- Show container logs with `docker-compose logs -f` (briefly)
- Mention Docker Compose for orchestration

**Timing**: 40 seconds

---

### Step 10: Explain Cloud Deployment (5:40 - 6:20)

**Presenter Talking Points:**
"Finally, let me talk about cloud deployment. We have multiple options. Using free-tier services like Vercel, Render, and Supabase, we can deploy this platform completely free. That's $0 per month! For production, we can use AWS ECS Fargate, which would cost about $80 per month. The Terraform configuration I've created automates the entire AWS deployment. The choice depends on your needs and budget."

**Actions:**
- Show free-tier deployment documentation
- Display cost comparison ($0 vs $80)
- Show Terraform configuration
- Mention Infrastructure as Code benefits
- Explain deployment automation

**Timing**: 40 seconds

---

### Conclusion (6:20 - 7:00)

**Presenter Talking Points:**
"To summarize, FoodHawk demonstrates modern cloud-native development practices including containerization, CI/CD automation, and real-time architecture. The platform addresses a real-world problem while showcasing DevOps skills. It's production-ready, scalable, and cost-effective. The entire project, including all documentation, is available in the repository. Thank you for watching - I'm happy to answer any questions."

**Actions:**
- Show project repository
- Display documentation list
- Thank the audience
- Open for questions

**Timing**: 40 seconds

---

## Timing Summary

| Step | Duration | Cumulative |
|------|----------|------------|
| 1. Problem Statement | 0:40 | 0:40 |
| 2. System Architecture | 0:40 | 1:20 |
| 3. Web Application | 0:40 | 2:00 |
| 4. Mobile Application | 0:20 | 2:20 |
| 5. Upload Surplus Food | 0:40 | 3:00 |
| 6. Dynamic Pricing | 0:40 | 3:40 |
| 7. Real-time Updates | 0:40 | 4:20 |
| 8. CI/CD Pipeline | 0:40 | 5:00 |
| 9. Docker Containers | 0:40 | 5:40 |
| 10. Cloud Deployment | 0:40 | 6:20 |
| Conclusion | 0:40 | 7:00 |

**Total**: 7 minutes

---

## Demo Setup Commands

**Before Starting:**

```bash
# Navigate to project directory
cd food-hawk-platform

# Start all services
docker-compose up -d

# Wait for services to be healthy (30 seconds)
docker-compose ps

# Seed database with demo data
docker-compose exec backend python seed.py

# Verify services are running
docker-compose ps
```

**Quick Verification:**

```bash
# Check backend health
curl http://localhost:8000/health

# Check frontend
curl http://localhost

# View logs if issues
docker-compose logs backend
```

---

## Backup Plan

**If Docker Fails:**
- Use screenshots from documentation
- Explain architecture verbally
- Show code instead of live demo
- Focus on CI/CD documentation

**If Application Won't Load:**
- Show architecture diagrams
- Explain the components
- Discuss technology choices
- Move to CI/CD pipeline demo

**If Real-time Updates Don't Work:**
- Explain WebSocket concept
- Show the code implementation
- Discuss use cases
- Mention fallback to polling

**If CI/CD Won't Trigger:**
- Show workflow file
- Explain each stage
- Discuss automation benefits
- Show deployment documentation

---

## Interview-Specific Tips

**For Technical Interviews:**
- Focus on architecture decisions
- Explain trade-offs you made
- Discuss scalability considerations
- Mention security implementations
- Be prepared for deep-dive questions

**For Class Presentations:**
- Keep explanations beginner-friendly
- Use analogies to explain concepts
- Focus on the problem-solution fit
- Highlight social impact
- Emphasize DevOps practices

**Key Points to Emphasize:**
- Real-time architecture (WebSocket)
- Dynamic pricing engine
- CI/CD automation
- Docker containerization
- Free-tier deployment
- Cost optimization
- Security implementation

---

## Common Questions & Answers

**Q: Why FastAPI over Flask?**
A: FastAPI provides automatic API documentation, async support, and better performance. It's more modern and has a growing ecosystem.

**Q: How does dynamic pricing work?**
A: A background task runs every 5 minutes, checking product expiry times and applying discounts based on a tiered structure (0% to 70%).

**Q: How do you handle security?**
A: JWT authentication, password hashing with bcrypt, encrypted data at rest, TLS for communication, and input validation with Pydantic.

**Q: What's the deployment cost?**
A: Using free-tier services (Vercel, Render, Supabase), it's $0/month. AWS production would be ~$80/month.

**Q: How does WebSocket work?**
A: It maintains a persistent connection between client and server, enabling bidirectional real-time communication without polling.

**Q: Can this scale?**
A: Yes, the stateless API design and container orchestration enable horizontal scaling. We can add more instances as traffic increases.

---

## Visual Aids to Prepare

**Screenshots to Have Ready:**
1. Architecture diagram
2. Vendor dashboard
3. Customer browsing interface
4. Dynamic pricing table
5. CI/CD pipeline diagram
6. Docker container list
7. Cost comparison chart

**Documents to Reference:**
- docs/architecture.md
- docs/cloud-architecture.md
- docs/ci-cd-workflow.md
- docs/docker-setup.md
- docs/free-tier-deployment.md

---

## Quick Reference Commands

**Demo Commands:**
```bash
docker-compose ps              # Show running containers
docker-compose logs -f backend  # View backend logs
docker-compose restart backend  # Restart backend
docker-compose down -v          # Stop and clear database
docker-compose up -d            # Start all services
```

**Verification Commands:**
```bash
curl http://localhost:8000/health  # Backend health
curl http://localhost                # Frontend
docker-compose exec backend python seed.py  # Seed database
```

---

## Post-Demo Follow-up

**After Demo:**
- Collect questions from audience
- Provide GitHub repository link
- Share documentation location
- Offer to explain technical details
- Discuss potential improvements

**Resources to Share:**
- Repository URL
- README.md for quick start
- Technical report for deep dive
- Presentation slides for reference

---

**Demo Script Version**: 1.0  
**Last Updated**: May 20, 2026  
**Duration**: 7 minutes  
**Steps**: 10
