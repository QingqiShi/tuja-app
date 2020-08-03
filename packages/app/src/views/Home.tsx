import React from 'react';
import { Link } from 'react-router-dom';
import { Center, FullHeight } from 'commonStyledComponents';

function Home() {
  return (
    <FullHeight>
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
