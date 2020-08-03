import React from 'react';
import { withKnobs } from '@storybook/addon-knobs';
import ActivitiesList from 'components/ActivitiesList';

export default {
  title: 'Contents|HistoryTable',
  component: ActivitiesList,
  decorators: [withKnobs],
};

// export const Demo = () => (
//   <HistoryTable
//     currency="GBP"
//     portfolioHistory={[
//       {
//         date: new Date('2019-07-01'),
//         holdings: { 'VUSA.L': 6, 'VUCP.L': 2, 'SGLN.L': 4, AAPL: 1 },
//         cash: 600 - 597.33,
//         deposit: 600,
//       },
//       {
//         date: new Date('2020-01-02'),
//         holdings: { 'VUSA.L': 12, 'VUCP.L': 4, 'SGLN.L': 8, AAPL: 2 },
//         cash: 680 + 2.67 - 682.39,
//         deposit: 680,
//       },
//       {
//         date: new Date('2020-07-01'),
//         holdings: { 'VUSA.L': 18, 'VUCP.L': 6, 'SGLN.L': 12, AAPL: 3 },
//         cash: 780 + 0.28 - 779.67,
//         deposit: 780,
//       },
//     ]}
//   />
// );
