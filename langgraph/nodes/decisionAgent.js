import { getGeminiFlash, callGemini, extractJSON } from '../../services/gemini.js'
import { DECISION_AND_REPORT_PROMPT } from '../../prompts/index.js'

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
    if (abs >= 1e9) return `${symbol}${(num / 1e9).toFixed(1)}B`
    if (abs >= 1e6) return `${symbol}${(num / 1e6).toFixed(1)}M`
    return `${symbol}${num.toFixed(2)}`
  }
}

/**
 * decisionAgentNode — produces the investment decision AND the markdown report
 * in a single LLM call, replacing the old decisionAgent + reportGenerator (2 calls → 1).
 * All analytical quality is preserved — only the redundant reformatting pass is removed.
 */
export async function decisionAgentNode(state, config) {
  const { company, companyData, financialData, newsData, riskData, competitorData, growthData } = state
  const onProgress = config?.configurable?.onProgress

  onProgress?.({ agent: 'decision', status: 'running', message: 'Making investment decision & generating report...' })

  try {
    const currency = financialData?.quote?.currency || 'USD'

    const evidence = `
=== COMPANY ===
${companyData?.name || company} (${companyData?.ticker || ''})
Industry: ${companyData?.industry || ''} | Sector: ${companyData?.sector || ''}
Business: ${companyData?.businessSummary || ''}
Moat: ${companyData?.moat || ''}
Products: ${companyData?.products?.join(', ') || ''}
Revenue Model: ${companyData?.revenueModel || ''}

=== FINANCIAL HEALTH ===
Score: ${financialData?.healthScore || 'N/A'}/100 (Grade: ${financialData?.healthGrade || 'N/A'})
${financialData?.healthReason || ''}
Revenue Growth: ${financialData?.revenueGrowth != null ? financialData.revenueGrowth.toFixed(1) + '%' : 'N/A'}
Gross Margin: ${financialData?.grossMargin != null ? financialData.grossMargin.toFixed(1) + '%' : 'N/A'}
Net Margin: ${financialData?.netMargin != null ? financialData.netMargin.toFixed(1) + '%' : 'N/A'}
Debt/Equity: ${financialData?.debtToEquity != null ? financialData.debtToEquity.toFixed(2) : 'N/A'}
Free Cash Flow: ${fmt(financialData?.freeCashFlow, currency)}
ROE: ${financialData?.returnOnEquity != null ? financialData.returnOnEquity.toFixed(1) + '%' : 'N/A'}
EBITDA: ${fmt(financialData?.ebitda, currency)}
P/E (Trailing/Forward): ${financialData?.trailingPE || 'N/A'} / ${financialData?.forwardPE || 'N/A'}
Price/Book: ${financialData?.priceToBook || 'N/A'}
Beta: ${financialData?.beta || 'N/A'}
Current Price: ${currency === 'INR' ? '₹' : '$'}${financialData?.quote?.regularMarketPrice?.toFixed(2) || 'N/A'}
Market Cap: ${financialData?.quote?.marketCap ? fmt(financialData.quote.marketCap, currency) : 'N/A'}
52W Range: ${financialData?.quote?.fiftyTwoWeekLow || 'N/A'} – ${financialData?.quote?.fiftyTwoWeekHigh || 'N/A'}

=== NEWS & SENTIMENT ===
Sentiment: ${newsData?.sentimentScore || 'N/A'}/100
Distribution: ${newsData?.positiveCount || 0}+ ${newsData?.neutralCount || 0}~ ${newsData?.negativeCount || 0}-
Themes: ${newsData?.keyThemes?.join(', ') || 'N/A'}
Summary: ${newsData?.summary || 'N/A'}
Headlines: ${newsData?.articles?.slice(0, 4).map(a => `[${a.sentiment}] ${a.headline}`).join(' | ') || 'N/A'}

=== RISK ASSESSMENT ===
Overall Risk: ${riskData?.overallRisk?.toUpperCase() || 'N/A'} | Score: ${riskData?.riskScore || 'N/A'}/100 (lower = safer)
${riskData?.riskSummary || ''}
Key Risks: ${riskData?.risks?.slice(0, 4).map(r => `[${r.severity}] ${r.category}: ${r.description}`).join(' | ') || 'N/A'}

=== COMPETITIVE POSITION ===
Moat Score: ${competitorData?.moatScore || 'N/A'}/100
${competitorData?.competitivePosition || 'N/A'}
${competitorData?.competitorSummary || ''}

=== GROWTH OUTLOOK ===
Score: ${growthData?.growthScore || 'N/A'}/100 | Outlook: ${growthData?.growthOutlook?.toUpperCase() || 'N/A'}
TAM: ${growthData?.tam || 'N/A'}
Catalysts: ${growthData?.catalysts?.join('; ') || 'N/A'}
${growthData?.growthSummary || ''}`

    // Single LLM call: decision JSON + full markdown report in one response
    const llm = getGeminiFlash(config, 4096)
    const raw = await callGemini(llm, DECISION_AND_REPORT_PROMPT, evidence)
    const parsed = extractJSON(raw)

    const decisionData = {
      recommendation: parsed.recommendation || 'HOLD',
      confidence: parsed.confidence ?? 50,
      reasoning: parsed.reasoning || '',
      scores: parsed.scores || {
        financial: financialData?.healthScore ?? 50,
        growth: growthData?.growthScore ?? 50,
        sentiment: newsData?.sentimentScore ?? 50,
        moat: competitorData?.moatScore ?? 50,
        risk: 100 - (riskData?.riskScore ?? 50),
        valuation: 50,
        overall: 50,
      },
      keyBullets: parsed.keyBullets || { bullCase: [], bearCase: [] },
      timeHorizon: parsed.timeHorizon || '12 months',
      targetPriceRange: parsed.targetPriceRange,
    }

    const report = parsed.report || `# ${companyData?.name || company} — Investment Report\n\nReport unavailable.`

    onProgress?.({ agent: 'decision', status: 'done', message: 'Decision & report complete' })
    return { decisionData, report }
  } catch (err) {
    onProgress?.({ agent: 'decision', status: 'error', message: err.message })
    return { errors: [`Decision: ${err.message}`] }
  }
}
