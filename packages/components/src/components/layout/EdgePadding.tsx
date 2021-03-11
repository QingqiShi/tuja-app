import styled from 'styled-components';
import { v } from '../../theme';

const EdgePadding = styled.div`
  padding-left: calc(env(safe-area-inset-left) + ${v.edgePadding});
  padding-right: calc(env(safe-area-inset-right) + ${v.edgePadding});

  @media (${v.minTablet}) {
    max-width: 44rem;
    margin: 0 auto;
  }

  @media (${v.minLaptop}) {
    max-width: none;
  }

  @media (${v.minDesktop}) {
    max-width: 80rem;
    margin: 0 auto;
  }
`;

export default EdgePadding;
