import { render, mockResizeObserver } from '../../testUtils';
import InvestmentItem from './InvestmentItem';

mockResizeObserver();

test('render information', () => {
  const { getByText, getAllByText } = render(
    <InvestmentItem code="AAPL" name="Apple" />
  );
  expect(getAllByText('AAPL')).toHaveLength(2);
  expect(getByText('Apple')).toBeInTheDocument();
});

test('render gain', () => {
  const { getByText } = render(
    <InvestmentItem code="AAPL" name="Apple" changePercentage={1.23} />
  );
  expect(getByText('+1.23%')).toBeInTheDocument();
});

test('render loss', () => {
  const { getByText } = render(
    <InvestmentItem code="AAPL" name="Apple" changePercentage={-1.23} />
  );
  expect(getByText('-1.23%')).toBeInTheDocument();
});

test('render nutral change', () => {
  const { getByText } = render(
    <InvestmentItem code="AAPL" name="Apple" changePercentage={0} />
  );
  expect(getByText('0.00%')).toBeInTheDocument();
});

test('render additional data', () => {
  const { getByText } = render(
    <InvestmentItem code="AAPL" name="Apple" additional="+£123.45" />
  );
  expect(getByText('+£123.45')).toBeInTheDocument();
});

test('render icon', () => {
  const { getByTestId, getAllByText } = render(
    <InvestmentItem code="AAPL" name="Apple" icon="http://logo.img" />
  );
  expect(getAllByText('AAPL')).toHaveLength(1);
  expect(getByTestId('investment-logo')).toHaveAttribute(
    'src',
    'http://logo.img'
  );
});

test('render chart', () => {
  const { getByTestId } = render(
    <InvestmentItem code="AAPL" name="Apple" chartData={[]} />
  );
  expect(getByTestId('investment-chart')).toBeInTheDocument();
});
