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
    top={<MockOverview />}
    side={<div></div>}
    main={<div></div>}
  />
);
