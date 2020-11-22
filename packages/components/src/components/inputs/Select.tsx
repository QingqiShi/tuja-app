import React from 'react';
import styled, { css } from 'styled-components';
import { transparentize } from 'polished';
import { RiArrowDownSLine } from 'react-icons/ri';
import { inputFont, labelFont, helperFont, paddings } from '../../mixins';

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

const HelperText = styled.span`
  ${helperFont}
  margin-top: ${({ theme }) => theme.spacings.xs};
  color: ${({ theme }) => transparentize(0.2, theme.colors.textOnBackground)};
  display: block;
`;

const SelectContainer = styled.div`
  width: 100%;
  position: relative;
`;

const SelectBase = styled.select`
  ${inputFont}
  ${paddings}
  padding-right: 3rem;
  border-radius: ${({ theme }) => theme.spacings.xs};
  border: ${({ theme }) =>
    `2px solid ${transparentize(0.9, theme.colors.textOnBackground)}`};
  color: ${({ theme }) => theme.colors.textOnBackground};
  background-color: transparent;
  transition: all 0.2s;
  width: 100%;
  appearance: none;

  &:focus {
    outline: none;
    box-shadow: ${({ theme }) =>
      `0 0 ${theme.spacings.s} 0 ${transparentize(
        0.9,
        theme.colors.textOnBackground
      )}`};
  }

  &:disabled {
    opacity: 0.5;
    color: ${({ theme }) => theme.colors.textOnBackground};
    background-color: ${({ theme }) =>
      transparentize(0.9, theme.colors.textOnBackground)};
  }

  &:invalid {
    color: ${({ theme }) => transparentize(0.5, theme.colors.textOnBackground)};
  }

  option {
    font-size: 1rem;
    color: initial;
  }
`;

const DropdownIcon = styled(RiArrowDownSLine)<{ disabled?: boolean }>`
  position: absolute;
  height: 100%;
  width: 1.5em;
  top: 0;
  pointer-events: none;
  ${({ disabled }) =>
    disabled &&
    css`
      color: ${({ theme }) =>
        transparentize(0.5, theme.colors.textOnBackground)};
    `}

  right: ${({ theme }) => theme.paddings.normal.mobile};
  @media (${({ theme }) => theme.breakpoints.minTablet}) {
    right: ${({ theme }) => theme.paddings.normal.tablet};
  }
  @media (${({ theme }) => theme.breakpoints.minLaptop}) {
    right: ${({ theme }) => theme.paddings.normal.laptop};
  }
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
        {options.map((option) => (
          <option
            value={option.value}
            key={`select-option-${option.value}`}
            disabled={!option.value && required}
          >
            {option.label}
          </option>
        ))}
      </SelectBase>
      <DropdownIcon disabled={disabled} size="100%" />
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
