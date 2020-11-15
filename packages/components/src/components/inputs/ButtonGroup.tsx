import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { transparentize } from 'polished';
import { theme, getTheme } from '../../theme';

const Container = styled.div`
  display: inline-flex;
  border-radius: ${theme.spacings('s')};
`;

const Button = styled.button<{ isActive?: boolean }>`
  font-family: ${theme.fontFamily};
  line-height: ${theme.fonts.ctaHeight};
  font-weight: ${theme.fonts.ctaWeight};
  letter-spacing: ${theme.fonts.ctaSpacing};
  padding: ${theme.spacings('xs')};
  border: 1px solid
    ${getTheme(theme.colors.textOnBackground, (c) => transparentize(1, c))};
  color: ${getTheme(theme.colors.textOnBackground, (c) =>
    transparentize(0.3, c)
  )};
  background-color: ${getTheme(theme.colors.textOnBackground, (color) =>
    transparentize(0.95, color)
  )};
  font-size: 0.8rem;
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
    border: 1px solid
      ${getTheme(theme.colors.textOnBackground, (color) =>
        transparentize(0.9, color)
      )};
    box-shadow: 0 0 ${theme.spacings('s')} 0
      ${getTheme(theme.colors.textOnBackground, (color) =>
        transparentize(0.9, color)
      )};
  }

  &:first-child {
    border-top-left-radius: ${theme.spacings('xs')};
    border-bottom-left-radius: ${theme.spacings('xs')};
  }

  &:last-child {
    border-top-right-radius: ${theme.spacings('xs')};
    border-bottom-right-radius: ${theme.spacings('xs')};
  }

  ${({ isActive }) =>
    isActive &&
    css`
      background-color: ${theme.colors.callToAction};
      color: ${theme.colors.textOnCallToAction};
      cursor: default;

      &:hover {
        background-color: ${theme.colors.callToAction};
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
