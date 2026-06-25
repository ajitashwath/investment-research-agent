import { tavilySearchMultiple } from '../../services/tavily.js'
import { getGeminiFlash, callGemini, extractJSON } from '../../services/gemini.js'
import { COMPETITOR_ANALYSIS_PROMPT } from '../../prompts/index.js'

export async function competitorAgentNode(state, config) {
  const { company, ticker, companyData } = state
  const onProgress = config?.configurable?.onProgress

  onProgress?.({ agent: 'competitors', status: 'running', message: 'Mapping competitive landscape...' })

  try {
    const currentYear = new Date().getFullYear()
    const queries = [
      `${company} main competitors rivals ${currentYear} market share`,
      `${companyData?.industry || company} top companies competitive landscape`,
      `${company} vs competitors comparison strengths weaknesses`,
      `${company} competitive advantages moat market position`,
    ]

    const { results, warnings } = await tavilySearchMultiple(queries, { maxResults: 5, config })

    const context = `
Company: ${company} (${ticker || ''})
Industry: ${companyData?.industry || ''}
Products: ${companyData?.products?.join(', ') || ''}
Moat: ${companyData?.moat || ''}

Competitive Intelligence:
${results.map(r => `[${r.title}]\n${r.content}`).join('\n\n---\n\n')}
`

    const llm = getGeminiFlash(config)
    const raw = await callGemini(llm, COMPETITOR_ANALYSIS_PROMPT, context)
    const competitorData = extractJSON(raw)

    if (!Array.isArray(competitorData.competitors)) competitorData.competitors = []

    const hasWarnings = warnings && warnings.length > 0
    onProgress?.({
      agent: 'competitors',
      status: hasWarnings ? 'warning' : 'done',
      message: hasWarnings ? 'Competitor analysis completed with search warnings' : 'Competitor analysis complete'
    })

    return { competitorData, errors: warnings || [] }
  } catch (err) {
    onProgress?.({ agent: 'competitors', status: 'error', message: err.message })
    return { errors: [`Competitors: ${err.message}`] }
  }
}
