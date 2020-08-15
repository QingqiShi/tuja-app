import React from 'react';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components/macro';
import { transparentize, lighten } from 'polished';
import { theme, getTheme } from 'theme';

type ButtonVariant = 'primary' | 'shout' | 'outline';

interface ButtonBaseProps
  extends Partial<Pick<React.ComponentProps<typeof Link>, 'to'>> {
  hasStartIcon?: boolean;
  hasEndIcon?: boolean;
  variant?: ButtonVariant;
}

const ButtonBase = styled.button.withConfig<ButtonBaseProps>({
  shouldForwardProp: (prop, validator) =>
    !['hasStartIcon', 'hasEndIcon'].includes(prop) && validator(prop),
})`
  font-family: ${theme.fontFamily};
  font-size: ${theme.fonts.ctaSize};
  line-height: ${theme.fonts.ctaHeight};
  font-weight: ${theme.fonts.ctaWeight};
  letter-spacing: ${theme.fonts.ctaSpacing};
  padding: ${theme.spacings('s')};
  border-radius: ${theme.spacings('xs')};
  border: 2px solid transparent;
  color: ${theme.colors.textOnBackground};
  background-color: ${getTheme(theme.colors.textOnBackground, (color) =>
    transparentize(1, color)
  )};
  text-transform: uppercase;
  transition: all 0.2s;
  display: inline-flex;
  place-items: center;
  place-content: center;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    background-color: ${getTheme(theme.colors.textOnBackground, (color) =>
      transparentize(0.9, color)
    )};
  }

  &:focus {
    outline: none;
    border: 2px solid
      ${getTheme(theme.colors.textOnBackground, (color) =>
        transparentize(0.9, color)
      )};
    box-shadow: 0 0 ${theme.spacings('s')} 0
      ${getTheme(theme.colors.textOnBackground, (color) =>
        transparentize(0.9, color)
      )};
  }

  &:disabled {
    opacity: ${({ theme }) => (theme.mode === 'light' ? 0.3 : 0.4)};
    pointer-events: none;
  }

  ${({ hasStartIcon }) =>
    hasStartIcon &&
    css`
      position: relative;
      padding-left: calc(${theme.spacings('s')} + 1.5em);
    `}

  ${({ hasEndIcon }) =>
    hasEndIcon &&
    css`
      position: relative;
      padding-right: calc(${theme.spacings('s')} + 1.5em);
    `}

  ${({ variant }) => {
    switch (variant) {
      case 'primary':
        return css`
          color: ${theme.colors.callToActionText};
        `;
      case 'shout':
        return css`
          background-color: ${theme.colors.callToAction};
          color: ${theme.colors.textOnCallToAction};

          &:hover {
            background-color: ${getTheme(theme.colors.callToAction, (color) =>
              lighten(0.15, color)
            )};
          }

          &:focus {
            border: 2px solid transparent;
            box-shadow: 0 0 ${theme.spacings('s')} 0
              ${getTheme(theme.colors.callToAction, (color) =>
                lighten(0.15, color)
              )};
          }
        `;
      case 'outline':
        return css`
          border: 2px solid ${theme.colors.callToAction};
          color: ${theme.colors.callToActionText};

          &:hover {
            border: 2px solid ${theme.colors.callToActionText};
          }

          &:focus {
            border: 2px solid ${theme.colors.callToAction};
            box-shadow: 0 0 ${theme.spacings('s')} 0
              ${getTheme(theme.colors.callToAction, (color) =>
                lighten(0.15, color)
              )};
          }
        `;
    }
  }}
`;

const FloatingIcon = styled.div<{ isStart?: boolean }>`
  position: absolute;
  ${({ isStart }) =>
    isStart
      ? css`
          left: ${theme.spacings('s')};
        `
      : css`
          right: ${theme.spacings('s')};
        `}
  font-size: 1.2em;
  height: 1em;
`;

const Icon = styled.span`
  font-size: 1.2em;
  height: 1em;
`;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  icon?: React.ReactNode;
  variant?: ButtonVariant;
  to?: React.ComponentProps<typeof Link>['to'];
}

function Button({
  children,
  startIcon,
  endIcon,
  icon,
  variant,
  to,
  disabled,
  ...rest
}: ButtonProps) {
  const content = (
    <>
      {startIcon && <FloatingIcon isStart>{startIcon}</FloatingIcon>}
      {icon ? <Icon>{icon}</Icon> : <span>{children}</span>}
      {endIcon && <FloatingIcon>{endIcon}</FloatingIcon>}
    </>
  );
  if (to && !disabled) {
    return (
      <ButtonBase
        {...(rest as any)}
        hasStartIcon={!!startIcon}
        hasEndIcon={!!endIcon}
        variant={variant}
        as={Link}
        to={to}
      >
        {content}
      </ButtonBase>
    );
  }
  return (
    <ButtonBase
      {...rest}
      hasStartIcon={!!startIcon}
      hasEndIcon={!!endIcon}
      variant={variant}
      disabled={disabled}
    >
      {content}
    </ButtonBase>
  );
}

export default Button;
