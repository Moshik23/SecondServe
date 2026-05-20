# FoodHawk Platform - 10-Slide Presentation

## Presentation Overview
- **Duration**: 10 minutes
- **Audience**: Technical and non-technical
- **Focus**: Cloud architecture and CI/CD
- **Style**: Modern, visually engaging, beginner-friendly

---

## Slide 1: Title Slide

**Slide Title**: FoodHawk Platform - Cloud-Native Food Waste Reduction

**Bullet Points**:
- Cloud-native ecommerce platform for food hawkers
- Reduces food waste through smart pricing
- Demonstrates modern DevOps practices
- Built with React, FastAPI, Docker, and CI/CD

**Speaker Notes/Script**:
"Good morning/afternoon. Today I'll be presenting FoodHawk, a cloud-native platform that helps food hawkers reduce waste by selling surplus food at discounted prices. This project demonstrates modern cloud architecture and DevOps practices including containerization, CI/CD pipelines, and automated deployment. Let me walk you through how we built this platform and the technologies that make it possible."

**Suggested Visuals**:
- Modern gradient background
- FoodHawk logo centered
- Simple icon representing food + technology
- Clean, professional design

**Transition Explanation**:
Fade in from black, then dissolve to next slide. Keep it simple and professional.

---

## Slide 2: The Problem

**Slide Title**: The Food Waste Challenge

**Bullet Points**:
- 1.3 billion tons of food wasted annually worldwide
- Food hawkers lose revenue from unsold surplus food
- Customers miss affordable meal opportunities
- No real-time platform exists for this market

**Speaker Notes/Script**:
"Let's start with the problem we're solving. Every day, food hawkers and small restaurants have surplus food at the end of the day. Without a way to sell it quickly, this food goes to waste - representing lost revenue for vendors and missed savings for customers. Globally, 1.3 billion tons of food are wasted annually. Think of it like this: if we could redirect just 1% of that waste, we could feed millions of people. Our platform connects these two groups in real-time."

**Suggested Visuals**:
- Infographic showing food waste statistics
- Split screen: vendor with wasted food vs. customer seeking affordable meals
- Simple bar chart showing waste vs. potential savings
- Clock icon representing time-sensitivity

**Transition Explanation**:
Push transition from right to left, moving from problem to solution.

---

## Slide 3: Our Solution

**Slide Title**: FoodHawk Platform - Smart Food Marketplace

**Bullet Points**:
- Real-time inventory tracking with WebSocket
- Dynamic pricing engine based on expiry time
- Vendor dashboard for product management
- Customer app for browsing deals
- Automatic discounts: 0% to 70% based on time-to-expiry

**Speaker Notes/Script**:
"FoodHawk is a smart marketplace that connects vendors with customers. Here's how it works: vendors list their surplus food with an expiry time. Our dynamic pricing engine automatically increases discounts as food approaches expiry - from 0% when fresh, up to 70% in the final hour. It's like an airline ticket - the closer to departure, the cheaper the seat. But for food. Customers see real-time inventory and can grab deals before they expire. Everyone wins: vendors recover revenue, customers save money, and less food goes to waste."

**Suggested Visuals**:
- Screenshot of vendor dashboard
- Screenshot of customer browsing interface
- Pricing timeline graphic showing discount progression
- Real-time update animation (WebSocket icon)

**Transition Explanation**:
Zoom in on pricing engine concept, then zoom out to architecture.

---

## Slide 4: Cloud Architecture

**Slide Title**: Cloud-Native System Architecture

**Bullet Points**:
- Three-tier architecture: Presentation, Application, Data
- React frontend (Vercel)
- FastAPI backend (Render/AWS)
- PostgreSQL database (Supabase/RDS)
- Redis cache for performance
- NGINX reverse proxy

