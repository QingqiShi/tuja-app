import { render } from '../../testUtils';
import SignInButton from './SignInButton';

test('render', () => {
  const { getByText } = render(
    <SignInButton
      icon={<>logo</>}
      shortText="Short"
      bgColor="#FFFFFF"
      iconBgColor="#000000"
    >
      Test
    </SignInButton>
  );

  expect(getByText('logo')).toBeInTheDocument();
  expect(getByText('Short')).toBeVisible();
  expect(getByText('Test')).not.toBeVisible();
  expect(getByText('Test').closest('button')).toHaveStyle(
    'background-color: #FFFFFF;'
  );
  expect(getByText('logo')).toHaveStyle('background-color: #000000;');
  expect(getByText('Test').closest('button')).toHaveStyle(
    'color: rgb(33, 26, 29);'
  );
});

test('render dark button', () => {
  const { getByText } = render(
    <SignInButton icon={<>logo</>} shortText="Short" bgColor="#000">
      Test
    </SignInButton>
  );
  expect(getByText('Test').closest('button')).toHaveStyle('color: #FFFFFF;');
});

test('render light button in dark mode', () => {
  const { getByText } = render(
    <SignInButton icon={<>logo</>} shortText="Short" bgColor="#FFFFFF">
      Test
    </SignInButton>,
    { theme: 'dark' }
  );
  expect(getByText('Test').closest('button')).toHaveStyle(
    'color: rgb(33, 26, 29);'
  );
});

test('render dark button in dark mode', () => {
  const { getByText } = render(
    <SignInButton icon={<>logo</>} shortText="Short" bgColor="#000">
      Test
    </SignInButton>,
    { theme: 'dark' }
  );
  expect(getByText('Test').closest('button')).toHaveStyle('color: #FFFFFF;');
});
