import styled, { css } from 'styled-components';
import useKeyboardFocus from '../../hooks/useKeyboardFocus';
import { v } from '../../theme';

type ButtonProps = {
  isTabFocused?: boolean;
} & React.ComponentProps<'button'>;
export const StyledButton = styled.button<ButtonProps>`
  border: 0;
  border-radius: 50rem;
  font-family: inherit;
  font-size: 1rem;
  line-height: inherit;
  white-space: nowrap;
  text-decoration: none;
  padding: ${v.spacerXS} ${v.spacerS};
  margin: 0;
  cursor: pointer;
  background-color: transparent;
  color: ${v.textMain};
  font-weight: ${v.fontSemiBold};
  display: inline-flex;
  align-items: center;
  transition: box-shadow 0.2s, color 0.2s, background 0.2s;
  outline-offset: 0.2rem;

  &:hover {
    background-color: ${v.backgroundHover};
  }
  &:focus {
    ${({ isTabFocused }) =>
      !isTabFocused &&
      css`
        outline: none;
      `}
  }
  &:active {
    background-color: ${v.backgroundOverlay};
  }
  &:disabled,
  &:disabled:hover,
  &[disabled],
  &[disabled]:hover {
    color: ${v.textSecondary};
    background-color: transparent;
    opacity: 0.6;
    cursor: default;
    pointer-events: none;
  }

  > svg:first-child:not(:last-child) {
    margin-right: ${v.spacerXS};
  }

  > svg:last-child:not(:first-child) {
    margin-left: ${v.spacerXS};
  }
`;

interface ButtonBaseProps {
  className?: string;
  href?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  type?: React.ComponentProps<'button'>['type'];
  onClick?: (e: React.MouseEvent) => void;
}

function ButtonBase({
  className,
  href,
  disabled,
  children,
  autoFocus,
  type,
  onClick,
}: React.PropsWithChildren<ButtonBaseProps>) {
  const [ref, isTabFocused] = useKeyboardFocus(autoFocus);
  return (
    <StyledButton
      ref={ref}
      as={!!href ? 'a' : undefined}
      onClick={(e: React.MouseEvent) => {
        if ((onClick || disabled) && href) e.preventDefault();

        onClick?.(e);
      }}
      href={href}
      className={className}
      isTabFocused={isTabFocused}
      disabled={disabled}
      autoFocus={autoFocus}
      type={!href ? type ?? 'button' : undefined}
    >
      {children}
    </StyledButton>
  );
}

export default ButtonBase;
