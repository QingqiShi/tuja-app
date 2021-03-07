import { render } from '@testing-library/react';
import EdgePadding from './EdgePadding';

test('render primary', () => {
  const { getByText } = render(<EdgePadding>test</EdgePadding>);
  expect(getByText('test')).toBeInTheDocument();
});
