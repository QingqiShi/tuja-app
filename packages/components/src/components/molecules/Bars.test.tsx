import { fireEvent } from '@testing-library/react';
import { render } from '../../testUtils';
import Bars from './Bars';

test('render', async () => {
  const { getByTestId, getByText } = render(
    <Bars
      data={[
        [new Date(1612558309355), 1],
        [new Date(1612644733880), 2],
      ]}
    />
  );

  fireEvent.mouseMove(getByTestId('bar-1612558309355'));
  expect(getByTestId('bars-tooltip')).toBeVisible();
  expect(getByText('Feb 2021')).toBeVisible();
  expect(getByText('1.00')).toBeVisible();

  fireEvent.mouseLeave(getByTestId('bar-1612558309355'));
  expect(getByTestId('bars-tooltip')).not.toBeVisible();

  fireEvent.touchStart(getByTestId('bar-1612644733880'));
  expect(getByTestId('bars-tooltip')).toBeVisible();
  expect(getByText('Feb 2021')).toBeVisible();
  expect(getByText('2.00')).toBeVisible();

  fireEvent.touchMove(getByTestId('bar-1612558309355'));
  expect(getByText('Feb 2021')).toBeVisible();
  expect(getByText('1.00')).toBeVisible();

  fireEvent.touchEnd(getByTestId('bar-1612558309355'));
  expect(getByTestId('bars-tooltip')).not.toBeVisible();
});
