import { fireEvent } from '@testing-library/react';
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

test('error banner with action button', () => {
  const handleAction = jest.fn();
  const { getByText } = render(
    <Banner variant="error" action={{ label: 'action', onClick: handleAction }}>
      test
    </Banner>
  );
  fireEvent.click(getByText('action'));
  expect(handleAction).toHaveBeenCalled();
});
