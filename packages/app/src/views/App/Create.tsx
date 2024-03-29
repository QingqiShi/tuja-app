import { useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useAuth from '../../hooks/useAuth';
import useScrollToTopOnMount from '../../hooks/useScrollToTopOnMount';
import { createPortfolio } from '../../libs/portfolioClient';
import { logEvent } from '../../libs/analytics';
import CreatePortfolio from '../../components/CreatePortfolio';

function Create() {
  const { currentUser } = useAuth();
  const history = useHistory();
  useScrollToTopOnMount();

  return (
    <>
      <Helmet>
        <title>Create Portfolio | Tuja App</title>
      </Helmet>
      <CreatePortfolio
        onCreate={async (name, currency) => {
          const id = await createPortfolio(
            name,
            currency,
            currentUser?.uid ?? ''
          );

          // Analytics
          logEvent('create_portfolio', { currency });

          history.push(`/tracker/portfolio/${id}`);
        }}
      />
    </>
  );
}

export default Create;
