import { tavilySearchMultiple } from '../../services/tavily.js'
import { getGeminiFlash, callGemini, extractJSON } from '../../services/gemini.js'
import { GROWTH_ANALYSIS_PROMPT } from '../../prompts/index.js'

export async function growthAgentNode(state, config) {
  const { company, ticker, companyData, financialData } = state
  const onProgress = config?.configurable?.onProgress

  onProgress?.({ agent: 'growth', status: 'running', message: 'Analyzing growth prospects...' })

  try {
    const currentYear = new Date().getFullYear()
    const queries = [
      `${company} growth strategy expansion plans ${currentYear - 1} ${currentYear} ${currentYear + 1}`,
      `${company} total addressable market TAM opportunity size`,
      `${companyData?.industry || company} market growth trends outlook`,
      `${company} product roadmap innovation pipeline`,
    ]

    const { results, warnings } = await tavilySearchMultiple(queries, { maxResults: 5, config })

    const context = `
Company: ${company} (${ticker || ''})
Industry: ${companyData?.industry || ''}
Products: ${companyData?.products?.join(', ') || ''}

Financial Growth Signals:
- Revenue Growth YoY: ${financialData?.revenueGrowth != null ? financialData.revenueGrowth.toFixed(1) + '%' : 'N/A'}
- Gross Margin: ${financialData?.grossMargin != null ? financialData.grossMargin.toFixed(1) + '%' : 'N/A'}
- Free Cash Flow: ${financialData?.freeCashFlow ? '$' + (financialData.freeCashFlow / 1e9).toFixed(2) + 'B' : 'N/A'}
- Forward P/E: ${financialData?.forwardPE || 'N/A'}

Growth Research:
${results.map(r => `[${r.title}]\n${r.content}`).join('\n\n---\n\n')}
`

    const llm = getGeminiFlash(config)
    const raw = await callGemini(llm, GROWTH_ANALYSIS_PROMPT, context)
    const growthData = extractJSON(raw)

    if (!Array.isArray(growthData.catalysts)) growthData.catalysts = []
    if (!Array.isArray(growthData.tailwinds)) growthData.tailwinds = []
    if (!Array.isArray(growthData.headwinds)) growthData.headwinds = []

    const hasWarnings = warnings && warnings.length > 0
    onProgress?.({
      agent: 'growth',
      status: hasWarnings ? 'warning' : 'done',
      message: hasWarnings ? 'Growth analysis completed with search warnings' : 'Growth analysis complete'
    })

    return { growthData, errors: warnings || [] }
  } catch (err) {
    onProgress?.({ agent: 'growth', status: 'error', message: err.message })
    return { errors: [`Growth: ${err.message}`] }
  }
}
