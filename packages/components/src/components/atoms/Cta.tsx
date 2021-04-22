import styled from 'styled-components';
import ButtonBase from './ButtonBase';
import { v } from '../../theme';

const Button = styled(ButtonBase)`
  display: block;
  width: 100%;
  color: ${v.textOnAccent};
  background-color: ${v.accentMain};
  box-shadow: ${v.shadowRaised};
  padding: ${v.spacerS} ${v.spacerS};
  font-size: 1.2rem;
  font-weight: ${v.fontBold};

  @media (${v.minTablet}) {
    display: inline-block;
    width: auto;
    padding: ${v.spacerS} ${v.spacerM};
  }

  @media (${v.minLaptop}) {
    padding: ${v.spacerXS} ${v.spacerM};
  }

  &:hover {
    color: ${v.textOnAccent};
    background-color: ${v.accentHover};
  }
  &:active {
    background-color: ${v.accentMain};
    box-shadow: ${v.shadowPressed};
  }
`;

function ButtonPrimary(props: React.ComponentProps<typeof ButtonBase>) {
  return <Button {...props} />;
}

export default ButtonPrimary;
