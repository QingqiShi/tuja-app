import { fireEvent } from '@testing-library/react';
import { render } from '../../testUtils';
import Pie from './Pie';

test('render', () => {
  const { getByTestId, queryAllByText } = render(
    <Pie
      data={[
        {
          label: 'A',
          percentage: 0.3,
        },
        {
          label: 'B',
          percentage: 0.7,
        },
      ]}
    />
  );

  fireEvent.mouseEnter(getByTestId('pie-piece-A'));
  expect(queryAllByText('A')).toHaveLength(2);
  expect(queryAllByText('30.00%')).toHaveLength(1);

  fireEvent.mouseLeave(getByTestId('pie-piece-A'));
  expect(queryAllByText('A')).toHaveLength(1);
  expect(queryAllByText('30.00%')).toHaveLength(0);

  fireEvent.touchStart(getByTestId('pie-piece-B'));
  expect(queryAllByText('B')).toHaveLength(2);
  expect(queryAllByText('70.00%')).toHaveLength(1);

  fireEvent.touchEnd(getByTestId('pie-piece-B'));
  expect(queryAllByText('B')).toHaveLength(1);
  expect(queryAllByText('70.00%')).toHaveLength(0);
});
