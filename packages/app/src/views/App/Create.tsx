import React from 'react';
import { Helmet } from 'react-helmet-async';
import { analytics } from 'firebase/app';
import useAuth from 'hooks/useAuth';
import { createPortfolio } from 'libs/portfolio';
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
          analytics().logEvent('create_portfolio', { currency });
        }}
      />
    </>
  );
}

export default Create;
