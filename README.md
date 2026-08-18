# BuildSense AI 🚀 https://social-ai-hazel.vercel.app/
### AI-Powered Community Sentiment Analysis & Automated Product Roadmap Studio

**BuildSense AI** (Social AI Manager) is an end-to-end AI platform designed for SaaS founders, product managers, and developers. It scrapes community discussions (e.g. Reddit subreddits and posts), runs advanced AI sentiment and feature clustering using Groq LLMs (Llama 3), generates actionable product roadmaps, evaluates live post feedback, and powers branded marketing campaigns directly tied to your workspace projects.

---

## 🌟 Key Features

### 🏢 1. Project Workspaces
- Organize your SaaS products, startup ideas, and micro-tools in isolated project workspaces.
- Each project tracks its own sentiment history, feature feedback evaluations, AI-generated roadmaps, and marketing campaigns.
- Complete CRUD operations (Create, Edit, Delete, View Detail) with real-time summary statistics.

### 📊 2. AI Community Sentiment Analysis
- Scrape Reddit subreddits or provide custom post links to analyze customer discussions.
- Automatically calculates positive, neutral, and negative sentiment distribution.
- Groups feedback into categorized **Feature Clusters** with mention counts and sentiment tags.
- Generates strategic insights and a prioritized **3-Step Product Roadmap**.

### 💬 3. Post Feedback Evaluation
- Input any live launch post URL or feature context.
- The AI analyzes comments to compute community **Agreement vs. Disagreement** metrics.
- Highlights **Top Requested Changes**, user confusions, and recommended next features.

### 📣 4. Project-Linked Brand Campaigns
- Create marketing campaigns strictly scoped under parent workspace projects.
- Define custom brand voice guidelines, tone, and market niches.
- **Generate Campaign Copy**: Automatically produce platform-optimized social posts (e.g. for Reddit or Product Hunt).
- **Active Campaign Management**: View, filter by project, or delete active campaigns with modal confirmations.

### 🤖 5. AI Copilot Studio
- Standalone interactive Copilot for on-demand post generation and community reply drafting.
- Customize tone (friendly, professional, technical) and targeted subreddits.

### 👤 6. Built-in Demo Mode & User Authentication
- Secure JWT-based authentication with bcrypt password hashing.
- One-click **Demo Login** (`demo@buildsense.ai` / `demo1234`) pre-populated with 3 complete sample projects (*DevFlow AI Code Assistant*, *SocialPulse Analytics*, *CloudScale Ops*), sentiment charts, and brand campaigns.

---

## 🏗️ Architecture & Technology Stack

```
   ┌─────────────────────────────────────────────────────────┐
   │                    React 19 Frontend                    │
   │  Vite · Tailwind CSS v4 · Recharts · Lucide · Router v7 │
   └──────────────────────────┬──────────────────────────────┘
                              │ REST API Calls (Axios + JWT)
   ┌──────────────────────────▼──────────────────────────────┐
   │                    Express.js Backend                   │
   │      Auth · Projects · Analysis · Campaigns · Copilot   │
   └─────────────┬─────────────────────────────┬─────────────┘
                 │                             │
    ┌────────────▼──────────┐     ┌────────────▼────────────┐
    │  PostgreSQL Database  │     │   Groq LLM SDK (Llama)  │
    │  Projects, Campaigns, │     │ Sentiment, Clustering,  │
    │  Analyses, Feedback   │     │   Roadmaps & Post Copy  │
    └───────────────────────┘     └─────────────────────────┘
```

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19 (via Vite) |
| **Styling** | Tailwind CSS v4 + Glassmorphism aesthetic |
| **Routing** | React Router v7 |
| **Data Visualization** | Recharts (Area, Bar, Line charts) |
| **Icons & UI** | Lucide React |
| **Backend Runtime** | Node.js (CommonJS) |
| **Server Framework** | Express 5 |
| **Database** | PostgreSQL (`pg` pool) |
| **AI Engine** | Groq SDK (`llama-3.3-70b-versatile`, `llama-3.1-8b-instant`) |
| **Scraper Integration**| Snoowrap (Reddit API) & Cheerio / Axios HTML Parsing |
| **Authentication** | JSON Web Tokens (JWT) & bcryptjs |

---

## 🗄️ Database Schema

BuildSense AI uses a PostgreSQL relational database schema with full user isolation (`user_id`) and cascading foreign key constraints:

```sql
users ──< projects ──< campaigns ──< posts
            │
            ├──< analyses
            └──< post_feedback
```

### Table Breakdown
- **`users`**: Manages accounts (`id`, `name`, `email`, `password`, `created_at`).
- **`projects`**: Top-level workspace container (`id`, `user_id`, `name`, `description`, `created_at`).
- **`analyses`**: Stores subreddit scrape sentiment, feature clusters, and roadmaps (`id`, `project_id`, `user_id`, `product_idea`, `sentiment_positive`, `sentiment_neutral`, `sentiment_negative`, `feature_clusters`, `insights`, `roadmap`).
- **`post_feedback`**: Stores post comment agreement metrics (`id`, `project_id`, `post_url`, `feature_context`, `agreement`, `neutral`, `disagreement`, `top_requested_change`, `confusions`, `recommended_next_feature`).
- **`campaigns`**: Scoped marketing campaigns (`id`, `project_id`, `user_id`, `name`, `brand_voice`, `tone`, `niche`, `mode`).
- **`posts`**: Generated social post drafts (`id`, `campaign_id`, `title`, `content`, `platform`, `status`).

