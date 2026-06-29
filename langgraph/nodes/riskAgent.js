import { tavilySearch } from '../../services/tavily.js'
import { getGeminiFlash, callGemini, extractJSON } from '../../services/gemini.js'
import { RISK_ANALYSIS_PROMPT } from '../../prompts/index.js'

export async function riskAgentNode(state, config) {
  const { company, ticker, companyData } = state
  const onProgress = config?.configurable?.onProgress

  onProgress?.({ agent: 'risk', status: 'running', message: 'Assessing risks...' })

  try {
    const { results, warning } = await tavilySearch(
      `${company} ${ticker || ''} business risks regulatory competition financial threats litigation`,
      { maxResults: 4, config }
    )

    const context = `
Company: ${company} (${ticker || ''})
Industry: ${companyData?.industry || ''}
Sector: ${companyData?.sector || ''}
Business: ${companyData?.businessSummary || ''}

Risk Research:
${results.map(r => `[${r.title}]\n${r.content?.slice(0, 400)}`).join('\n\n---\n\n')}`

    const llm = getGeminiFlash(config, 1536)
    const raw = await callGemini(llm, RISK_ANALYSIS_PROMPT, context)
    const riskData = extractJSON(raw)

    if (!Array.isArray(riskData.risks)) riskData.risks = []

    const warnings = warning ? [warning] : []
    onProgress?.({ agent: 'risk', status: warnings.length ? 'warning' : 'done', message: 'Risk assessment complete' })
    return { riskData, errors: warnings }
  } catch (err) {
    onProgress?.({ agent: 'risk', status: 'error', message: err.message })
    return { errors: [`Risk: ${err.message}`] }
  }
}
