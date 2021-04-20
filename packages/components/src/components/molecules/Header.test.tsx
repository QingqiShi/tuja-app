import { fireEvent, render } from '@testing-library/react';
import Header from './Header';

test('render clickable logo', () => {
  const handleLogoClick = jest.fn();
  const { getByText } = render(
    <Header
      logoHref="#"
      navigation={<div>test navigation</div>}
      onLogoClick={handleLogoClick}
    />
  );

  expect(getByText('Tuja').closest('a')).toHaveAttribute('href', '#');

  fireEvent.click(getByText('Tuja'));
  expect(handleLogoClick).toHaveBeenCalled();
});

test('render navigation element', () => {
  const { getByText } = render(
    <Header logoHref="#" navigation={<div>test navigation</div>} />
  );
  expect(getByText('test navigation')).toBeInTheDocument();
});
