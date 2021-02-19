import { render } from '../../testUtils';
import Banner from './Banner';

test('render informational banner', () => {
  const { getByText } = render(<Banner>test</Banner>);
  expect(getByText('test')).toBeInTheDocument();
});

test('render error banner', () => {
  const { getByText } = render(<Banner variant="error">test</Banner>);
  expect(getByText('test')).toBeInTheDocument();
});
