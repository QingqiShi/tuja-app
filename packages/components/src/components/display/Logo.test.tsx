import { render } from '../../testUtils';
import Logo from './Logo';

test('render logo with title', () => {
  const { getByText } = render(<Logo />);
  expect(getByText('Tuja')).toBeInTheDocument();
});
