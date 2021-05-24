import { useState } from 'react';
import styled, { css } from 'styled-components';
import useKeyboardFocus from '../../hooks/useKeyboardFocus';
import { v } from '../../theme';

const Label = styled.label<{ noMargin?: boolean }>`
  display: block;
  text-align: left;
  width: 100%;
  position: relative;
  margin-bottom: ${v.spacerS};

  > * {
    width: 100%;
  }

  ${({ noMargin }) =>
    noMargin &&
    css`
      margin-bottom: 0;
    `};
`;

const LabelLine = styled.span<{ isFocus?: boolean }>`
  font-family: ${v.fontFamily};
  font-weight: ${v.fontRegular};
  margin: 0 ${v.spacerS};
  padding: ${v.spacerS} 0;
  color: ${v.textSecondary};
  font-size: 1rem;
  line-height: 1.2em;
  display: block;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  border: 1px solid transparent;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transform-origin: 0 0;
  transition: transform 0.2s;
  z-index: 1;
  pointer-events: none;

  ${({ isFocus }) =>
    isFocus &&
    css`
      transform: scale(0.7);
      font-weight: ${v.fontSemiBold};
    `}
`;

const InputBase = styled.input.attrs((props) => ({
  ...props,
  // Use a single space for placeholders so we can use :placeholder-shown
  // in CSS to check for empty values
  placeholder: props.placeholder || ' ',
}))<{ hasEndIcon?: boolean; hasLeadIcon?: boolean; isKeyboardFocus?: boolean }>`
  color: ${v.textMain};
  background-color: ${v.backgroundHover};
  padding: ${v.spacerS} ${v.spacerS};
  box-shadow: ${v.shadowRaised};
  font-family: ${v.fontFamily};
  font-weight: ${v.fontRegular};
  font-size: 1rem;
  line-height: 1.2em;
  border: 1px solid transparent;
  border-radius: 0.5rem;
  width: 100%;
  appearance: none;
  transition: border 0.2s, box-shadow 0.2s;

  ${({ hasLeadIcon }) =>
    hasLeadIcon &&
    css`
      padding-left: 3.5rem;
    `}
  ${({ hasEndIcon }) =>
    hasEndIcon &&
    css`
      padding-right: 3.5rem;
    `}

  &::placeholder {
    color: ${v.textSecondary};
    opacity: 1;
  }

  &:focus {
    border-color: ${v.textSecondary};

    ${({ isKeyboardFocus }) =>
      !isKeyboardFocus &&
      css`
        outline: none;
      `}
  }

  &:hover:not(:focus):not(:disabled) {
    box-shadow: ${v.shadowOverlay};
    border-color: ${v.textSecondary};
  }

  &:disabled {
    opacity: 0.7;
    box-shadow: none;
    color: ${v.textSecondary};
  }

  &:invalid:not(:placeholder-shown) {
    border-color: ${v.textError};
  }

  ::-webkit-datetime-edit-fields-wrapper {
    padding: 0;
    margin: 0;
  }

  ::-webkit-calendar-picker-indicator {
    font-size: 0.9em;
    line-height: 0.9em;
    padding: 0;
    margin: 0;
  }

  &[data-theme='dark'] {
    ::-webkit-calendar-picker-indicator {
      filter: invert(1);
    }
  }

  ${Label} & {
    padding: calc(${v.spacerS} * 1.5) ${v.spacerS} calc(${v.spacerS} / 2);

    ::-webkit-calendar-picker-indicator {
      transform: translateY(calc(${v.spacerS} / -2));
    }
  }
`;

const HelperText = styled.div`
  font-size: 0.6rem;
  font-weight: ${v.fontRegular};
  padding-left: ${v.spacerS};
  margin-top: ${v.spacerXS};
  color: ${v.textSecondary};
`;

const InputContainer = styled.div<{ noMargin?: boolean }>`
  width: 100%;
  margin-bottom: ${v.spacerS};

  ${({ noMargin }) =>
    noMargin &&
    css`
      margin-bottom: 0;
    `};

  ${Label} & {
    margin-bottom: 0;
  }
`;

const IconContainer = styled.div<{ isLead?: boolean }>`
  position: absolute;
  height: 100%;
  width: 3.5em;
  top: 0;
  pointer-events: none;
  display: flex;
  align-items: center;
  padding: ${v.spacerS};
  color: ${v.textSecondary};
  z-index: 1;

  ${({ isLead }) =>
    isLead
      ? css`
          left: 0;
        `
      : css`
          right: 0;
        `}
`;

const IconWrapper = styled.div`
  position: relative;
`;

interface TextInputProps extends Omit<React.ComponentProps<'input'>, 'ref'> {
  label?: string;
  helperText?: string;
  endIcon?: React.ReactNode;
  leadIcon?: React.ReactNode;
  noMargin?: boolean;
}

function TextInput({
  label,
  required,
  helperText,
  endIcon,
  leadIcon,
  noMargin,
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  ...rest
}: TextInputProps) {
  const [ref, isKeyboardFocus] = useKeyboardFocus();
  const [isFocus, setIsFocus] = useState(false);
  const [_value, _setValue] = useState(defaultValue ?? '');

  const input = (
    <InputContainer>
      <IconWrapper>
        {leadIcon && <IconContainer isLead>{leadIcon}</IconContainer>}
        <InputBase
          ref={ref}
          isKeyboardFocus={isKeyboardFocus}
          required={required}
          hasLeadIcon={!!leadIcon}
          hasEndIcon={!!endIcon}
          value={value ?? _value}
          onChange={onChange ?? ((e) => _setValue(e.target.value))}
          {...rest}
          onFocus={(e) => {
            setIsFocus(true);
            if (onFocus) onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocus(false);
            if (onBlur) onBlur(e);
          }}
        />
        {endIcon && <IconContainer>{endIcon}</IconContainer>}
      </IconWrapper>
      {helperText && <HelperText>{helperText}</HelperText>}
    </InputContainer>
  );

  if (label) {
    return (
      <Label noMargin={noMargin}>
        {label && (
          <LabelLine
            isFocus={
              isFocus || !!value || !!_value || !!rest.placeholder?.trim()
            }
          >
            {label}
            {required ? '*' : ''}
          </LabelLine>
        )}
        {input}
      </Label>
    );
  }

  return input;
}

export default TextInput;
