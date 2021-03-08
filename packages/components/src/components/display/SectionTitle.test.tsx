import { render } from '@testing-library/react';
import SectionTitle from './SectionTitle';

test('render title', () => {
  const { getByText } = render(<SectionTitle>test title</SectionTitle>);
  expect(getByText('test title')).toBeInTheDocument();
});
