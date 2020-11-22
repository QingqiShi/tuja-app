import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { transparentize } from 'polished';

const Container = styled.div`
  display: inline-flex;
  border-radius: ${({ theme }) => theme.spacings.s};
`;

const Button = styled.button<{ isActive?: boolean }>`
  font-family: ${({ theme }) => theme.fontFamily};
  line-height: ${({ theme }) => theme.fonts.cta.height};
  font-weight: ${({ theme }) => theme.fonts.cta.weight};
  letter-spacing: ${({ theme }) => theme.fonts.cta.spacing};
  padding: ${({ theme }) => theme.spacings.xs};
  border: 1px solid
    ${({ theme }) => transparentize(1, theme.colors.textOnBackground)};
  color: ${({ theme }) => transparentize(0.3, theme.colors.textOnBackground)};
  background-color: ${({ theme }) =>
    transparentize(0.95, theme.colors.textOnBackground)};
  font-size: 0.8rem;
  text-transform: uppercase;
  transition: all 0.2s;
  display: inline-flex;
  place-items: center;
  place-content: center;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    background-color: ${({ theme }) =>
      transparentize(0.9, theme.colors.textOnBackground)};
  }

  &:focus {
    outline: none;
    border: 1px solid
      ${({ theme }) => transparentize(0.9, theme.colors.textOnBackground)};
    box-shadow: 0 0 ${({ theme }) => theme.spacings.s} 0
      ${({ theme }) => transparentize(0.9, theme.colors.textOnBackground)};
  }

  &:first-child {
    border-top-left-radius: ${({ theme }) => theme.spacings.xs};
    border-bottom-left-radius: ${({ theme }) => theme.spacings.xs};
  }

  &:last-child {
    border-top-right-radius: ${({ theme }) => theme.spacings.xs};
    border-bottom-right-radius: ${({ theme }) => theme.spacings.xs};
  }

  ${({ isActive }) =>
    isActive &&
    css`
      background-color: ${({ theme }) => theme.colors.callToAction};
      color: ${({ theme }) => theme.colors.textOnCallToAction};
      cursor: default;

      &:hover {
        background-color: ${({ theme }) => theme.colors.callToAction};
      }
    `}
`;

interface ButtonGroupProps<T> {
  buttons: { label: string; value: T }[];
  value?: T;
  onChange?: (value: T) => void;
}

function ButtonGroup<T>({ buttons, value, onChange }: ButtonGroupProps<T>) {
  const [internalValue, setInternalValue] = useState(buttons[0]?.value);

  return (
    <Container>
      {buttons.map((button) => (
        <Button
          key={button.label}
          isActive={(value ?? internalValue) === button.value}
          onClick={() => (onChange ?? setInternalValue)(button.value)}
          tabIndex={(value ?? internalValue) === button.value ? -1 : undefined}
        >
          {button.label}
        </Button>
      ))}
    </Container>
  );
}

export default ButtonGroup;
