import { Story, Meta } from '@storybook/react';
import ActivityItem from './ActivityItem';

export default {
  title: 'Molecules/ActivityItem',
  component: ActivityItem,
} as Meta;

const Template: Story<React.ComponentProps<typeof ActivityItem>> = (args) => (
  <ActivityItem {...args} />
);

export const Deposit = Template.bind({});
Deposit.args = {
  activity: {
    id: 'a',
    date: new Date(),
    type: 'Deposit',
    amount: 500,
  },
  currency: 'GBP',
};

export const Dividend = Template.bind({});
Dividend.args = {
  activity: {
    id: 'a',
    date: new Date(),
    type: 'Dividend',
    ticker: 'IWDP.LSE',
    amount: 1.53,
  },
  currency: 'GBP',
  getStockName: () =>
    'iShares II Public Limited Company - iShares Developed Markets Property Yield UCITS ETF',
};

export const StockDividend = Template.bind({});
StockDividend.args = {
  activity: {
    id: 'a',
    date: new Date(),
    type: 'StockDividend',
    ticker: 'AAPL.US',
    units: 3,
  },
  currency: 'GBP',
  getStockName: () => 'Apple Ltd.',
};

export const Buy = Template.bind({});
Buy.args = {
  activity: {
    id: 'a',
    date: new Date(),
    type: 'Trade',
    cost: 123.45,
    trades: [{ ticker: 'IWDP.LSE', units: 1 }],
  },
  currency: 'GBP',
  getStockName: () =>
    'iShares II Public Limited Company - iShares Developed Markets Property Yield UCITS ETF',
};

export const Sell = Template.bind({});
Sell.args = {
  activity: {
    id: 'a',
    date: new Date(),
    type: 'Trade',
    cost: -123.45,
    trades: [
      { ticker: 'AAPL.US', units: 1.2345678 },
      { ticker: 'IWDP.LSE', units: 1 },
    ],
  },
  currency: 'GBP',
  getStockName: () =>
    'iShares II Public Limited Company - iShares Developed Markets Property Yield UCITS ETF',
};
