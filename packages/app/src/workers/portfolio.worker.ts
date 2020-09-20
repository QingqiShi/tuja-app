import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { Portfolio } from 'libs/portfolio';
import { StocksData } from 'libs/stocksClient';
import { getPortfolioPerformance } from 'libs/portfolio';
import TimeSeries from 'libs/timeSeries';

dayjs.extend(isSameOrBefore);

// eslint-disable-next-line no-restricted-globals
addEventListener('message', (event) => {
  const payload = event.data as {
    portfolio: Portfolio;
    stocksData: StocksData;
    startDate: Date;
    endDate: Date;
  };

  Object.keys(payload.stocksData).forEach((ticker) => {
    const stockData = payload.stocksData[ticker];
    if (stockData.closeSeries) {
      stockData.closeSeries = new TimeSeries(stockData.closeSeries);
    }
    if (stockData.adjustedSeries) {
      stockData.adjustedSeries = new TimeSeries(stockData.adjustedSeries);
    }
  });

  const result = getPortfolioPerformance(
    payload.portfolio,
    payload.startDate,
    payload.endDate,
    payload.stocksData
  );
  postMessage(result);
});
