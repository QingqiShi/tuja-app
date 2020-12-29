import { Helmet } from 'react-helmet-async';
import styled from 'styled-components/macro';
import { Type } from '@tuja/components';
import ActivitiesList from 'components/ActivitiesList';
import { TitleRow } from 'commonStyledComponents';
import useScrollToTopOnMount from 'hooks/useScrollToTopOnMount';
import { theme } from 'theme';

const Container = styled.div`
  margin-bottom: env(safe-area-inset-bottom);
  padding: ${theme.spacings('s')} ${theme.spacings('xs')};

  @media (${theme.breakpoints.minTablet}) {
    padding: ${theme.spacings('s')};
  }

  @media (${theme.breakpoints.minLaptop}) {
    padding: ${theme.spacings('m')};
  }

  @media (${theme.breakpoints.minDesktop}) {
    padding: ${theme.spacings('l')};
    max-width: 1920px;
    margin-left: auto;
    margin-right: auto;
  }
`;

function Activities() {
  useScrollToTopOnMount();

  return (
    <Container>
      <Helmet>
        <title>Activities | Tuja App</title>
      </Helmet>
      <TitleRow>
        <Type scale="h3">Activities</Type>
      </TitleRow>
      <ActivitiesList />
    </Container>
  );
}

export default Activities;
