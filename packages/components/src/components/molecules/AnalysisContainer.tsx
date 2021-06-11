import styled, { keyframes } from 'styled-components';
import { v } from '../../theme';

const Container = styled.article`
  position: relative;
  background-color: ${v.backgroundRaised};
  box-shadow: ${v.shadowRaised};
  border-radius: ${v.radiusCard};
  padding: ${v.spacerS};

  &:not(:last-child) {
    margin-bottom: ${v.spacerM};
  }
`;

const Title = styled.h2`
  font-family: ${v.fontFamily};
  font-weight: ${v.fontSemiBold};
  font-size: 1.2rem;
  margin: ${v.spacerS} 0 0;

  @media (${v.minDesktop}) {
    flex-grow: 1;
  }
`;

const Configuration = styled.div`
  margin: ${v.spacerXS} 0 ${v.spacerS};
  display: flex;

  > :not(:last-child) {
    margin-right: ${v.spacerXS};
  }

  > * {
    width: 100%;
  }

  @media (${v.minDesktop}) {
    margin: ${v.spacerS} 0 0;

    > * {
      width: auto;
    }
  }
`;

const TopRow = styled.div`
  @media (${v.minDesktop}) {
    display: flex;
  }
`;

const Chart = styled.div`
  max-width: 100%;
  height: 20rem;
  overflow: hidden;

  @media (${v.minTablet}) {
    height: 30rem;
  }

  @media (${v.minLaptop}) {
    height: 20rem;
  }

  @media (${v.minDesktop}) {
    height: 30vw;
    max-height: 70vh;
  }
`;

const flash = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const LoadingIndicator = styled.div`
  position: absolute;
  right: ${v.spacerS};
  top: ${v.spacerS};
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 50%;
  overflow: hidden;
  background-color: ${v.accentMain};
  animation: 1s linear 0s infinite alternate ${flash};
`;

interface AnalysisContainerProps {
  title: string;
  configuration?: React.ReactNode;
  chart?: React.ReactNode;
  isLoading?: boolean;
}

function AnalysisContainer({
  title,
  configuration,
  chart,
  isLoading,
}: AnalysisContainerProps) {
  return (
    <Container>
      {isLoading && <LoadingIndicator />}
      <TopRow>
        <Title>{title}</Title>
        {configuration && <Configuration>{configuration}</Configuration>}
      </TopRow>
      {chart && <Chart>{chart}</Chart>}
    </Container>
  );
}

export default AnalysisContainer;
