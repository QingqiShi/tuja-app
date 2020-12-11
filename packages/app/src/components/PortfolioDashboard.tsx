import { useState, useMemo } from 'react';
import { RiMoreLine, RiSubtractLine } from 'react-icons/ri';
import styled from 'styled-components/macro';
import dayjs from 'dayjs';
import { Button, ButtonGroup, Chart, Modal, Type } from '@tuja/components';
import { formatCurrency } from '@tuja/forex';
import DashboardLayout from 'components/DashboardLayout';
import PortfolioOverview from 'components/PortfolioOverview';
import PortfolioPieCard from 'components/PortfolioPieCard';
import InvestmentsList from 'components/InvestmentsList';
import ActivityTradeForm from 'components/ActivityTradeForm';
import ActivityDepositForm from 'components/ActivityDepositForm';
import ActivityDividendForm from 'components/ActivityDividendForm';
import ActivityStockDividendForm from 'components/ActivityStockDividendForm';
import AutoInvest from 'components/AutoInvest';
import { Card, CardMedia } from 'commonStyledComponents';
import usePortfolio from 'hooks/usePortfolio';
import usePortfolioProcessor from 'hooks/usePortfolioProcessor';
import useStartDate from 'hooks/useStartDate';
import { addPortfolioActivity } from 'libs/portfolio';
import { Activity } from 'libs/activities';
import { logEvent } from 'libs/analytics';
import { theme } from 'theme';

const DatePeriodContainer = styled.div`
  margin-bottom: ${theme.spacings('s')};
  text-align: right;
`;

const ActionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  position: sticky;
  top: 100px;
  margin: ${theme.spacings('s')} 0;

  > button {
    margin-bottom: ${theme.spacings('xs')};
    flex-grow: 1;
    margin-right: ${theme.spacings('xs')};
  }

  > button:last-child:not(:first-child) {
    flex-grow: 0;
  }

  > button:last-child {
    margin-right: 0;
  }
`;

const WideAction = styled.div`
  width: 100%;

  > * {
    width: 100%;
  }
`;

const ChartActionsContainer = styled.div`
  text-align: right;
  margin-bottom: ${theme.spacings('xs')};
`;

const ChartCard = styled(Card)`
  height: 25rem;
  max-height: 80vh;
  margin-bottom: ${theme.spacings('s')};
`;

const ModalContainer = styled.div`
  width: 500px;
  max-width: 100%;
  text-align: center;
  position: relative;
