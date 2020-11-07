import React from 'react';
import styled, { css } from 'styled-components';
import { theme } from '../theme';

interface TypeProps {
  scale: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2';
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  className?: string;
  noMargin?: boolean;
}

const scales = {
  h1: {
    defaultAs: 'h1' as const,
    size: '3.815rem',
    height: '1.1em',
    spacing: '-0.025em',
    weight: 800,
  },
  h2: {
    defaultAs: 'h2' as const,
    size: '3.052rem',
    height: '1.1em',
    spacing: '-0.025em',
    weight: 750,
  },
  h3: {
    defaultAs: 'h3' as const,
    size: '2.441rem',
    height: '1.1em',
    spacing: '-0.025em',
    weight: 700,
  },
  h4: {
    defaultAs: 'h4' as const,
    size: '1.953rem',
    height: '1.1em',
    spacing: '-0.025em',
    weight: 650,
  },
  h5: {
    defaultAs: 'h5' as const,
    size: '1.563rem',
    height: '1.1em',
    spacing: '-0.025em',
    weight: 650,
  },
  h6: {
    defaultAs: 'h6' as const,
    size: '1.25rem',
    height: '1.1em',
    spacing: '-0.025em',
    weight: 600,
  },
  body1: {
    defaultAs: 'p' as const,
    size: '1rem',
    height: '1.7em',
    spacing: '0',
    weight: 400,
  },
  body2: {
    defaultAs: 'p' as const,
    size: '0.9rem',
    height: '1.5em',
    spacing: '0',
    weight: 400,
  },
};

const TypeBase = styled.span<Pick<TypeProps, 'scale' | 'noMargin'>>`
  font-family: ${theme.fontFamily};
  ${({ scale }) => css`
    font-size: ${scales[scale].size};
    line-height: ${scales[scale].height};
    letter-spacing: ${scales[scale].spacing};
    font-weight: ${scales[scale].weight};
  `}
  margin: ${({ scale, noMargin }) => {
    if (noMargin) return '0';
    return scale === 'body1' || scale === 'body2'
      ? `0 0 0.5em`
      : `1.5em 0 0.8em`;
  }};

  &:first-child {
    margin-top: 0;
  }
`;

function Type({
  scale,
  as,
  children,
  className,
  noMargin,
}: React.PropsWithChildren<TypeProps>) {
  return (
    <TypeBase
      scale={scale}
      as={as ?? scales[scale].defaultAs}
      className={className}
      noMargin={noMargin}
    >
      {children}
    </TypeBase>
  );
}

export default Type;
