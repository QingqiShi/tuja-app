import styled from 'styled-components';
import ButtonBase from './ButtonBase';
import { v } from '../../theme';

const Button = styled(ButtonBase)`
  color: ${v.textOnAccent};
  background-color: ${v.accentMain};
  box-shadow: ${v.shadowRaised};

  &:hover {
    color: ${v.textOnAccent};
    background-color: ${v.accentHover};
  }
  &:active {
    background-color: ${v.accentMain};
    box-shadow: ${v.shadowPressed};
  }
`;

function ButtonPrimary(props: React.ComponentProps<typeof ButtonBase>) {
  return <Button {...props} />;
}

export default ButtonPrimary;
