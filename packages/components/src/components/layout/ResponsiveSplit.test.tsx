import { fireEvent, render, waitFor } from '@testing-library/react';
import { NoMotion } from '../../testUtils';
import ResponsiveSplit from './ResponsiveSplit';

test('render primary', () => {
  const { getByText } = render(
    <NoMotion>
      <ResponsiveSplit
        primary={<div>primary</div>}
        secondary={<div>secondary</div>}
      />
    </NoMotion>
  );
  expect(getByText('primary')).toBeInTheDocument();
});

test('render secondary', () => {
  const { getByText } = render(
    <NoMotion>
      <ResponsiveSplit
        primary={<div>primary</div>}
        secondary={<div>secondary</div>}
      />
    </NoMotion>
  );
  expect(getByText('secondary')).toBeInTheDocument();
});

test('toggle secondary', async () => {
  const { getByText, getByTestId } = render(
    <NoMotion>
      <ResponsiveSplit
        primary={<div>primary</div>}
        secondary={<div>secondary</div>}
      />
    </NoMotion>
  );
  expect(getByText('secondary')).not.toBeVisible();

  fireEvent.click(getByText('View'));

  await waitFor(() => {
    expect(getByText('secondary')).toBeVisible();
    expect(getByTestId('responsive-split-secondary-card')).toHaveStyle(
      'transform: translate3d(0, 0vh, 0)'
    );
    expect(getByTestId('responsive-split-backdrop')).toHaveStyle('opacity: 1');
  });

  fireEvent.click(getByTestId('responsive-split-backdrop'));
  await waitFor(() => {
    expect(getByText('secondary')).not.toBeVisible();
  });
});

test('provides render prop to secondary for self closing', async () => {
  const { getByText, getByTestId } = render(
    <NoMotion>
      <ResponsiveSplit
        primary={<div>primary</div>}
        secondary={({ closeSecondary }) => (
          <div>
            <span>secondary</span>
            <button onClick={closeSecondary}>close self</button>
          </div>
        )}
      />
    </NoMotion>
  );

  fireEvent.click(getByText('View'));
  await waitFor(() => {
    expect(getByTestId('responsive-split-backdrop')).toHaveStyle('opacity: 1');
  });

  fireEvent.click(getByText('close self'));
  await waitFor(() => {
    expect(getByText('secondary')).not.toBeVisible();
  });
});

test('supports offset', async () => {
  const { getByTestId } = render(
    <NoMotion>
      <ResponsiveSplit
        primary={<div>primary</div>}
        secondary={<div>secondary</div>}
        stickyOffset="10vh"
      />
    </NoMotion>
  );

  expect(getByTestId('responsive-split-secondary-container')).toHaveStyle(
    'top: 10vh'
  );
});

test('render sticky actions', async () => {
  const { getByText } = render(
    <NoMotion>
      <ResponsiveSplit
        primary={<div>primary</div>}
        secondary={<div>secondary</div>}
        secondarySticky={<div>sticky actions</div>}
      />
    </NoMotion>
  );

  expect(getByText('sticky actions')).toBeInTheDocument();
});
