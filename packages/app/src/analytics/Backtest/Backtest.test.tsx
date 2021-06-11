import { render } from '@testing-library/react';
import { mockResizeObserver } from '../../testUtils';
import Backtest from './';

mockResizeObserver();

test('render', () => {
  render(<Backtest assets={[]} baseCurrency="GBP" inflationRate={0.02} />);
});
