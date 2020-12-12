import { Meta } from '@storybook/react';
import StockListItem from './StockListItem';

export default {
  title: 'Display/StockListItem',
  component: StockListItem,
} as Meta;

export const Demo = () => (
  <StockListItem code="AAPL" exchange="US" name="Apple Ltd" />
);
