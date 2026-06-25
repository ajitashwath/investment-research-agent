import { getFinancials } from '../services/yahooFinance.js';

async function test() {
  try {
    console.log('Fetching financials for AAPL using original scraper...');
    const res = await getFinancials('AAPL');
    console.log('Original scraper result:', JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('Error with original scraper:', err);
  }
}

test();
