import React from 'react';
import styled, { css } from 'styled-components';
import { transparentize } from 'polished';
import { theme, getTheme } from '../theme';

const InputBase = styled.input.attrs((props) => ({
  ...props,
  // Use a single space for placeholders so we can use :placeholder-shown
  // in CSS to check for empty values
  placeholder: props.placeholder || ' ',
}))`
  font-family: ${theme.fontFamily};
  font-size: ${theme.fonts.inputSize};
  line-height: ${theme.fonts.inputHeight};
  font-weight: ${theme.fonts.inputWeight};
  padding: ${theme.spacings('s')};
  border-radius: ${theme.spacings('xs')};
  border: 2px solid
    ${getTheme(theme.colors.textOnBackground, (color) =>
      transparentize(0.9, color)
    )};
  /* height: calc(${theme.spacings('s')} * 2 + ${theme.fonts.inputHeight} + 4px); */
  color: ${theme.colors.textOnBackground};
  background-color: transparent;
  transition: all 0.2s;
  width: 100%;

  &::placeholder {
    color: ${getTheme(theme.colors.textOnBackground, (color) =>
      transparentize(0.9, color)
    )};
    opacity: 1;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 ${theme.spacings('s')} 0
      ${getTheme(theme.colors.textOnBackground, (color) =>
        transparentize(0.9, color)
      )};
  }

  &:disabled {
    opacity: 0.5;
    color: ${theme.colors.textOnBackground};
    background-color: ${getTheme(theme.colors.textOnBackground, (color) =>
      transparentize(0.9, color)
    )};
  }

  &:not(:placeholder-shown):invalid {
    border-color: ${theme.colors.error};
  }

  ${({ theme }) =>
    theme.mode === 'dark' &&
    css`
      ::-webkit-calendar-picker-indicator {
        filter: invert(1);
      }
    `}
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${theme.spacings('s')};
  text-align: left;
  width: 100%;
  > * {
    width: 100%;
  }
`;

const LabelLine = styled.span`
  font-size: ${theme.fonts.labelSize};
  line-height: ${theme.fonts.labelHeight};
  font-weight: ${theme.fonts.labelWeight};
  margin-bottom: ${theme.spacings('xs')};
  display: block;
`;

const HelperText = styled.span`
  font-size: ${theme.fonts.helperSize};
  line-height: ${theme.fonts.helperHeight};
  font-weight: ${theme.fonts.helperWeight};
  margin-top: ${theme.spacings('xs')};
  color: ${getTheme(theme.colors.textOnBackground, (color) =>
    transparentize(0.2, color)
  )};
  display: block;
`;

const InputContainer = styled.div`
  width: 100%;
  position: relative;
  > div {
    position: absolute;
    right: ${theme.spacings('s')};
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
  console.log(label);
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