`;

const currentDate = dayjs(dayjs().format('YYYY-MM-DD'));

const defaultPeriods = [
  { label: '1W', value: currentDate.subtract(7, 'day') },
  { label: '1M', value: currentDate.subtract(1, 'month') },
  { label: '3M', value: currentDate.subtract(3, 'month') },
  { label: '6M', value: currentDate.subtract(6, 'month') },
  { label: '1Y', value: currentDate.subtract(1, 'year') },
  { label: '5Y', value: currentDate.subtract(5, 'year') },
];

const charts = [
  { label: 'Value', value: 'value' },
  { label: 'Gains', value: 'gains' },
  { label: 'Returns', value: 'returns' },
];

interface PortfolioDashboardProps {
  isDemo?: boolean;
  onSignIn?: () => void;
}

function PortfolioDashboard({ isDemo, onSignIn }: PortfolioDashboardProps) {
  // Context data
  const [startDate, setStartDate] = useStartDate();
  const { portfolio } = usePortfolio();
  const { portfolioPerformance } = usePortfolioProcessor();

  // Chart type selection
  const [selectedChart, setSelectedChart] = useState('value');

  // Date range selection
  const activitiesStartDate = useMemo(
    () => dayjs(portfolio?.activities[0]?.date),
    [portfolio]
  );

  const periodButtons = [
    ...defaultPeriods.filter(({ value }) =>
      value.isAfter(portfolio?.activities[0]?.date ?? currentDate)
    ),
    { label: 'All', value: activitiesStartDate },
  ];

  const selectedPeriod =
    (startDate &&
      periodButtons.find((button) => button.value.isSame(startDate, 'date'))
        ?.value) ??
    (periodButtons[2]
      ? periodButtons[2].value
      : periodButtons[periodButtons.length - 1].value);

  // Activity modals
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showDividendModal, setShowDividendModal] = useState(false);
  const [showStockDividendModal, setShowStockDividendModal] = useState(false);

  const handleSubmit = async (activity: Activity) => {
    if (portfolio?.id) {
      addPortfolioActivity(portfolio?.id, activity);

      // Analytics
      logEvent('create_activity', { type: activity.type });
    }
  };

  // Show more actions
  const [showMoreActions, setShowMoreActions] = useState(false);

  if (!portfolio) {
    return null;
  }

  return (
    <>
      <DashboardLayout
        top={
          <>
            <PortfolioOverview isDemo={isDemo} />
            <DatePeriodContainer>
              <ButtonGroup
                buttons={periodButtons}
                value={selectedPeriod}
                onChange={(period) => {
                  if (startDate && !period.isSame(startDate, 'date')) {
                    setStartDate(period.toDate());
                  }
                }}
              />
            </DatePeriodContainer>
          </>
        }
        side={
          <>
            <PortfolioPieCard />
            {!isDemo && (
              <ActionsContainer>
                {portfolio.activities.length > 0 && (
                  <Button variant="shout" onClick={() => setShowBuyModal(true)}>
                    Buy
                  </Button>
                )}
                <Button
                  variant={
                    portfolio.activities.length > 0 ? 'outline' : 'shout'
                  }
                  onClick={() => setShowDepositModal(true)}
                >
                  Deposit
                </Button>
                {portfolio.activities.length > 1 && (
                  <Button
                    variant="primary"
                    onClick={() => setShowMoreActions((val) => !val)}
                    icon={showMoreActions ? <RiSubtractLine /> : <RiMoreLine />}
                  />
                )}
                {showMoreActions && portfolio.activities.length > 1 && (
                  <>
                    <WideAction>
                      <Button
                        variant="primary"
                        onClick={() => setShowSellModal(true)}
                      >
                        Sell
                      </Button>
                    </WideAction>
                    <WideAction>
                      <Button
                        variant="primary"
                        onClick={() => setShowDividendModal(true)}
                      >
                        Cash Dividend
                      </Button>
                    </WideAction>
                    <WideAction>
                      <Button
                        variant="primary"
                        onClick={() => setShowStockDividendModal(true)}
                      >
                        Stock Dividend
                      </Button>
                    </WideAction>
                  </>
                )}
              </ActionsContainer>
            )}
            {isDemo && onSignIn && (
              <ActionsContainer>
                <Button variant="shout" onClick={onSignIn}>
                  Make Your Own
                </Button>
              </ActionsContainer>
            )}
          </>
        }
        main={
          <div>
            <ChartCard>
              <ChartActionsContainer>
                <ButtonGroup
                  buttons={charts}
                  value={selectedChart}
                  onChange={setSelectedChart}
                />
              </ChartActionsContainer>
              <CardMedia>
                {selectedChart === 'value' && (
                  <Chart
                    data={portfolioPerformance?.valueSeries.data ?? []}
                    benchmark={portfolioPerformance?.cashFlowSeries.data ?? []}
                    formatValue={(val) =>
                      formatCurrency(portfolio.currency, val)
                    }
                    benchmarkLabel="Cost"
                    hideAxis
                  />
                )}
                {selectedChart === 'gains' && (
                  <Chart
                    data={portfolioPerformance?.gainSeries.data ?? []}
                    formatValue={(val) =>
                      formatCurrency(portfolio.currency, val)
                    }
                    hideAxis
                  />
                )}
                {selectedChart === 'returns' && (
                  <Chart
                    data={portfolioPerformance?.twrrSeries.data ?? []}
                    formatValue={(val) => `${(val * 100).toFixed(1)}%`}
                    benchmark={portfolioPerformance?.benchmarkSeries?.data}
                    benchmarkLabel={portfolio.benchmark}
                    hideAxis
                  />
                )}
              </CardMedia>
            </ChartCard>
            {portfolioPerformance && (
              <InvestmentsList portfolioPerformance={portfolioPerformance} />
            )}
            {portfolioPerformance &&
              !!Object.keys(portfolio.targetAllocations ?? {}).length && (
                <Card>
                  <Type scale="h5">Auto Invest</Type>
                  <AutoInvest portfolioPerformance={portfolioPerformance} />
                </Card>
              )}
          </div>
        }
      />
      {showBuyModal && (
        <Modal onClose={() => setShowBuyModal(false)}>
          <ModalContainer>
            <Type scale="h5">Buy</Type>
            <ActivityTradeForm
              mode="buy"
              currency={portfolio.currency}
              onClose={() => setShowBuyModal(false)}
              onSubmit={handleSubmit}
            />
          </ModalContainer>
        </Modal>
      )}
      {showDepositModal && (
        <Modal onClose={() => setShowDepositModal(false)}>
          <ModalContainer>
            <Type scale="h5">Deposit</Type>
            <ActivityDepositForm
              currency={portfolio.currency}
              onClose={() => setShowDepositModal(false)}
              onSubmit={handleSubmit}
            />
          </ModalContainer>
        </Modal>
      )}
      {showSellModal && (
        <Modal onClose={() => setShowSellModal(false)}>
          <ModalContainer>
            <Type scale="h5">Sell</Type>
            <ActivityTradeForm
              mode="sell"
              currency={portfolio.currency}
              onClose={() => setShowSellModal(false)}
              onSubmit={handleSubmit}
            />
          </ModalContainer>
        </Modal>
      )}
      {showDividendModal && (
        <Modal onClose={() => setShowDividendModal(false)}>
          <ModalContainer>
            <Type scale="h5">Cash Dividend</Type>
            <ActivityDividendForm
              currency={portfolio.currency}
              onClose={() => setShowDividendModal(false)}
              onSubmit={handleSubmit}
            />
          </ModalContainer>
        </Modal>
      )}
      {showStockDividendModal && (
        <Modal onClose={() => setShowStockDividendModal(false)}>
          <ModalContainer>
            <Type scale="h5">Stock Dividend</Type>
            <ActivityStockDividendForm
              currency={portfolio.currency}
              onClose={() => setShowStockDividendModal(false)}
              onSubmit={handleSubmit}
            />
          </ModalContainer>
        </Modal>
      )}
    </>
  );
}

export default PortfolioDashboard;
