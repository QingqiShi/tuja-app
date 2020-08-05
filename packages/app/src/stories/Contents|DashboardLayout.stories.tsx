import React from 'react';
import styled from 'styled-components/macro';
import DashboardLayout from 'components/DashboardLayout';

const MockOverview = styled.div`
  min-height: 250px;
`;

export default {
  title: 'Contents|DashboardLayout',
  component: DashboardLayout,
};

export const Demo = () => (
  <DashboardLayout
    overview={<MockOverview />}
    values={<div></div>}
    gains={<div></div>}
    returns={<div></div>}
    datePeriod={null}
  />
);
