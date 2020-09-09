import React, { useState } from 'react';
import styled from 'styled-components/macro';
import { transparentize } from 'polished';
import dayjs from 'dayjs';
import Backdrop from './Backdrop';
import Type from './Type';
import ActivityDepositForm from './ActivityDepositForm';
import ActivityDividendForm from './ActivityDividendForm';
import ActivityStockDividendForm from './ActivityStockDividendForm';
import ActivityTradeForm from './ActivityTradeForm';
import { Card } from 'commonStyledComponents';
import { formatCurrency } from 'libs/stocksClient';
import { logEvent } from 'libs/analytics';
import { updatePortfolioActivities } from 'libs/portfolio';
import { Activity } from 'libs/activities';
import usePortfolio from 'hooks/usePortfolio';
import useBodyScrollLock from 'hooks/useBodyScrollLock';
import { theme, getTheme } from 'theme';

const ActivityCard = styled(Card)`
  display: flex;
  flex-direction: row;
  cursor: pointer;
  margin-bottom: ${theme.spacings('s')};

  > :first-child {
    flex-grow: 1;
  }

  > :last-child {
    text-align: right;
  }

  > :not(:last-child) {
    margin-right: ${theme.spacings('s')};
  }
`;

const HistoryLabel = styled.div`
  font-size: ${theme.fonts.labelSize};
  font-weight: ${theme.fonts.labelWeight};
  line-height: ${theme.fonts.labelHeight};
  color: ${getTheme(theme.colors.textOnBackground, (c) =>
    transparentize(0.5, c)
  )};
`;

const HistoryValue = styled.div`
  font-size: ${theme.fonts.ctaSize};
  line-height: ${theme.fonts.ctaHeight};
  font-weight: 500;
`;

const UpdateActivityContainer = styled.div`
  width: 500px;
  max-width: 100%;
  position: relative;
`;

function ActivitiesList() {
  const { portfolio } = usePortfolio();

  const [updateIndex, setUpdateIndex] = useState(0);
  const [showUpdateActivity, setShowUpdateActivity] = useState(false);
  const updateActivityRef = useBodyScrollLock(showUpdateActivity);

  if (!portfolio) {
    return null;
  }

  const updateActivity = portfolio.activities[updateIndex];

  const handleUpdateActivity = async (updatedActivity: Activity) => {
    await updatePortfolioActivities(
      portfolio.id,
      portfolio.activities.map((activity, i) =>
        i === updateIndex ? updatedActivity : activity
      )
    );

    // Analytics
    logEvent('update_activity', { type: updatedActivity.type });
  };

  const handleDeleteActivity = async () => {
    const deletedActivity = portfolio.activities[updateIndex];
    await updatePortfolioActivities(
      portfolio.id,
      portfolio.activities.filter((_, i) => i !== updateIndex)
    );

    // Analytics
    logEvent('delete_activity', { type: deletedActivity?.type });
  };

  return (
    <div>
      {[...portfolio.activities].reverse().map((activity, reversedI) => {
        const i = portfolio.activities.length - reversedI - 1;
        if (activity.type === 'Deposit') {
          return (
            <ActivityCard
              key={`activity-${i}`}
              onClick={() => {
                setUpdateIndex(i);
                setShowUpdateActivity(true);
              }}
            >
              <div>
                <HistoryLabel>
                  {dayjs(activity.date).format('YYYY-MM-DD')}
                </HistoryLabel>
                <HistoryValue>Deposit</HistoryValue>
              </div>
              <div>
                <HistoryLabel>Amount</HistoryLabel>
                <HistoryValue>
                  {formatCurrency(portfolio.currency, activity.amount)}
                </HistoryValue>
              </div>
            </ActivityCard>
          );
        }

        if (activity.type === 'Dividend') {
          return (
            <ActivityCard
              key={`activity-${i}`}
              onClick={() => {
                setUpdateIndex(i);
                setShowUpdateActivity(true);
              }}
            >
              <div>
                <HistoryLabel>
                  {dayjs(activity.date).format('YYYY-MM-DD')}
                </HistoryLabel>
                <HistoryValue>Cash Dividend</HistoryValue>
              </div>
              <div>
                <HistoryLabel>From</HistoryLabel>
                <HistoryValue>{activity.ticker}</HistoryValue>
              </div>
              <div>
                <HistoryLabel>Amount</HistoryLabel>
                <HistoryValue>
                  {formatCurrency(portfolio.currency, activity.amount)}
                </HistoryValue>
              </div>
            </ActivityCard>
          );
        }

        if (activity.type === 'StockDividend') {
          return (
            <ActivityCard
              key={`activity-${i}`}
              onClick={() => {
                setUpdateIndex(i);
                setShowUpdateActivity(true);
              }}
            >
              <div>
                <HistoryLabel>
                  {dayjs(activity.date).format('YYYY-MM-DD')}
                </HistoryLabel>
                <HistoryValue>Stock Dividend</HistoryValue>
              </div>
              <div>
                <HistoryLabel>From</HistoryLabel>
                <HistoryValue>{activity.ticker}</HistoryValue>
              </div>
              <div>
                <HistoryLabel>Units</HistoryLabel>
                <HistoryValue>{activity.units}</HistoryValue>
              </div>
            </ActivityCard>
          );
        }

        return activity.trades.map((trade) => (
          <ActivityCard
            key={`activity-${i}-${trade.ticker}`}
            onClick={() => {
              setUpdateIndex(i);
              setShowUpdateActivity(true);
            }}
          >
            <div>
              <HistoryLabel>
                {dayjs(activity.date).format('YYYY-MM-DD')}
              </HistoryLabel>
              <HistoryValue>{trade.units > 0 ? 'Buy' : 'Sell'}</HistoryValue>
            </div>
            <div>
              <HistoryLabel>Investment</HistoryLabel>
              <HistoryValue>{trade.ticker}</HistoryValue>
            </div>
            <div>
              <HistoryLabel>Units</HistoryLabel>
              <HistoryValue>
                {trade.units > 0 ? '+' : ''}
                {trade.units}
              </HistoryValue>
            </div>
          </ActivityCard>
        ));
      })}

      {showUpdateActivity && (
        <Backdrop onClick={() => setShowUpdateActivity(false)}>
          <Card ref={updateActivityRef}>
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
              <UpdateActivityContainer>
                <Type scale="h5">
                  {updateActivity?.cost > 0 ? 'Buy' : 'Sell'}
                </Type>
                <ActivityTradeForm
                  mode={updateActivity?.cost > 0 ? 'buy' : 'sell'}
                  currency={portfolio.currency}
                  initialActivity={updateActivity}
                  onClose={() => setShowUpdateActivity(false)}
                  onSubmit={handleUpdateActivity}
                  onDelete={handleDeleteActivity}
                />
              </UpdateActivityContainer>
            )}
          </Card>
        </Backdrop>
      )}
    </div>
  );
}

export default ActivitiesList;
