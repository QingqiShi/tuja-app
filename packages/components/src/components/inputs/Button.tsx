import styled, { css } from 'styled-components';
import { transparentize, lighten } from 'polished';
import { ctaFont, paddings } from '../../mixins';

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
  ${ctaFont}
  ${paddings}

  border-radius: ${({ theme }) => theme.spacings.xs};
  border: 1px solid transparent;
  color: ${({ theme }) => theme.colors.textSecondaryOnBackground};
  background-color: ${({ theme }) =>
    transparentize(1, theme.colors.textOnBackground)};
  text-transform: uppercase;
  text-decoration: none;
  transition: background-color 0.2s, color 0.2s, box-shadow 0.2s, border 0.2s,
    opacity 0.2s;
  display: inline-flex;
  place-items: center;
  cursor: pointer;

  ${({ align = 'center' }) => css`
    place-content: ${align};
  `}

  &:hover {
    background-color: ${({ theme }) =>
      transparentize(0.9, theme.colors.textOnBackground)};
  }

  &:focus {
    outline: none;
    border: 1px solid
      ${({ theme }) => transparentize(0.9, theme.colors.textOnBackground)};
    box-shadow: 0 0 0.2rem 0
      ${({ theme }) => transparentize(0.6, theme.colors.textOnBackground)};
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.disabled};
    pointer-events: none;

    ${({ active }) =>
      active &&
      css`
        color: ${({ theme }) => theme.colors.textSecondaryOnBackground};
        background-color: ${({ theme }) =>
          transparentize(0.9, theme.colors.textOnBackground)};
      `}
  }

  ${({ variant, active, theme }) => {
    switch (variant) {
      case 'primary':
        return css`
          color: ${theme.colors.callToActionText};
        `;
      case 'shout':
        return css`
          color: ${theme.colors.textOnCallToAction};
          background-color: ${transparentize(0.2, theme.colors.callToAction)};
          border: 1px solid ${theme.colors.callToActionText};

          &:hover {
            background-color: ${theme.colors.callToAction};
          }

          &:focus {
            border: 1px solid transparent;
            box-shadow: 0 0 0.2rem 0 ${lighten(0.15, theme.colors.callToAction)};
          }

          &:disabled {
            color: ${theme.colors.disabled};
            background-color: ${transparentize(
              0.95,
              theme.colors.textOnBackground
            )};
            border: 1px solid
              ${transparentize(0.9, theme.colors.textOnBackground)};
            ${active &&
            css`
              color: ${theme.colors.textSecondaryOnBackground};
            `}
          }
        `;
      case 'outline':
        return css`
          background-color: ${transparentize(
            theme.mode === 'light' ? 1 : 0.95,
            theme.colors.textOnBackground
          )};
          border: 1px solid
            ${transparentize(0.9, theme.colors.textOnBackground)};
          color: ${theme.colors.textOnBackground};

          &:hover {
            background-color: ${transparentize(
              theme.mode === 'light' ? 0.95 : 0.85,
              theme.colors.callToActionText
            )};
            border: 1px solid ${theme.colors.callToActionText};
          }

          &:disabled {
            background-color: ${transparentize(
              0.95,
              theme.colors.textOnBackground
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
    margin-right: ${({ theme }) => theme.spacings.xs};
  }
  &:not(:first-child) {
    margin-left: ${({ theme }) => theme.spacings.xs};
  }

  ${({ hideTextOnMobile, theme }) =>
    hideTextOnMobile &&
    css`
      display: none;
      @media (${theme.breakpoints.minTablet}) {
        display: inline;
      }
    `}
`;

interface ButtonProps<T> extends Omit<React.ComponentProps<'button'>, 'ref'> {
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
