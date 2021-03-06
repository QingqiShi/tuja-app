import { render } from '@testing-library/react';
import ResponsiveSplit from './ResponsiveSplit';

test('render primary', () => {
  const { getByText } = render(
    <ResponsiveSplit
      primary={<div>primary</div>}
      secondary={<div>secondary</div>}
      focusOn="primary"
    />
  );
  expect(getByText('primary')).toBeInTheDocument();
});

test('render secondary', () => {
  const { getByText } = render(
    <ResponsiveSplit
      primary={<div>primary</div>}
      secondary={<div>secondary</div>}
      focusOn="secondary"
    />
  );
  expect(getByText('secondary')).toBeInTheDocument();
});
