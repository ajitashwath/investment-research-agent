import { getGeminiPro, callGemini, extractJSON } from '../../services/gemini.js'
import { DECISION_PROMPT } from '../../prompts/index.js'

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
    if (abs >= 1e9) return `${symbol}${(num / 1e9).toFixed(1)}B`
    if (abs >= 1e6) return `${symbol}${(num / 1e6).toFixed(1)}M`
    return `${symbol}${num.toFixed(2)}`
  }
}

export async function decisionAgentNode(state, config) {
  const { company, companyData, financialData, newsData, riskData, competitorData, growthData } = state
  const onProgress = config?.configurable?.onProgress

  onProgress?.({ agent: 'decision', status: 'running', message: 'Making investment decision...' })

  try {
    const currency = financialData?.quote?.currency || 'USD'

    const evidence = `
=== INVESTMENT ANALYSIS EVIDENCE BRIEF ===

COMPANY: ${companyData?.name || company} (${companyData?.ticker || ''})
Industry: ${companyData?.industry || ''} | Sector: ${companyData?.sector || ''}
Business: ${companyData?.businessSummary || ''}
Moat: ${companyData?.moat || ''}

=== FINANCIAL HEALTH ===
Health Score: ${financialData?.healthScore || 'N/A'}/100 (Grade: ${financialData?.healthGrade || 'N/A'})
${financialData?.healthReason || ''}
Revenue Growth: ${financialData?.revenueGrowth != null ? financialData.revenueGrowth.toFixed(1) + '%' : 'N/A'}
Gross Margin: ${financialData?.grossMargin != null ? financialData.grossMargin.toFixed(1) + '%' : 'N/A'}
Net Margin: ${financialData?.netMargin != null ? financialData.netMargin.toFixed(1) + '%' : 'N/A'}
Debt/Equity: ${financialData?.debtToEquity != null ? financialData.debtToEquity.toFixed(2) : 'N/A'}
Free Cash Flow: ${fmt(financialData?.freeCashFlow, currency)}
ROE: ${financialData?.returnOnEquity != null ? financialData.returnOnEquity.toFixed(1) + '%' : 'N/A'}
P/E Trailing: ${financialData?.trailingPE || 'N/A'}
P/E Forward: ${financialData?.forwardPE || 'N/A'}
Price/Book: ${financialData?.priceToBook || 'N/A'}
Beta: ${financialData?.beta || 'N/A'}

=== MARKET DATA ===
Current Price: ${currency === 'INR' ? '₹' : '$'}${financialData?.quote?.regularMarketPrice?.toFixed(2) || 'N/A'}
Market Cap: ${financialData?.quote?.marketCap ? fmt(financialData.quote.marketCap, currency) : 'N/A'}

=== NEWS SENTIMENT ===
Sentiment Score: ${newsData?.sentimentScore || 'N/A'}/100
Distribution: ${newsData?.positiveCount || 0} positive, ${newsData?.neutralCount || 0} neutral, ${newsData?.negativeCount || 0} negative
Themes: ${newsData?.keyThemes?.join(', ') || 'N/A'}
Summary: ${newsData?.summary || 'N/A'}

=== RISK ASSESSMENT ===
Overall Risk: ${riskData?.overallRisk?.toUpperCase() || 'N/A'}
Risk Score: ${riskData?.riskScore || 'N/A'}/100 (lower = safer)
Summary: ${riskData?.riskSummary || ''}
Key Risks: ${riskData?.risks?.slice(0, 4).map(r => `[${r.severity}] ${r.category}: ${r.description}`).join(' | ') || 'N/A'}

=== COMPETITIVE POSITION ===
Moat Score: ${competitorData?.moatScore || 'N/A'}/100
Position: ${competitorData?.competitivePosition || 'N/A'}
Summary: ${competitorData?.competitorSummary || ''}

=== GROWTH OUTLOOK ===
Growth Score: ${growthData?.growthScore || 'N/A'}/100
Outlook: ${growthData?.growthOutlook?.toUpperCase() || 'N/A'}
TAM: ${growthData?.tam || 'N/A'}
Catalysts: ${growthData?.catalysts?.join('; ') || 'N/A'}
Summary: ${growthData?.growthSummary || ''}
`

    const llm = getGeminiPro(undefined, config?.configurable?.model)
    const raw = await callGemini(llm, DECISION_PROMPT, evidence)
    const decisionData = extractJSON(raw)

    if (!decisionData.scores) {
      decisionData.scores = {
        financial: financialData?.healthScore ?? 50,
        growth: growthData?.growthScore ?? 50,
        sentiment: newsData?.sentimentScore ?? 50,
        moat: competitorData?.moatScore ?? 50,
        risk: 100 - (riskData?.riskScore ?? 50),
        valuation: 50,
        overall: 50,
      }
    }

    if (!decisionData.keyBullets) {
      decisionData.keyBullets = { bullCase: [], bearCase: [] }
    }

    onProgress?.({ agent: 'decision', status: 'done', message: 'Investment decision made' })

    return { decisionData }
  } catch (err) {
    onProgress?.({ agent: 'decision', status: 'error', message: err.message })
    return { errors: [`Decision: ${err.message}`] }
  }
}
