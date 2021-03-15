import styled, { css } from 'styled-components';
import { v } from '../../theme';

const EdgePadding = styled.div`
  max-width: ${v.maxLayoutWidth};
  padding-left: calc(env(safe-area-inset-left) + ${v.leftRightPadding});
  padding-right: calc(env(safe-area-inset-right) + ${v.leftRightPadding});
  margin: 0 auto;
`;

export const invertEdgePadding = css`
  margin: 0
    calc(
      (100vw - (min(${v.maxLayoutWidth}, 100vw) - (${v.leftRightPadding} * 2))) /
        -2
    );
`;

export default EdgePadding;
