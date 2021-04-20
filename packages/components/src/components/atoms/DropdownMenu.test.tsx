import { render, fireEvent } from '@testing-library/react';
import DropdownMenu from './DropdownMenu';

test('render', () => {
  const handleChange = jest.fn();
  const { getByText } = render(
    <DropdownMenu
      value="a"
      options={[
        { label: 'Test 1', value: 'a' },
        { label: 'Test 2', value: 'b' },
      ]}
      onChange={handleChange}
    />
  );

  fireEvent.click(getByText('Test 1'));
  expect(getByText('Test 2')).toBeInTheDocument();

  fireEvent.click(getByText('Test 2'));
  expect(handleChange).toHaveBeenCalledWith('b');
});
