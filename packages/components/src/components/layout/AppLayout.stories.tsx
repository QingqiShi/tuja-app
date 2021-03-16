import styled from 'styled-components';
import { Story, Meta } from '@storybook/react';
import AppLayout from './AppLayout';
import { v } from '../../theme';

const FakeTabBar = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 1rem;
  height: 75px;
  width: 100%;
  max-width: 454px;
  background-color: ${v.textGain};

  @media (${v.minDesktop}) {
    height: 340px;
    width: 75px;
  }
`;

const FakeContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 1rem;
  background-color: ${v.textLoss};
  height: 2000px;
`;

export default {
  title: 'Layout/AppLayout',
  component: AppLayout,
} as Meta;

const Template: Story<React.ComponentProps<typeof AppLayout>> = (args) => (
  <AppLayout {...args} />
);

export const Example = Template.bind({});
Example.args = {
  tabBar: <FakeTabBar>tab bar</FakeTabBar>,
  children: <FakeContent>content</FakeContent>,
};
Example.parameters = { layout: 'fullscreen' };
