import { runInvestmentAnalysis } from '../../../langgraph/graph.js'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST(request) {
  const { company } = await request.json()

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
        } else if (status === 'done') {
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
        const result = await runInvestmentAnalysis(company.trim(), onProgress)

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
