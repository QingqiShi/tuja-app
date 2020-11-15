import React from 'react';
import { Meta } from '@storybook/react';
import Table, { TableRow, TableCell, TableHeader } from './Table';

export default {
  title: 'Display/Table',
  component: Table,
} as Meta;

export const Demo = () => (
  <Table>
    <thead>
      <TableRow>
        <TableHeader>Symbol</TableHeader>
        <TableHeader>Price</TableHeader>
        <TableHeader>Info</TableHeader>
      </TableRow>
    </thead>
    <tbody>
      <TableRow>
        <TableCell>AAPL</TableCell>
        <TableCell secondary="+12.3%">+$123.45</TableCell>
        <TableCell>Yes!</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>MSFT</TableCell>
        <TableCell secondary="+12.3%">+$12.34</TableCell>
        <TableCell>No!</TableCell>
      </TableRow>
    </tbody>
  </Table>
);
