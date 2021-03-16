import { render } from '@testing-library/react';
import TabBar from './TabBar';

test('render', () => {
  const { getByText } = render(
    <TabBar
      links={[
        { label: 'A', Icon: () => <div>a</div> },
        { label: 'B', Icon: () => <div>b</div> },
      ]}
    />
  );

  expect(getByText('A')).toBeInTheDocument();
  expect(getByText('a')).toBeInTheDocument();
  expect(getByText('B')).toBeInTheDocument();
  expect(getByText('b')).toBeInTheDocument();
});
