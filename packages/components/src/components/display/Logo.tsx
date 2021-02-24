import styled from 'styled-components';
import Type from './Type';

const Title = styled(Type)`
  position: relative;
  display: inline-block;
  margin-right: 2em;
  font-weight: 800;
  user-select: none;
  color: ${({ theme }) => theme.colors.textOnBackground};
`;

const BetaBadge = styled.span`
  font-size: 0.5em;
  font-weight: ${({ theme }) => theme.fonts.cta.weight};
  line-height: ${({ theme }) => theme.fonts.cta.height};
  letter-spacing: ${({ theme }) => theme.fonts.cta.spacing};
  text-transform: uppercase;
  position: absolute;
  right: -0.3em;
  top: 0;
  width: 0;
`;

function Logo() {
  return (
    <Title scale="h6" noMargin>
      Tuja <BetaBadge>beta</BetaBadge>
    </Title>
  );
}

export default Logo;
