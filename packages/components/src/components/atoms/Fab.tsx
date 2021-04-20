import styled from 'styled-components';
import { Plus } from 'phosphor-react';
import EdgePadding from '../layout/EdgePadding';
import ButtonBase from './ButtonBase';
import { v } from '../../theme';

const Container = styled(EdgePadding)`
  position: fixed;
  bottom: calc(
    env(safe-area-inset-bottom) + min(${v.upDownPadding}, 4vh) + 5.5rem
  );
  left: 0;
  right: 0;
  pointer-events: none;
  display: flex;
  justify-content: flex-end;
  z-index: ${v.zFixed};
  max-width: min(100%, calc(${v.maxLayoutWidth} + 10rem));

  @media (${v.minTablet}) {
    bottom: calc(env(safe-area-inset-bottom) + min(${v.upDownPadding}, 4vh));
  }
`;

const FabButton = styled(ButtonBase)`
  width: 3.8rem;
  height: 3.8rem;
  border-radius: 1.9rem;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: ${v.shadowOverlay};
  background-color: ${v.accentMain};
  color: ${v.textOnAccent};
  pointer-events: auto;

  &:hover {
    background-color: ${v.accentHover};
  }

  &:active {
    background-color: ${v.accentMain};
    box-shadow: ${v.shadowRaised};
  }
`;

function Fab(props: React.ComponentProps<typeof ButtonBase>) {
  return (
    <Container>
      <FabButton {...props}>
        <Plus weight="bold" size="1.5rem" />
      </FabButton>
    </Container>
  );
}

export default Fab;
