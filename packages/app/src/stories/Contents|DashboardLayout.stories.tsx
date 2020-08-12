import React from 'react';
import styled from 'styled-components/macro';
import DashboardLayout from 'components/DashboardLayout';

const MockOverview = styled.div`
  min-height: 250px;
`;

const DashboardLayoutStories = {
  title: 'Contents/DashboardLayout',
  component: DashboardLayout,
};

export default DashboardLayoutStories;

export const Demo = () => (
  <DashboardLayout
    overview={<MockOverview />}
    values={<div></div>}
    gains={<div></div>}
    returns={<div></div>}
    datePeriod={null}
  />
);
