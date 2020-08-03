import React from 'react';
import styled from 'styled-components/macro';
import HistoricDataUploader from 'adminWidgets/HistoricDataUploader';
import TickerChecker from 'adminWidgets/TickerChecker';
import { Center } from 'commonStyledComponents';
import { theme } from 'theme';

const Container = styled(Center)`
  padding: ${theme.spacings('s')};
  width: 100%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(600px, 100%), 1fr));
  grid-gap: ${theme.spacings('s')};
  justify-content: center;
  justify-items: stretch;
  place-items: stretch;
`;

function Home() {
  return (
    <Container>
      <TickerChecker />
      <HistoricDataUploader />
    </Container>
  );
}

export default Home;
