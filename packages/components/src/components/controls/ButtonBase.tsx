import React from 'react';
import styled, { css } from 'styled-components';
import useKeyboardFocus from '../../hooks/useKeyboardFocus';
import { v } from '../../theme';

const Button = styled.button<{ isTabFocused?: boolean; disabled?: boolean }>`
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
  onClick?: (e: React.MouseEvent) => void;
}

function ButtonBase({
  className,
  href,
  disabled,
  children,
  onClick,
}: React.PropsWithChildren<ButtonBaseProps>) {
  const [ref, isTabFocused] = useKeyboardFocus();
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
    >
      {children}
    </Button>
  );
}

export default ButtonBase;
