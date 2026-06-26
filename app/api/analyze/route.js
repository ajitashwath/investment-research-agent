import { runInvestmentAnalysis } from '../../../langgraph/graph.js'
import { setCustomKeys } from '../../../services/keys.js'
import { checkRateLimit } from '../../../utils/rateLimiter.js'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST(request) {
  let company
  let geminiKey
  let tavilyKey
  let model
  let depth
  let userId
  try {
    const body = await request.json()
    company = body?.company
    geminiKey = body?.geminiKey
    tavilyKey = body?.tavilyKey
    model = body?.model
    depth = body?.depth
    userId = body?.userId
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid or missing JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Rate Limiting
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             '127.0.0.1'
  const rateLimitIdentifier = userId || ip

  const rateLimitResult = await checkRateLimit(rateLimitIdentifier)
  if (!rateLimitResult.allowed) {
    const resetTimeStr = new Date(rateLimitResult.resetTime).toLocaleTimeString()
    return new Response(JSON.stringify({ 
      error: `Rate limit exceeded. You have reached your daily limit of ${rateLimitResult.max} analyses. Please try again after ${resetTimeStr}.` 
    }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  setCustomKeys(geminiKey, tavilyKey, depth)

  if (!company || typeof company !== 'string' || company.trim().length < 1) {
    return new Response(JSON.stringify({ error: 'Company name is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      const agentOrder = ['company', 'financials', 'news', 'risk', 'competitors', 'growth', 'decision', 'report']
      const agentProgress = {}

      agentOrder.forEach((a) => { agentProgress[a] = 0 })

      send({ type: 'start', message: `Starting analysis for ${company.trim()}` })

      const onProgress = ({ agent, status, message }) => {
        if (status === 'running') {
          agentProgress[agent] = 30
        } else if (status === 'done' || status === 'warning') {
          agentProgress[agent] = 100
        } else if (status === 'error') {
          agentProgress[agent] = -1
        }

        send({
          type: 'progress',
          agent,
          status,
          message,
          progress: agentProgress,
        })
      }

      try {
        const result = await runInvestmentAnalysis(company.trim(), onProgress, {
          model,
          depth,
          geminiKey,
          tavilyKey,
        })

        send({
          type: 'result',
          data: {
            company: result.companyData,
            ticker: result.ticker,
            financials: result.financialData,
            news: result.newsData,
            risks: result.riskData,
            competitors: result.competitorData,
            growth: result.growthData,
            decision: result.decisionData,
            report: result.report,
            sources: result.sources,
            errors: result.errors,
          },
        })
      } catch (err) {
        send({
          type: 'error',
          message: err.message || 'Analysis failed',
        })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
