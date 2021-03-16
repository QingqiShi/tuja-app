import { render } from '@testing-library/react';
import AppLayout from './AppLayout';

test('render', () => {
  const { getByText } = render(
    <AppLayout tabBar={<div>tabbar</div>}>content</AppLayout>
  );
  expect(getByText('content'));
  expect(getByText('tabbar'));
});
