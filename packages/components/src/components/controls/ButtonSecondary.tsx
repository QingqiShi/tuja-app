import styled from 'styled-components';
import ButtonBase from './ButtonBase';
import { v } from '../../theme';

const Button = styled(ButtonBase)`
  color: ${v.accentMain};
  background-color: ${v.backgroundRaised};
  box-shadow: ${v.shadowRaised};
  transition: box-shadow 0.2s, color 0.2s, background 0.2s;

  &:hover {
    color: ${v.accentHover};
    background-color: ${v.backgroundOverlay};
  }
  &:active {
    background-color: ${v.backgroundOverlay};
    box-shadow: ${v.shadowPressed};
  }
`;

interface ButtonSecondaryProps {
  href?: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

function ButtonSecondary({
  children,
  href,
  disabled,
  onClick,
}: React.PropsWithChildren<ButtonSecondaryProps>) {
  return (
    <Button href={href} onClick={onClick} disabled={disabled}>
      {children}
    </Button>
  );
}

export default ButtonSecondary;
