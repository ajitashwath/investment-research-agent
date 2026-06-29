import { tavilySearch } from '../../services/tavily.js'
import { getGeminiFlash, callGemini, extractJSON } from '../../services/gemini.js'
import { COMPETITOR_ANALYSIS_PROMPT } from '../../prompts/index.js'

export async function competitorAgentNode(state, config) {
  const { company, ticker, companyData } = state
  const onProgress = config?.configurable?.onProgress

  onProgress?.({ agent: 'competitors', status: 'running', message: 'Mapping competitive landscape...' })

  try {
    const { results, warning } = await tavilySearch(
      `${company} ${ticker || ''} top competitors market share competitive advantages`,
      { maxResults: 4, config }
    )

    const context = `
Company: ${company} (${ticker || ''})
Industry: ${companyData?.industry || ''}
Products: ${companyData?.products?.join(', ') || ''}
Moat: ${companyData?.moat || ''}

Competitive Intelligence:
${results.map(r => `[${r.title}]\n${r.content?.slice(0, 400)}`).join('\n\n---\n\n')}`

    const llm = getGeminiFlash(config, 1536)
    const raw = await callGemini(llm, COMPETITOR_ANALYSIS_PROMPT, context)
    const competitorData = extractJSON(raw)

    if (!Array.isArray(competitorData.competitors)) competitorData.competitors = []

    const warnings = warning ? [warning] : []
    onProgress?.({ agent: 'competitors', status: warnings.length ? 'warning' : 'done', message: 'Competitor analysis complete' })
    return { competitorData, errors: warnings }
  } catch (err) {
    onProgress?.({ agent: 'competitors', status: 'error', message: err.message })
    return { errors: [`Competitors: ${err.message}`] }
  }
}
