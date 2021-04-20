import { render, fireEvent } from '@testing-library/react';
import Fab from './Fab';

test('render', () => {
  const handleClick = jest.fn();
  const { getByRole } = render(<Fab onClick={handleClick} />);
  fireEvent.click(getByRole('button'));
  expect(handleClick).toHaveBeenCalled();
});
