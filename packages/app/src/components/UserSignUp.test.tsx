import { render } from 'testUtils';
import UserSignUp from './UserSignUp';

test('render without crashing', async () => {
  render(<UserSignUp />);
});
