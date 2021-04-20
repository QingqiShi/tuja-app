import { render } from '../../testUtils';
import StockListItem from './StockListItem';

test('render stock details', () => {
  const { getByText } = render(
    <StockListItem code="AAPL" exchange="US" name="Apple Ltd" />
  );
  expect(getByText('AAPL')).toBeInTheDocument();
  expect(getByText('US')).toBeInTheDocument();
  expect(getByText('Apple Ltd')).toBeInTheDocument();
});
