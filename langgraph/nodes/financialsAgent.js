import { getFinancials } from '../../services/yahooFinance.js'
import { getGeminiFlash, callGemini, extractJSON } from '../../services/gemini.js'
import { FINANCIAL_HEALTH_PROMPT } from '../../prompts/index.js'

function fmt(num) {
  if (num == null) return 'N/A'
  if (Math.abs(num) >= 1e12) return `$${(num / 1e12).toFixed(2)}T`
  if (Math.abs(num) >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
  if (Math.abs(num) >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
  return `$${num.toFixed(2)}`
}

export async function financialsAgentNode(state, config) {
  const { company, ticker, companyData } = state
  const onProgress = config?.configurable?.onProgress

  onProgress?.({ agent: 'financials', status: 'running', message: 'Fetching financial data...' })

  try {
    const resolvedTicker = ticker || companyData?.ticker
    if (!resolvedTicker) throw new Error('No ticker available for financial analysis')

    const financials = await getFinancials(resolvedTicker)
    if (!financials) throw new Error(`Could not fetch financials for ${resolvedTicker}`)

    const financialContext = `
Company: ${company}
Ticker: ${resolvedTicker}

INCOME STATEMENT:
- Total Revenue (TTM): ${fmt(financials.totalRevenue)}
- Gross Profit: ${fmt(financials.grossProfit)}
- Net Income: ${fmt(financials.netIncome)}
- EBITDA: ${fmt(financials.ebitda)}
- Revenue Growth YoY: ${financials.revenueGrowth != null ? financials.revenueGrowth.toFixed(1) + '%' : 'N/A'}
- Gross Margin: ${financials.grossMargin != null ? financials.grossMargin.toFixed(1) + '%' : 'N/A'}
- Net Margin: ${financials.netMargin != null ? financials.netMargin.toFixed(1) + '%' : 'N/A'}

BALANCE SHEET:
- Total Cash: ${fmt(financials.totalCash)}
- Total Debt: ${fmt(financials.totalDebt)}
- Debt-to-Equity: ${financials.debtToEquity != null ? financials.debtToEquity.toFixed(2) : 'N/A'}
- Current Ratio: ${financials.currentRatio != null ? financials.currentRatio.toFixed(2) : 'N/A'}

CASH FLOW:
- Free Cash Flow: ${fmt(financials.freeCashFlow)}
- Operating Cash Flow: ${fmt(financials.operatingCashFlow)}

VALUATION:
- P/E Ratio (Trailing): ${financials.trailingPE != null ? financials.trailingPE.toFixed(1) : 'N/A'}
- P/E Ratio (Forward): ${financials.forwardPE != null ? financials.forwardPE.toFixed(1) : 'N/A'}
- Price-to-Book: ${financials.priceToBook != null ? financials.priceToBook.toFixed(2) : 'N/A'}
- Beta: ${financials.beta != null ? financials.beta.toFixed(2) : 'N/A'}

RETURNS:
- Return on Equity: ${financials.returnOnEquity != null ? financials.returnOnEquity.toFixed(1) + '%' : 'N/A'}
- Return on Assets: ${financials.returnOnAssets != null ? financials.returnOnAssets.toFixed(1) + '%' : 'N/A'}

HISTORICAL:
${financials.revenueData.map(d => `${d.year}: Revenue=${fmt(d.revenue)}, Net Income=${fmt(d.netIncome)}, Gross=${fmt(d.grossProfit)}, EPS=${d.eps != null ? '$' + d.eps.toFixed(2) : 'N/A'}`).join('\n')}
`

    const llm = getGeminiFlash()
    const rawResponse = await callGemini(llm, FINANCIAL_HEALTH_PROMPT, financialContext)
    const health = extractJSON(rawResponse)

    const financialData = {
      ...financials,
      healthScore: health.healthScore ?? 50,
      healthGrade: health.healthGrade ?? 'C',
      healthReason: health.healthReason ?? 'Assessment unavailable',
    }

    onProgress?.({ agent: 'financials', status: 'done', message: 'Financial analysis complete' })

    return { financialData }
  } catch (err) {
    onProgress?.({ agent: 'financials', status: 'error', message: err.message })
    return { errors: [`Financials: ${err.message}`] }
  }
}
