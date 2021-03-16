import { Helmet } from 'react-helmet-async';
import { Type } from '@tuja/components';
import ActivitiesList from 'components/ActivitiesList';
import { TitleRow } from 'commonStyledComponents';
import useScrollToTopOnMount from 'hooks/useScrollToTopOnMount';

function Activities() {
  useScrollToTopOnMount();

  return (
    <>
      <Helmet>
        <title>Activities | Tuja App</title>
      </Helmet>
      <TitleRow>
        <Type scale="h3">Activities</Type>
      </TitleRow>
      <ActivitiesList />
    </>
  );
}

export default Activities;
