import styled from 'styled-components';
import { Plus } from 'phosphor-react';
import ButtonBase from './ButtonBase';
import { v } from '../../theme';

const Container = styled.div`
  position: fixed;
  bottom: calc(${v.edgePadding} + env(safe-area-inset-bottom));
  left: 0;
  right: 0;
  pointer-events: none;
  display: flex;
  justify-content: flex-end;
  padding-left: calc(env(safe-area-inset-left) + ${v.edgePadding});
  padding-right: calc(env(safe-area-inset-right) + ${v.edgePadding});
  z-index: ${v.zFixed};

  @media (${v.minDesktop}) {
    max-width: 90rem;
    margin: 0 auto;
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
