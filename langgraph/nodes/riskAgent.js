import { tavilySearchMultiple } from '../../services/tavily.js'
import { getGeminiFlash, callGemini, extractJSON } from '../../services/gemini.js'
import { RISK_ANALYSIS_PROMPT } from '../../prompts/index.js'

export async function riskAgentNode(state, config) {
  const { company, ticker, companyData, newsData } = state
  const onProgress = config?.configurable?.onProgress

  onProgress?.({ agent: 'risk', status: 'running', message: 'Assessing risks...' })

  try {
    const queries = [
      `${company} risks challenges threats 2024 2025`,
      `${company} ${companyData?.industry || ''} regulatory risk compliance`,
      `${company} competition market risk supply chain`,
      `${company} geopolitical legal financial risk`,
    ]

    const { results } = await tavilySearchMultiple(queries, { maxResults: 5 })

    const context = `
Company: ${company} (${ticker || ''})
Industry: ${companyData?.industry || ''}
Sector: ${companyData?.sector || ''}
Business: ${companyData?.businessSummary || ''}

Recent Negative News: ${newsData?.articles?.filter(a => a.sentiment === 'negative').map(a => a.headline).join('; ') || 'None'}

Risk Research:
${results.map(r => `[${r.title}]\n${r.content}`).join('\n\n---\n\n')}
`

    const llm = getGeminiFlash()
    const raw = await callGemini(llm, RISK_ANALYSIS_PROMPT, context)
    const riskData = extractJSON(raw)

    if (!Array.isArray(riskData.risks)) riskData.risks = []

    onProgress?.({ agent: 'risk', status: 'done', message: 'Risk assessment complete' })

    return { riskData }
  } catch (err) {
    onProgress?.({ agent: 'risk', status: 'error', message: err.message })
    return { errors: [`Risk: ${err.message}`] }
  }
}
