import React from 'react';
import styled from 'styled-components/macro';
import { action } from '@storybook/addon-actions';
import { FaUserCircle } from 'react-icons/fa';
import { RiSendPlane2Line, RiHomeLine } from 'react-icons/ri';
import Button from 'components/Button';

const Container = styled.div`
  > button {
    margin-right: 15px;
  }
`;

const ButtonStories = {
  title: 'Inputs/Button',
  component: Button,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export default ButtonStories;

export const Buttons = () => (
  <>
    <Button onClick={action('button-click')}>default</Button>
    <Button onClick={action('button-click')} variant="primary">
      primary
    </Button>
    <Button onClick={action('button-click')} variant="outline">
      outline
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
    <Button onClick={action('button-click')} variant="outline" disabled>
      outline
    </Button>
    <Button onClick={action('button-click')} variant="shout" disabled>
      shout
    </Button>
  </>
);
