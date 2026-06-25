import yahooFinance from 'yahoo-finance2';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const MODULE_OPTS = {
  fetchOptions: {
    headers: {
      'User-Agent': UA
    }
  }
};

async function searchTicker(companyName) {
  try {
    const data = await yahooFinance.search(companyName, {
      quotesCount: 10,
      newsCount: 0
    }, MODULE_OPTS);

    const RANK = { NSI: 0, BSE: 0, NSE: 0, Bombay: 0, NMS: 1, NYQ: 1, NYS: 1, NGM: 2, NAS: 2 };

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
    );

    if (quotes.length === 0) {
      quotes = (data.quotes || []).filter(q => q.quoteType === 'EQUITY');
    }

    quotes.sort((a, b) => (RANK[a.exchange] ?? RANK[a.exchDisp] ?? 3) - (RANK[b.exchange] ?? RANK[b.exchDisp] ?? 3));

    const upper = companyName.toUpperCase().trim();
    const exact = quotes.find(q => q.symbol === upper);
    if (exact) return exact.symbol;

    const nameMath = quotes.find(q =>
      q.shortname?.toLowerCase().includes(companyName.toLowerCase()) ||
      q.longname?.toLowerCase().includes(companyName.toLowerCase())
    );
    if (nameMath) return nameMath.symbol;

    return quotes[0]?.symbol || null;
  } catch (err) {
    console.error('searchTicker error:', err.message);
    return null;
  }
}

async function getQuote(ticker) {
  try {
    const quote = await yahooFinance.quote(ticker, {}, MODULE_OPTS);
    if (!quote) return null;
    return {
      symbol: quote.symbol,
      longName: quote.longName || quote.shortName || ticker,
      regularMarketPrice: quote.regularMarketPrice,
      regularMarketChange: quote.regularMarketChange,
      regularMarketChangePercent: quote.regularMarketChangePercent,
      currency: quote.currency,
      exchange: quote.exchange,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
      marketCap: quote.marketCap || null,
    };
  } catch (err) {
    console.error('getQuote error:', err.message);
    return null;
  }
}

async function getFinancials(ticker) {
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
    ];

    const result = await yahooFinance.quoteSummary(ticker, { modules }, MODULE_OPTS);
    if (!result) throw new Error('No quoteSummary result');

    const price = result.price || {};
    const detail = result.summaryDetail || {};
    const keyStats = result.defaultKeyStatistics || {};
    const finData = result.financialData || {};
    const profile = result.assetProfile || {};
    const incomeStmts = result.incomeStatementHistory?.incomeStatementHistory || [];
    const balanceSheets = result.balanceSheetHistory?.balanceSheetStatements || [];
    const cashFlows = result.cashflowStatementHistory?.cashflowStatements || [];

    const revenueData = incomeStmts.slice(0, 4).reverse().map(s => {
      const endDate = s.endDate ? new Date(s.endDate) : new Date();
      return {
        year: endDate.getFullYear(),
        revenue: s.totalRevenue ?? null,
        netIncome: s.netIncome ?? null,
        grossProfit: s.grossProfit ?? null,
        operatingIncome: s.operatingIncome ?? null,
        eps: s.basicEPS ?? null,
      };
    });

    const latest = incomeStmts[0] || {};
    const prev = incomeStmts[1] || {};
    const latestBS = balanceSheets[0] || {};
    const latestCF = cashFlows[0] || {};

    const totalRevenue = latest.totalRevenue ?? null;
    const prevRevenue = prev.totalRevenue ?? null;
    const grossProfit = latest.grossProfit ?? null;
    const netIncome = latest.netIncome ?? null;

    const revenueGrowth = totalRevenue && prevRevenue && prevRevenue !== 0
      ? ((totalRevenue - prevRevenue) / Math.abs(prevRevenue)) * 100
      : null;

    const grossMargin = totalRevenue && grossProfit ? (grossProfit / totalRevenue) * 100 : null;
    const netMargin = totalRevenue && netIncome ? (netIncome / totalRevenue) * 100 : null;

    const totalEquity = latestBS.totalStockholderEquity ?? latestBS.stockholderEquity ?? null;
    const longTermDebt = latestBS.longTermDebt ?? null;
    const debtToEquity = longTermDebt && totalEquity && totalEquity !== 0
      ? (longTermDebt / totalEquity) * 100
      : finData.debtToEquity ?? null;

    return {
      revenueData,
      revenueGrowth,
      grossMargin,
      netMargin,
      debtToEquity,
      freeCashFlow: latestCF.freeCashFlow ?? finData.freeCashflow ?? null,
      operatingCashFlow: latestCF.totalCashFromOperatingActivities ?? latestCF.operatingCashFlow ?? finData.operatingCashflow ?? null,
      returnOnEquity: finData.returnOnEquity != null ? finData.returnOnEquity * 100 : null,
      returnOnAssets: finData.returnOnAssets != null ? finData.returnOnAssets * 100 : null,
      currentRatio: finData.currentRatio ?? null,
      quickRatio: finData.quickRatio ?? null,
      trailingPE: detail.trailingPE ?? keyStats.trailingPE ?? null,
      forwardPE: detail.forwardPE ?? keyStats.forwardPE ?? null,
      priceToBook: keyStats.priceToBook ?? null,
      priceToSales: detail.priceToSalesTrailing12Months ?? null,
      beta: detail.beta ?? keyStats.beta ?? null,
      totalCash: finData.totalCash ?? null,
      totalDebt: finData.totalDebt ?? longTermDebt ?? null,
      totalRevenue,
      grossProfit,
      netIncome,
      ebitda: finData.ebitda ?? null,
      sector: profile.sector ?? null,
      industry: profile.industry ?? null,
      fullTimeEmployees: profile.fullTimeEmployees ?? null,
      website: profile.website ?? null,
      longBusinessSummary: profile.longBusinessSummary ?? null,
      quote: {
        symbol: price.symbol,
        longName: price.longName || price.shortName,
        regularMarketPrice: price.regularMarketPrice,
        regularMarketChange: price.regularMarketChange,
        regularMarketChangePercent: price.regularMarketChangePercent != null ? price.regularMarketChangePercent * 100 : null,
        marketCap: price.marketCap,
        fiftyTwoWeekHigh: keyStats.fiftyTwoWeekHigh ?? null,
        fiftyTwoWeekLow: keyStats.fiftyTwoWeekLow ?? null,
        currency: price.currency,
        exchange: price.exchangeName,
      },
    };
  } catch (err) {
    console.error('getFinancials error:', err.message);
    return null;
  }
}

async function test() {
  console.log('Testing searchTicker for "Apple"...');
  const t = await searchTicker('Apple');
  console.log('Ticker:', t);

  console.log('Testing getQuote for "AAPL"...');
  const q = await getQuote('AAPL');
  console.log('Quote:', q);

  console.log('Testing getFinancials for "AAPL"...');
  const f = await getFinancials('AAPL');
  console.log('Financials keys:', Object.keys(f));
  console.log('Financials revenueData:', f.revenueData);
  console.log('Financials totalRevenue:', f.totalRevenue);
}

test();
