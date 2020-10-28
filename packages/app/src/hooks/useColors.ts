import { useMemo } from 'react';
import { useTheme } from 'styled-components/macro';
import { transparentize } from 'polished';
import { scaleOrdinal } from 'd3-scale';
import usePortfolioPerformance from 'hooks/usePortfolioPerformance';
import { theme } from 'theme';

function useColors() {
  const styledTheme = useTheme();
  const { portfolioPerformance } = usePortfolioPerformance();

  const getColor = useMemo(() => {
    const holdings = portfolioPerformance?.holdings;
    const domain = holdings
      ? Object.keys(holdings ?? {})
          .map((ticker) => ticker)
          .sort((a, b) => holdings[b].value - holdings[a].value)
          .concat('Cash')
      : [];
    return scaleOrdinal(domain, [
      ...theme.colors.ordinals({ theme: styledTheme }),
      ...theme.colors
        .ordinals({ theme: styledTheme })
        .map((color) => transparentize(0.3, color)),
      ...theme.colors
        .ordinals({ theme: styledTheme })
        .map((color) => transparentize(0.6, color)),
    ]);
  }, [portfolioPerformance?.holdings, styledTheme]);
  return getColor;
}

export default useColors;
