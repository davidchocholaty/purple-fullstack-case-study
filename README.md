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

## Technology Stack

**Backend:**
- Express.js with REST API
- TypeScript
- SQLite Database (better-sqlite3)
- Axios (HTTP client for external API)
- [OpenExchangeRates API](https://openexchangerates.org/)

**Frontend:**
- Next.js
- React
- TypeScript
- Chart.js (data visualization)
- Custom CSS

## Implemented App Extensions
This section describes the implemented app extensions.

### Budget Mode
- In this mode, the user has a randomly generated wallet with a certain amount of money for each currency. The user can transfer only the funds available in the wallet. The wallet can also be generated using the available button.

### Advanced Statistics
- Advanced statistics, such as the most used target currency, statistics for each currency pair, and a table of recent conversions, are provided.

### Pie Chart
- The pie chart shows the frequency of use of the target currency.

### Exchange Rate Caching
- To reduce the number of requests to the external API, rate caching is implemented and set to 1 hour.

## Technologies Selection and Implementation Approach
This section describes the reasoning processes of using specific technology stack or using available tools for the tasks.

### Why use a simple CSS file with predefined rules?
A simple ```globals.css``` file with predefined rules was used for simplicity and to match the original Figma design as closely as possible. A better approach would be to logically divide the design rules and also include the Tailwind CSS library.

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

### Why REST API instead of tRPC?
The REST API was implemented with Express.js for a simple reason: the developer’s familiarity with these tools made the development process faster.

## API Documentation

See [`backend/API.md`](currency-converter/backend/API.md) for complete API documentation.

## Architecture Documentation

- Backend: [`backend/README.md`](currency-converter/backend/README.md)
- Frontend: [`frontend/README.md`](currency-converter/frontend/README.md)


### AI Usage
#### Cursor AI IDE
- During the implementation process, I used the Cursor AI IDE along with its available AI agent. All subsequent AI usage, except for GitHub Copilot reviews, was done using this agent.

#### CI Pipeline Creation
- The AI agent was used during the creation of the CI pipeline. The task involved adapting my personal Python CI setup for the TypeScript frontend and backend.

#### SQL Commands First Proposals
- Because the app required basic SQL commands and the models are well-suited for SQL, the first SQL command prototypes were created by the AI agent to reduce implementation time for this core logic.

#### Frontend CSS Stylization & Dynamic Color Handling for Graph
- The AI was used to speed up the process of reimplementing the original Figma template into CSS styling. This was possible because the models perform well on this task and CSS is not a security-critical part of the code.

#### Architectural Design Discussion
- The architectural design and transformation from the base version to a more production-like structure were discussed with the Cursor AI agent, allowing it to recommend an optional monorepo structure and logic for potential future extensions.

#### Code Refactorization
- The AI agent was used to identify duplicated or optimizable parts of the code, enhancing a single developer’s capabilities without the need for another human reviewer. Also the agent was used for the first proposals of the possible restructuralization approaches.

#### GitHub Copilot Reviews
- During the implementation process, GitHub Copilot was used to review pull requests before they were merged into the main branch.

#### JSDoc Documentation, Documentation Comments, and Frontend and Backend READMEs Generation
- The first version of the README files was generated by the AI before custom changes and extensions were added. This was done to speed up the documentation process.

#### Installation Script
- The first version of the installation script was generated by the AI agent.