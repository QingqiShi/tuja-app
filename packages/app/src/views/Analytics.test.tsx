import { render, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';
import { TimeSeries } from '../../../libs/build';
import { mockCachedData, mockResizeObserver } from '../testUtils';
import Analytics from './Analytics';

mockResizeObserver();

const startDate = dayjs('1970-01-01', 'YYYY-MM-DD').toDate();
const endDate = new Date();
const stocksData = {
  stocksInfo: [
    {
      Code: 'VTSMX',
      Country: 'USA',
      Currency: 'USD',
      Exchange: 'US',
      ISIN: 'US9229083061',
      Name: 'VANGUARD TOTAL STOCK MARKET INDEX FUND INVESTOR SHARES',
      Ticker: 'VTSMX.US',
      Type: 'FUND',
      previousClose: 105.39,
    },
    {
      Code: 'VBMFX',
      Country: 'USA',
      Currency: 'USD',
      Exchange: 'US',
      ISIN: 'US9219371088',
      Name: 'VANGUARD TOTAL BOND MARKET INDEX FUND INVESTOR SHARES',
      Ticker: 'VBMFX.US',
      Type: 'FUND',
      previousClose: 11.33,
    },
  ],
  stocksHistory: [
    {
      ticker: 'VTSMX.US',
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
      ticker: 'VBMFX.US',
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
};

test('render', async () => {
  await mockCachedData(stocksData);
  render(<Analytics />);
  await act(async () => {});
});

describe('auto adjust allocation', () => {
  test('scale down to 100%', async () => {
    await mockCachedData(stocksData);
    const { getByLabelText, getByTestId } = render(<Analytics />);
    await act(async () => {});

    expect(getByLabelText(/US Total Stock Market/)).toHaveValue('60');
    expect(getByLabelText(/US Total Bond Market/)).toHaveValue('40');

    userEvent.clear(getByLabelText(/US Total Stock Market/));
    userEvent.type(getByLabelText(/US Total Stock Market/), '70');
    userEvent.click(getByTestId('auto-adjust'));

    expect(getByLabelText(/US Total Stock Market/)).toHaveValue('63.6');
    expect(getByLabelText(/US Total Bond Market/)).toHaveValue('36.4');
  });

  test('prevents auto adjust if all zero', async () => {
    await mockCachedData(stocksData);
    const { getByLabelText, queryByTestId } = render(<Analytics />);
    await act(async () => {});

    expect(getByLabelText(/US Total Stock Market/)).toHaveValue('60');
    expect(getByLabelText(/US Total Bond Market/)).toHaveValue('40');

    userEvent.clear(getByLabelText(/US Total Stock Market/));
    userEvent.type(getByLabelText(/US Total Stock Market/), '0');
    userEvent.clear(getByLabelText(/US Total Bond Market/));
    userEvent.type(getByLabelText(/US Total Bond Market/), '0');

    expect(queryByTestId('auto-adjust')).toBeNull();
  });
});