**Speaker Notes/Script**:
"Now let's look at the technical architecture. We use a modern three-tier architecture. Think of it like a restaurant: the frontend is the dining room where customers interact with the menu, the backend is the kitchen where orders are prepared, and the database is the pantry where ingredients are stored. Our frontend runs on Vercel, the backend on Render or AWS, and we use PostgreSQL for data storage. NGINX acts as the maître d', directing traffic to the right places."

**Suggested Visuals**:
- Three-tier architecture diagram (Presentation → Application → Data)
- Service icons with platform logos (Vercel, AWS, Supabase)
- Data flow arrows showing request/response cycle
- Color-coded layers for visual clarity

**Transition Explanation**:
Dissolve from architecture to technology stack details.

---

## Slide 5: Technology Stack

**Slide Title**: Modern Technology Stack

**Bullet Points**:
- **Frontend**: React 18, Tailwind CSS, Lucide Icons
- **Backend**: FastAPI (Python), PostgreSQL, SQLAlchemy
- **Real-time**: WebSocket for live updates
- **Containerization**: Docker for all services
- **CI/CD**: GitHub Actions for automation
- **IaC**: Terraform + Ansible for infrastructure

**Speaker Notes/Script**:
"We chose modern, industry-standard technologies. For the frontend, React provides a component-based architecture that's easy to maintain. FastAPI on the backend gives us automatic API documentation and excellent performance. We use WebSocket for real-time updates - think of it like a walkie-talkie between the browser and server, keeping everyone in sync. Everything runs in Docker containers, making deployment consistent across environments. And we use GitHub Actions to automate our entire deployment pipeline."

**Suggested Visuals**:
- Technology logo grid (React, FastAPI, PostgreSQL, Docker, GitHub)
- Simple icons for each technology category
- Color-coded by layer (frontend, backend, DevOps)
- Connection lines showing integration

**Transition Explanation**:
Wipe from left to right, moving from technology to CI/CD pipeline.

---

## Slide 6: CI/CD Pipeline

**Slide Title**: Automated CI/CD Pipeline

**Bullet Points**:
- **Stage 1**: Code quality & security scanning (flake8, bandit)
- **Stage 2**: Automated testing (pytest, Jest)
- **Stage 3**: Docker image building
- **Stage 4**: Security scanning (Trivy)
- **Stage 5**: Deploy to staging (automatic)
- **Stage 6**: Deploy to production (manual approval)

**Speaker Notes/Script**:
"Our CI/CD pipeline is like an automated assembly line. When we push code to GitHub, it automatically runs quality checks, tests the code, builds Docker images, scans for security vulnerabilities, and deploys to staging. For production deployment, a team member must manually approve - like a final quality inspection before shipping. This ensures that only tested, secure code reaches production. If any stage fails, the pipeline stops - like a quality gate catching defects early."

**Suggested Visuals**:
- Pipeline flow diagram with 6 stages
- GitHub Actions logo and workflow visualization
- Success/failure indicators at each stage
- Animated flow showing code progression

**Transition Explanation**:
Fly-in effect for pipeline stages, then dissolve to Docker.

---

## Slide 7: Docker Containerization

**Slide Title**: Docker - Containerization Strategy

**Bullet Points**:
- All services run in Docker containers
- Backend: Python 3.11 slim image
- Frontend: Multi-stage build with Nginx
- Database: PostgreSQL 15 Alpine
- Docker Compose for local development
- Consistent environment from dev to production

**Speaker Notes/Script**:
"Docker is like shipping containers for software. Each service - the backend, frontend, database - runs in its own container with everything it needs to work. This means the application runs exactly the same on my laptop as it does in the cloud. No more 'it works on my machine' problems. We use Docker Compose locally to spin up all services with one command. For production, these containers run on cloud platforms like AWS ECS or Render."

**Suggested Visuals**:
- Docker whale logo
- Container diagram showing backend, frontend, database
- Docker Compose visualization
- Before/after comparison: manual setup vs. Docker

**Transition Explanation**:
Slide from right showing containers, then zoom out to cloud deployment.

---

## Slide 8: Cloud Deployment

