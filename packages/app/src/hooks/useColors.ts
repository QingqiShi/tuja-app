import { useMemo } from 'react';
import { useTheme } from 'styled-components/macro';
import { transparentize } from 'polished';
import { scaleOrdinal } from '@vx/scale';
import usePortfolioPerformance from 'hooks/usePortfolioPerformance';
import { theme } from 'theme';

function useColors() {
  const styledTheme = useTheme();
  const { portfolioPerformance } = usePortfolioPerformance();

  const domain = portfolioPerformance
    ? Object.keys(portfolioPerformance.holdings)
        .map((ticker) => ticker)
        .sort((a, b) => {
          return (
            portfolioPerformance.holdings[b].value -
            portfolioPerformance.holdings[a].value
          );
        })
        .concat('Cash')
    : [];

  const getColor = useMemo(
    () =>
      scaleOrdinal({
        domain,
        range: [
          ...theme.colors.ordinals({ theme: styledTheme }),
          ...theme.colors
            .ordinals({ theme: styledTheme })
            .map((color) => transparentize(0.3, color)),
          ...theme.colors
            .ordinals({ theme: styledTheme })
            .map((color) => transparentize(0.6, color)),
        ],
      }),
    [domain, styledTheme]
  );
  return getColor;
}

export default useColors;
