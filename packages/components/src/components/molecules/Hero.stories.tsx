import { Story, Meta } from '@storybook/react';
import Cta from '../atoms/Cta';
import Hero from './Hero';

export default {
  title: 'Molecules/Hero',
  component: Hero,
} as Meta;

const Template: Story<React.ComponentProps<typeof Hero>> = (args) => (
  <Hero {...args} />
);

export const OnlyHeadline = Template.bind({});
OnlyHeadline.args = {
  headline: 'Understand your investments.',
};

export const WithImage = Template.bind({});
WithImage.args = {
  headline: 'Understand your investments.',
  image: (
    <img
      src="https://global-uploads.webflow.com/5f3cf8cce20a65438a93628a/5f59d3dae314c45f39759041_Drawkit_landing_04_1-compressed-poster-00001.jpg"
      alt="Test"
    />
  ),
};

export const WithImageAndCta = Template.bind({});
WithImageAndCta.args = {
  headline: 'Understand your investments.',
  image: (
    <img
      src="https://global-uploads.webflow.com/5f3cf8cce20a65438a93628a/5f59d3dae314c45f39759041_Drawkit_landing_04_1-compressed-poster-00001.jpg"
      alt="Test"
    />
  ),
  cta: <Cta>Try now</Cta>,
};
