import React, { useState } from 'react';
import styled from 'styled-components/macro';
import Button from './Button';
import ActivityDepositForm from './ActivityDepositForm';
import ActivityTradeForm from './ActivityTradeForm';
import ActivityDividendForm from './ActivityDividendForm';
import { Activity, addPortfolioActivity } from 'libs/portfolio';
import { logEvent } from 'libs/analytics';
import usePortfolio from 'hooks/usePortfolio';
import { theme } from 'theme';

const Container = styled.div`
  width: 500px;
  max-width: 100%;
  text-align: center;
  position: relative;
`;

const TabContainer = styled.div`
  margin: 0 auto ${theme.spacings('m')};
  white-space: nowrap;
  overflow: auto;
`;

export interface ActivityFormProps {
  currency: string;
  initialActivity?: Activity;
  onClose?: () => void;
  onSubmit?: (activity: Activity) => Promise<void>;
  onDelete?: () => void;
}

type FormType = 'Buy' | 'Sell' | 'Deposit' | 'Dividend';

interface ActivityFormsProps {
  onClose?: () => void;
}

function ActivityForms({ onClose }: ActivityFormsProps) {
  const { portfolio } = usePortfolio();
  const currency = portfolio?.currency ?? 'GBP';

  const [type, setType] = useState<FormType>('Buy');

  const handleSubmit = async (activity: Activity) => {
    if (portfolio?.id) {
      addPortfolioActivity(portfolio?.id, activity);

      // Analytics
      logEvent('create_activity', { type: activity.type });
    }
  };

  return (
    <Container>
      <TabContainer>
        <Button
          disabled={type === 'Buy'}
          onClick={() => setType('Buy')}
          variant="primary"
        >
          Buy
        </Button>
        <Button
          disabled={type === 'Sell'}
          onClick={() => setType('Sell')}
          variant="primary"
        >
          Sell
        </Button>
        <Button
          disabled={type === 'Deposit'}
          onClick={() => setType('Deposit')}
          variant="primary"
        >
          Deposit
        </Button>
        <Button
          disabled={type === 'Dividend'}
          onClick={() => setType('Dividend')}
          variant="primary"
        >
          Dividend
        </Button>
      </TabContainer>

      {type === 'Buy' && (
        <ActivityTradeForm
          mode="buy"
          currency={currency}
          onClose={onClose}
          onSubmit={handleSubmit}
        />
      )}
      {type === 'Sell' && (
        <ActivityTradeForm
          mode="sell"
          currency={currency}
          onClose={onClose}
          onSubmit={handleSubmit}
        />
      )}
      {type === 'Deposit' && (
        <ActivityDepositForm
          currency={currency}
          onClose={onClose}
          onSubmit={handleSubmit}
        />
      )}
      {type === 'Dividend' && (
        <ActivityDividendForm
          currency={currency}
          onClose={onClose}
          onSubmit={handleSubmit}
        />
      )}
    </Container>
  );
}

export default ActivityForms;
