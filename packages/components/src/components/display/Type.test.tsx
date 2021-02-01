import { render } from '../../testUtils';
import Type from './Type';

test('render text', () => {
  const { getByText } = render(<Type scale="h1">test</Type>);
  expect(getByText('test')).toBeInTheDocument();
});

test('override weight', () => {
  const { getByText } = render(
    <Type scale="h1" weight={500}>
      test
    </Type>
  );
  expect(getByText('test')).toHaveStyle('font-weight: 500;');
});

test('override margin', () => {
  const { getByText } = render(
    <Type scale="h1" noMargin>
      test
    </Type>
  );
  expect(getByText('test')).toHaveStyle('margin: 0px 0px 0px 0px;');
});

test('body1 margin', () => {
  const { getByText } = render(<Type scale="body1">test</Type>);
  expect(getByText('test')).toHaveStyle('margin: 0px 0px 0.5em 0px;');
});

test('body2 margin', () => {
  const { getByText } = render(<Type scale="body2">test</Type>);
  expect(getByText('test')).toHaveStyle('margin: 0px 0px 0.5em 0px;');
});

test('margin for non-first child', () => {
  const { getByText } = render(
    <>
      <Type scale="h1">test1</Type>
      <Type scale="h1">test2</Type>
    </>
  );
  expect(getByText('test1')).toHaveStyle('margin: 0px 0px 0.8em 0px;');
  expect(getByText('test2')).toHaveStyle('margin: 1.5em 0px 0.8em;');
});
