import { fireEvent, render } from '@testing-library/react';
import { MockDrag, drag, mockResizeObserver } from '../../testUtils';
import Slider from './Slider';

const mockResize = mockResizeObserver();

test('render slider', () => {
  const { getByTestId } = render(<Slider />);
  expect(getByTestId('slider-thumb')).toBeInTheDocument();
});

test('update value by dragging slider', async () => {
  const handleChange = jest.fn();
  const { getByTestId } = render(
    <MockDrag>
      <Slider value={50} onChange={handleChange} />
    </MockDrag>
  );

  mockResize(getByTestId('slider-thumb-container'), { width: 300 } as any);

  (await drag(getByTestId('slider-thumb')).to(150, 0)).end();

  // 50 + 50
  expect(handleChange).toHaveBeenCalledWith(100);
});

test('update value using keyboard', () => {
  const handleChange = jest.fn();
  const { getByTestId } = render(<Slider value={50} onChange={handleChange} />);

  fireEvent.focus(getByTestId('slider-thumb'));

  fireEvent.keyDown(getByTestId('slider-thumb'), { code: 'ArrowRight' });
  expect(handleChange).toHaveBeenCalledWith(51);

  fireEvent.keyDown(getByTestId('slider-thumb'), { code: 'ArrowLeft' });
  expect(handleChange).toHaveBeenCalledWith(49);
});

test('infer step size from step count', () => {
  const handleChange = jest.fn();
  const { getByTestId } = render(
    <Slider value={50} onChange={handleChange} stepCount={10} />
  );

  fireEvent.focus(getByTestId('slider-thumb'));

  fireEvent.keyDown(getByTestId('slider-thumb'), { code: 'ArrowRight' });
  expect(handleChange).toHaveBeenCalledWith(60);

  fireEvent.keyDown(getByTestId('slider-thumb'), { code: 'ArrowLeft' });
  expect(handleChange).toHaveBeenCalledWith(40);
});

test('set min and max limits', async () => {
  const handleChange = jest.fn();
  const { getByTestId } = render(
    <MockDrag>
      <Slider value={50} min={25} max={66} onChange={handleChange} />
    </MockDrag>
  );
  mockResize(getByTestId('slider-thumb-container'), { width: 300 } as any);

  (await drag(getByTestId('slider-thumb')).to(1000, 0)).end();
  expect(handleChange).toHaveBeenCalledWith(66);

  (await drag(getByTestId('slider-thumb')).to(-1000, 0)).end();
  expect(handleChange).toHaveBeenCalledWith(25);
});
