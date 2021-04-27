import { render } from '@testing-library/react';
import Benefits from './Benefits';

test('render title and benefits', () => {
  const { getByText } = render(
    <Benefits
      title="Test Title"
      benefits={[
        { name: 'A', description: 'A description.' },
        { name: 'B', description: 'B description.', icon: <span>B icon</span> },
      ]}
    />
  );
  expect(getByText('Test Title')).toBeInTheDocument();
  expect(getByText('A')).toBeInTheDocument();
  expect(getByText('A description.')).toBeInTheDocument();
  expect(getByText('B')).toBeInTheDocument();
  expect(getByText('B description.')).toBeInTheDocument();
  expect(getByText('B icon')).toBeInTheDocument();
});
