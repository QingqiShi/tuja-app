import { fireEvent } from '@testing-library/react';
import { render } from '../../testUtils';
import Button from './Button';

test('render clickable button', () => {
  const handleClick = jest.fn();
  const { getByText } = render(<Button onClick={handleClick}>test</Button>);
  fireEvent.click(getByText('test'));
  expect(handleClick).toHaveBeenCalled();
});

test('render leading icon', () => {
  const { getByText } = render(
    <Button startIcon={<span>start-icon</span>}>test</Button>
  );
  expect(getByText('start-icon')).toBeInTheDocument();
});

test('render trailing icon', () => {
  const { getByText } = render(
    <Button endIcon={<span>end-icon</span>}>test</Button>
  );
  expect(getByText('end-icon')).toBeInTheDocument();
});

test('render icon button', () => {
  const { queryByText } = render(
    <Button icon={<span>icon</span>}>test</Button>
  );
  expect(queryByText('test')).toBeNull();
  expect(queryByText('icon')).not.toBeNull();
});

test('render as link', () => {
  const { queryByText } = render(
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    <Button as={(props) => <a {...props} />}>test</Button>
  );
  expect(queryByText('test')?.parentElement?.tagName).toBe('A');
});

test('render mobile with no text', () => {
  const { queryByText } = render(<Button hideTextOnMobile>test</Button>);
  expect(queryByText('test')).not.toBeVisible();
});

test.each(['primary' as const, 'shout' as const, 'outline' as const])(
  'render variants $s',
  (variant) => {
    render(<Button variant={variant}>test</Button>);
  }
);

test('render active button', () => {
  const { getByRole } = render(
    <Button variant="shout" active>
      test
    </Button>
  );
  expect(getByRole('button')).toBeDisabled();
});
