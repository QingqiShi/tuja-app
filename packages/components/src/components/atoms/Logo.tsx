import styled from 'styled-components';
import { v } from '../../theme';

const Title = styled.span`
  position: relative;
  display: inline-block;
  user-select: none;
  color: ${v.textMain};
  font-size: 1.25rem;
  line-height: 1.1em;
  letter-spacing: -0.025em;
  font-weight: 800;
  margin: 0 2em 0 0;
`;

const BetaBadge = styled.span`
  font-size: 0.5em;
  text-transform: uppercase;
  position: absolute;
  right: -0.3em;
  top: 0;
  width: 0;
  font-size: 0.9rem;
  line-height: 1.2em;
  font-weight: 600;
  letter-spacing: 0.028em;
`;

function Logo() {
  return (
    <Title>
      Tuja <BetaBadge>demo</BetaBadge>
    </Title>
  );
}

export default Logo;
