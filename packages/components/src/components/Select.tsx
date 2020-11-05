import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { transparentize } from 'polished';
import { RiArrowDownSLine } from 'react-icons/ri';
import { theme, getTheme } from '../theme';

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

const SelectContainer = styled.div`
  width: 100%;
  position: relative;
`;

const SelectBase = styled.select`
  font-family: ${theme.fontFamily};
  font-size: ${theme.fonts.inputSize};
  line-height: ${theme.fonts.inputHeight};
  font-weight: ${theme.fonts.inputWeight};
  border-radius: ${theme.spacings('xs')};
  border: 2px solid
    ${getTheme(theme.colors.textOnBackground, (color) =>
      transparentize(0.9, color)
    )};
  color: ${theme.colors.textOnBackground};
  padding: 0.8em 3em 0.8em 1em;
  background-color: transparent;
  transition: all 0.2s;
  width: 100%;
  appearance: none;

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

  &:invalid {
    color: ${getTheme(theme.colors.textOnBackground, (color) =>
      transparentize(0.5, color)
    )};
  }

  option {
    font-size: 1rem;
    color: initial;
  }
`;

const DropdownIcon = styled(RiArrowDownSLine)<{ disabled?: boolean }>`
  position: absolute;
  height: 100%;
  width: 1.8em;
  right: 0.8em;
  top: 0;
  pointer-events: none;
  ${({ disabled }) =>
    disabled &&
    css`
      color: ${getTheme(theme.colors.textOnBackground, (color) =>
        transparentize(0.5, color)
      )};
    `}
`;

interface SelectProps extends Omit<React.ComponentProps<'select'>, 'ref'> {
  options: { label: string; value: string }[];
  label?: string;
  helperText?: string;
}

function Select({
  options,
  label,
  helperText,
  required,
  disabled,
  ...props
}: SelectProps) {
  const select = (
    <SelectContainer>
      <SelectBase required={required} disabled={disabled} {...props}>
        {options.map((option, i) => (
          <option
            value={option.value}
            key={`select-option-${option.value}`}
            disabled={!option.value && required}
          >
            {option.label}
          </option>
        ))}
      </SelectBase>
      <DropdownIcon disabled={disabled} size="auto" />
    </SelectContainer>
  );

  if (label || helperText) {
    return (
      <Label>
        {label && (
          <LabelLine>
            {label}
            {required ? '*' : ''}
          </LabelLine>
        )}
        {select}
        {helperText && <HelperText>{helperText}</HelperText>}
      </Label>
    );
  }

  return select;
}

export default Select;
