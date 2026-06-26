# Prisma — Multi-Agentic AI Investment Research System
Multi-agent investment research system powered by **LangGraph.js**, **Google Gemini 2.5**, **Tavily**, and **Yahoo Finance**.

## Stack
- **Frontend**: Next.js 15, React 19, Framer Motion, Recharts
- **Backend**: Next.js Route Handlers (SSE streaming)
- **AI**: LangGraph.js + Google Gemini 2.5 Flash / Pro
- **Data**: Yahoo Finance, Tavily Web Search

## Setup
1. Copy `.env.local.example` → `.env.local`
2. Fill in your API keys:
   ```
   GEMINI_API_KEY=your_key_here
   TAVILY_API_KEY=your_key_here
   ```
3. Run: `npm run dev`
4. Open: http://localhost:3000

## Architecture

```
User Input
    │
    ▼
Company Research Agent (Tavily + Yahoo Finance)
    │
    ├─── [Parallel Fan-Out] ──────────────────────┐
    ▼         ▼          ▼          ▼         ▼   │
Financials  News      Risk     Competitor  Growth  │
Agent       Agent     Agent    Agent       Agent   │
    └────────────────────────────────────────┘
                        │
                        ▼
            Investment Decision Agent (Gemini Pro)
                        │
                        ▼
               Report Generator
                        │
                        ▼
         Streamed SSE → React Dashboard
```

## Get API Keys

- **Gemini**: https://aistudio.google.com/apikey
- **Tavily**: https://tavily.com (free tier: 1000 searches/month)
