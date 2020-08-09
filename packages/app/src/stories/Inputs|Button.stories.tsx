import React from 'react';
import { action } from '@storybook/addon-actions';
import { FaUserCircle } from 'react-icons/fa';
import { RiSendPlane2Line, RiHomeLine } from 'react-icons/ri';
import Button from 'components/Button';

const ButtonStories = {
  title: 'Inputs|Button',
  component: Button,
};

export default ButtonStories;

export const Buttons = () => (
  <>
    <Button onClick={action('button-click')}>default</Button>
    <Button onClick={action('button-click')} variant="primary">
      primary
    </Button>
    <Button onClick={action('button-click')} variant="shout">
      shout
    </Button>
  </>
);

export const ButtonsWithIcons = () => (
  <>
    <Button onClick={action('button-click')} startIcon={<FaUserCircle />}>
      log in
    </Button>
    <Button onClick={action('button-click')} endIcon={<RiSendPlane2Line />}>
      send
    </Button>
    <Button onClick={action('button-click')} icon={<RiHomeLine />} />
  </>
);

export const Disabled = () => (
  <>
    <Button onClick={action('button-click')} disabled>
      default
    </Button>
    <Button onClick={action('button-click')} variant="primary" disabled>
      primary
    </Button>
    <Button onClick={action('button-click')} variant="shout" disabled>
      shout
    </Button>
  </>
);
