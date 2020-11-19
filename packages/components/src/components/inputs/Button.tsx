import React from 'react';
import styled, { css } from 'styled-components';
import { transparentize, lighten } from 'polished';
import { theme, getTheme, getPaddings } from '../../theme';

type ButtonVariant = 'primary' | 'shout' | 'outline';

interface ButtonBaseProps {
  variant?: ButtonVariant;
  compact?: boolean;
  active?: boolean;
  align?: 'start' | 'center' | 'end';
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
  border-radius: ${theme.spacings('xs')};
  border: 2px solid transparent;
  color: ${theme.colors.textSecondaryOnBackground};
  background-color: ${getTheme(theme.colors.textOnBackground, (color) =>
    transparentize(1, color)
  )};
  text-transform: uppercase;
  transition: background-color 0.2s, color 0.2s, box-shadow 0.2s, border 0.2s,
    opacity 0.2s;
  display: inline-flex;
  place-items: center;
  place-content: center;
  cursor: pointer;
  text-decoration: none;

  ${({ compact }) => getPaddings(compact)}

  ${({ align = 'center' }) => css`
    place-content: ${align};
  `}

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

    ${({ active }) =>
      active &&
      css`
        opacity: 1;
        background-color: ${getTheme(theme.colors.textOnBackground, (color) =>
          transparentize(0.9, color)
        )};
      `}
  }

  ${({ variant, active }) => {
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

          ${active &&
          css`
            &:disabled {
              background-color: ${getTheme(theme.colors.callToAction, (color) =>
                lighten(0.15, color)
              )};
            }
          `}
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

const Icon = styled.span`
  height: 1em;
`;

const Text = styled.span<{ hideTextOnMobile?: boolean }>`
  &:not(:last-child) {
    margin-right: ${theme.spacings('xs')};
  }
  &:not(:first-child) {
    margin-left: ${theme.spacings('xs')};
  }

  ${({ hideTextOnMobile }) =>
    hideTextOnMobile &&
    css`
      display: none;
      @media (${theme.breakpoints.minTablet}) {
        display: inline;
      }
    `}
`;

interface ButtonProps<T> extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  icon?: React.ReactNode;
  variant?: ButtonVariant;
  disabled?: boolean;
  compact?: boolean;
  active?: boolean;
  hideTextOnMobile?: boolean;
  align?: 'start' | 'center' | 'end';
  onClick?: React.MouseEventHandler;
  as?: React.ComponentType<T>;
  otherProps?: T;
}

function Button<T>({
  children,
  startIcon,
  endIcon,
  icon,
  variant,
  disabled,
  compact,
  active,
  hideTextOnMobile,
  align,
  as,
  otherProps,
  ...rest
}: ButtonProps<T>) {
  const content = (
    <>
      {startIcon && <Icon>{startIcon}</Icon>}
      {icon ? (
        <Icon>{icon}</Icon>
      ) : (
        <Text hideTextOnMobile={hideTextOnMobile}>{children}</Text>
      )}
      {endIcon && <Icon>{endIcon}</Icon>}
    </>
  );
  if (as && !disabled && !active) {
    return (
      <ButtonBase
        as={as}
        {...(rest as any)}
        variant={variant}
        active={active}
        disabled={disabled || active}
        compact={compact}
        align={align}
        {...otherProps}
      >
        {content}
      </ButtonBase>
    );
  }
  return (
    <ButtonBase
      {...rest}
      variant={variant}
      active={active}
      disabled={disabled || active}
      compact={compact}
      align={align}
    >
      {content}
    </ButtonBase>
  );
}

export default Button;
