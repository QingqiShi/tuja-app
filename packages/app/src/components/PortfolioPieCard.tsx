import styled from 'styled-components/macro';
import { Pie } from '@tuja/components';
import { formatCurrency } from '@tuja/libs';
import { Card, CardMedia } from 'commonStyledComponents';
import usePortfolio from 'hooks/usePortfolio';
import useColors from 'hooks/useColors';
import usePortfolioProcessor from 'hooks/usePortfolioProcessor';
import { theme } from 'theme';

const PieContainer = styled.div`
  width: 100%;
  max-width: 300px;
  position: relative;
  margin: 0 auto;

  @media (${theme.breakpoints.minTablet}) {
    max-width: 15rem;
  }
  @media (${theme.breakpoints.minLaptop}) {
    max-width: 20rem;
  }

  &:after {
    content: '';
    display: block;
    padding-bottom: 100%;
  }

  > div {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
  @media (${theme.breakpoints.minLaptop}) {
    > div {
      width: calc(100% - ${theme.spacings('s')} * 2);
      height: calc(100% - ${theme.spacings('s')} * 2);
      top: ${theme.spacings('s')};
      left: ${theme.spacings('s')};
    }
  }
`;

interface PortfolioPieCardProps {}

function PortfolioPieCard(_props: PortfolioPieCardProps) {
  const { portfolio } = usePortfolio();
  const { portfolioPerformance } = usePortfolioProcessor();

  const portfolioValue = portfolioPerformance?.valueSeries.getLast() ?? 0;

  const getColor = useColors();
  const pieData = portfolioPerformance
    ? Object.keys(portfolioPerformance.holdings)
        .map((ticker) => ({
          label: ticker,
          percentage: portfolioValue
            ? portfolioPerformance.holdings[ticker].value / portfolioValue
            : 0,
          color: getColor(ticker),
        }))
        .concat({
          label: 'Cash',
          percentage: portfolioValue
            ? (portfolioPerformance.lastSnapshot?.cash ?? 0) / portfolioValue
            : 0,
          color: getColor('Cash'),
        })
        .sort((a, b) => b.percentage - a.percentage)
    : [];

  if (!portfolio) {
    return null;
  }

  return (
    <Card>
      <CardMedia>
        <PieContainer>
          <div>
            <Pie
              data={pieData}
              primaryText={formatCurrency(portfolio.currency, portfolioValue)}
              secondaryText="Portfolio Value"
            />
          </div>
        </PieContainer>
      </CardMedia>
    </Card>
  );
}

export default PortfolioPieCard;