**Slide Title**: Free-Tier Cloud Deployment

**Bullet Points**:
- **Option 1**: Vercel + Render + Supabase ($0/month)
- **Option 2**: Railway ($5/month)
- **Option 3**: AWS ($80/month for production)
- Automated deployment on git push
- SSL certificates included
- Global CDN for performance

**Speaker Notes/Script**:
"One of the best things about modern cloud platforms is the generous free tiers. Our platform can run completely free using Vercel for the frontend, Render for the backend, and Supabase for the database. That's $0 per month! For production, we can scale up to AWS for about $80 per month. Deployment is automated - just push to GitHub, and the CI/CD pipeline handles everything. It's like having a personal deployment team working 24/7."

**Suggested Visuals**:
- Cost comparison chart ($0 vs $5 vs $80)
- Platform logos (Vercel, Render, Supabase, AWS)
- Deployment automation flow diagram
- Global map showing CDN distribution

**Transition Explanation**:
Rotate transition from cost comparison to demo.

---

## Slide 9: Live Demo

**Slide Title**: Live Platform Demo

**Bullet Points**:
- **Vendor Dashboard**: Add products, view analytics
- **Customer App**: Browse deals, place orders
- **Real-time Updates**: See inventory changes instantly
- **Dynamic Pricing**: Watch discounts increase over time
- **Demo Accounts**: vendor@demo.com / demo123

**Speaker Notes/Script**:
"Now let me show you the platform in action. I'll log in as a vendor and add a product with an expiry time. Watch how the system automatically applies a 50% discount. Now I'll switch to the customer view and place an order. Notice how the vendor dashboard instantly shows the new order - that's our WebSocket real-time updates in action. The entire platform is live and functional, demonstrating all the concepts we've discussed."

**Suggested Visuals**:
- Screen recording of vendor dashboard
- Screen recording of customer app
- Split screen showing real-time updates
- Pricing engine visualization
- Order placement animation

**Transition Explanation**:
Wipe transition from demo back to summary.

---

## Slide 10: Summary & Key Takeaways

**Slide Title**: Key Takeaways & Future Work

**Bullet Points**:
- **Built**: Full-stack cloud-native application
- **Demonstrated**: CI/CD, Docker, IaC, real-time updates
- **Achieved**: $0 deployment cost with free tiers
- **Impact**: Reduces food waste through technology
- **Future**: Mobile app, AI features, payment integration
- **Questions?**

**Speaker Notes/Script**:
"To summarize, we've built a complete cloud-native platform that addresses a real-world problem while demonstrating modern DevOps practices. The platform is production-ready, scalable, and can run completely free using modern cloud services. Future enhancements include a mobile app, AI-generated descriptions, and payment integration. This project shows how technology can solve real problems while being cost-effective and sustainable. Thank you for your attention - I'm happy to take any questions."

**Suggested Visuals**:
- Summary infographic with key metrics
- Future roadmap timeline
- Contact information or GitHub repository link
- Thank you message with clean design

**Transition Explanation**:
Fade to black or end with contact information slide.

---

## Presentation Tips

### Timing Guide (10 minutes total)

**Slide 1 (Title)**: 30 seconds
- Quick introduction
- Set the stage

**Slide 2 (Problem)**: 1 minute
- Explain the problem clearly
- Use the restaurant analogy

**Slide 3 (Solution)**: 1.5 minutes
- Explain the solution
- Show dynamic pricing concept

**Slide 4 (Architecture)**: 1.5 minutes
- Walk through architecture
- Use the restaurant analogy

**Slide 5 (Technology)**: 1 minute
- Brief technology overview
- Focus on why we chose each

**Slide 6 (CI/CD)**: 1.5 minutes
- Explain the pipeline
- Use the assembly line analogy

**Slide 7 (Docker)**: 1 minute
- Explain containerization
- Use the shipping container analogy

**Slide 8 (Deployment)**: 1 minute
- Show cost comparison
- Highlight free-tier benefits

