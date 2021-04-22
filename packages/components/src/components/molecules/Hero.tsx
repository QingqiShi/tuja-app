import styled from 'styled-components';
import { v } from '../../theme';
import EdgePadding from '../layout/EdgePadding';

const Container = styled(EdgePadding)`
  margin-top: 5rem;
  margin-bottom: 3rem;

  @media (${v.minLaptop}) {
    display: flex;
    align-items: center;

    > div {
      width: 50%;
    }
  }
`;

const Headline = styled.h1`
  font-weight: ${v.fontExtraBold};
  margin: 0;
  font-size: 2.5rem;
  overflow: hidden;

  @media (${v.minTablet}) {
    font-size: 3rem;
  }

  @media (${v.minTablet}) {
    font-size: 3rem;
  }

  @media (${v.minDesktop}) {
    font-size: 4rem;
  }
`;

const CtaContainer = styled.div`
  margin-top: ${v.spacerM};
`;

const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${v.spacerM};

  > * {
    width: 100%;
    max-height: 30rem;
    border-radius: ${v.spacerXS};
  }

  @media (${v.minTablet}) {
    > * {
      max-width: 45rem;
    }
  }

  @media (${v.minLaptop}) {
    > * {
      max-width: 35rem;
      max-height: 25rem;
    }
  }

  @media (${v.minLaptop}) {
    justify-content: flex-end;
    > * {
      max-width: 45rem;
      max-height: 30rem;
    }
  }
`;

interface HeroProps {
  headline?: string;
  cta?: React.ReactNode;
  image?: React.ReactNode;
}

function Hero({ headline, cta, image }: HeroProps) {
  return (
    <Container>
      <div>
        <Headline>{headline}</Headline>
        <CtaContainer>{cta}</CtaContainer>
      </div>
      {image && <ImageContainer>{image}</ImageContainer>}
    </Container>
  );
}

export default Hero;
