import styled, { css } from 'styled-components';

interface TypeProps {
  scale: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2';
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  className?: string;
  noMargin?: boolean;
}

const defaultAs = {
  h1: 'h1' as const,
  h2: 'h2' as const,
  h3: 'h3' as const,
  h4: 'h4' as const,
  h5: 'h5' as const,
  h6: 'h6' as const,
  body1: 'p' as const,
  body2: 'p' as const,
};

const TypeBase = styled.span<Pick<TypeProps, 'scale' | 'noMargin'>>`
  font-family: ${({ theme }) => theme.fontFamily};
  ${({ scale }) => css`
    font-size: ${({ theme }) => theme.fonts[scale].size};
    line-height: ${({ theme }) => theme.fonts[scale].height};
    letter-spacing: ${({ theme }) => theme.fonts[scale].spacing};
    font-weight: ${({ theme }) => theme.fonts[scale].weight};
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
      as={as ?? defaultAs[scale]}
      className={className}
      noMargin={noMargin}
    >
      {children}
    </TypeBase>
  );
}

export default Type;
