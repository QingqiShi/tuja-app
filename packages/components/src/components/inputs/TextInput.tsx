import React from 'react';
import styled, { css } from 'styled-components';
import { transparentize } from 'polished';
import { inputFont, labelFont, helperFont, paddings } from '../../mixins';

const InputBase = styled.input.attrs((props) => ({
  ...props,
  // Use a single space for placeholders so we can use :placeholder-shown
  // in CSS to check for empty values
  placeholder: props.placeholder || ' ',
}))`
  ${inputFont}
  ${paddings}

  border-radius: ${({ theme }) => theme.spacings.xs};
  border: 2px solid
    ${({ theme }) => transparentize(0.9, theme.colors.textOnBackground)};
  color: ${({ theme }) => theme.colors.textOnBackground};
  background-color: transparent;
  transition: all 0.2s;
  width: 100%;
  appearance: none;

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
  > div {
    position: absolute;
    right: ${({ theme }) => theme.spacings.s};
    top: 50%;
  }
`;

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  endIcon?: React.ReactNode;
}

function TextInput({
  label,
  required,
  helperText,
  endIcon,
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
          <InputBase required={required} {...rest} />
          {endIcon}
        </InputContainer>
        {helperText && <HelperText>{helperText}</HelperText>}
      </Label>
    );
  }

  return (
    <InputContainer>
      <InputBase {...rest} />
      {endIcon}
    </InputContainer>
  );
}

export default TextInput;
