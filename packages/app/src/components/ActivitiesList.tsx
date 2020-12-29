import { Fragment, useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import styled from 'styled-components/macro';
import { ActivityItem, Modal, Type } from '@tuja/components';
import { Activity } from '@tuja/libs';
import useLoadingState from 'hooks/useLoadingState';
import usePortfolio from 'hooks/usePortfolio';
import { logEvent } from 'libs/analytics';
import {
  deleteActivity,
  getActivities,
  updateActivity,
} from 'libs/portfolioClient';
import ActivityDepositForm from './ActivityDepositForm';
import ActivityDividendForm from './ActivityDividendForm';
import ActivityStockDividendForm from './ActivityStockDividendForm';
import ActivityTradeForm from './ActivityTradeForm';

const UpdateActivityContainer = styled.div`
  width: 500px;
  max-width: 100%;
  position: relative;
`;

const MonthTitle = styled(Type)`
  position: sticky;
  background-color: ${({ theme }) => theme.colors.backgroundMain};
  z-index: ${({ theme }) => theme.zIndex.raised};
  top: 4rem;
  @media (${({ theme }) => theme.breakpoints.minLaptop}) {
    top: 3.5rem;
  }

  padding: ${({ theme }) => `${theme.spacings.s} ${theme.spacings.xs}`};
  margin: 0 -${({ theme }) => theme.spacings.xs};
  @media (${({ theme }) => theme.breakpoints.minTablet}) {
    padding: ${({ theme }) => `${theme.spacings.s} ${theme.spacings.s}`};
    margin: 0 -${({ theme }) => theme.spacings.s};
  }
  @media (${({ theme }) => theme.breakpoints.minLaptop}) {
    padding: ${({ theme }) => `${theme.spacings.s} ${theme.spacings.m}`};
    margin: 0 -${({ theme }) => theme.spacings.m};
  }
  @media (${({ theme }) => theme.breakpoints.minDesktop}) {
    padding: ${({ theme }) => `${theme.spacings.s} ${theme.spacings.l}`};
    margin: 0 -${({ theme }) => theme.spacings.l};
  }
`;

const NoActivityBanner = styled.div`
  display: grid;
  place-items: center;
  margin: ${({ theme }) => theme.spacings.m} 0;
`;

const LoadMoreDiv = styled.div`
  height: 50px;
`;

function ActivitiesList() {
  const { portfolio } = usePortfolio();
  const [, setLoading] = useLoadingState();

  const [updateActivityId, setUpdateActivityId] = useState('');
  const [showUpdateActivity, setShowUpdateActivity] = useState(false);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const fetchActivities = useRef<
    (() => ReturnType<typeof getActivities>) | undefined
  >();

  // Make an initial load of the activities
  const [loadedOnce, setLoadedOnce] = useState(false);
  const portfolioId = portfolio?.id;
  useEffect(() => {
    (async () => {
      if (!portfolioId || loadedOnce) return;
      setLoadedOnce(true);

      setLoading(true);
      const { activities, lastDoc } = await getActivities(portfolioId);
      setActivities(activities);
      fetchActivities.current = lastDoc
        ? () => getActivities(portfolioId, lastDoc)
        : undefined;

      setHasMore(!!lastDoc);
      setLoading(false);
    })();
  }, [loadedOnce, portfolioId, setLoading]);

  // Set up intersection observer to load more activities
  const [loadMoreEl, setLoadMoreEl] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (loadMoreEl && typeof IntersectionObserver === 'function') {
      const handler = async (entries: IntersectionObserverEntry[]) => {
        const shouldLoad = !!entries[0]?.isIntersecting;
        if (!shouldLoad || !portfolioId || !fetchActivities.current) return;

        setLoading(true);
        const { activities, lastDoc } = await fetchActivities.current();
        setActivities((current) => [...current, ...activities]);
        fetchActivities.current = () => getActivities(portfolioId, lastDoc);
        setHasMore(!!lastDoc);
        setLoading(false);
      };

      const observer = new IntersectionObserver(handler, {
        rootMargin: '0px 0px 500px 0px',
      });
      observer.observe(loadMoreEl);

      return () => {
        observer.disconnect();
      };
    }
  }, [loadMoreEl, portfolioId, setLoading]);

  if (!portfolio) {
    return null;
  }

  const activityBeingUpdated = activities.find(
    (activity) => activity.id === updateActivityId
  );

  const resetActivities = () => {
    setLoadedOnce(false);
  };

  const handleUpdateActivity = async (updatedActivity: Activity) => {
    await updateActivity(portfolio.id, updatedActivity);
    resetActivities();
    // Analytics
    logEvent('update_activity', { type: updatedActivity.type });
  };

  const handleDeleteActivity = async () => {
    await deleteActivity(portfolio.id, updateActivityId);
    resetActivities();
    // Analytics
    logEvent('delete_activity', { type: activityBeingUpdated?.type });
  };

  const monthTitles = new Set();

  if (!activities.length) {
    return (
      <NoActivityBanner>
        <Type scale="body1">Create activities from the Portfolio page.</Type>
      </NoActivityBanner>
    );
  }

  return (
    <div>
      {activities.map((activity) => {
        const monthTitle = dayjs(activity.date).format('MMMM YYYY');
        const shouldShowTitle = !monthTitles.has(monthTitle);
        monthTitles.add(monthTitle);
        return (
          <Fragment key={activity.id}>
            {shouldShowTitle && (
              <MonthTitle scale="h6">{monthTitle}</MonthTitle>
            )}
            <ActivityItem
              activity={activity}
              currency={portfolio.currency}
              onClick={() => {
                if (activity.id) {
                  setUpdateActivityId(activity.id);
                  setShowUpdateActivity(true);
                }
              }}
            />
          </Fragment>
        );
      })}
      {hasMore && <LoadMoreDiv ref={setLoadMoreEl} />}

      <Modal
        onClose={() => {
          setShowUpdateActivity(false);
          setUpdateActivityId('');
        }}
        open={showUpdateActivity}
        width={30}
      >
        {activityBeingUpdated?.type === 'Deposit' && (
          <UpdateActivityContainer>
            <Type scale="h5">Deposit</Type>
            <ActivityDepositForm
              currency={portfolio.currency}
              initialActivity={activityBeingUpdated}
              onClose={() => setShowUpdateActivity(false)}
              onSubmit={handleUpdateActivity}
              onDelete={handleDeleteActivity}
            />
          </UpdateActivityContainer>
        )}
        {activityBeingUpdated?.type === 'Dividend' && (
          <UpdateActivityContainer>
            <Type scale="h5">Cash Dividend</Type>
            <ActivityDividendForm
              currency={portfolio.currency}
              initialActivity={activityBeingUpdated}
              onClose={() => setShowUpdateActivity(false)}
              onSubmit={handleUpdateActivity}
              onDelete={handleDeleteActivity}
            />
          </UpdateActivityContainer>
        )}
        {activityBeingUpdated?.type === 'StockDividend' && (
          <UpdateActivityContainer>
            <Type scale="h5">Stock Dividend</Type>
            <ActivityStockDividendForm
              currency={portfolio.currency}
              initialActivity={activityBeingUpdated}
              onClose={() => setShowUpdateActivity(false)}
              onSubmit={handleUpdateActivity}
              onDelete={handleDeleteActivity}
            />
          </UpdateActivityContainer>
        )}
        {activityBeingUpdated?.type === 'Trade' && (
          <ActivityTradeForm
            mode={activityBeingUpdated?.cost > 0 ? 'buy' : 'sell'}
            currency={portfolio.currency}
            initialActivity={activityBeingUpdated}
            onClose={() => setShowUpdateActivity(false)}
            onSubmit={handleUpdateActivity}
            onDelete={handleDeleteActivity}
          />
        )}
      </Modal>
    </div>
  );
}

export default ActivitiesList;