---

## 📂 Directory Structure

```
social-ai-manager/
├── server.js                   # Express server entry point & route mounting
├── package.json                # Backend dependencies & npm scripts
├── .env                        # Environment variables (Database, JWT, Groq)
├── README.md                   # Full Project Documentation & Sitemap
├── src/                        # Backend Source Modules
│   ├── auth/                   # Signup, Login, Me endpoints & JWT middleware
│   │   ├── routes.js
│   │   └── auth.js
│   ├── projects/               # Workspace Projects CRUD & Summary metrics
│   │   └── routes.js
│   ├── analyze/                # AI Community Sentiment Analyzer
│   │   └── routes.js
│   ├── postFeedback/           # Post Comment Evaluation Engine
│   │   └── routes.js
│   ├── campaigns/              # Project-linked Brand Campaigns CRUD
│   │   └── routes.js
│   ├── posts/                  # Campaign Post Generator
│   │   └── routes.js
│   ├── copilot/                # AI Post & Reply Copilot
│   │   ├── routes.js
│   │   ├── generatePost.js
│   │   └── generateReplies.js
│   ├── cluster/                # AI Feature Clustering Module
│   │   └── routes.js
│   ├── roadmap/                # AI Roadmap Generator Module
│   │   └── routes.js
│   ├── ai/                     # Groq LLM Client & Prompt Helpers
│   │   ├── groq.js
│   │   ├── sentiment.js
│   │   ├── cluster.js
│   │   ├── roadmap.js
│   │   └── evaluateFeedback.js
│   └── db/                     # PostgreSQL Pool & Schema Initializer / Seeder
│       ├── index.js
│       └── initDb.js
└── frontend/                   # React Vite Application
    ├── src/
    │   ├── api.js              # Axios API client for backend communication
    │   ├── context/            # AuthContext (state management for logged-in user)
    │   ├── pages/              # UI Pages (Dashboard, Projects, ProjectDetail, Analysis, Campaigns, Copilot, Roadmap)
    │   ├── components/         # Reusable UI (Navbar, Modal, StatCard, LoadingSpinner, Toast)
    │   └── App.jsx             # React Router routing & Protected Route wrapper
    ├── package.json
    └── vite.config.js
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **PostgreSQL**: Local or hosted database instance
- **Groq API Key**: Obtain a free API key from [Groq Console](https://console.groq.com)

---

### 1. Environment Configuration
Create a `.env` file in the root directory `social-ai-manager/`:

```env
PORT=5000
DATABASE_URL=postgres://postgres:your_password@localhost:5432/social_ai
JWT_SECRET=your_jwt_secret_key_12345
GROQ_API_KEY=gsk_your_groq_api_key_here
```

---

### 2. Backend Setup & Database Seeding

Open a terminal in the root directory:

```bash
# Install backend dependencies
npm install

# Start the backend server (automatically runs schema migrations & seeds demo user)
npm start
```
*The server will run on `http://localhost:5000`.*

---

### 3. Frontend Setup

Open a second terminal in the `frontend/` directory:

```bash
cd frontend

# Install frontend dependencies
npm install

# Start the Vite development server
npm run dev
```
*The app will open on `http://localhost:5173`.*

---

## 🔑 Demo Account Credentials

To explore BuildSense AI immediately without signing up, use the built-in demo credentials on the Login screen:

- **Email**: `demo@buildsense.ai`
- **Password**: `demo1234`

*Clicking "Login with Demo Account" on the login page logs you in automatically with 3 pre-configured sample projects, sentiment analyses, and marketing campaigns.*

---

## 🔗 Key API Endpoints

### 🔐 Auth (`/auth`)
- `POST /auth/signup` - Register a new user account.
- `POST /auth/login` - Authenticate user & receive JWT token.
- `GET /auth/me` - Fetch currently authenticated user profile.

### 🏢 Projects (`/projects`)
- `GET /projects` - List all projects for logged-in user.
- `POST /projects` - Create a new project workspace.
- `GET /projects/:id` - Fetch project details.
- `PUT /projects/:id` - Update project details.
- `DELETE /projects/:id` - Delete project and cascading data.
- `GET /projects/:id/summary` - Get aggregated sentiment & feedback stats.
- `GET /projects/:id/sentiment-trend` - Get timeline data for charts.

### 📊 AI Analysis (`/analyze`)
- `POST /analyze` - Run full community analysis on a product idea & subreddit.
- `GET /analyze` - List past analyses.
- `POST /analyze/post` - Run post comment feedback analysis.

### 📣 Campaigns (`/campaigns`)
- `GET /campaigns?projectId=...` - List campaigns (optionally filtered by project).
- `POST /campaigns` - Create a new campaign tied to a project workspace.
- `DELETE /campaigns/:id` - Delete an active campaign.

### 📝 Campaign Posts (`/posts`)
- `POST /posts/:campaignId/generate` - Generate AI marketing post copy for a campaign.

### 🤖 Copilot (`/copilot`)
- `POST /copilot/post` - Generate quick social media post copy.
- `POST /copilot/replies` - Generate community response options.

---

## 📄 License
Distributed under the ISC License. See `LICENSE` for more information.
