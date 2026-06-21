import { tavilySearchMultiple } from '../../services/tavily.js'
import { searchTicker, getQuote } from '../../services/yahooFinance.js'
import { getGeminiFlash, callGemini, extractJSON } from '../../services/gemini.js'
import { COMPANY_RESEARCH_PROMPT } from '../../prompts/index.js'

export async function companyResearchNode(state, config) {
  const { company } = state
  const onProgress = config?.configurable?.onProgress

  onProgress?.({ agent: 'company', status: 'running', message: 'Researching company...' })

  try {
    let ticker = state.ticker

    if (!ticker) {
      ticker = await searchTicker(company)
    }

    const queries = [
      `${company} company overview business model products services 2024`,
      `${company} CEO leadership headquarters founded history`,
      `${company} competitive advantages moat market position`,
      ticker ? `${ticker} investor relations annual report` : `${company} revenue model how makes money`,
    ]

    const { results, answer } = await tavilySearchMultiple(queries, { maxResults: 5 })

    const quote = ticker ? await getQuote(ticker) : null
    const currency = quote?.currency || 'USD'
    const isINR = currency === 'INR' || currency === 'inr'
    const symbol = isINR ? '₹' : '$'
    const marketCapFormatted = quote?.marketCap
      ? (isINR ? `${symbol}${(quote.marketCap / 1e7).toFixed(2)} Cr` : `${symbol}${(quote.marketCap / 1e9).toFixed(1)}B`)
      : 'N/A'
    const currentPriceFormatted = quote?.regularMarketPrice
      ? `${symbol}${quote.regularMarketPrice.toFixed(2)} ${quote.currency || ''}`
      : 'N/A'

    const context = `
Company: ${company}
Ticker: ${ticker || 'Unknown'}
Current Price: ${currentPriceFormatted}
Market Cap: ${marketCapFormatted}

Web Research Summary:
${answer}

Detailed Sources:
${results.map(r => `[${r.title}] (${r.url})\n${r.content}`).join('\n\n---\n\n')}
`

    const llm = getGeminiFlash()
    const raw = await callGemini(llm, COMPANY_RESEARCH_PROMPT, context)
    const companyData = extractJSON(raw)

    if (!companyData.ticker && ticker) companyData.ticker = ticker
    if (!companyData.name) companyData.name = company

    const sources = results.slice(0, 5).map(r => ({
      title: r.title,
      url: r.url,
      source: (() => { try { return new URL(r.url).hostname.replace('www.', '') } catch { return 'Unknown' } })(),
    }))

    onProgress?.({ agent: 'company', status: 'done', message: 'Company research complete' })

    return {
      ticker: companyData.ticker || ticker,
      companyData,
      sources,
    }
  } catch (err) {
    onProgress?.({ agent: 'company', status: 'error', message: err.message })
    return { errors: [`Company research: ${err.message}`] }
  }
}
