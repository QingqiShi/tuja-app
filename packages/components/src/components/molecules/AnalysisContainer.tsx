import styled from 'styled-components';
import { v } from '../../theme';

const Container = styled.article`
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
  }
`;

interface AnalysisContainerProps {
  title: string;
  configuration?: React.ReactNode;
  chart?: React.ReactNode;
}

function AnalysisContainer({
  title,
  configuration,
  chart,
}: AnalysisContainerProps) {
  return (
    <Container>
      <TopRow>
        <Title>{title}</Title>
        {configuration && <Configuration>{configuration}</Configuration>}
      </TopRow>
      {chart && <Chart>{chart}</Chart>}
    </Container>
  );
}

export default AnalysisContainer;
