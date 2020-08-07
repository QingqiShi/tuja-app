import React from 'react';
import { Helmet } from 'react-helmet-async';
import useAuth from 'hooks/useAuth';
import { createPortfolio } from 'libs/portfolio';
import { logEvent } from 'libs/analytics';
import CreatePortfolio from 'components/CreatePortfolio';

function Create() {
  const { currentUser } = useAuth();

  return (
    <>
      <Helmet>
        <title>Create Portfolio | Tuja App</title>
      </Helmet>
      <CreatePortfolio
        onCreate={(name, currency) => {
          createPortfolio(name, currency, currentUser?.uid ?? '');

          // Analytics
          logEvent('create_portfolio', { currency });
        }}
      />
    </>
  );
}

export default Create;
