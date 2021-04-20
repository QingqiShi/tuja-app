import styled from 'styled-components';
import ButtonBase from './ButtonBase';
import { v } from '../../theme';

const Button = styled(ButtonBase)`
  color: ${v.accentMain};
  background-color: ${v.backgroundRaised};
  box-shadow: ${v.shadowRaised};

  &:hover {
    color: ${v.accentHover};
    background-color: ${v.backgroundHover};
  }
  &:active {
    background-color: ${v.backgroundOverlay};
    box-shadow: ${v.shadowPressed};
  }
`;

function ButtonSecondary(props: React.ComponentProps<typeof ButtonBase>) {
  return <Button {...props} />;
}

export default ButtonSecondary;
