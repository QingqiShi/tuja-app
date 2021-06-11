import { render, act } from '@testing-library/react';
import dayjs from 'dayjs';
import { TimeSeries } from '../../../libs/build';
import { mockCachedData, mockResizeObserver } from '../testUtils';
import Analytics from './Analytics';

mockResizeObserver();

test('render', async () => {
  const startDate = dayjs('1970-01-01', 'YYYY-MM-DD').toDate();
  const endDate = new Date();

  await mockCachedData({
    stocksInfo: [
      {
        Code: 'VFIAX',
        Exchange: 'US',
        Name: 'VANGUARD 500 INDEX FUND ADMIRAL SHARES',
        Type: 'FUND',
        Country: 'USA',
        Currency: 'USD',
        previousClose: 392.35,
        Ticker: 'VFIAX.US',
      },
      {
        Code: 'VFITX',
        Exchange: 'US',
        Name: 'VANGUARD INTERMEDIATE-TERM TREASURY FUND INVESTOR SHARES',
        Type: 'FUND',
        Country: 'USA',
        Currency: 'USD',
        previousClose: 11.52,
        Ticker: 'VFITX.US',
      },
    ],
    stocksHistory: [
      {
        ticker: 'VFIAX.US',
        range: { startDate, endDate },
        adjusted: new TimeSeries({
          data: [
            [dayjs('2021-06-09', 'YYYY-MM-DD').toDate(), 390.51],
            [dayjs('2021-06-1', 'YYYY-MM-DD').toDate(), 392.35],
          ],
        }),
        close: new TimeSeries({
          data: [
            [dayjs('2021-06-09', 'YYYY-MM-DD').toDate(), 390.51],
            [dayjs('2021-06-1', 'YYYY-MM-DD').toDate(), 392.35],
          ],
        }),
      },
      {
        ticker: 'VFITX.US',
        range: { startDate, endDate },
        adjusted: new TimeSeries({
          data: [
            [dayjs('2021-06-09', 'YYYY-MM-DD').toDate(), 11.5],
            [dayjs('2021-06-1', 'YYYY-MM-DD').toDate(), 11.52],
          ],
        }),
        close: new TimeSeries({
          data: [
            [dayjs('2021-06-09', 'YYYY-MM-DD').toDate(), 11.5],
            [dayjs('2021-06-1', 'YYYY-MM-DD').toDate(), 11.52],
          ],
        }),
      },
    ],
  });

  await act(async () => {
    render(<Analytics />);
  });
});
