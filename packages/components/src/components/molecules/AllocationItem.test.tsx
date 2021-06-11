import { fireEvent, render } from '@testing-library/react';
import { MockDrag, drag, mockResizeObserver } from '../../testUtils';
import AllocationItem from './AllocationItem';

const mockResize = mockResizeObserver();

test('render', () => {
  const { getByText, getByTestId } = render(
    <AllocationItem
      stockInfo={{ name: 'Test', code: 'test', exchange: 'AB' }}
    />
  );

  expect(getByText('Test')).toBeInTheDocument();
  expect(getByText('test')).toBeInTheDocument();
  expect(getByText('AB')).toBeInTheDocument();
  expect(getByTestId('slider-thumb')).toBeInTheDocument();
  expect(getByTestId('allocation-input')).toHaveValue('0');
});

test('udpate value with slider', async () => {
  const handleChange = jest.fn();
  const { getByTestId } = render(
    <MockDrag>
      <AllocationItem
        stockInfo={{ name: 'Test', code: 'test', exchange: 'AB' }}
        allocation={23}
        onChange={handleChange}
      />
    </MockDrag>
  );

  mockResize(getByTestId('slider-thumb-container'), { width: 300 } as any);
  (await drag(getByTestId('slider-thumb')).to(150, 0)).end();

  expect(handleChange).toHaveBeenCalledWith(73);
});

test('udpate value with input', () => {
  const handleChange = jest.fn();
  const { getByTestId } = render(
    <AllocationItem
      stockInfo={{ name: 'Test', code: 'test', exchange: 'AB' }}
      allocation={23}
      onChange={handleChange}
    />
  );

  expect(getByTestId('allocation-input')).toHaveValue('23');
  fireEvent.change(getByTestId('allocation-input'), {
    target: { value: '54.3' },
  });

  expect(handleChange).toHaveBeenCalledWith(54.3);
});

test('render remove button', () => {
  const handleRemove = jest.fn();
  const { getByTestId } = render(
    <AllocationItem
      stockInfo={{ name: 'Test', code: 'test', exchange: 'AB' }}
      onRemove={handleRemove}
    />
  );

  fireEvent.click(getByTestId('allocation-remove-btn'));
  expect(handleRemove).toHaveBeenCalled();
});
