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

interface ButtonPrimaryProps {
  href?: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

function ButtonPrimary({
  children,
  href,
  disabled,
  onClick,
}: React.PropsWithChildren<ButtonPrimaryProps>) {
  return (
    <Button href={href} onClick={onClick} disabled={disabled}>
      {children}
    </Button>
  );
}

export default ButtonPrimary;
