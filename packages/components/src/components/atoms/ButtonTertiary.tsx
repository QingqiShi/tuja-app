import styled from 'styled-components';
import ButtonBase from './ButtonBase';
import { v } from '../../theme';

const Button = styled(ButtonBase)`
  color: ${v.accentMain};
  &:hover {
    color: ${v.accentHover};
  }
  &:active {
    background-color: ${v.backgroundOverlay};
  }
`;

function ButtonTertiary(props: React.ComponentProps<typeof ButtonBase>) {
  return <Button {...props} />;
}

export default ButtonTertiary;
