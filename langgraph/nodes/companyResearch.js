import { tavilySearch } from '../../services/tavily.js'
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

    // Single Tavily query instead of 2 (saves 1 API call + latency)
    const query = `${company} ${ticker || ''} company overview business model CEO competitive advantages moat revenue model`
    const { results, answer } = await tavilySearch(query, { maxResults: 4, config })

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

    // Pre-fill from Yahoo Finance — reduces what the LLM needs to infer
    const yahooContext = quote ? `
Yahoo Finance Data:
- Name: ${quote.longName || company}
- Ticker: ${ticker}
- Sector: ${quote.sector || 'N/A'}
- Industry: ${quote.industry || 'N/A'}
- Employees: ${quote.fullTimeEmployees || 'N/A'}
- Website: ${quote.website || 'N/A'}
- Current Price: ${currentPriceFormatted}
- Market Cap: ${marketCapFormatted}
- Business: ${quote.longBusinessSummary?.slice(0, 400) || 'N/A'}
` : `Company: ${company}, Ticker: ${ticker || 'Unknown'}, Price: ${currentPriceFormatted}`

    const context = `${yahooContext}

Web Research:
${answer}

Sources:
${results.map(r => `[${r.title}]\n${r.content?.slice(0, 300)}`).join('\n\n---\n\n')}`

    const llm = getGeminiFlash(config, 1024)
    const raw = await callGemini(llm, COMPANY_RESEARCH_PROMPT, context)
    const companyData = extractJSON(raw)

    if (!companyData.ticker && ticker) companyData.ticker = ticker
    if (!companyData.name) companyData.name = quote?.longName || company

    // Override with authoritative Yahoo Finance data where available
    if (quote?.sector && !companyData.sector) companyData.sector = quote.sector
    if (quote?.industry && !companyData.industry) companyData.industry = quote.industry
    if (quote?.fullTimeEmployees && !companyData.employees) companyData.employees = quote.fullTimeEmployees
    if (quote?.website && !companyData.website) companyData.website = quote.website

    const sources = results.slice(0, 4).map(r => ({
      title: r.title,
      url: r.url,
      source: (() => { try { return new URL(r.url).hostname.replace('www.', '') } catch { return 'Unknown' } })(),
    }))

    onProgress?.({ agent: 'company', status: 'done', message: 'Company research complete' })

    return { ticker: companyData.ticker || ticker, companyData, sources, errors: [] }
  } catch (err) {
    onProgress?.({ agent: 'company', status: 'error', message: err.message })
    return { errors: [`Company research: ${err.message}`] }
  }
}
