import styled from 'styled-components';
import EdgePadding from '../layout/EdgePadding';
import { v } from '../../theme';

const Container = styled.div`
  margin-top: ${v.spacerXL};
  padding-top: ${v.spacerXL};
  padding-bottom: ${v.spacerXL};
  background-color: ${v.backgroundRaised};
`;

const Title = styled.h2`
  font-weight: ${v.fontBold};
  margin: 0;
  font-size: 1.5rem;
  overflow: hidden;
  text-align: center;
  display: block;
  width: 100%;

  @media (${v.minTablet}) {
    font-size: 1.8rem;
  }

  @media (${v.minTablet}) {
    font-size: 2rem;
  }

  @media (${v.minDesktop}) {
    font-size: 2.1rem;
  }
`;

const BenefitsList = styled.dl`
  margin-top: ${v.spacerXL};

  @media (${v.minTablet}) {
    display: grid;
    grid-gap: ${v.spacerS};
    grid-template-columns: 1fr 1fr;
  }

  @media (${v.minLaptop}) {
    grid-gap: ${v.spacerM};
  }

  @media (${v.minDesktop}) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
`;

const BenefitItem = styled.div`
  margin-bottom: ${v.spacerL};
`;

const BenefitIcon = styled.div`
  font-size: 3rem;
  text-align: center;

  @media (${v.minTablet}) {
    text-align: left;
  }
`;

const BenefitName = styled.dt`
  color: ${v.textMain};
  font-weight: ${v.fontSemiBold};
  font-size: 1.1rem;
  margin: 0 0 ${v.spacerXS};
  text-align: center;

  @media (${v.minTablet}) {
    text-align: left;
  }
`;

const BenefitDescription = styled.dd`
  color: ${v.textSecondary};
  margin: 0 auto;
  max-width: 18rem;
  text-align: center;

  @media (${v.minTablet}) {
    text-align: left;
    max-width: none;
  }
`;

interface BenefitsProps {
  title?: string;
  benefits?: { name: string; description: string; icon?: React.ReactNode }[];
}

function Benefits({ title, benefits }: BenefitsProps) {
  return (
    <Container>
      <EdgePadding>
        {title && <Title>{title}</Title>}
        {benefits && (
          <BenefitsList>
            {benefits.map(({ name, description, icon }) => (
              <BenefitItem key={name}>
                {icon && <BenefitIcon>{icon}</BenefitIcon>}
                <BenefitName>{name}</BenefitName>
                <BenefitDescription>{description}</BenefitDescription>
              </BenefitItem>
            ))}
          </BenefitsList>
        )}
      </EdgePadding>
    </Container>
  );
}

export default Benefits;
