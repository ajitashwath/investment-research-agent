import { z } from 'zod'

export const ArticleSchema = z.object({
  headline: z.string(),
  source: z.string(),
  url: z.string(),
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  date: z.string(),
  summary: z.string(),
})

export const RiskSchema = z.object({
  category: z.string(),
  description: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  probability: z.enum(['low', 'medium', 'high']),
})

export const CompetitorSchema = z.object({
  name: z.string(),
  ticker: z.string().optional(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  marketPosition: z.string(),
})

export const ScoresSchema = z.object({
  financial: z.number().min(0).max(100),
  growth: z.number().min(0).max(100),
  sentiment: z.number().min(0).max(100),
  moat: z.number().min(0).max(100),
  risk: z.number().min(0).max(100),
  valuation: z.number().min(0).max(100),
  overall: z.number().min(0).max(100),
})

export const GraphStateSchema = z.object({
  company: z.string(),
  ticker: z.string().optional(),

  companyData: z.object({
    name: z.string(),
    ticker: z.string(),
    industry: z.string(),
    sector: z.string(),
    ceo: z.string().optional(),
    founded: z.string().optional(),
    headquarters: z.string().optional(),
    employees: z.number().optional(),
    website: z.string().optional(),
    businessSummary: z.string(),
    products: z.array(z.string()),
    revenueModel: z.string(),
    moat: z.string(),
    keyFacts: z.array(z.string()),
  }).optional(),

  financialData: z.object({
    revenueData: z.array(z.object({
      year: z.number(),
      revenue: z.number().nullable(),
      netIncome: z.number().nullable(),
      grossProfit: z.number().nullable(),
      operatingIncome: z.number().nullable(),
      eps: z.number().nullable(),
    })),
    revenueGrowth: z.number().nullable(),
    grossMargin: z.number().nullable(),
    netMargin: z.number().nullable(),
    debtToEquity: z.number().nullable(),
    freeCashFlow: z.number().nullable(),
    returnOnEquity: z.number().nullable(),
    currentRatio: z.number().nullable(),
    trailingPE: z.number().nullable(),
    forwardPE: z.number().nullable(),
    priceToBook: z.number().nullable(),
    beta: z.number().nullable(),
    totalCash: z.number().nullable(),
    totalDebt: z.number().nullable(),
    ebitda: z.number().nullable(),
    healthScore: z.number(),
    healthGrade: z.string(),
    healthReason: z.string(),
    quote: z.any().optional(),
  }).optional(),

  newsData: z.object({
    articles: z.array(ArticleSchema),
    sentimentScore: z.number(),
    positiveCount: z.number(),
    neutralCount: z.number(),
    negativeCount: z.number(),
    keyThemes: z.array(z.string()),
    summary: z.string(),
  }).optional(),

  riskData: z.object({
    risks: z.array(RiskSchema),
    overallRisk: z.enum(['low', 'medium', 'high', 'critical']),
    riskScore: z.number().min(0).max(100),
    riskSummary: z.string(),
  }).optional(),

  competitorData: z.object({
    competitors: z.array(CompetitorSchema),
    competitivePosition: z.string(),
    moatScore: z.number().min(0).max(100),
    marketShareEstimate: z.string().optional(),
    competitorSummary: z.string(),
  }).optional(),

  growthData: z.object({
    catalysts: z.array(z.string()),
    tailwinds: z.array(z.string()),
    headwinds: z.array(z.string()),
    growthScore: z.number().min(0).max(100),
    growthOutlook: z.enum(['strong', 'moderate', 'weak', 'declining']),
    growthSummary: z.string(),
    tam: z.string().optional(),
  }).optional(),

  decisionData: z.object({
    recommendation: z.enum(['STRONG BUY', 'BUY', 'HOLD', 'SELL', 'STRONG SELL']),
    confidence: z.number().min(0).max(100),
    reasoning: z.string(),
    scores: ScoresSchema,
    keyBullets: z.object({
      bullCase: z.array(z.string()),
      bearCase: z.array(z.string()),
    }),
    timeHorizon: z.string(),
    targetPriceRange: z.string().optional(),
  }).optional(),

  report: z.string().optional(),

  sources: z.array(z.object({
    title: z.string(),
    url: z.string(),
    source: z.string(),
  })).optional(),

  errors: z.array(z.string()).optional(),
})

export const initialState = {
  company: '',
  ticker: undefined,
  companyData: undefined,
  financialData: undefined,
  newsData: undefined,
  riskData: undefined,
  competitorData: undefined,
  growthData: undefined,
  decisionData: undefined,
  report: undefined,
  sources: [],
  errors: [],
}
