import React from 'react';
import useAuth from 'hooks/useAuth';
import { createPortfolio } from 'libs/portfolio';
import CreatePortfolio from 'components/CreatePortfolio';

function Create() {
  const { currentUser } = useAuth();

  return (
    <CreatePortfolio
      onCreate={(name, currency) => {
        createPortfolio(name, currency, currentUser?.uid ?? '');
      }}
    />
  );
}

export default Create;
