import { useState } from 'react';
import styled from 'styled-components/macro';
import { ActivityItem, Modal, Type } from '@tuja/components';
import { Activity } from '@tuja/libs';
import ActivityDepositForm from './ActivityDepositForm';
import ActivityDividendForm from './ActivityDividendForm';
import ActivityStockDividendForm from './ActivityStockDividendForm';
import ActivityTradeForm from './ActivityTradeForm';
import { logEvent } from 'libs/analytics';
import { updatePortfolioActivities } from 'libs/portfolio';
import usePortfolio from 'hooks/usePortfolio';

const UpdateActivityContainer = styled.div`
  width: 500px;
  max-width: 100%;
  position: relative;
`;

function ActivitiesList() {
  const { portfolio } = usePortfolio();

  // const [updateIndex, setUpdateIndex] = useState(-1);
  const [updateActivityId, setUpdateActivityId] = useState('');
  const [showUpdateActivity, setShowUpdateActivity] = useState(false);

  if (!portfolio) {
    return null;
  }

  const updateActivity = portfolio.activities.find(
    (activity) => activity.id === updateActivityId
  );

  const handleUpdateActivity = async (updatedActivity: Activity) => {
    await updatePortfolioActivities(
      portfolio.id,
      portfolio.activities.map((activity, i) =>
        activity.id === updateActivityId ? updatedActivity : activity
      )
    );

    // Analytics
    logEvent('update_activity', { type: updatedActivity.type });
  };

  const handleDeleteActivity = async () => {
    await updatePortfolioActivities(
      portfolio.id,
      portfolio.activities.filter(
        (activity) => activity.id !== updateActivityId
      )
    );

    // Analytics
    logEvent('delete_activity', { type: updateActivity?.type });
  };

  return (
    <div>
      {[...portfolio.activities].reverse().map((activity, i) => (
        <ActivityItem
          key={activity.id}
          activity={activity}
          currency={portfolio.currency}
          onClick={() => {
            setUpdateActivityId(activity.id);
            setShowUpdateActivity(true);
          }}
        />
      ))}

      <Modal
        onClose={() => {
          setShowUpdateActivity(false);
          setUpdateActivityId('');
        }}
        open={showUpdateActivity}
        width={30}
      >
        {updateActivity?.type === 'Deposit' && (
          <UpdateActivityContainer>
            <Type scale="h5">Deposit</Type>
            <ActivityDepositForm
              currency={portfolio.currency}
              initialActivity={updateActivity}
              onClose={() => setShowUpdateActivity(false)}
              onSubmit={handleUpdateActivity}
              onDelete={handleDeleteActivity}
            />
          </UpdateActivityContainer>
        )}
        {updateActivity?.type === 'Dividend' && (
          <UpdateActivityContainer>
            <Type scale="h5">Cash Dividend</Type>
            <ActivityDividendForm
              currency={portfolio.currency}
              initialActivity={updateActivity}
              onClose={() => setShowUpdateActivity(false)}
              onSubmit={handleUpdateActivity}
              onDelete={handleDeleteActivity}
            />
          </UpdateActivityContainer>
        )}
        {updateActivity?.type === 'StockDividend' && (
          <UpdateActivityContainer>
            <Type scale="h5">Stock Dividend</Type>
            <ActivityStockDividendForm
              currency={portfolio.currency}
              initialActivity={updateActivity}
              onClose={() => setShowUpdateActivity(false)}
              onSubmit={handleUpdateActivity}
              onDelete={handleDeleteActivity}
            />
          </UpdateActivityContainer>
        )}
        {updateActivity?.type === 'Trade' && (
          <ActivityTradeForm
            mode={updateActivity?.cost > 0 ? 'buy' : 'sell'}
            currency={portfolio.currency}
            initialActivity={updateActivity}
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