**Slide 9 (Demo)**: 1.5 minutes
- Live demonstration
- Show real-time features

**Slide 10 (Summary)**: 30 seconds
- Quick summary
- Open for questions

### Visual Design Tips

**Color Scheme**:
- Primary: #2563EB (Blue)
- Secondary: #10B981 (Green)
- Accent: #F59E0B (Amber)
- Background: White or light gray

**Typography**:
- Headings: Sans-serif (Inter, Roboto, or Arial)
- Body: Sans-serif (same as headings)
- Size: 24pt for headings, 18pt for body

**Layout**:
- Clean, uncluttered slides
- Maximum 5 bullet points per slide
- Use icons instead of text where possible
- Consistent spacing and alignment

### Real-Life Analogies to Use

**Architecture**:
- Restaurant analogy (dining room, kitchen, pantry)

**CI/CD Pipeline**:
- Assembly line analogy (quality gates, inspections)

**Docker**:
- Shipping container analogy (consistent environment)

**Dynamic Pricing**:
- Airline ticket analogy (cheaper closer to departure)

**WebSocket**:
- Walkie-talkie analogy (real-time communication)

**Load Balancer**:
- Traffic director analogy (maître d')

### Demo Preparation

**Before Presentation**:
1. Start Docker Compose: `docker-compose up -d`
2. Seed database: `docker-compose exec backend python seed.py`
3. Test both vendor and customer logins
4. Prepare browser tabs for demo
5. Have screenshots ready as backup

**During Demo**:
1. Keep it simple - show key features only
2. Explain what you're doing as you do it
3. Point out real-time updates
4. Show dynamic pricing in action
5. Keep demo under 2 minutes

### Backup Plans

**If Demo Fails**:
- Use screenshots
- Explain the concept verbally
- Show code instead of live demo
- Focus on architecture diagrams

**If Technical Issues**:
- Have slides ready without live demo
- Use recorded video as backup
- Focus on technical documentation
- Skip demo, extend Q&A

### Q&A Preparation

**Common Questions**:

**Q: Why this tech stack?**
A: React and FastAPI are modern, well-documented, and have large communities. PostgreSQL is industry-standard for relational data.

**Q: How does dynamic pricing work?**
A: A background task checks product expiry every 5 minutes and applies discounts based on time-to-expiry, similar to airline pricing.

**Q: What's the deployment cost?**
A: Using free-tier services, it's $0/month. AWS production would be ~$80/month.

**Q: How do you handle security?**
A: JWT authentication, password hashing, encrypted data, and secure communication with TLS.

**Q: Can this scale?**
A: Yes, the stateless API design and container orchestration enable horizontal scaling.

### Rehearsal Checklist

- [ ] Practice the full presentation multiple times
- [ ] Time yourself to stay within 10 minutes
- [ ] Test the demo beforehand
- [ ] Prepare backup screenshots
- [ ] Check that all visuals are clear
- [ ] Practice transitions between slides
- [ ] Prepare answers to common questions
- [ ] Test audio and display equipment

### Slide Master Template

**Title Slide**:
- Large, bold title
- Subtitle with project description
- Your name and date
- Clean, professional design

**Content Slides**:
- Consistent header with slide number
- Bullet points with icons
- Visuals on the right, text on left
- Brand colors maintained

**Demo Slide**:
- Full-screen screenshot
- Minimal text overlay
- Clear callouts for key features

**Summary Slide**:
- Key takeaways highlighted
- Contact information
- Thank you message

---

## Presentation Files

**To Create in PowerPoint**:
1. Create new presentation
2. Apply modern template
3. Add 10 slides using content above
4. Insert suggested visuals
5. Add speaker notes
6. Set slide transitions
7. Rehearse timing

**Export Options**:
- PDF for distribution
- Video recording for remote presentation
- Slide-only version for handouts

---

**Presentation Version**: 1.0  
**Last Updated**: May 20, 2026  
**Duration**: 10 minutes  
**Slides**: 10
