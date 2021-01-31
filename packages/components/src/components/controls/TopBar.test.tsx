import { fireEvent } from '@testing-library/react';
import { render } from '../../testUtils';
import TopBar from './TopBar';

test('render logo', () => {
  const { getByText } = render(<TopBar logo="test" />);
  expect(getByText('test')).toBeInTheDocument();
});

test('render links', () => {
  const handleClick = jest.fn();
  const { getByText } = render(
    <TopBar
      links={[
        {
          startIcon: <span>portfolio icon</span>,
          children: 'Portfolio',
          active: true,
        },
        { children: 'Activities', onClick: handleClick },
      ]}
    />
  );
  expect(getByText('Portfolio')).toBeInTheDocument();
  expect(getByText('Activities')).toBeInTheDocument();
  expect(getByText('portfolio icon')).toBeInTheDocument();

  // onClick handler
  fireEvent.click(getByText('Activities'));
  expect(handleClick).toHaveBeenCalled();

  // active disables link
  expect(getByText('Portfolio').closest('button')).toBeDisabled();
});

test('render menu', () => {
  const handleClick = jest.fn();
  const { getByTestId, getByText } = render(
    <TopBar
      menu={[
        { children: 'Create portfolio', onClick: handleClick },
        { children: 'Sign out' },
      ]}
    />
  );

  // open the menu
  fireEvent.click(getByTestId('top-bar-menu'));
  expect(getByText('Create portfolio')).toBeInTheDocument();
  expect(getByText('Sign out')).toBeInTheDocument();

  fireEvent.click(getByText('Create portfolio'));
  expect(handleClick).toHaveBeenCalled();
});

test('click away to hide menu', () => {
  const { getByTestId, getByText, queryByText } = render(
    <TopBar logo="logo" menu={[{ children: 'Sign out' }]} />
  );

  // open the menu
  fireEvent.click(getByTestId('top-bar-menu'));
  expect(getByText('Sign out')).toBeVisible();

  fireEvent.mouseDown(document.body);
  expect(queryByText('Sign out')).toBeNull();
});

test('render end link', () => {
  const handleClick = jest.fn();
  const { getByText } = render(
    <TopBar endLinks={[{ children: 'Sign in', onClick: handleClick }]} />
  );

  fireEvent.click(getByText('Sign in'));
  expect(handleClick).toHaveBeenCalled();
});
