import { fetchTickerInfo as yahooFinance } from '../scrapers/yahooFinance';
import { fetchTickerInfo as investing } from '../scrapers/investing';

const alternatives = {
  'SGLN.L': {
    method: 'investing',
    url: 'https://www.investing.com/etfs/ishares-physical-gold?cid=1024362',
    currency: 'GBp',
    expenseRatio: 0.0025,
  },
  'IWDP.L': {
    method: 'investing',
    url: 'https://www.investing.com/etfs/ishares-ftse-nareit-dev.-markets',
    currency: 'GBp',
    expenseRatio: 0.0059,
  },
  'VUCP.L': {
    method: 'investing',
    url: 'https://www.investing.com/etfs/vanguard-usd-corporate-bd-l',
    expenseRatio: 0.0009,
  },
  'ISP6.L': {
    method: 'investing',
    url: 'https://www.investing.com/etfs/ishares-s-p-smallcap-600',
    currency: 'GBp',
    expenseRatio: 0.004,
  },
  'IUSA.L': {
    method: 'investing',
    url: 'https://www.investing.com/etfs/ishares-s-p-500---gbp',
    currency: 'GBp',
    expenseRatio: 0.007,
  },
};

function usesAlternative(ticker: string): ticker is keyof typeof alternatives {
  return ticker in alternatives;
}

export async function fetchTickerInfo(ticker: string) {
  if (usesAlternative(ticker)) {
    switch (alternatives[ticker].method) {
      case 'investing':
        const info = await investing(ticker, alternatives[ticker].url);
        return { ...info, ...alternatives[ticker] };
    }
  }
  return yahooFinance(ticker);
}
