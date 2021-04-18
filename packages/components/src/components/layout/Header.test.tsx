import { fireEvent, render } from '@testing-library/react';
import Header from './Header';

test('render', () => {
  const handleLogoClick = jest.fn();
  const { getByText } = render(
    <Header
      logoHref="#"
      navigation={<div>test navigation</div>}
      onLogoClick={handleLogoClick}
    />
  );

  expect(getByText('test navigation')).toBeInTheDocument();
  expect(getByText('Tuja').closest('a')).toHaveAttribute('href', '#');

  fireEvent.click(getByText('Tuja'));
  expect(handleLogoClick).toHaveBeenCalled();
});
