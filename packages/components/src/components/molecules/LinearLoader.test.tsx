import { render } from '../../testUtils';
import LinearLoader from './LinearLoader';

test('render className', () => {
  render(<LinearLoader className="test-class" />);
  expect(document.querySelector('.test-class')).toBeInTheDocument();
});
