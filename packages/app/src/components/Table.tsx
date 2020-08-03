import React from 'react';
import styled from 'styled-components/macro';
import { transparentize } from 'polished';
import { theme, getTheme } from 'theme';

export const Table = styled.table`
  width: 100%;
  border: none;
  border-collapse: collapse;
  border-spacing: 0;
`;

export const TableRow = styled.tr`
  td,
  th {
    padding: ${theme.spacings('s')};
    border-bottom: 1px solid
      ${getTheme(theme.colors.textOnBackground, (c) => transparentize(0.9, c))};

    @media (${theme.breakpoints.minLaptop}) {
      padding: ${theme.spacings('s')} ${theme.spacings('m')};
    }
  }

  &:last-of-type:not(:first-of-type) td {
    border-bottom: none;
  }
`;

export const TableHeader = styled.th`
  font-size: ${theme.fonts.labelSize};
  line-height: ${theme.fonts.labelHeight};
  font-weight: ${theme.fonts.labelWeight};
  color: ${getTheme(theme.colors.textOnBackground, (c) =>
    transparentize(0.5, c)
  )};

  &:first-of-type {
    text-align: left;
  }

  &:not(:first-of-type) {
    text-align: right;
  }
`;

const StyledTableCell = styled.td`
  &:first-of-type {
    text-align: left;
  }

  &:not(:first-of-type) {
    text-align: right;
  }
`;

const Primary = styled.span`
  display: block;
  white-space: nowrap;
  font-size: ${theme.fonts.ctaSize};
  line-height: ${theme.fonts.ctaHeight};
  font-weight: 500;
`;

const Secondary = styled.span`
  display: block;
  white-space: nowrap;
  max-width: 30vw;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: ${theme.fonts.helperSize};
  line-height: ${theme.fonts.helperHeight};
  font-weight: ${theme.fonts.helperWeight};
  @media (${theme.breakpoints.minLaptop}) {
    max-width: 15vw;
  }
`;

interface TableCellProps {
  secondary?: React.ReactNode;
  as?: React.ComponentProps<typeof StyledTableCell>['as'];
}

export function TableCell({
  children,
  secondary,
  ...props
}: TableCellProps & Omit<React.ComponentProps<'td'>, 'ref'>) {
  return (
    <StyledTableCell {...props}>
      <Primary>{children}</Primary>
      {secondary && <Secondary>{secondary}</Secondary>}
    </StyledTableCell>
  );
}

export default Table;
