import { render } from '../../testUtils';
import TopLinearLoader from './TopLinearLoader';

test('render className', () => {
  render(<TopLinearLoader className="test-class" />);
  expect(document.querySelector('.test-class')).toHaveStyle('position: fixed;');
});
