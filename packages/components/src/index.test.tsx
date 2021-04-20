import { render } from '@testing-library/react';
import { Logo, GlobalStyle } from './index';

test('renders', () => {
  render(
    <div>
      <GlobalStyle />
      <Logo />
    </div>
  );
});
