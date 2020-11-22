import React from 'react';
import styled from 'styled-components';
import { transparentize } from 'polished';

export const Table = styled.table`
  width: 100%;
  border: none;
  border-collapse: collapse;
  border-spacing: 0;
`;

export const TableRow = styled.tr`
  td,
  th {
    padding: ${({ theme }) => theme.spacings.s};
    border-bottom: 1px solid
      ${({ theme }) => transparentize(0.9, theme.colors.textOnBackground)};

    @media (${({ theme }) => theme.breakpoints.minLaptop}) {
      padding: ${({ theme }) => `${theme.spacings.s} ${theme.spacings.m}`};
    }
  }

  &:last-of-type:not(:first-of-type) td {
    border-bottom: none;
  }
`;

export const TableHeader = styled.th`
  font-size: ${({ theme }) => theme.fonts.label.size};
  line-height: ${({ theme }) => theme.fonts.label.height};
  font-weight: ${({ theme }) => theme.fonts.label.weight};
  color: ${({ theme }) => transparentize(0.5, theme.colors.textOnBackground)};

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
  font-size: ${({ theme }) => theme.fonts.cta.size};
  line-height: ${({ theme }) => theme.fonts.cta.height};
  font-weight: 500;
`;

const Secondary = styled.span`
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: ${({ theme }) => theme.fonts.helper.size};
  line-height: ${({ theme }) => theme.fonts.helper.height};
  font-weight: ${({ theme }) => theme.fonts.helper.weight};
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
