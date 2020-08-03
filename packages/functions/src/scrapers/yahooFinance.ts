import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

const QUOTE_SELECTOR =
  '#quote-header-info > div:nth-child(3) > div:first-child span:first-child';
const CURRENCY_SELECTOR =
  '#quote-header-info > div:nth-child(2) > div:first-child > div:last-child > span';
const SUMMARY_SELECTOR = '#quote-summary tr';
const STATISTICS_SELECTOR = '#app table tr';
const NAME_SELECTOR = '#quote-header-info h1';

function toNumber(num: string) {
  return parseFloat(num.replace(/,/g, ''));
}

function toPercent(num: string) {
  return parseFloat((toNumber(num) / 100).toFixed(6));
}

export async function fetchTickerInfo(ticker: string) {
  const url = `https://finance.yahoo.com/quote/${encodeURI(ticker)}`;
  const result = await fetch(url);
  if (result.status !== 200 || result.url !== url) {
    return null;
  }

  const html = await result.text();
  const $ = cheerio.load(html);
  try {
    const quote = toNumber($(QUOTE_SELECTOR).first().text());
    const name = $(NAME_SELECTOR)
      .text()
      .replace(` (${ticker})`, '')
      .replace(`${ticker} - `, '');
    if (!quote || !name) {
      return null;
    }

    const info: TickerInfo = { name, quote };

    const currency = $(CURRENCY_SELECTOR)
      .text()
      .match(/Currency in (.*)$/);
    if (currency && currency[1]) {
      info.currency = currency[1];
    }

    const summaryRows = $(SUMMARY_SELECTOR);
    summaryRows.each((_, row) => {
      const title = $(row).find('td:first-child').text();
      const value = $(row).find('td:last-child').text();

      switch (title) {
        case 'Previous Close':
          info.prevClose = toNumber(value);
          break;
        case 'Open':
          info.open = toNumber(value);
          break;
        case 'Volume':
          info.volumn = toNumber(value);
          break;
        case 'Yield':
          info.yield = toPercent(value);
          break;
        case 'Forward Dividend & Yield':
          const yieldPart = value.match(/\((.*)\)/);
          if (yieldPart && yieldPart[1] && yieldPart[1] !== 'N/A') {
            info.yield = toPercent(yieldPart[1]);
          }
          break;
        case 'Expense Ratio (net)':
          info.expenseRatio = toPercent(value);
      }
    });

    if (!info.yield) {
      info.yield = await fetchTickerTrailingYield(ticker);
    }

    info.timestamp = Date.now();

    return info;
  } catch {
    return null;
  }
}

async function fetchTickerTrailingYield(ticker: string) {
  const url = `https://finance.yahoo.com/quote/${ticker}/key-statistics`;
  const result = await fetch(url);
  if (result.status !== 200 || result.url !== url) {
    return undefined;
  }

  const html = await result.text();
  const $ = cheerio.load(html);
  let trailingYield: number | undefined;
  try {
    const summaryRows = $(STATISTICS_SELECTOR);
    summaryRows.each((_, row) => {
      const title = $(row).find('td:first-child').text();
      const value = $(row).find('td:last-child').text();

      // Can't use the Trailing Annual Dividend Yield because sometimes that
      // only takes into account biannual dividends, so essentially half of the
      // actual yield
      if (title.match(/5 Year Average Dividend Yield/) && value !== 'N/A') {
        trailingYield = toPercent(value);
      }
    });

    return trailingYield;
  } catch {
    return undefined;
  }
}
