import { Story, Meta } from '@storybook/react';
import SearchSuggest from './SearchSuggest';

export default {
  title: 'Inputs/SearchSuggest',
  component: SearchSuggest,
} as Meta;

const Template: Story<React.ComponentProps<typeof SearchSuggest>> = (args) => (
  <SearchSuggest {...args} />
);

export const SearchAndSuggest = Template.bind({});
SearchAndSuggest.args = {
  suggestions: [<div>a</div>, <div>b</div>],
};

export const DisableSuggestClick = Template.bind({});
DisableSuggestClick.args = {
  suggestions: [<div>a</div>, <div>b</div>],
  onClick: undefined,
};

export const NoSuggestions = Template.bind({});
NoSuggestions.args = {};

export const ScrollSuggestions = Template.bind({});
ScrollSuggestions.args = {
  suggestions: [
    <div>a</div>,
    <div>b</div>,
    <div>c</div>,
    <div>d</div>,
    <div>e</div>,
    <div>f</div>,
  ],
  maxSuggestHeight: 8,
};
