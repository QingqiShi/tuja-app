import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useHistory } from 'react-router-dom';
import { Lightning, Percent } from 'phosphor-react';
import { useDebounce } from 'use-debounce';
import styled from 'styled-components';
import dayjs from 'dayjs';
import minMax from 'dayjs/plugin/minMax';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import {
  AllocationItem,
  ButtonIcon,
  Footer,
  Header,
  NumberInput,
  Pie,
  ResponsiveSplit,
  Select,
  v,
} from '@tuja/components';
import { prefetchStocksHistory } from '../libs/cachedStocksData';
import Backtest from '../analytics/Backtest';

dayjs.extend(isSameOrBefore);
dayjs.extend(minMax);

const ContentContainer = styled.div`
  min-height: calc(100vh - 10rem - ${v.headerHeight});
`;

const PieContainer = styled.div`
  height: 300px;
  position: relative;
`;

const AutoAdjust = styled.div`
  position: absolute;
  bottom: 0;
  right: ${v.leftRightPadding};
  @media (${v.minLaptop}) {
    right: calc(${v.leftRightPadding} / 2);
  }
`;

const ConfigContainer = styled.div`
  margin-top: ${v.spacerM};
  padding-left: ${v.leftRightPadding};
  padding-right: ${v.leftRightPadding};

  @media (${v.minLaptop}) {
    padding-right: calc(${v.leftRightPadding} / 2);
  }
`;

const GlobalConfig = styled.div`
  display: flex;
  > :not(:last-child) {
    margin-right: ${v.spacerXS};
  }
`;

const Assets = styled.div`
  margin-top: ${v.spacerS};

  > *:not(:last-child) {
    margin-bottom: ${v.spacerM};
  }
`;

const Results = styled.div`
  margin-top: ${v.spacerS};
  padding-left: ${v.leftRightPadding};
  padding-right: ${v.leftRightPadding};

  @media (${v.minLaptop}) {
    padding-left: calc(${v.leftRightPadding} / 2);
  }
`;

const ComingSoon = styled.div`
  height: 10rem;
  font-size: 1.5rem;
  display: grid;
  place-items: center;
  place-content: center;
  font-family: ${v.fontFamily};
  font-weight: ${v.fontSemiBold};
  color: ${v.textSecondary};
`;

const assets = [
  {
    ticker: 'VFIAX.US',
    label: 'USA Large Cap Balance',
    percentage: 0.6,
    color: '#556480',
  },
  {
    ticker: 'VFITX.US',
    label: 'US Intermediate Treasury Bond',
    percentage: 0.4,
    color: '#CF9F97',
  },
];

const currencies = [
  { label: 'USD', value: 'USD' },
  { label: 'GBP', value: 'GBP' },
  { label: 'EUR', value: 'EUR' },
  { label: 'CAD', value: 'CAD' },
  { label: 'SEK', value: 'SEK' },
  { label: 'JPY', value: 'JPY' },
  { label: 'CNY', value: 'CNY' },
];

interface AnalyticsProps {}

function Analytics(_props: AnalyticsProps) {
  const history = useHistory();

  const [isLoading, setIsLoading] = useState(true);

  const [inflation, setInflation] = useState(0.02);
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [selections, setSelections] = useState(assets);
  const [debouncedSelections] = useDebounce(selections, 500);

  const empty = {
    label: 'Cash',
    color: 'transparent',
    percentage:
      1 - selections.reduce((sum, current) => sum + current.percentage, 0),
    isEmpty: true,
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);

      await prefetchStocksHistory(
        assets.map((a) => a.ticker),
        baseCurrency
      );

      setIsLoading(false);
    })();
  }, [baseCurrency]);

  // Auto adjust allocation
  const totalPercentage = selections.reduce((sum, s) => sum + s.percentage, 0);
  const adjustAllocation = () => {
    setSelections(
      selections.map((s) => ({
        ...s,
        percentage: s.percentage / totalPercentage,
      }))
    );
  };

  return (
    <div>
      <Helmet>
        <title>Tuja App | Portfolio analytics</title>
      </Helmet>

      <Header logoHref="/" onLogoClick={() => history.push('/')} />

      <ContentContainer>
        <ResponsiveSplit
          stickyOffset={v.headerHeight}
          primary={
            <Results>
              <Backtest
                assets={isLoading ? [] : debouncedSelections}
                baseCurrency={baseCurrency}
                inflationRate={inflation}
                isLoading={isLoading}
              />
              <ComingSoon>More analytics coming soon!</ComingSoon>
            </Results>
          }
          secondary={() => (
            <div>
              <PieContainer>
                <Pie
                  primaryText={'5'}
                  secondaryText={'Assets'}
                  data={[...selections, empty]}
                />
                {totalPercentage !== 1 && (
                  <AutoAdjust>
                    <ButtonIcon onClick={adjustAllocation}>
                      <Lightning />
                    </ButtonIcon>
                  </AutoAdjust>
                )}
              </PieContainer>
              <ConfigContainer>
                <GlobalConfig>
                  <Select
                    label="Base currency"
                    options={currencies}
                    value={baseCurrency}
                    onChange={(val) => setBaseCurrency(val.target.value)}
                  />
                  <NumberInput
                    label="Annual inflation rate"
                    value={Math.round((inflation ?? 0) * 1000) / 10}
                    onChange={(val) => setInflation(val / 100)}
                    endIcon={<Percent />}
                    max={100}
                    min={0}
                  />
                </GlobalConfig>
                <Assets>
                  {selections
                    .filter((selection) => !!selection.ticker)
                    .map((selection) => (
                      <AllocationItem
                        key={selection.ticker}
                        stockInfo={{
                          name: selection.label,
                          code: selection.ticker.split('.')[0],
                          exchange: selection.ticker.split('.')[1],
                        }}
                        allocation={selection.percentage * 100}
                        onChange={(newVal) =>
                          setSelections((current) =>
                            current.map((val) =>
                              val.ticker === selection.ticker
                                ? {
                                    ...val,
                                    percentage: newVal / 100,
                                  }
                                : val
                            )
                          )
                        }
                      />
                    ))}
                </Assets>
              </ConfigContainer>
            </div>
          )}
        />
      </ContentContainer>

      <Footer
        links={[
          { label: 'Portfolio Tracker', href: '/tracker' },
          // { label: 'Help us out', href: '/donation' },
          // { label: 'About Us', href: '/about' },
        ]}
      />
    </div>
  );
}

export default Analytics;
