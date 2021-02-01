import { fireEvent } from '@testing-library/react';
import { render } from '../../testUtils';
import ButtonGroup from './ButtonGroup';

test('toggle buttons', () => {
  const { getByText } = render(
    <ButtonGroup
      buttons={[
        { label: '1W', value: '1W' },
        { label: '1M', value: '1M' },
        { label: '3M', value: '3M' },
        { label: '1Y', value: '1Y' },
      ]}
    />
  );
  expect(getByText('1W').closest('button')).toBeDisabled();
  fireEvent.click(getByText('3M'));
  expect(getByText('1W').closest('button')).not.toBeDisabled();
  expect(getByText('3M').closest('button')).toBeDisabled();
});

test('controlled component', () => {
  const handleChange = jest.fn();
  const { getByText } = render(
    <ButtonGroup
      buttons={[
        { label: '1W', value: '1W' },
        { label: '1M', value: '1M' },
        { label: '3M', value: '3M' },
        { label: '1Y', value: '1Y' },
      ]}
      value="3M"
      onChange={handleChange}
    />
  );
  expect(getByText('3M').closest('button')).toBeDisabled();
  fireEvent.click(getByText('1M'));
  expect(handleChange).toHaveBeenCalledWith('1M');
});
