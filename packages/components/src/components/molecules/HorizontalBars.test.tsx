import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HorizontalBars from './HorizontalBars';

test('render segments', () => {
  const { getByTestId } = render(
    <HorizontalBars
      data={[
        { id: 'A', value: 0.6 },
        { id: 'B', value: 0.4 },
      ]}
    />
  );
  expect(getByTestId('segment-A')).toHaveStyle('width: 60.00%');
  expect(getByTestId('segment-B')).toHaveStyle('width: 40.00%');
});

test('use total to define min width', () => {
  const { getByTestId } = render(
    <HorizontalBars
      data={[
        { id: 'A', value: 0.6 },
        { id: 'B', value: 0.4 },
      ]}
      total={2}
    />
  );
  expect(getByTestId('segment-A')).toHaveStyle('width: 30.00%');
  expect(getByTestId('segment-B')).toHaveStyle('width: 20.00%');
});

test('hover over segments fires callback', () => {
  const handleEnter = jest.fn();
  const handleLeave = jest.fn();
  const { getByTestId } = render(
    <HorizontalBars
      data={[
        { id: 'A', value: 0.6 },
        { id: 'B', value: 0.4 },
      ]}
      onEnter={handleEnter}
      onLeave={handleLeave}
    />
  );
  userEvent.hover(getByTestId('segment-A'));
  expect(handleEnter).toHaveBeenCalledWith({ id: 'A', value: 0.6 });

  userEvent.unhover(getByTestId('segment-A'));
  expect(handleLeave).toHaveBeenCalled();
});

test('zero total does not crash', () => {
  const { getByTestId } = render(
    <HorizontalBars data={[{ id: 'A', value: 0 }]} total={0} />
  );
  expect(getByTestId('segment-A')).toHaveStyle('width: 0.00%');
});
