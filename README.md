# Purple Full Stack Case Study
This repository contains code for the Fullstack Developer case study completed by David Chocholatý during the hiring process at Purple Technology.

## Installation and Running

This tutorial was tested on **Ubuntu 24.04.2 LTS**. 

### Prerequisites

- [Node.js](https://nodejs.org/en/download) v22.11.0 or higher
- npm 10.8.2 or higher *(automatically installed with Node.js)*

### Quick Setup (Recommended)

**Automated setup script:**

```bash
git clone <repository-url>
cd purple-fullstack-case-study/currency-converter
./setup.sh
```

The script will:
- Check prerequisites (Node.js, npm)
- Install backend dependencies
- Install frontend dependencies
- Create `.env` template
- Optionally configure your API key interactively

### Manual Setup (Alternative)

If you prefer manual setup or the script doesn't work:

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd purple-fullstack-case-study/currency-converter
   ```

2. **Install all dependencies** (uses npm workspaces)
   ```bash
   npm install
   ```
   
   This installs dependencies for both backend and frontend simultaneously.

3. **Configure API Key**
   
   Create a `.env` file in the `backend/` directory:
   ```bash
   # backend/.env
   OXR_APP_ID=your_openexchangerates_api_key_here
   ```
   
   > **API Provider:** [OpenExchangeRates](https://openexchangerates.org/)  
   > **API Endpoint:** `https://openexchangerates.org/api/latest.json`  
   > Get your free API key by signing up at the link above

### Running the Application

**Development Mode (Recommended):**

Start both backend and frontend simultaneously from the root directory:

```bash
npm run dev
```

This will run:
- Backend on `http://localhost:4000`
- Frontend on `http://localhost:3000`

Then open your browser and navigate to `http://localhost:3000`

**Alternative - Run Separately:**

If you prefer to run them in separate terminals:

```bash
# Terminal 1 - Backend only
npm run dev:backend

# Terminal 2 - Frontend only
npm run dev:frontend
```

**Production Build:**

Build both projects:
```bash
npm run build
```

Then start each in separate terminals:
```bash
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend  
cd frontend && npm start
```


## Project Structure

```
currency-converter/
├── backend/          # Express.js + TypeScript backend
│   ├── src/
│   │   ├── config/       # Configuration (currencies, app config)
│   │   ├── middleware/   # CORS, error handling
│   │   ├── routes/       # API routes (conversion, stats, wallet)
│   │   ├── services/     # Business logic (exchange rate service)
│   │   └── server/db/    # SQLite database operations
│   └── data/         # SQLite database file
└── frontend/         # Next.js + React + TypeScript frontend
    └── src/
        ├── app/          # Next.js App Router pages
        ├── components/   # React components
        ├── hooks/        # Custom React hooks
        ├── services/     # API service layer
        └── types/        # TypeScript type definitions
```

## Features

- 💱 **Currency Conversion**: Real-time conversion using OpenExchangeRates API
- 📊 **Statistics Dashboard**: Conversion history, most used currencies, pair statistics
- 📈 **Visual Analytics**: Pie chart showing target currency frequency
- 💰 **Budget Mode**: Virtual wallet with random balances for practice conversions
- ⚡ **Performance**: 1-hour exchange rate caching (80x faster responses)
- 🎨 **Modern UI**: Clean, responsive design with custom CSS
- 🔒 **Type-Safe**: Full TypeScript coverage on both frontend and backend

## Technology Stack

**Backend:**
- Express.js - Web framework
- TypeScript - Type safety
- SQLite - Database (better-sqlite3)
- Axios - HTTP client for external API
- [OpenExchangeRates API](https://openexchangerates.org/) - Real-time exchange rates
- Modular architecture with middleware and services

**Frontend:**
- Next.js 16 - React framework
- React 19 - UI library
- TypeScript - Type safety
- Chart.js - Data visualization
- Custom CSS - Styling

## Implemented App Extensions

### Budget Mode

### Advanced Statistics

### Pie Chart


## Technologies Selection and Implementation Approach
This section describes the reasoning processes of using specific technology stack or using available tools for the tasks.

### CSS Implementation Strategy

The frontend currently uses **plain CSS** with a single `globals.css` file. This approach was chosen for the following reasons:

**Current Implementation:**
- Plain CSS in `globals.css` for all styles
- 1:1 mapping with Figma design specifications
- Direct translation of exact values (colors, spacing, typography)
- Faster initial implementation when matching exact design specs

**Recommended for Production:**

However, for a production application or further development, the following improvements are recommended:

1. **CSS Modules** (Recommended)
   - Scoped styles per component
   - Prevents naming conflicts
   - Better maintainability and code organization
   - Co-location of styles with components
   - Example: `Button.module.css`, `Wallet.module.css`

2. **Tailwind CSS** (Alternative)
   - Utility-first CSS framework
   - Faster development with pre-built utilities
   - Smaller bundle size (tree-shaking unused styles)
   - Design system consistency out of the box
   - Better for rapid prototyping and iteration

3. **CSS-in-JS** (e.g., styled-components, Emotion)
   - Dynamic styling based on props
   - Full TypeScript integration
   - Runtime theme switching
   - Better suited for complex component libraries

**Why Not Used Initially:**
- Figma provided exact pixel values that were easier to copy as plain CSS
- Avoided additional build complexity during rapid prototyping
- Direct translation ensured pixel-perfect match with design

**Migration Path:**
The current CSS can be easily refactored into CSS Modules or Tailwind CSS when scaling the application. See the "Potential Improvements" section for details on frontend refactoring.

### Why SQLite?

SQLite was chosen over MongoDB Atlas for several reasons:

1. **Simplicity**: No external service setup required - database is a local file
2. **Zero Configuration**: Works out of the box without credentials or connection strings
3. **Security**: No need to expose database to the internet or manage IP whitelists
4. **Performance**: Excellent for read-heavy workloads like this application
5. **Portability**: Single file makes it easy to backup and move

MongoDB Atlas would require:
- Managing IP whitelists (allowing 0.0.0.0/0 is a security risk)
- Storing database credentials
- Network dependency for local development
- More complex setup for a simple case study

## API Documentation

See [`backend/API.md`](currency-converter/backend/API.md) for complete API documentation.

## Architecture Documentation

- Backend: [`backend/README.md`](currency-converter/backend/README.md)
- Frontend: [`frontend/README.md`](currency-converter/frontend/README.md)


### AI Usage
#### Cursor AI IDE

#### CI Pipeline Creation

#### SQL Commands First Proposals

#### Frontend CSS Stylization & Dynamic Color Handling for Graph

#### Architectural Design Discussion

#### Zod Validation Implementation

#### Code Refactorization

#### GitHub Copilot Reviews

#### JSDoc Documentation, Documentation Comments, and Frontend and Backend READMEs Generation

#### Installation Script


### Potential Improvements and Architecture Changes

If the application were to be dramatically scaled and extended for production use with thousands of users, the following improvements should be considered:

#### **Database & Data Layer**

1. **Migrate to PostgreSQL or MySQL**
   - SQLite is single-user and file-based; not suitable for concurrent users
   - PostgreSQL offers better concurrency, replication, and horizontal scaling
   - Add connection pooling for efficient database connections
   - Implement read replicas for high-read workloads

2. **Implement Database Migrations**
   - Use tools like Knex.js, Prisma, or TypeORM
   - Version-controlled schema changes for safe deployments
   - Automated rollback capabilities

3. **Add Caching Layer**
   - Redis or Memcached for distributed caching
   - Cache user sessions, frequently accessed data
   - Pub/Sub for real-time features

#### **Backend Architecture**

4. **Microservices Architecture**
   - Split into separate services: Exchange Rate Service, Wallet Service, Statistics Service
   - Independent scaling based on load (e.g., scale conversion service separately)
   - Message queue (RabbitMQ/Kafka) for inter-service communication

5. **API Gateway**
   - Implement API Gateway (Kong, Nginx) for routing, rate limiting, authentication
   - Centralized logging and monitoring
   - Request/response transformation

6. **Authentication & Authorization**
   - Implement JWT-based authentication
   - Role-based access control (RBAC)
   - OAuth2 integration for third-party login (Google, GitHub)
   - API key management for external consumers

7. **Rate Limiting & Throttling**
   - Prevent API abuse with rate limiting per user/IP
   - Different tiers for free/premium users
   - Circuit breaker pattern for external API calls

#### **Performance & Scalability**

8. **Load Balancing**
   - Multiple backend instances behind load balancer (Nginx, HAProxy)
   - Health checks and automatic failover
   - Session affinity if needed

9. **Content Delivery Network (CDN)**
   - Serve static assets (CSS, JS, images) via CDN (CloudFlare, AWS CloudFront)
   - Reduce latency for global users
   - Cache API responses at edge locations

10. **Horizontal Scaling**
    - Containerize with Docker
    - Orchestrate with Kubernetes for auto-scaling
    - Scale frontend and backend independently

#### **Data & Analytics**

11. **Time-Series Database**
    - InfluxDB or TimescaleDB for conversion history and statistics
    - Optimized for time-based queries and aggregations
    - Better performance for analytics dashboards

12. **Data Warehouse**
    - Separate analytics database (Snowflake, BigQuery)
    - ETL pipelines for business intelligence
    - Historical data archival

#### **Monitoring & Observability**

13. **Comprehensive Logging**
    - Structured logging with correlation IDs
    - Centralized log aggregation (ELK Stack, Datadog, Grafana Loki)
    - Log retention policies

14. **Application Performance Monitoring (APM)**
    - New Relic, Datadog, or Sentry for performance tracking
    - Real-time error tracking and alerting
    - Distributed tracing for microservices

15. **Metrics & Dashboards**
    - Prometheus + Grafana for metrics visualization
    - Custom dashboards for business KPIs
    - SLA monitoring and alerting

#### **Security Enhancements**

16. **Security Hardening**
    - HTTPS/TLS for all communications
    - Input validation and sanitization library (Joi, Zod)
    - SQL injection prevention (already handled with prepared statements)
    - XSS and CSRF protection
    - Security headers (Helmet.js)
    - Regular dependency updates and vulnerability scanning

17. **Secrets Management**
    - HashiCorp Vault or AWS Secrets Manager
    - Rotate API keys and credentials automatically
    - Never commit secrets to repository

#### **Testing & Quality**

18. **Comprehensive Testing**
    - Unit tests (Jest) for all business logic (target: 80%+ coverage)
    - Integration tests for API endpoints
    - E2E tests (Playwright, Cypress) for critical user flows
    - Load testing (k6, Artillery) for performance validation

19. **CI/CD Pipeline Enhancements**
    - Automated testing on every commit
    - Staging environment for pre-production testing
    - Blue-green or canary deployments
    - Automated rollback on failures

#### **Frontend Improvements**

20. **State Management**
    - Redux, Zustand, or Jotai for complex state
    - Better handling of global state across components

21. **Data Fetching**
    - React Query or SWR for server state management
    - Automatic caching, revalidation, and error handling
    - Optimistic updates

22. **Progressive Web App (PWA)**
    - Offline support with Service Workers
    - Push notifications for conversion alerts
    - Add to home screen capability

23. **Internationalization (i18n)**
    - Support multiple languages (next-i18next)
    - Currency formatting based on locale
    - Right-to-left (RTL) language support

#### **DevOps & Infrastructure**

24. **Infrastructure as Code (IaC)**
    - Terraform or AWS CloudFormation for reproducible infrastructure
    - Version-controlled infrastructure changes

25. **Backup & Disaster Recovery**
    - Automated database backups
    - Multi-region deployment for high availability
    - Disaster recovery plan and regular testing

26. **Environment Management**
    - Separate environments: dev, staging, production
    - Feature flags for gradual rollouts (LaunchDarkly)
    - Configuration management per environment

#### **Business Features**

27. **User Accounts & Personalization**
    - User registration and profiles
    - Saved conversion history per user
    - Favorite currency pairs
    - Custom alerts for rate changes

28. **Premium Features**
    - Subscription model (Stripe integration)
    - Historical rate data and trends
    - Bulk conversions and CSV export
    - API access for developers

29. **Multi-Currency Wallet**
    - Real money integration (with proper financial licensing)
    - Transaction history and audit logs
    - Compliance with financial regulations (KYC/AML)

#### **API & Integration**

30. **GraphQL API**
    - Alternative to REST for flexible data fetching
    - Reduce over-fetching and under-fetching
    - Real-time subscriptions

31. **Webhook Support**
    - Notify external systems of conversion events
    - Retry logic and delivery guarantees

32. **Third-Party Integrations**
    - Multiple exchange rate providers with fallback
    - Payment gateways for real transactions
    - Analytics tools (Google Analytics, Mixpanel)

#### **Cost Optimization**

33. **Resource Optimization**
    - Serverless functions (AWS Lambda) for sporadic workloads
    - Spot instances for non-critical batch jobs
    - Database query optimization and indexing
    - Automatic scaling based on traffic patterns

#### **Compliance & Legal**

34. **GDPR & Data Privacy**
    - Data anonymization and retention policies
    - User data export and deletion capabilities
    - Cookie consent management
    - Privacy policy and terms of service

---

**Priority for Initial Scaling:**
1. Database migration (PostgreSQL)
2. Authentication & user accounts
3. Load balancing & horizontal scaling
4. Comprehensive logging & monitoring
5. Automated testing & CI/CD

**Estimated Timeline:** 3-6 months for production-ready scaling with a team of 3-5 developers.