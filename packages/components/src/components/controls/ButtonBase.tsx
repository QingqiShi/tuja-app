import React from 'react';
import styled, { css } from 'styled-components';
import useKeyboardFocus from '../../hooks/useKeyboardFocus';
import { v } from '../../theme';

interface ButtonProps {
  isTabFocused?: boolean;
}
const Button = styled.button<ButtonProps & React.ComponentProps<'button'>>`
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
  background: transparent;
  color: ${v.textMain};
  font-weight: ${v.fontSemiBold};
  display: inline-flex;
  align-items: center;
  transition: box-shadow 0.2s, color 0.2s, background 0.2s;

  &:hover {
    background-color: ${v.backgroundRaised};
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
  &:visited {
    background: transparent;
    color: ${v.textMain};
  }
  &:disabled,
  &:disabled:hover {
    color: ${v.textSecondary};
    background: transparent;
    opacity: 0.6;
    cursor: default;
  }
`;

interface ButtonBaseProps {
  className?: string;
  href?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

function ButtonBase({
  className,
  href,
  disabled,
  children,
  autoFocus,
  onClick,
}: React.PropsWithChildren<ButtonBaseProps>) {
  const [ref, isTabFocused] = useKeyboardFocus(autoFocus);
  return (
    <Button
      ref={ref}
      as={!!href ? 'a' : undefined}
      onClick={(e: React.MouseEvent) => {
        if (onClick && href) e.preventDefault();
        onClick?.(e);
      }}
      href={href}
      className={className}
      isTabFocused={isTabFocused}
      disabled={disabled}
      autoFocus={autoFocus}
    >
      {children}
    </Button>
  );
}

export default ButtonBase;
