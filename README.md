# DevFlow: AI-Powered Code Review Automation

AI-powered platform that integrates with GitHub to automatically analyze pull requests and provide intelligent feedback.

## What It Does

- Receives GitHub webhook events when pull requests are opened
- Fetches code changes and analyzes them using OpenAI
- Provides automated feedback on security, performance, and code quality
- Displays review results in a web dashboard

## Tech Stack

**Backend:** Node.js, TypeScript, Express, PostgreSQL, Prisma  
**Frontend:** React, TypeScript, Tailwind CSS  
**AI:** OpenAI API  
**Integration:** GitHub Webhooks & API

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- OpenAI API key
- GitHub repository access

### Installation

1. **Clone and install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend  
npm install
```

2. **Environment variables**

Backend `.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/devflow"
OPENAI_API_KEY="your-openai-key"
GITHUB_TOKEN="your-github-token"
PORT=3001
```

Frontend `.env`:
```env
VITE_API_URL=http://localhost:3001/api/v1
```

3. **Database setup**
```bash
cd backend
npx prisma migrate dev
```

4. **Start servers**
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

## Project Structure

```
backend/
├── src/
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   ├── types/           # TypeScript definitions
│   └── app.ts
├── prisma/schema.prisma # Database schema
└── package.json

frontend/
├── src/
│   ├── components/      # React components
│   ├── pages/           # Dashboard page
│   ├── services/        # API calls
│   └── types/           # TypeScript definitions
└── package.json
```

## API Endpoints

- `POST /api/v1/webhooks/github` - GitHub webhook receiver
- `GET /api/v1/reviews` - List all reviews
- `GET /api/v1/reviews/:id` - Get specific review
- `GET /health` - Health check

## GitHub Integration

1. **Add webhook to your repository:**
   - URL: `http://localhost:3001/api/v1/webhooks/github` (for local development)
   - Content type: `application/json`
   - Events: Pull requests

2. **Generate GitHub token with repo access**

## How It Works

1. GitHub sends webhook when PR is opened
2. System fetches PR diff from GitHub API
3. OpenAI analyzes code changes
4. Results stored in PostgreSQL database
5. Dashboard displays review summary and comments

## Database Schema

- **Users** - GitHub user information
- **Repositories** - Connected repositories  
- **PullRequests** - PR metadata
- **Reviews** - Analysis results with scores
- **Comments** - Individual feedback items

## Development Commands

```bash
# Backend
npm run dev     # Start with hot reload
npm run build   # Compile TypeScript
npm run lint    # Code linting

# Frontend  
npm run dev     # Start dev server
npm run build   # Production build
```

## Testing

Run webhook test:
```bash
cd backend
node webhook-test.js
```
