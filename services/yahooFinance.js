const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
const BASE = 'https://query2.finance.yahoo.com'
const BASE1 = 'https://query1.finance.yahoo.com'

let _session = null

async function getSession() {
  if (_session && Date.now() - _session.ts < 1000 * 60 * 30) return _session

  // Fetch session cookie from fc.yahoo.com first
  const fcRes = await fetch('https://fc.yahoo.com', {
    headers: { 'User-Agent': UA }
  })
  const rawCookies = fcRes.headers.get('set-cookie') || ''

  // Request crumb with the session cookie
  const crumbRes = await fetch(`${BASE}/v1/test/getcrumb`, {
    headers: { 
      'User-Agent': UA,
      'Cookie': rawCookies
    }
  })
  const crumb = await crumbRes.text()

  _session = { crumb: crumb.trim(), cookie: rawCookies, ts: Date.now() }
  return _session
}

async function yfFetch(url, withCrumb = false) {
  const session = await getSession()
  const finalUrl = withCrumb ? `${url}&crumb=${encodeURIComponent(session.crumb)}` : url

  const res = await fetch(finalUrl, {
    headers: {
      'User-Agent': UA,
      'Accept': 'application/json',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://finance.yahoo.com/',
      ...(session.cookie ? { 'Cookie': session.cookie } : {}),
    },
  })

  if (!res.ok) throw new Error(`Yahoo Finance ${res.status}: ${finalUrl.split('?')[0]}`)
  return res.json()
}

export async function searchTicker(companyName) {
  try {
    const url = `${BASE1}/v1/finance/search?q=${encodeURIComponent(companyName)}&quotesCount=10&newsCount=0&listsCount=0`
    const data = await yfFetch(url)

    const RANK = { NSI: 0, BSE: 0, NSE: 0, Bombay: 0, NMS: 1, NYQ: 1, NYS: 1, NGM: 2, NAS: 2 }

    let quotes = (data.quotes || []).filter(q =>
      q.quoteType === 'EQUITY' &&
      (
        q.exchDisp === 'NSE' ||
        q.exchDisp === 'BSE' ||
        q.exchDisp === 'Bombay' ||
        q.exchange === 'NSI' ||
        q.exchange === 'BSE' ||
        q.symbol?.endsWith('.NS') ||
        q.symbol?.endsWith('.BO') ||
        q.exchDisp === 'NASDAQ' ||
        q.exchDisp === 'NYSE' ||
        q.exchange === 'NMS' ||
        q.exchange === 'NYQ' ||
        q.exchange === 'NGM'
      )
    )

    if (quotes.length === 0) {
      quotes = (data.quotes || []).filter(q => q.quoteType === 'EQUITY')
    }

    quotes.sort((a, b) => (RANK[a.exchange] ?? RANK[a.exchDisp] ?? 3) - (RANK[b.exchange] ?? RANK[b.exchDisp] ?? 3))

    const upper = companyName.toUpperCase().trim()
    const exact = quotes.find(q => q.symbol === upper)
    if (exact) return exact.symbol

    const nameMath = quotes.find(q =>
      q.shortname?.toLowerCase().includes(companyName.toLowerCase()) ||
      q.longname?.toLowerCase().includes(companyName.toLowerCase())
    )
    if (nameMath) return nameMath.symbol

    return quotes[0]?.symbol || null
  } catch (err) {
    console.error('searchTicker error:', err.message)
    return null
  }
}

export async function getQuote(ticker) {
  try {
    const url = `${BASE}/v8/finance/chart/${ticker}?interval=1d&range=5d`
    const data = await yfFetch(url)
    const meta = data.chart?.result?.[0]?.meta
    if (!meta) return null

    const prevClose = meta.chartPreviousClose || meta.regularMarketPreviousClose || meta.regularMarketPrice
    const change = meta.regularMarketPrice - prevClose
    return {
      symbol: meta.symbol,
      longName: meta.longName || meta.shortName || ticker,
      regularMarketPrice: meta.regularMarketPrice,
      regularMarketChange: change,
      regularMarketChangePercent: prevClose ? (change / prevClose) * 100 : 0,
      currency: meta.currency,
      exchange: meta.exchangeName,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
      marketCap: null,
    }
  } catch (err) {
    console.error('getQuote error:', err.message)
    return null
  }
}

