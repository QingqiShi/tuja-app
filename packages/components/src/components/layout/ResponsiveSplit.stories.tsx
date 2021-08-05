import { Story, Meta } from '@storybook/react';
import Header from '../molecules/Header';
import ResponsiveSplit from './ResponsiveSplit';
import { v } from '../../theme';

export default {
  title: 'Layout/ResponsiveSplit',
  component: ResponsiveSplit,
} as Meta;

const Template: Story<React.ComponentProps<typeof ResponsiveSplit>> = (
  args
) => <ResponsiveSplit {...args} />;

export const Example = Template.bind({});
Example.args = {
  secondary: (
    <div
      style={{
        height: '1000px',
        backgroundColor: v.textGain,
      }}
    />
  ),
  primary: (
    <div
      style={{
        height: '2000px',
        backgroundColor: v.textLoss,
      }}
    />
  ),
};
Example.parameters = { layout: 'fullscreen' };

export const WithHeader = (
  ((args) => (
    <div>
      <Header logoHref="/" />
      <ResponsiveSplit
        {...args}
        primary={
          <div
            style={{
              height: '2000px',
              backgroundColor: v.textLoss,
              padding: '3rem',
            }}
          />
        }
        secondary={
          <div
            style={{
              height: '1000px',
              // backgroundColor: v.textGain,
              padding: '3rem',
            }}
          >
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore
            quas, ipsam accusamus deserunt necessitatibus sit minus iste
            adipisci autem possimus quasi alias dolore asperiores quo nulla
            omnis aut voluptate suscipit.
          </div>
        }
        stickyOffset={v.headerHeight}
      />
    </div>
  )) as Story<React.ComponentProps<typeof ResponsiveSplit>>
).bind({});
WithHeader.args = {
  secondary: (
    <div
      style={{
        height: '1000px',
        backgroundColor: v.textGain,
      }}
    />
  ),
  primary: (
    <div
      style={{
        height: '2000px',
        backgroundColor: v.textLoss,
      }}
    />
  ),
};
WithHeader.parameters = { layout: 'fullscreen' };

export const WithSticky = Template.bind({});
WithSticky.args = {
  secondary: (
    <div
      style={{
        height: '1000px',
        backgroundColor: v.textGain,
      }}
    />
  ),
  primary: (
    <div
      style={{
        height: '2000px',
        backgroundColor: v.textLoss,
      }}
    />
  ),
  secondarySticky: <div>test</div>,
};
WithSticky.parameters = { layout: 'fullscreen' };
