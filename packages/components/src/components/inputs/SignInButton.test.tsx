import { render } from '../../testUtils';
import SignInButton from './SignInButton';

test('toggle buttons', () => {
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
});
