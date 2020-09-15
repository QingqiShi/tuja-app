import React from 'react';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components/macro';
import HistoricDataUploader from 'adminWidgets/HistoricDataUploader';
import TickerChecker from 'adminWidgets/TickerChecker';
import Button from 'components/Button';
import usePortfolio from 'hooks/usePortfolio';
import { migratePortfolio } from 'libs/portfolio';
import { Center, Card } from 'commonStyledComponents';
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

function Admin() {
  const { portfolio } = usePortfolio();
  return (
    <Container>
      <Helmet>
        <title>Admin | Tuja App</title>
      </Helmet>
      <TickerChecker />
      <HistoricDataUploader />
      {portfolio && (
        <Card>
          <Button
            onClick={() => migratePortfolio(portfolio.id)}
            variant="shout"
          >
            Migrate
          </Button>
        </Card>
      )}
    </Container>
  );
}

export default Admin;
