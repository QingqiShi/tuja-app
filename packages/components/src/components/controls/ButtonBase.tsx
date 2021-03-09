import React from 'react';
import styled, { css } from 'styled-components';
import useKeyboardFocus from '../../hooks/useKeyboardFocus';
import { v } from '../../theme';

const Button = styled.button<{ isTabFocused?: boolean }>`
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
`;

interface ButtonBaseProps {
  className?: string;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
}

function ButtonBase({
  className,
  href,
  onClick,
  children,
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
    >
      {children}
    </Button>
  );
}

export default ButtonBase;
