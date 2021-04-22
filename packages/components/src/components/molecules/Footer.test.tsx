import { render } from '@testing-library/react';
import Footer from './Footer';

test('render links', () => {
  const { getByText } = render(
    <Footer
      links={[
        { label: 'A', href: 'http://a' },
        { label: 'B', href: 'http://b' },
      ]}
    />
  );

  expect(getByText('Tuja')).toBeInTheDocument();
  expect(getByText('A')).toHaveAttribute('href', 'http://a');
  expect(getByText('B')).toHaveAttribute('href', 'http://b');
});
