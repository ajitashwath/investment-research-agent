import { getFinancials, getQuote } from '../../services/yahooFinance.js'
import { getGeminiFlash, callGemini, extractJSON } from '../../services/gemini.js'
import { FINANCIALS_COMBINED_PROMPT, FINANCIALS_EXTRACTION_PROMPT } from '../../prompts/index.js'
import { tavilySearch } from '../../services/tavily.js'

function fmt(num, currency = 'USD') {
  if (num == null) return 'N/A'
  const isINR = currency === 'INR' || currency === 'inr'
  const symbol = isINR ? '₹' : '$'
  if (isINR) {
    const abs = Math.abs(num)
    if (abs >= 1e7) return `${symbol}${(num / 1e7).toFixed(2)} Cr`
    if (abs >= 1e5) return `${symbol}${(num / 1e5).toFixed(2)} L`
    return `${symbol}${num.toLocaleString('en-IN')}`
  } else {
    const abs = Math.abs(num)
    if (abs >= 1e12) return `${symbol}${(num / 1e12).toFixed(2)}T`
    if (abs >= 1e9) return `${symbol}${(num / 1e9).toFixed(2)}B`
    if (abs >= 1e6) return `${symbol}${(num / 1e6).toFixed(2)}M`
    return `${symbol}${num.toFixed(2)}`
  }
}

