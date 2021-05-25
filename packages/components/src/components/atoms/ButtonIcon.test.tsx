import { render, fireEvent } from '@testing-library/react';
import { XCircle } from 'phosphor-react';
import ButtonIcon from './ButtonIcon';

test('normal button', () => {
  const handleClick = jest.fn();
  const { getByTestId } = render(
    <ButtonIcon onClick={handleClick}>
      <XCircle data-testid="close-btn" />
    </ButtonIcon>
  );
  fireEvent.click(getByTestId('close-btn'));
  expect(handleClick).toHaveBeenCalled();
});
