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

    expect(getByLabelText(/USA Large Cap Balance/)).toHaveValue('60');
    expect(getByLabelText(/US Intermediate Treasury Bond/)).toHaveValue('40');

    userEvent.clear(getByLabelText(/USA Large Cap Balance/));
    userEvent.type(getByLabelText(/USA Large Cap Balance/), '70');
    userEvent.click(getByTestId('auto-adjust'));

    expect(getByLabelText(/USA Large Cap Balance/)).toHaveValue('63.6');
    expect(getByLabelText(/US Intermediate Treasury Bond/)).toHaveValue('36.4');
  });

  test('prevents auto adjust if all zero', async () => {
    await mockCachedData(stocksData);
    const { getByLabelText, queryByTestId } = render(<Analytics />);
    await act(async () => {});

    expect(getByLabelText(/USA Large Cap Balance/)).toHaveValue('60');
    expect(getByLabelText(/US Intermediate Treasury Bond/)).toHaveValue('40');

    userEvent.clear(getByLabelText(/USA Large Cap Balance/));
    userEvent.type(getByLabelText(/USA Large Cap Balance/), '0');
    userEvent.clear(getByLabelText(/US Intermediate Treasury Bond/));
    userEvent.type(getByLabelText(/US Intermediate Treasury Bond/), '0');

    expect(queryByTestId('auto-adjust')).toBeNull();
  });
});
