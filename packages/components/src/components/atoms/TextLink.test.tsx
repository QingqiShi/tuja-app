import { render } from '@testing-library/react';
import TextLink from './TextLink';

test('render', () => {
  const { getByText } = render(
    <TextLink href="http://test">test link</TextLink>
  );
  expect(getByText('test link')).toHaveAttribute('href', 'http://test');
});
