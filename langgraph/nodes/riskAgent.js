import { tavilySearchMultiple } from '../../services/tavily.js'
import { getGeminiFlash, callGemini, extractJSON } from '../../services/gemini.js'
import { RISK_ANALYSIS_PROMPT } from '../../prompts/index.js'

export async function riskAgentNode(state, config) {
  const { company, ticker, companyData, newsData } = state
  const onProgress = config?.configurable?.onProgress

  onProgress?.({ agent: 'risk', status: 'running', message: 'Assessing risks...' })

  try {
    const currentYear = new Date().getFullYear()
    const queries = [
      `${company} risks challenges threats ${currentYear - 1} ${currentYear}`,
      `${company} ${companyData?.industry || ''} regulatory risk compliance`,
      `${company} competition market risk supply chain`,
      `${company} geopolitical legal financial risk`,
    ]

    const { results, warnings } = await tavilySearchMultiple(queries, { maxResults: 5, config })

    const context = `
Company: ${company} (${ticker || ''})
Industry: ${companyData?.industry || ''}
Sector: ${companyData?.sector || ''}
Business: ${companyData?.businessSummary || ''}

Recent Negative News: ${newsData?.articles?.filter(a => a.sentiment === 'negative').map(a => a.headline).join('; ') || 'None'}

Risk Research:
${results.map(r => `[${r.title}]\n${r.content}`).join('\n\n---\n\n')}
`

    const llm = getGeminiFlash(config)
    const raw = await callGemini(llm, RISK_ANALYSIS_PROMPT, context)
    const riskData = extractJSON(raw)

    if (!Array.isArray(riskData.risks)) riskData.risks = []

    const hasWarnings = warnings && warnings.length > 0
    onProgress?.({
      agent: 'risk',
      status: hasWarnings ? 'warning' : 'done',
      message: hasWarnings ? 'Risk assessment completed with search warnings' : 'Risk assessment complete'
    })

    return { riskData, errors: warnings || [] }
  } catch (err) {
    onProgress?.({ agent: 'risk', status: 'error', message: err.message })
    return { errors: [`Risk: ${err.message}`] }
  }
}