export async function getFinancials(ticker) {
  try {
    const modules = [
      'price',
      'summaryDetail',
      'defaultKeyStatistics',
      'financialData',
      'incomeStatementHistory',
      'balanceSheetHistory',
      'cashflowStatementHistory',
      'assetProfile',
    ].join(',')

    const url = `${BASE}/v10/finance/quoteSummary/${ticker}?modules=${modules}`
    const data = await yfFetch(url, true)

    const result = data.quoteSummary?.result?.[0]
    if (!result) throw new Error('No quoteSummary result')

    const price = result.price || {}
    const detail = result.summaryDetail || {}
    const keyStats = result.defaultKeyStatistics || {}
    const finData = result.financialData || {}
    const profile = result.assetProfile || {}
    const incomeStmts = result.incomeStatementHistory?.incomeStatementHistory || []
    const balanceSheets = result.balanceSheetHistory?.balanceSheetStatements || []
    const cashFlows = result.cashflowStatementHistory?.cashflowStatements || []

    const revenueData = incomeStmts.slice(0, 4).reverse().map(s => {
      const endDate = s.endDate?.raw ? new Date(s.endDate.raw * 1000) : new Date(s.endDate)
      return {
        year: endDate.getFullYear(),
        revenue: s.totalRevenue?.raw ?? null,
        netIncome: s.netIncome?.raw ?? null,
        grossProfit: s.grossProfit?.raw ?? null,
        operatingIncome: s.operatingIncome?.raw ?? null,
        eps: s.basicEPS?.raw ?? null,
      }
    })

    const latest = incomeStmts[0] || {}
    const prev = incomeStmts[1] || {}
    const latestBS = balanceSheets[0] || {}
    const latestCF = cashFlows[0] || {}

    const totalRevenue = latest.totalRevenue?.raw ?? null
    const prevRevenue = prev.totalRevenue?.raw ?? null
    const grossProfit = latest.grossProfit?.raw ?? null
    const netIncome = latest.netIncome?.raw ?? null

    const revenueGrowth = totalRevenue && prevRevenue && prevRevenue !== 0
      ? ((totalRevenue - prevRevenue) / Math.abs(prevRevenue)) * 100
      : null

    const grossMargin = totalRevenue && grossProfit ? (grossProfit / totalRevenue) * 100 : null
    const netMargin = totalRevenue && netIncome ? (netIncome / totalRevenue) * 100 : null

    const totalEquity = latestBS.totalStockholderEquity?.raw ?? null
    const longTermDebt = latestBS.longTermDebt?.raw ?? null
    const debtToEquity = longTermDebt && totalEquity && totalEquity !== 0
      ? (longTermDebt / totalEquity) * 100
      : finData.debtToEquity?.raw ?? null

    return {
      revenueData,
      revenueGrowth,
      grossMargin,
      netMargin,
      debtToEquity,
      freeCashFlow: latestCF.freeCashFlow?.raw ?? finData.freeCashflow?.raw ?? null,
      operatingCashFlow: latestCF.totalCashFromOperatingActivities?.raw ?? finData.operatingCashflow?.raw ?? null,
      returnOnEquity: finData.returnOnEquity?.raw != null ? finData.returnOnEquity.raw * 100 : null,
      returnOnAssets: finData.returnOnAssets?.raw != null ? finData.returnOnAssets.raw * 100 : null,
      currentRatio: finData.currentRatio?.raw ?? null,
      quickRatio: finData.quickRatio?.raw ?? null,
      trailingPE: detail.trailingPE?.raw ?? keyStats.trailingPE?.raw ?? null,
      forwardPE: detail.forwardPE?.raw ?? keyStats.forwardPE?.raw ?? null,
      priceToBook: keyStats.priceToBook?.raw ?? null,
      priceToSales: detail.priceToSalesTrailing12Months?.raw ?? null,
      beta: detail.beta?.raw ?? keyStats.beta?.raw ?? null,
      totalCash: finData.totalCash?.raw ?? null,
      totalDebt: finData.totalDebt?.raw ?? longTermDebt ?? null,
      totalRevenue,
      grossProfit,
      netIncome,
      ebitda: finData.ebitda?.raw ?? null,
      sector: profile.sector ?? null,
      industry: profile.industry ?? null,
      fullTimeEmployees: profile.fullTimeEmployees ?? null,
      website: profile.website ?? null,
      longBusinessSummary: profile.longBusinessSummary ?? null,
      quote: {
        symbol: price.symbol,
        longName: price.longName || price.shortName,
        regularMarketPrice: price.regularMarketPrice?.raw,
        regularMarketChange: price.regularMarketChange?.raw,
        regularMarketChangePercent: price.regularMarketChangePercent?.raw != null ? price.regularMarketChangePercent.raw * 100 : null,
        marketCap: price.marketCap?.raw,
        fiftyTwoWeekHigh: keyStats.fiftyTwoWeekHigh?.raw ?? null,
        fiftyTwoWeekLow: keyStats.fiftyTwoWeekLow?.raw ?? null,
        currency: price.currency,
        exchange: price.exchangeName,
      },
    }
  } catch (err) {
    console.error('getFinancials error:', err.message)
    return null
  }
}
