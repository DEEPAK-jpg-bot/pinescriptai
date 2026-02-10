# PineScript AI Generator

AI-powered Pine Script v6 code generation for TradingView, powered by Google Gemini 2.0 Flash.

## Features

- **AI Code Generation**: Describe trading strategies in plain English, get production-ready Pine Script v6 code
- **Code Explanation**: Get detailed explanations of any Pine Script code
- **Code Refinement**: Modify and improve existing code with natural language instructions
- **Template Library**: Pre-built templates for common strategies (RSI, MACD, Bollinger, etc.)
- **Token Management**: Usage tracking with monthly limits based on subscription tier
- **Response Caching**: Cached responses are free (no token deduction)
- **Monaco Editor**: Professional code editing experience

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Supabase** - PostgreSQL database with Row Level Security
- **Google Gemini 2.0 Flash** - AI code generation
- **Stripe** - Payment processing
- **Upstash Redis** - Distributed rate limiting and caching

### Frontend
- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **Monaco Editor** - Code editor
- **Framer Motion** - Animations
- **Supabase Auth** - Authentication

## Project Structure

```
ANTIGRAVITY/
├── backend/
│   ├── api/                 # API endpoints
│   │   ├── auth.py          # Authentication (login, signup, password reset)
│   │   ├── generate.py      # AI generation, explain, refine
│   │   ├── threads.py       # Conversation threads
│   │   ├── scripts.py       # Saved scripts library
│   │   ├── tokens.py        # Token balance & usage
│   │   ├── payments.py      # Stripe integration
│   │   └── user.py          # User profile
│   ├── services/            # Business logic
│   │   ├── ai_service.py    # Gemini integration
│   │   ├── token_service.py # Token management
│   │   └── cache_service.py # Redis caching
│   ├── models/              # Pydantic schemas
│   ├── utils/               # Helpers, security, rate limiting
│   ├── data/                # AI context files
│   ├── config.py            # Environment validation
│   ├── server.py            # FastAPI application
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── pages/           # React pages
│   │   ├── components/      # UI components
│   │   ├── context/         # Auth context
│   │   └── utils/           # API client, Supabase client
│   └── package.json
├── supabase_schema.sql      # Database schema
└── vercel.json              # Vercel deployment config
```

## Setup

### Prerequisites
- Node.js 18+
- Python 3.9+
- Supabase account
- Google AI Studio account (for Gemini API key)
- Stripe account (optional, for payments)
- Upstash account (optional, for Redis)

### 1. Database Setup

1. Create a new Supabase project
2. Run the SQL schema in `supabase_schema.sql` in the Supabase SQL Editor
3. Enable Row Level Security on all tables (already in schema)

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env with your credentials:
# - SUPABASE_URL
# - SUPABASE_SERVICE_KEY
# - SUPABASE_JWT_SECRET
# - GEMINI_API_KEY

# Run development server
uvicorn server:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your Supabase credentials:
# - REACT_APP_SUPABASE_URL
# - REACT_APP_SUPABASE_ANON_KEY
# - REACT_APP_API_URL=http://localhost:8000/api

# Run development server
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out
- `POST /api/auth/password/reset` - Request password reset
- `POST /api/auth/password/update` - Update password with token
- `POST /api/auth/password/change` - Change password (authenticated)

### AI Generation
- `POST /api/generate` - Generate Pine Script code
- `POST /api/explain` - Explain Pine Script code
- `POST /api/refine` - Modify existing code
- `POST /api/estimate` - Estimate token usage

### Threads & Scripts
- `GET /api/threads` - List threads
- `GET /api/threads/{id}` - Get thread with messages
- `DELETE /api/threads/{id}` - Delete thread
- `GET /api/scripts` - List saved scripts
- `POST /api/scripts` - Save script
- `DELETE /api/scripts/{id}` - Delete script

### Tokens & Payments
- `GET /api/tokens/balance` - Get token balance
- `GET /api/tokens/usage` - Get usage analytics
- `POST /api/payments/checkout` - Create Stripe checkout
- `POST /api/payments/webhook` - Stripe webhook handler
- `GET /api/payments/subscription` - Get subscription status

## Subscription Tiers

| Plan | Tokens/Month | Rate Limit | Features |
|------|--------------|------------|----------|
| Hobby (Free) | 1,000 | 10 req/min | Basic generation, 24h thread expiry |
| Starter | 5,000 | 15 req/min | All features, permanent threads |
| Pro | 25,000 | 30 req/min | All features, priority support |
| Business | 100,000 | 100 req/min | All features, custom integrations |

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy - Vercel will automatically build both frontend and backend

### Manual Deployment

Backend can be deployed to any Python hosting (Railway, Render, AWS Lambda, etc.)
Frontend can be deployed to any static hosting (Vercel, Netlify, etc.)

## Security Features

- JWT-based authentication via Supabase
- Row Level Security on all database tables
- Prompt sanitization against injection attacks
- Rate limiting (per-user and global)
- Stripe webhook signature verification
- CORS configuration for frontend origins

## License

MIT
