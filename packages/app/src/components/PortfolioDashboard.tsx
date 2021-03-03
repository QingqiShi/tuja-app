import { useState } from 'react';
import { RiMoreLine, RiSubtractLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import styled from 'styled-components/macro';
import dayjs from 'dayjs';
import {
  Bars,
  Button,
  ButtonGroup,
  Chart,
  Modal,
  Type,
} from '@tuja/components';
import { Activity, formatCurrency } from '@tuja/libs';
import DashboardLayout from 'components/DashboardLayout';
import PortfolioOverview from 'components/PortfolioOverview';
import PortfolioPieCard from 'components/PortfolioPieCard';
import InvestmentsList from 'components/InvestmentsList';
import ActivityTradeForm from 'components/ActivityTradeForm';
import ActivityDepositForm from 'components/ActivityDepositForm';
import ActivityDividendForm from 'components/ActivityDividendForm';
import ActivityStockDividendForm from 'components/ActivityStockDividendForm';
import { Card, CardMedia } from 'commonStyledComponents';
import usePortfolio from 'hooks/usePortfolio';
import usePortfolioProcessor from 'hooks/usePortfolioProcessor';
import useStartDate from 'hooks/useStartDate';
import { addActivity } from 'libs/portfolioClient';
import { logEvent } from 'libs/analytics';
import { theme } from 'theme';

const DatePeriodContainer = styled.div`
  margin-bottom: ${theme.spacings('s')};
  text-align: right;
`;

const ActionsRow = styled.div`
  display: flex;
  margin: ${theme.spacings('s')} 0 ${theme.spacings('xs')};

  &:last-child {
    margin-bottom: ${theme.spacings('s')};
  }

  > button {
    margin-right: ${theme.spacings('xs')};
    flex-grow: 1;
  }

  > button:last-child {
    margin-right: 0;
  }

  > button:last-child:not(:first-child) {
    flex-grow: 0;
  }
`;

const WideAction = styled.div`
  margin-bottom: ${theme.spacings('s')};

  > button {
    width: 100%;
    margin-bottom: ${theme.spacings('xs')};
  }

  > button:last-child {
    margin-bottom: 0;
  }
`;

const ChartActionsContainer = styled.div`
  text-align: right;
  margin-bottom: ${theme.spacings('xs')};
`;

const ChartCard = styled(Card)`
  max-height: 80vh;
  margin-bottom: ${theme.spacings('s')};
  height: 15rem;
  @media (${({ theme }) => theme.breakpoints.minTablet}) {
    height: 20rem;
  }
  @media (${({ theme }) => theme.breakpoints.minLaptop}) {
    height: 25rem;
  }
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
  { label: 'Dividends', value: 'dividends' },
];

interface PortfolioDashboardProps {
  isDemo?: boolean;
}

function PortfolioDashboard({ isDemo }: PortfolioDashboardProps) {
  // Context data
  const [startDate, setStartDate] = useStartDate();
  const { portfolio } = usePortfolio();
  const { portfolioPerformance } = usePortfolioProcessor();

  // Chart type selection
  const [selectedChart, setSelectedChart] = useState('value');

  // Date range selection
  const activitiesStartDate = portfolio?.activitiesStartDate;

  const periodButtons = [
    ...defaultPeriods.filter(({ value }) =>
      value.isAfter(activitiesStartDate ?? currentDate)
    ),
    { label: 'All', value: dayjs(activitiesStartDate) ?? currentDate },
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
      addActivity(portfolio?.id, activity);

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
              <div>
                <ActionsRow>
                  {!!activitiesStartDate && (
                    <Button
                      variant="shout"
                      onClick={() => setShowBuyModal(true)}
                    >
                      Buy
                    </Button>
                  )}
                  <Button
                    variant={!!activitiesStartDate ? 'outline' : 'shout'}
                    onClick={() => setShowDepositModal(true)}
                  >
                    Deposit
                  </Button>
                  {!!activitiesStartDate && portfolio.costBasis && (
                    <Button
                      variant="outline"
                      onClick={() => setShowMoreActions((val) => !val)}
                      icon={
                        showMoreActions ? <RiSubtractLine /> : <RiMoreLine />
                      }
                    />
                  )}
                </ActionsRow>
                {showMoreActions &&
                  !!activitiesStartDate &&
                  portfolio.costBasis && (
                    <>
                      <WideAction>
                        <Button
                          variant="outline"
                          onClick={() => setShowSellModal(true)}
                        >
                          Sell
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowDividendModal(true)}
                        >
                          Cash Dividend
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowStockDividendModal(true)}
                        >
                          Stock Dividend
                        </Button>
                      </WideAction>
                    </>
                  )}
              </div>
            )}
            {isDemo && (
              <ActionsRow>
                <Button
                  variant="shout"
                  as={Link}
                  otherProps={{ to: '/signin' }}
                >
                  Make Your Own
                </Button>
              </ActionsRow>
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
                    data={
                      portfolioPerformance?.portfolio.valueSeries.data ?? []
                    }
                    benchmark={
                      portfolioPerformance?.portfolio.cashFlowSeries.data ?? []
                    }
                    formatValue={(val) =>
                      formatCurrency(portfolio.currency, val)
                    }
                    benchmarkLabel="Cost"
                    hideAxis
                  />
                )}
                {selectedChart === 'gains' && (
                  <Chart
                    data={portfolioPerformance?.portfolio.gainSeries.data ?? []}
                    formatValue={(val) =>
                      formatCurrency(portfolio.currency, val)
                    }
                    hideAxis
                  />
                )}
                {selectedChart === 'returns' && (
                  <Chart
                    data={portfolioPerformance?.portfolio.twrrSeries.data ?? []}
                    formatValue={(val) => `${(val * 100).toFixed(1)}%`}
                    benchmark={
                      portfolioPerformance?.portfolio.benchmarkSeries?.data
                    }
                    benchmarkLabel={portfolio.benchmark}
                    hideAxis
                  />
                )}
                {selectedChart === 'dividends' && (
                  <Bars
                    data={
                      portfolioPerformance?.portfolio.monthlyDividends.data ??
                      []
                    }
                    formatValue={(val) =>
                      formatCurrency(portfolio.currency, val)
                    }
                  />
                )}
              </CardMedia>
            </ChartCard>
            {portfolioPerformance?.portfolio && <InvestmentsList />}
          </div>
        }
      />
      <Modal
        width={30}
        open={showBuyModal}
        onClose={() => setShowBuyModal(false)}
      >
        <ActivityTradeForm
          mode="buy"
          currency={portfolio.currency}
          onClose={() => setShowBuyModal(false)}
          onSubmit={handleSubmit}
        />
      </Modal>
      <Modal onClose={() => setShowDepositModal(false)} open={showDepositModal}>
        <ModalContainer>
          <Type scale="h5">Deposit</Type>
          <ActivityDepositForm
            currency={portfolio.currency}
            onClose={() => setShowDepositModal(false)}
            onSubmit={handleSubmit}
          />
        </ModalContainer>
      </Modal>
      <Modal
        width={30}
        open={showSellModal}
        onClose={() => setShowSellModal(false)}
      >
        <ActivityTradeForm
          mode="sell"
          currency={portfolio.currency}
          onClose={() => setShowSellModal(false)}
          onSubmit={handleSubmit}
        />
      </Modal>
      <Modal
        onClose={() => setShowDividendModal(false)}
        open={showDividendModal}
      >
        <ModalContainer>
          <Type scale="h5">Cash Dividend</Type>
          <ActivityDividendForm
            currency={portfolio.currency}
            onClose={() => setShowDividendModal(false)}
            onSubmit={handleSubmit}
          />
        </ModalContainer>
      </Modal>
      <Modal
        onClose={() => setShowStockDividendModal(false)}
        open={showStockDividendModal}
      >
        <ModalContainer>
          <Type scale="h5">Stock Dividend</Type>
          <ActivityStockDividendForm
            currency={portfolio.currency}
            onClose={() => setShowStockDividendModal(false)}
            onSubmit={handleSubmit}
          />
        </ModalContainer>
      </Modal>
    </>
  );
}

export default PortfolioDashboard;
