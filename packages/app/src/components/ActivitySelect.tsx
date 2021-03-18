import { useState } from 'react';
import styled from 'styled-components';
import { ButtonBase, Modal, Type, v } from '@tuja/components';
import { Activity } from '@tuja/libs';
import ActivityTradeForm from './ActivityTradeForm';
import ActivityDepositForm from './ActivityDepositForm';
import ActivityDividendForm from './ActivityDividendForm';
import ActivityStockDividendForm from './ActivityStockDividendForm';
import SetBenchmarkForm from './SetBenchmarkForm';
import usePortfolio from '../hooks/usePortfolio';
import { addActivity, updatePortfolioBenchmark } from '../libs/portfolioClient';
import { logEvent } from '../libs/analytics';

const Container = styled.div`
  width: 500px;
  max-width: 100%;
  display: flex;
  flex-direction: column;
`;

const ModalContainer = styled.div`
  width: 500px;
  max-width: 100%;
  text-align: center;
  position: relative;
`;

const ActivityTrigger = styled(ButtonBase)`
  ${Container} & {
    padding: ${v.spacerM};
    border-radius: ${v.radiusMedia};
    background: linear-gradient(135deg, ${v.accentMain}, ${v.accentHover});
    color: ${v.textOnAccent};
    box-shadow: ${v.shadowRaised};
    width: 100%;
    transition: transform 0.2s, background 0.2s, box-shadow 0.2s;

    &:hover {
      background-color: ${v.accentHover};
      box-shadow: ${v.shadowOverlay};
      transform: translateY(-0.1rem);
    }

    &:active {
      box-shadow: ${v.shadowRaised};
    }

    &:not(:last-child) {
      margin-bottom: ${v.spacerXS};
    }
  }
`;

interface ActivitySelectProps {
  showAddActivities: boolean;
  setShowAddActivities: (newVal: boolean) => void;
}

function ActivitySelect({
  showAddActivities,
  setShowAddActivities,
}: ActivitySelectProps) {
  const { portfolio } = usePortfolio();

  // Activity modals
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showDividendModal, setShowDividendModal] = useState(false);
  const [showStockDividendModal, setShowStockDividendModal] = useState(false);
  const [showBenchmarkModal, setShowBenchmarkModal] = useState(false);

  if (!portfolio) {
    return (
      <div>
        <Type scale="h4">You need to first create a portfolio!</Type>
      </div>
    );
  }

  const handleSubmit = async (activity: Activity) => {
    if (portfolio?.id) {
      addActivity(portfolio?.id, activity);

      // Analytics
      logEvent('create_activity', { type: activity.type });
    }
  };

  return (
    <>
      <Modal
        onClose={() => {
          setShowAddActivities(false);
          setShowBuyModal(false);
          setShowDepositModal(false);
          setShowSellModal(false);
          setShowDividendModal(false);
          setShowStockDividendModal(false);
          setShowBenchmarkModal(false);
        }}
        open={showAddActivities}
      >
        {!showBuyModal &&
          !showDepositModal &&
          !showSellModal &&
          !showDividendModal &&
          !showStockDividendModal &&
          !showBenchmarkModal && (
            <Container>
              <Type scale="h5">Create Activity</Type>
              {!!portfolio.activitiesStartDate && (
                <ActivityTrigger onClick={() => setShowBuyModal(true)}>
                  Buy
                </ActivityTrigger>
              )}
              <ActivityTrigger onClick={() => setShowDepositModal(true)}>
                Deposit
              </ActivityTrigger>
              {!!portfolio.activitiesStartDate && portfolio.costBasis && (
                <>
                  <ActivityTrigger onClick={() => setShowSellModal(true)}>
                    Sell
                  </ActivityTrigger>
                  <ActivityTrigger onClick={() => setShowDividendModal(true)}>
                    Cash Dividend
                  </ActivityTrigger>
                  <ActivityTrigger
                    onClick={() => setShowStockDividendModal(true)}
                  >
                    Stock Dividend
                  </ActivityTrigger>
                  <ActivityTrigger onClick={() => setShowBenchmarkModal(true)}>
                    Configure Benchmark
                  </ActivityTrigger>
                </>
              )}
            </Container>
          )}
        {showBuyModal && (
          <Container>
            <ActivityTradeForm
              mode="buy"
              currency={portfolio.currency}
              onClose={() => {
                setShowBuyModal(false);
                setShowAddActivities(false);
              }}
              onSubmit={handleSubmit}
            />
          </Container>
        )}
        {showDepositModal && (
          <ModalContainer>
            <Type scale="h5">Deposit</Type>
            <ActivityDepositForm
              currency={portfolio.currency}
              onClose={() => {
                setShowDepositModal(false);
                setShowAddActivities(false);
              }}
              onSubmit={handleSubmit}
            />
          </ModalContainer>
        )}
        {showSellModal && (
          <Container>
            <ActivityTradeForm
              mode="sell"
              currency={portfolio.currency}
              onClose={() => {
                setShowSellModal(false);
                setShowAddActivities(false);
              }}
              onSubmit={handleSubmit}
            />
          </Container>
        )}
        {showDividendModal && (
          <ModalContainer>
            <Type scale="h5">Cash Dividend</Type>
            <ActivityDividendForm
              currency={portfolio.currency}
              onClose={() => {
                setShowDividendModal(false);
                setShowAddActivities(false);
              }}
              onSubmit={handleSubmit}
            />
          </ModalContainer>
        )}
        {showStockDividendModal && (
          <ModalContainer>
            <Type scale="h5">Stock Dividend</Type>
            <ActivityStockDividendForm
              currency={portfolio.currency}
              onClose={() => {
                setShowStockDividendModal(false);
                setShowAddActivities(false);
              }}
              onSubmit={handleSubmit}
            />
          </ModalContainer>
        )}
        {showBenchmarkModal && (
          <ModalContainer>
            <Type scale="h5">Portfolio Benchmark</Type>
            <SetBenchmarkForm
              defaultBenchmark={portfolio.benchmark}
              onClose={() => {
                setShowBenchmarkModal(false);
                setShowAddActivities(false);
              }}
              onSubmit={(benchmark) =>
                updatePortfolioBenchmark(portfolio.id, benchmark)
              }
              onDelete={() => updatePortfolioBenchmark(portfolio.id, '')}
            />
          </ModalContainer>
        )}
      </Modal>
    </>
  );
}

export default ActivitySelect;
