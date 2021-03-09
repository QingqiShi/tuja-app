import styled from 'styled-components';
import ButtonBase from './ButtonBase';
import { v } from '../../theme';

const Button = styled(ButtonBase)`
  color: ${v.accentMain};
  &:hover {
    color: ${v.accentHover};
    background-color: ${v.backgroundRaised};
  }
  &:active {
    background-color: ${v.backgroundOverlay};
  }
`;

interface ButtonTertiaryProps {
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
}

function ButtonTertiary({
  children,
  href,
  onClick,
}: React.PropsWithChildren<ButtonTertiaryProps>) {
  return (
    <Button href={href} onClick={onClick}>
      {children}
    </Button>
  );
}

export default ButtonTertiary;
