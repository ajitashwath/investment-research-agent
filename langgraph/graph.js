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

export function buildInvestmentGraph() {
  const graph = new StateGraph(GraphState)

  graph.addNode('company_research', companyResearchNode)
  graph.addNode('financials_agent', financialsAgentNode)
  graph.addNode('news_agent', newsAgentNode)
  graph.addNode('risk_agent', riskAgentNode)
  graph.addNode('competitor_agent', competitorAgentNode)
  graph.addNode('growth_agent', growthAgentNode)
  graph.addNode('decision_agent', decisionAgentNode)
  graph.addNode('report_gen', reportGeneratorNode)

  graph.addEdge(START, 'company_research')

  // Tier 1 Parallel Research
  graph.addEdge('company_research', 'financials_agent')
  graph.addEdge('company_research', 'news_agent')
  graph.addEdge('company_research', 'competitor_agent')

  // Tier 2 Parallel Research (Data Dependency Resolution)
  graph.addEdge('financials_agent', 'growth_agent')
  graph.addEdge('news_agent', 'risk_agent')

  // Fan-in / Join to Decision Agent
  graph.addEdge('growth_agent', 'decision_agent')
  graph.addEdge('risk_agent', 'decision_agent')
  graph.addEdge('competitor_agent', 'decision_agent')

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
