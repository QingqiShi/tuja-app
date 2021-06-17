import { render } from '@testing-library/react';
import AnnualReturns from './AnnualReturns';
import { mockResizeObserver } from '../../testUtils';

mockResizeObserver();

test('render', () => {
  render(<AnnualReturns assets={[]} baseCurrency="GBP" inflationRate={0.02} />);
});
