import { getFinancials, getQuote } from '../../services/yahooFinance.js'
import { getGeminiFlash, callGemini, extractJSON } from '../../services/gemini.js'
import { FINANCIAL_HEALTH_PROMPT, FINANCIALS_EXTRACTION_PROMPT } from '../../prompts/index.js'
import { tavilySearchMultiple } from '../../services/tavily.js'

function fmt(num, currency = 'USD') {
  if (num == null) return 'N/A'
  const isINR = currency === 'INR' || currency === 'inr';
  const symbol = isINR ? '₹' : '$';
  if (isINR) {
    const abs = Math.abs(num);
    if (abs >= 1e7) return `${symbol}${(num / 1e7).toFixed(2)} Cr`
    if (abs >= 1e5) return `${symbol}${(num / 1e5).toFixed(2)} L`
    return `${symbol}${num.toLocaleString('en-IN')}`
  } else {
    const abs = Math.abs(num);
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

    let warnings = []
    let financials = await getFinancials(resolvedTicker)
    if (!financials) {
      onProgress?.({ agent: 'financials', status: 'running', message: 'Yahoo API blocked. Searching web for financials...' })
      
      const quote = await getQuote(resolvedTicker)
      const currentYear = new Date().getFullYear()
      const prevYear = currentYear - 1
      const queries = [
        `${company} (${resolvedTicker}) financial metrics, revenue, net income, balance sheet, cash flows, and valuation ratios for ${prevYear} ${currentYear}`
      ]
      
      const searchRes = await tavilySearchMultiple(queries, { maxResults: 5, config })
      const results = searchRes.results
      warnings = searchRes.warnings || []
      const fallbackContext = `
Company: ${company}
Ticker: ${resolvedTicker}
Web Search Financial Data:
${results.map(r => `Title: ${r.title}\nContent: ${r.content}`).join('\n\n---\n\n')}
`
      const llm = getGeminiFlash(config)
      const rawExtracted = await callGemini(llm, FINANCIALS_EXTRACTION_PROMPT, fallbackContext)
      financials = extractJSON(rawExtracted)
      
      if (!Array.isArray(financials.revenueData)) {
        financials.revenueData = []
      }
      
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
            symbol: resolvedTicker,
            longName: company,
            regularMarketPrice: null,
            regularMarketChange: null,
            regularMarketChangePercent: null,
            marketCap: null,
            fiftyTwoWeekHigh: null,
            fiftyTwoWeekLow: null,
            currency: 'USD',
            exchange: 'NASDAQ',
          }
        }
      }
    }

    const currency = financials.quote?.currency || 'USD'

    const financialContext = `
Company: ${company}
Ticker: ${resolvedTicker}

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
- P/E Ratio (Trailing): ${financials.trailingPE != null ? financials.trailingPE.toFixed(1) : 'N/A'}
- P/E Ratio (Forward): ${financials.forwardPE != null ? financials.forwardPE.toFixed(1) : 'N/A'}
- Price-to-Book: ${financials.priceToBook != null ? financials.priceToBook.toFixed(2) : 'N/A'}
- Beta: ${financials.beta != null ? financials.beta.toFixed(2) : 'N/A'}

RETURNS:
- Return on Equity: ${financials.returnOnEquity != null ? financials.returnOnEquity.toFixed(1) + '%' : 'N/A'}
- Return on Assets: ${financials.returnOnAssets != null ? financials.returnOnAssets.toFixed(1) + '%' : 'N/A'}

HISTORICAL:
${financials.revenueData.map(d => `${d.year}: Revenue=${fmt(d.revenue, currency)}, Net Income=${fmt(d.netIncome, currency)}, Gross=${fmt(d.grossProfit, currency)}, EPS=${d.eps != null ? (currency === 'INR' ? '₹' : '$') + d.eps.toFixed(2) : 'N/A'}`).join('\n')}
`

    const llm = getGeminiFlash(config)
    const rawResponse = await callGemini(llm, FINANCIAL_HEALTH_PROMPT, financialContext)
    const health = extractJSON(rawResponse)

    const financialData = {
      ...financials,
      healthScore: health.healthScore ?? 50,
      healthGrade: health.healthGrade ?? 'C',
      healthReason: health.healthReason ?? 'Assessment unavailable',
    }

    const hasWarnings = warnings && warnings.length > 0
    onProgress?.({
      agent: 'financials',
      status: hasWarnings ? 'warning' : 'done',
      message: hasWarnings ? 'Financial analysis completed with search warnings' : 'Financial analysis complete'
    })

    return { financialData, errors: warnings }
  } catch (err) {
    onProgress?.({ agent: 'financials', status: 'error', message: err.message })
    return { errors: [`Financials: ${err.message}`] }
  }
}
