import styled from 'styled-components';
import { v } from '../../theme';

const EdgePadding = styled.div`
  padding-left: calc(env(safe-area-inset-left) + 1rem);
  padding-right: calc(env(safe-area-inset-right) + 1rem);

  @media (${v.minTablet}) {
    max-width: 44rem;
    margin: 0 auto;
    padding-left: calc(env(safe-area-inset-left) + 2rem);
    padding-right: calc(env(safe-area-inset-right) + 2rem);
  }

  @media (${v.minLaptop}) {
    max-width: none;
    padding-left: calc(env(safe-area-inset-left) + 3.5rem);
    padding-right: calc(env(safe-area-inset-right) + 3.5rem);
  }

  @media (${v.minDesktop}) {
    max-width: 80rem;
    margin: 0 auto;
    padding-left: calc(env(safe-area-inset-left) + 4rem);
    padding-right: calc(env(safe-area-inset-right) + 4rem);
  }
`;

export default EdgePadding;
