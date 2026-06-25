import yahooFinance from 'yahoo-finance2';

async function test() {
  try {
    const moduleOpts = {
      fetchOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      }
    };

    const result = await yahooFinance.quoteSummary('AAPL', {
      modules: [
        'balanceSheetHistory',
        'cashflowStatementHistory',
        'financialData',
      ]
    }, moduleOpts);
    
    console.log('Balance Sheet History:', JSON.stringify(result.balanceSheetHistory, null, 2));
    console.log('Cash Flow History:', JSON.stringify(result.cashflowStatementHistory, null, 2));
    console.log('Financial Data:', JSON.stringify(result.financialData, null, 2));
  } catch (err) {
    console.error('Error during test:', err);
  }
}

test();
