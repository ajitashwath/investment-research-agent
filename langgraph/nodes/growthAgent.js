import { tavilySearch } from '../../services/tavily.js'
import { getGeminiFlash, callGemini, extractJSON } from '../../services/gemini.js'
import { GROWTH_ANALYSIS_PROMPT } from '../../prompts/index.js'

export async function growthAgentNode(state, config) {
  const { company, ticker, companyData } = state
  const onProgress = config?.configurable?.onProgress

  onProgress?.({ agent: 'growth', status: 'running', message: 'Analyzing growth prospects...' })

  try {
    const { results, warning } = await tavilySearch(
      `${company} ${ticker || ''} growth strategy expansion TAM total addressable market product roadmap future outlook`,
      { maxResults: 4, config }
    )

    const context = `
Company: ${company} (${ticker || ''})
Industry: ${companyData?.industry || ''}
Products: ${companyData?.products?.join(', ') || ''}
Revenue Model: ${companyData?.revenueModel || ''}

Growth Research:
${results.map(r => `[${r.title}]\n${r.content?.slice(0, 400)}`).join('\n\n---\n\n')}`

    const llm = getGeminiFlash(config, 1536)
    const raw = await callGemini(llm, GROWTH_ANALYSIS_PROMPT, context)
    const growthData = extractJSON(raw)

    if (!Array.isArray(growthData.catalysts)) growthData.catalysts = []
    if (!Array.isArray(growthData.tailwinds)) growthData.tailwinds = []
    if (!Array.isArray(growthData.headwinds)) growthData.headwinds = []

    const warnings = warning ? [warning] : []
    onProgress?.({ agent: 'growth', status: warnings.length ? 'warning' : 'done', message: 'Growth analysis complete' })
    return { growthData, errors: warnings }
  } catch (err) {
    onProgress?.({ agent: 'growth', status: 'error', message: err.message })
    return { errors: [`Growth: ${err.message}`] }
  }
}
