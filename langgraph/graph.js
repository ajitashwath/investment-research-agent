import { Annotation, StateGraph, END, START } from '@langchain/langgraph'
import { companyResearchNode } from './nodes/companyResearch.js'
import { financialsAgentNode } from './nodes/financialsAgent.js'
import { newsAgentNode } from './nodes/newsAgent.js'
import { riskAgentNode } from './nodes/riskAgent.js'
import { competitorAgentNode } from './nodes/competitorAgent.js'
import { growthAgentNode } from './nodes/growthAgent.js'
import { decisionAgentNode } from './nodes/decisionAgent.js'
import { reportGeneratorNode } from './nodes/reportGenerator.js'

const GraphState = Annotation.Root({
  company: Annotation({ reducer: (x, y) => y ?? x, default: () => '' }),
  ticker: Annotation({ reducer: (x, y) => y ?? x, default: () => undefined }),
  companyData: Annotation({ reducer: (x, y) => y ?? x, default: () => undefined }),
  financialData: Annotation({ reducer: (x, y) => y ?? x, default: () => undefined }),
  newsData: Annotation({ reducer: (x, y) => y ?? x, default: () => undefined }),
  riskData: Annotation({ reducer: (x, y) => y ?? x, default: () => undefined }),
  competitorData: Annotation({ reducer: (x, y) => y ?? x, default: () => undefined }),
  growthData: Annotation({ reducer: (x, y) => y ?? x, default: () => undefined }),
  decisionData: Annotation({ reducer: (x, y) => y ?? x, default: () => undefined }),
  report: Annotation({ reducer: (x, y) => y ?? x, default: () => undefined }),
  sources: Annotation({ reducer: (x, y) => [...(x || []), ...(y || [])], default: () => [] }),
  errors: Annotation({ reducer: (x, y) => [...(x || []), ...(y || [])], default: () => [] }),
})

async function parallelResearchNode(state, config) {
  const onProgress = config?.configurable?.onProgress

  onProgress?.({ agent: 'parallel', status: 'running', message: 'Running parallel analysis...' })

  const [financialResult, newsResult, riskResult, competitorResult, growthResult] =
    await Promise.allSettled([
      financialsAgentNode(state, config),
      newsAgentNode(state, config),
      riskAgentNode(state, config),
      competitorAgentNode(state, config),
      growthAgentNode(state, config),
    ])

  const updates = {}
  const errors = []

  if (financialResult.status === 'fulfilled') {
    if (financialResult.value.financialData) updates.financialData = financialResult.value.financialData
    if (financialResult.value.errors) errors.push(...financialResult.value.errors)
  } else if (financialResult.status === 'rejected') {
    errors.push(`Financials: ${financialResult.reason?.message}`)
  }

  if (newsResult.status === 'fulfilled') {
    if (newsResult.value.newsData) {
      updates.newsData = newsResult.value.newsData
      updates.sources = newsResult.value.sources || []
    }
    if (newsResult.value.errors) errors.push(...newsResult.value.errors)
  } else if (newsResult.status === 'rejected') {
    errors.push(`News: ${newsResult.reason?.message}`)
  }

  if (riskResult.status === 'fulfilled') {
    if (riskResult.value.riskData) updates.riskData = riskResult.value.riskData
    if (riskResult.value.errors) errors.push(...riskResult.value.errors)
  } else if (riskResult.status === 'rejected') {
    errors.push(`Risk: ${riskResult.reason?.message}`)
  }

  if (competitorResult.status === 'fulfilled') {
    if (competitorResult.value.competitorData) updates.competitorData = competitorResult.value.competitorData
    if (competitorResult.value.errors) errors.push(...competitorResult.value.errors)
  } else if (competitorResult.status === 'rejected') {
    errors.push(`Competitors: ${competitorResult.reason?.message}`)
  }

  if (growthResult.status === 'fulfilled') {
    if (growthResult.value.growthData) updates.growthData = growthResult.value.growthData
    if (growthResult.value.errors) errors.push(...growthResult.value.errors)
  } else if (growthResult.status === 'rejected') {
    errors.push(`Growth: ${growthResult.reason?.message}`)
  }

  onProgress?.({ agent: 'parallel', status: 'done', message: 'Parallel analysis complete' })

  return { ...updates, errors }
}

export function buildInvestmentGraph() {
  const graph = new StateGraph(GraphState)

  graph.addNode('company_research', companyResearchNode)
  graph.addNode('parallel_research', parallelResearchNode)
  graph.addNode('decision_agent', decisionAgentNode)
  graph.addNode('report_gen', reportGeneratorNode)

  graph.addEdge(START, 'company_research')
  graph.addEdge('company_research', 'parallel_research')
  graph.addEdge('parallel_research', 'decision_agent')
  graph.addEdge('decision_agent', 'report_gen')
  graph.addEdge('report_gen', END)

  return graph.compile()
}

export async function runInvestmentAnalysis(company, onProgress, options = {}) {
  const graph = buildInvestmentGraph()
  const result = await graph.invoke(
    { company, sources: [], errors: [] },
    { configurable: { onProgress, ...options }, recursionLimit: 50 }
  )
  return result
}
