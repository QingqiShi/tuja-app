import React, { useState, useEffect, useMemo } from 'react';
import { RiMoreLine, RiSubtractLine } from 'react-icons/ri';
import styled from 'styled-components/macro';
import dayjs from 'dayjs';
import Chart from 'components/Chart';
import DashboardLayout from 'components/DashboardLayout';
import PortfolioOverview from 'components/PortfolioOverview';
import PortfolioPieCard from 'components/PortfolioPieCard';
import ButtonGroup from 'components/ButtonGroup';
import Type from 'components/Type';
import Button from 'components/Button';
import Backdrop from 'components/Backdrop';
import InvestmentsList from 'components/InvestmentsList';
import ActivityTradeForm from 'components/ActivityTradeForm';
import ActivityDepositForm from 'components/ActivityDepositForm';
import ActivityDividendForm from 'components/ActivityDividendForm';
import AutoInvest from 'components/AutoInvest';
import { Card, CardMedia } from 'commonStyledComponents';
import usePortfolio from 'hooks/usePortfolio';
import usePortfolioPerformance from 'hooks/usePortfolioPerformance';
import useStocksList from 'hooks/useStocksList';
import useStartDate from 'hooks/useStartDate';
import useBodyScrollLock from 'hooks/useBodyScrollLock';
import { addPortfolioActivity, Activity } from 'libs/portfolio';
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
    margin-right: 0;
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
  const { portfolioPerformance } = usePortfolioPerformance();
  const { stocksList } = useStocksList();

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

  const [selectedPeriod, setSelectedPeriod] = useState(
    (startDate &&
      periodButtons.find((button) => button.value.isSame(startDate, 'date'))
        ?.value) ??
      (periodButtons[2]
        ? periodButtons[2].value
        : periodButtons[periodButtons.length - 1].value)
  );

  useEffect(() => {
    if (!startDate || !selectedPeriod.isSame(startDate, 'date')) {
      setStartDate(selectedPeriod.toDate());
    }
  }, [selectedPeriod, setStartDate, startDate]);

  // Activity modals
  const [showBuyModal, setShowBuyModal] = useState(false);
  const buyModalRef = useBodyScrollLock(showBuyModal);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const depositModalRef = useBodyScrollLock(showDepositModal);
  const [showSellModal, setShowSellModal] = useState(false);
  const sellModalRef = useBodyScrollLock(showSellModal);
  const [showDividendModal, setShowDividendModal] = useState(false);
  const dividendModalRef = useBodyScrollLock(showDividendModal);

  const handleSubmit = async (activity: Activity) => {
    if (portfolio?.id) {
      addPortfolioActivity(portfolio?.id, activity);

      // Analytics
      logEvent('create_activity', { type: activity.type });
    }
  };

  // Show more actions
  const [showMoreActions, setShowMoreActions] = useState(false);

  if (!stocksList || !portfolio) {
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
                onChange={setSelectedPeriod}
              />
            </DatePeriodContainer>
          </>
        }
        side={
          <>
            <PortfolioPieCard />
            {!isDemo && (
              <ActionsContainer>
                <Button variant="shout" onClick={() => setShowBuyModal(true)}>
                  Buy
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDepositModal(true)}
                >
                  Deposit
                </Button>
                {showMoreActions && (
                  <>
                    <Button
                      variant="primary"
                      onClick={() => setShowSellModal(true)}
                    >
                      Sell
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => setShowDividendModal(true)}
                    >
                      Dividend
                    </Button>
                  </>
                )}
                <Button
                  variant="primary"
                  onClick={() => setShowMoreActions((val) => !val)}
                  icon={showMoreActions ? <RiSubtractLine /> : <RiMoreLine />}
                />
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
                    data={portfolioPerformance?.series.valueSeries.data ?? []}
                    benchmark={portfolioPerformance?.series.deposits.data ?? []}
                    currency={portfolio.currency}
                    benchmarkLabel="Cost"
                    hideAxis
                  />
                )}
                {selectedChart === 'gains' && (
                  <Chart
                    data={portfolioPerformance?.series.gains.data ?? []}
                    currency={portfolio.currency}
                    hideAxis
                  />
                )}
                {selectedChart === 'returns' && (
                  <Chart
                    data={portfolioPerformance?.series.returns.data ?? []}
                    formatPercentage
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
        <Backdrop onClick={() => setShowBuyModal(false)}>
          <Card ref={buyModalRef}>
            <ModalContainer>
              <Type scale="h5">Buy</Type>
              <ActivityTradeForm
                mode="buy"
                currency={portfolio.currency}
                onClose={() => setShowBuyModal(false)}
                onSubmit={handleSubmit}
              />
            </ModalContainer>
          </Card>
        </Backdrop>
      )}
      {showDepositModal && (
        <Backdrop onClick={() => setShowDepositModal(false)}>
          <Card ref={depositModalRef}>
            <ModalContainer>
              <Type scale="h5">Deposit</Type>
              <ActivityDepositForm
                currency={portfolio.currency}
                onClose={() => setShowDepositModal(false)}
                onSubmit={handleSubmit}
              />
            </ModalContainer>
          </Card>
        </Backdrop>
      )}
      {showSellModal && (
        <Backdrop onClick={() => setShowSellModal(false)}>
          <Card ref={sellModalRef}>
            <ModalContainer>
              <Type scale="h5">Sell</Type>
              <ActivityTradeForm
                mode="sell"
                currency={portfolio.currency}
                onClose={() => setShowSellModal(false)}
                onSubmit={handleSubmit}
              />
            </ModalContainer>
          </Card>
        </Backdrop>
      )}
      {showDividendModal && (
        <Backdrop onClick={() => setShowDividendModal(false)}>
          <Card ref={dividendModalRef}>
            <ModalContainer>
              <Type scale="h5">Dividend</Type>
              <ActivityDividendForm
                currency={portfolio.currency}
                onClose={() => setShowDividendModal(false)}
                onSubmit={handleSubmit}
              />
            </ModalContainer>
          </Card>
        </Backdrop>
      )}
    </>
  );
}

export default PortfolioDashboard;
