import { render } from '@testing-library/react';
import Hero from './Hero';

test('render', () => {
  const { getByText, getByAltText } = render(
    <Hero
      headline="Test headline"
      image={<img src="https://test" alt="test alt" />}
      cta={<button>test cta</button>}
    />
  );
  expect(getByText('Test headline')).toBeInTheDocument();
  expect(getByText('test cta')).toBeInTheDocument();
  expect(getByAltText('test alt')).toHaveAttribute('src', 'https://test');
});
