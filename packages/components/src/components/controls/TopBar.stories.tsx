import { Story, Meta } from '@storybook/react';
import {
  RiPieChartLine,
  RiFileListLine,
  RiLogoutBoxRLine,
  RiMenuAddLine,
} from 'react-icons/ri';
import { FaUserCircle } from 'react-icons/fa';
import TopBar from './TopBar';

export default {
  title: 'Controls/TopBar',
  component: TopBar,
} as Meta;

const Template: Story<React.ComponentProps<typeof TopBar>> = (args) => (
  <TopBar {...args} />
);

export const WithLogo = Template.bind({});
WithLogo.args = {
  logo: <h3>Tuja</h3>,
};

export const Links = Template.bind({});
Links.args = {
  links: [
    { startIcon: <RiPieChartLine />, children: 'Portfolio', active: true },
    { startIcon: <RiFileListLine />, children: 'Activities' },
  ],
};

export const Menu = Template.bind({});
Menu.args = {
  menu: [
    { children: 'Create portfolio', startIcon: <RiMenuAddLine /> },
    { children: 'Sign out', startIcon: <RiLogoutBoxRLine /> },
  ],
};

export const EndLinks = Template.bind({});
EndLinks.args = {
  endLinks: [
    { children: 'Sign in', startIcon: <FaUserCircle />, variant: 'shout' },
  ],
};

export const AllTogether = Template.bind({});
AllTogether.args = {
  links: [
    { startIcon: <RiPieChartLine />, children: 'Portfolio', active: true },
    { startIcon: <RiFileListLine />, children: 'Activities' },
  ],
  menu: [
    { children: 'Create portfolio', startIcon: <RiMenuAddLine /> },
    { children: 'Sign out', startIcon: <RiLogoutBoxRLine /> },
  ],
  logo: <h3>Tuja</h3>,
};