export async function financialsAgentNode(state, config) {
  const { company, ticker, companyData } = state
  const onProgress = config?.configurable?.onProgress

  onProgress?.({ agent: 'financials', status: 'running', message: 'Fetching financial data...' })

  try {
    const resolvedTicker = ticker || companyData?.ticker
    if (!resolvedTicker) throw new Error('No ticker available for financial analysis')

    let financials = await getFinancials(resolvedTicker)
    let warnings = []

    if (!financials) {
      // Yahoo Finance blocked — fallback to Tavily web search
      onProgress?.({ agent: 'financials', status: 'running', message: 'Yahoo blocked, searching web...' })

      const quote = await getQuote(resolvedTicker)
      const currentYear = new Date().getFullYear()
      const { results, warnings: searchWarnings } = await tavilySearch(
        `${company} ${resolvedTicker} annual revenue net income financials ${currentYear - 1} ${currentYear}`,
        { maxResults: 4, config }
      )
      warnings = searchWarnings ? [searchWarnings] : []

      const fallbackContext = `
Company: ${company} (${resolvedTicker})
Web Search Financial Data:
${results.map(r => `${r.title}\n${r.content?.slice(0, 400)}`).join('\n\n---\n\n')}`

      const llm = getGeminiFlash(config, 2048)
      const rawExtracted = await callGemini(llm, FINANCIALS_EXTRACTION_PROMPT, fallbackContext)
      financials = extractJSON(rawExtracted)

      if (!Array.isArray(financials.revenueData)) financials.revenueData = []

      if (quote) {
        financials.quote = {
          symbol: quote.symbol || resolvedTicker,
          longName: quote.longName || company,
          regularMarketPrice: quote.regularMarketPrice,
          regularMarketChange: quote.regularMarketChange,
          regularMarketChangePercent: quote.regularMarketChangePercent,
          marketCap: financials.quote?.marketCap ?? null,
          fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
          fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
          currency: quote.currency || 'USD',
          exchange: quote.exchange || 'NASDAQ',
        }
      } else {
        if (!financials.quote) {
          financials.quote = {
            symbol: resolvedTicker, longName: company,
            regularMarketPrice: null, regularMarketChange: null,
            regularMarketChangePercent: null, marketCap: null,
            fiftyTwoWeekHigh: null, fiftyTwoWeekLow: null,
            currency: 'USD', exchange: 'NASDAQ',
          }
        }
      }

      // FINANCIALS_EXTRACTION_PROMPT already includes health score — return directly
      const financialData = {
        ...financials,
        healthScore: financials.healthScore ?? 50,
        healthGrade: financials.healthGrade ?? 'C',
        healthReason: financials.healthReason ?? 'Assessment based on limited data',
      }

      onProgress?.({ agent: 'financials', status: warnings.length ? 'warning' : 'done', message: 'Financial analysis complete' })
      return { financialData, errors: warnings }
    }

    // Happy path: Yahoo Finance data available
    // Single LLM call for BOTH financial metrics + health score (was 2 calls before)
    const currency = financials.quote?.currency || 'USD'
    const financialContext = `
Company: ${company} (${resolvedTicker})

INCOME STATEMENT:
- Total Revenue (TTM): ${fmt(financials.totalRevenue, currency)}
- Gross Profit: ${fmt(financials.grossProfit, currency)}
- Net Income: ${fmt(financials.netIncome, currency)}
- EBITDA: ${fmt(financials.ebitda, currency)}
- Revenue Growth YoY: ${financials.revenueGrowth != null ? financials.revenueGrowth.toFixed(1) + '%' : 'N/A'}
- Gross Margin: ${financials.grossMargin != null ? financials.grossMargin.toFixed(1) + '%' : 'N/A'}
- Net Margin: ${financials.netMargin != null ? financials.netMargin.toFixed(1) + '%' : 'N/A'}

BALANCE SHEET:
- Total Cash: ${fmt(financials.totalCash, currency)}
- Total Debt: ${fmt(financials.totalDebt, currency)}
- Debt-to-Equity: ${financials.debtToEquity != null ? financials.debtToEquity.toFixed(2) : 'N/A'}
- Current Ratio: ${financials.currentRatio != null ? financials.currentRatio.toFixed(2) : 'N/A'}

CASH FLOW:
- Free Cash Flow: ${fmt(financials.freeCashFlow, currency)}
- Operating Cash Flow: ${fmt(financials.operatingCashFlow, currency)}

VALUATION:
- P/E (Trailing): ${financials.trailingPE != null ? financials.trailingPE.toFixed(1) : 'N/A'}
- P/E (Forward): ${financials.forwardPE != null ? financials.forwardPE.toFixed(1) : 'N/A'}
- Price/Book: ${financials.priceToBook != null ? financials.priceToBook.toFixed(2) : 'N/A'}
- Beta: ${financials.beta != null ? financials.beta.toFixed(2) : 'N/A'}
- ROE: ${financials.returnOnEquity != null ? financials.returnOnEquity.toFixed(1) + '%' : 'N/A'}

HISTORICAL:
${financials.revenueData?.slice(0, 3).map(d => `${d.year}: Revenue=${fmt(d.revenue, currency)}, Net Income=${fmt(d.netIncome, currency)}, EPS=${d.eps != null ? d.eps.toFixed(2) : 'N/A'}`).join('\n')}`

    // Single call: FINANCIALS_COMBINED_PROMPT outputs metrics + healthScore + healthGrade + healthReason
    const llm = getGeminiFlash(config, 2048)
    const rawResponse = await callGemini(llm, FINANCIALS_COMBINED_PROMPT, financialContext)
    const combined = extractJSON(rawResponse)

    const financialData = {
      ...financials,
      // Override with any LLM-extracted improvements
      revenueGrowth: combined.revenueGrowth ?? financials.revenueGrowth,
      grossMargin: combined.grossMargin ?? financials.grossMargin,
      netMargin: combined.netMargin ?? financials.netMargin,
      healthScore: combined.healthScore ?? 50,
      healthGrade: combined.healthGrade ?? 'C',
      healthReason: combined.healthReason ?? 'Assessment unavailable',
      revenueData: financials.revenueData?.length ? financials.revenueData : (combined.revenueData || []),
    }

    onProgress?.({ agent: 'financials', status: 'done', message: 'Financial analysis complete' })
    return { financialData, errors: [] }
  } catch (err) {
    onProgress?.({ agent: 'financials', status: 'error', message: err.message })
    return { errors: [`Financials: ${err.message}`] }
  }
}
