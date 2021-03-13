import styled from 'styled-components/macro';
import { v } from '@tuja/components';

export const Center = styled.div`
  min-height: 100%;
  display: flex;
  place-items: center;
  place-content: center;
  flex-direction: column;
  text-align: center;
`;

export const FullHeight = styled.div`
  height: 100vh;
`;

export const Card = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: ${v.backgroundRaised};
  box-shadow: ${v.shadowOverlay};
  border-radius: ${v.radiusCard};
  padding: ${v.spacerS};
  @media (${v.minTablet}) {
    padding: ${v.spacerM} ${v.spacerS};
  }
  @media (${v.minLaptop}) {
    padding: ${v.spacerM};
  }
`;

export const CardMedia = styled.div`
  flex-grow: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  margin: -${v.spacerS};

  @media (${v.minTablet}) {
    margin: -${v.spacerM} -${v.spacerS};
  }
  @media (${v.minLaptop}) {
    margin: -${v.spacerM};
  }

  &:not(:first-child) {
    margin-top: 0;
  }

  &:not(:last-child) {
    margin-bottom: 0;
  }
`;

export const TitleRow = styled.div`
  > button {
    display: block;
    margin-bottom: 2em;
    width: 100%;
  }

  > h3:first-child {
    margin: 1.5rem 0;
    line-height: 3rem;

    > button {
      margin-left: 1rem;
    }
  }

  @media (${v.minLaptop}) {
    display: flex;
    align-items: center;

    > h3:first-child {
      flex-grow: 1;
    }

    > button {
      width: auto;
      margin-bottom: 0;
    }
  }
`;

export const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
  justify-content: space-between;
  position: sticky;
  background-color: ${v.backgroundRaised};
  bottom: -${v.spacerS};
  padding: ${v.spacerS};
  margin: 0 -${v.spacerS};
  @media (${v.minTablet}) {
    bottom: -${v.spacerM};
    margin: 0 -${v.spacerS};
  }
  @media (${v.minLaptop}) {
    bottom: -${v.spacerM};
    margin: 0 -${v.spacerM};
  }
`;

export const Field = styled.div`
  margin-top: calc(1.08rem + ${v.spacerXS});
`;

export const Label = styled.label`
  font-size: 0.9rem;
  line-height: 1.2em;
  font-weight: ${v.fontSemiBold};
  margin-bottom: ${v.spacerXS};
  display: block;
  text-align: left;
`;
