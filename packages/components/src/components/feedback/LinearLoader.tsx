import styled, { keyframes } from 'styled-components';
import { transparentize } from 'polished';

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  overflow: hidden;
  z-index: 900;
  background-color: ${({ theme }) =>
    transparentize(0.7, theme.colors.callToActionText)};
`;

const barAnimationSlow = keyframes`
  0% {
    left: -35%;
    right: 100%;
  }
  60% {
    left: 100%;
    right: -90%;
  }
  100% {
    left: 100%;
    right: -90%;
  }
`;

const barAnimationFast = keyframes`
  0% {
    left: -200%;
    right: 100%;
  }
  60% {
    left: 107%;
    right: -8%;
  }
  100% {
    left: 107%;
    right: -8%;
  }
`;

const Bar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: auto;
  background-color: ${({ theme }) => theme.colors.callToActionText};
`;

const SlowBar = styled(Bar)`
  animation: ${barAnimationSlow} 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395)
    infinite;
`;

const FastBar = styled(Bar)`
  animation: ${barAnimationFast} 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) 1.15s
    infinite;
`;

interface LinearLoaderProps {
  className?: string;
}

function LinearLoader({ className }: LinearLoaderProps) {
  return (
    <Container className={className}>
      <SlowBar />
      <FastBar />
    </Container>
  );
}

export default LinearLoader;
