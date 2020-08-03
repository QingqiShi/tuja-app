import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

const QUOTE_SELECTOR = '#last_last';
const NAME_SELECTOR = '#tradeNowFloat span:first-child';
const CURRENCY_SELECTOR =
  '#quotes_summary_current_data .bottom > span:nth-child(4)';
const SUMMARY_SELECTOR = '.overviewDataTable .inlineblock';

function toNumber(num: string) {
  return parseFloat(num.replace(/,/g, ''));
}

function toPercent(num: string) {
  return parseFloat((toNumber(num) / 100).toFixed(6));
}

export async function fetchTickerInfo(ticker: string, url: string) {
  const result = await fetch(url);
  if (result.status !== 200 || result.url !== url) {
    return null;
  }

  const html = await result.text();
  const $ = cheerio.load(html);
  try {
    const quote = toNumber($(QUOTE_SELECTOR).first().text());
    const name = $(NAME_SELECTOR).first().text();
    if (!quote || !name) {
      return null;
    }

    const info: TickerInfo = { name, quote };

    const currency = $(CURRENCY_SELECTOR).text();
    if (currency) {
      info.currency = currency;
    }

    const summaryRows = $(SUMMARY_SELECTOR);
    summaryRows.each((_, row) => {
      const title = $(row).find('span:first-child').text();
      const value = $(row).find('span:last-child').text();

      switch (title) {
        case 'Prev. Close':
          info.prevClose = toNumber(value);
          break;
        case 'Open':
          info.open = toNumber(value);
          break;
        case 'Volume':
          info.volumn = toNumber(value);
          break;
        case 'Dividend (Yield)':
          const yieldPart = value.match(/\((.*)\)/);
          if (yieldPart && yieldPart[1] && yieldPart[1] !== 'N/A') {
            info.yield = toPercent(yieldPart[1]);
          }
          break;
        case 'Expense Ratio (net)':
          info.expenseRatio = toPercent(value);
      }
    });

    info.timestamp = Date.now();

    return info;
  } catch {
    return null;
  }
}
