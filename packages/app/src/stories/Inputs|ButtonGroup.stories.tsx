import React from 'react';
import ButtonGroup from 'components/ButtonGroup';

const ButtonGroupStories = {
  title: 'Inputs|ButtonGroup',
  component: ButtonGroup,
};

export default ButtonGroupStories;

export const Demo = () => (
  <ButtonGroup
    buttons={[
      { label: '1W', value: '1W' },
      { label: '1M', value: '1M' },
      { label: '3M', value: '3M' },
      { label: '1Y', value: '1Y' },
    ]}
  />
);
