import styled from 'styled-components';
import { v } from '../../theme';

const Link = styled.a`
  color: ${v.accentMain};
  text-decoration: none;

  &:hover {
    color: ${v.accentHover};
    text-decoration: underline;
  }
`;

function TextLink(props: Omit<React.ComponentProps<'a'>, 'ref'>) {
  return <Link {...props} />;
}

export default TextLink;
