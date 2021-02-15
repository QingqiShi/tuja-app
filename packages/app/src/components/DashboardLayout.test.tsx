import { render } from '@testing-library/react';
import DashboardLayout from './DashboardLayout';

test('render', () => {
  const { getByText } = render(
    <DashboardLayout
      top={<div>top</div>}
      side={<div>side</div>}
      main={<div>main</div>}
    />
  );

  expect(getByText('top')).toBeInTheDocument();
  expect(getByText('side')).toBeInTheDocument();
  expect(getByText('main')).toBeInTheDocument();
});
