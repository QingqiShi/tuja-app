import styled, { css } from 'styled-components';
import { transparentize } from 'polished';
import {
  inputFont,
  labelFont,
  helperFont,
  paddings,
  border,
  inputEndPadding,
  inputLeadPadding,
} from '../../mixins';

const InputBase = styled.input.attrs((props) => ({
  ...props,
  // Use a single space for placeholders so we can use :placeholder-shown
  // in CSS to check for empty values
  placeholder: props.placeholder || ' ',
}))<{ hasEndIcon?: boolean; hasLeadIcon?: boolean }>`
  ${inputFont}
  ${paddings}
  ${border}
  color: ${({ theme }) => theme.colors.textOnBackground};
  background-color: transparent;
  transition: all 0.2s;
  width: 100%;
  appearance: none;

  ${({ hasLeadIcon }) => hasLeadIcon && inputLeadPadding}
  ${({ hasEndIcon }) => hasEndIcon && inputEndPadding}

  &::placeholder {
    color: ${({ theme }) => transparentize(0.9, theme.colors.textOnBackground)};
    opacity: 1;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 ${({ theme }) => theme.spacings.s} 0
      ${({ theme }) => transparentize(0.9, theme.colors.textOnBackground)};
  }

  &:disabled {
    opacity: 0.5;
    color: ${({ theme }) => theme.colors.textOnBackground};
    background-color: ${({ theme }) =>
      transparentize(0.9, theme.colors.textOnBackground)};
  }

  &:not(:placeholder-shown):invalid {
    border-color: ${({ theme }) => theme.colors.error};
  }

  ::-webkit-calendar-picker-indicator {
    font-size: 1em;
    line-height: 1em;
    padding: 0;
    margin: 0;
  }

  ::-webkit-datetime-edit-fields-wrapper {
    padding: 0;
    margin: 0;
  }

  ${({ theme }) =>
    theme.mode === 'dark' &&
    css`
      ::-webkit-calendar-picker-indicator {
        filter: invert(1);
      }
    `};
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacings.s};
  text-align: left;
  width: 100%;
  > * {
    width: 100%;
  }
`;

const LabelLine = styled.span`
  ${labelFont}
  margin-bottom: ${({ theme }) => theme.spacings.xs};
  display: block;
`;

const HelperText = styled.div`
  ${helperFont}
  margin-top: ${({ theme }) => theme.spacings.xs};
  color: ${({ theme }) => transparentize(0.2, theme.colors.textOnBackground)};
`;

const InputContainer = styled.div`
  width: 100%;
  position: relative;
`;

const IconContainer = styled.div<{ isLead?: boolean }>`
  position: absolute;
  height: 100%;
  width: 1.5em;
  top: 0;
  pointer-events: none;
  display: flex;
  align-items: center;
  color: ${({ theme }) => transparentize(0.9, theme.colors.textOnBackground)};

  ${({ isLead }) =>
    isLead
      ? css`
          left: ${({ theme }) => theme.paddings.normal.mobile};
          @media (${({ theme }) => theme.breakpoints.minTablet}) {
            left: ${({ theme }) => theme.paddings.normal.tablet};
          }
          @media (${({ theme }) => theme.breakpoints.minLaptop}) {
            left: ${({ theme }) => theme.paddings.normal.laptop};
          }
        `
      : css`
          right: ${({ theme }) => theme.paddings.normal.mobile};
          @media (${({ theme }) => theme.breakpoints.minTablet}) {
            right: ${({ theme }) => theme.paddings.normal.tablet};
          }
          @media (${({ theme }) => theme.breakpoints.minLaptop}) {
            right: ${({ theme }) => theme.paddings.normal.laptop};
          }
        `}
`;

interface TextInputProps extends Omit<React.ComponentProps<'input'>, 'ref'> {
  label?: string;
  helperText?: string;
  endIcon?: React.ReactNode;
  leadIcon?: React.ReactNode;
}

function TextInput({
  label,
  required,
  helperText,
  endIcon,
  leadIcon,
  ...rest
}: TextInputProps) {
  if (label || helperText) {
    return (
      <Label>
        {label && (
          <LabelLine>
            {label}
            {required ? '*' : ''}
          </LabelLine>
        )}
        <InputContainer>
          {leadIcon && <IconContainer isLead>{leadIcon}</IconContainer>}
          <InputBase
            required={required}
            hasLeadIcon={!!leadIcon}
            hasEndIcon={!!endIcon}
            {...rest}
          />
          {endIcon && <IconContainer>{endIcon}</IconContainer>}
        </InputContainer>
        {helperText && <HelperText>{helperText}</HelperText>}
      </Label>
    );
  }

  return (
    <InputContainer>
      {leadIcon && <IconContainer isLead>{leadIcon}</IconContainer>}
      <InputBase
        hasLeadIcon={!!leadIcon}
        hasEndIcon={!!endIcon}
        required={required}
        {...rest}
      />
      {helperText && <HelperText>{helperText}</HelperText>}
    </InputContainer>
  );
}

export default TextInput;
