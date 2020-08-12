import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Center, FullHeight } from 'commonStyledComponents';

function Home() {
  return (
    <FullHeight>
      <Helmet>
        <title>Tuja App | Portfolio Tracker</title>
      </Helmet>
      <Center>
        <div>
          <p>
            Actually there isn't a home page... sorry{' '}
            <span role="img" aria-label="shrug">
              🤷‍♂
            </span>
          </p>
          <div>
            <Link to="/dashboard">Go To App</Link>
          </div>
        </div>
      </Center>
    </FullHeight>
  );
}

export default Home;
