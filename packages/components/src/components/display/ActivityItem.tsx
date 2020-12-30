import styled from 'styled-components';
import dayjs from 'dayjs';
import { transparentize } from 'polished';
import { Activity, activityLabels, formatCurrency } from '@tuja/libs';
import Type from './Type';
import { card } from '../../mixins';

const Container = styled.div`
  ${card}
  padding: ${({ theme }) => theme.spacings.s};
  margin-bottom: ${({ theme }) => theme.spacings.s};
  cursor: pointer;
`;

const Summary = styled.div`
  display: flex;
  > :first-child {
    flex-grow: 1;
    margin-right: ${({ theme }) => theme.spacings.s};
  }
`;

const ActivityDate = styled(Type)`
  opacity: 0.5;
`;

const ActivityAmount = styled(Type)`
  display: flex;
  align-items: center;
`;

const TickersList = styled.div`
  display: grid;
  margin-top: ${({ theme }) => theme.spacings.xs};
  padding-top: ${({ theme }) => theme.spacings.xs};
  border-top: 1px solid
    ${({ theme }) => transparentize(0.9, theme.colors.textOnBackground)};
`;

const TickerItem = styled(Type).attrs({ as: 'span' })`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

interface ActivityItemProps {
  activity: Activity;
  currency: string;
  getStockName?: (ticker: string) => string;
  onClick?: () => void;
}

function ActivityItem({
  activity,
  currency,
  getStockName,
  onClick,
}: ActivityItemProps) {
  return (
    <Container onClick={onClick}>
      <Summary>
        <div>
          <Type scale="body1" noMargin>
            {activityLabels(activity)}
          </Type>
          <ActivityDate scale="body2" noMargin>
            {dayjs(activity.date).format('YYYY-MM-DD')}
          </ActivityDate>
        </div>
        {activity.type === 'Deposit' && (
          <ActivityAmount scale="h6" noMargin>
            {activity.amount > 0 && '+'}
            {formatCurrency(currency, activity.amount)}
          </ActivityAmount>
        )}
        {activity.type === 'Dividend' && (
          <ActivityAmount scale="h6" noMargin>
            {formatCurrency(currency, activity.amount)}
          </ActivityAmount>
        )}
        {activity.type === 'StockDividend' && (
          <ActivityAmount scale="h6" noMargin>
            {activity.units} Share{activity.units !== 1 && 's'}
          </ActivityAmount>
        )}
        {activity.type === 'Trade' && (
          <ActivityAmount scale="h6" noMargin>
            {formatCurrency(
              currency,
              activity.cost >= 0 ? activity.cost : activity.cost * -1
            )}
          </ActivityAmount>
        )}
      </Summary>
      {activity.type !== 'Deposit' && (
        <TickersList>
          {(activity.type === 'Dividend' ||
            activity.type === 'StockDividend') && (
            <TickerItem scale="body2" noMargin>
              {activity.ticker.split('.')[0]}
              {getStockName && ` · ${getStockName(activity.ticker)}`}
            </TickerItem>
          )}
          {activity.type === 'Trade' &&
            activity.trades.map((trade, i) => (
              <TickerItem key={`${activity.id}-${i}`} scale="body2" noMargin>
                <Summary>
                  <TickerItem scale="body2" noMargin>
                    {trade.ticker.split('.')[0]}
                    {getStockName && ` · ${getStockName(trade.ticker)}`}
                  </TickerItem>
                  <div>
                    {trade.units >= 0 ? '+' : ''}
                    {trade.units}
                  </div>
                </Summary>
              </TickerItem>
            ))}
        </TickersList>
      )}
    </Container>
  );
}

export default ActivityItem;
