import { useMemo } from 'react';
import { useTheme } from 'styled-components/macro';
import { transparentize } from 'polished';
import { scaleOrdinal } from '@vx/scale';
import { theme } from 'theme';

function useColors(domain: string[]) {
  const styledTheme = useTheme();
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
