import { Helmet } from 'react-helmet-async';
import { EdgePadding, PageTitle } from '@tuja/components';
import ActivitiesList from '../../components/ActivitiesList';
import useScrollToTopOnMount from '../../hooks/useScrollToTopOnMount';

function Activities() {
  useScrollToTopOnMount();

  return (
    <>
      <Helmet>
        <title>Activities | Tuja App</title>
      </Helmet>
      <EdgePadding>
        <PageTitle>Activities</PageTitle>
        <ActivitiesList />
      </EdgePadding>
    </>
  );
}

export default Activities;
