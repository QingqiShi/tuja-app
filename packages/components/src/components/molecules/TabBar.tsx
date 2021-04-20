import styled from 'styled-components';
import ButtonBase from '../atoms/ButtonBase';
import { v } from '../../theme';

const Bar = styled.div`
  border-radius: ${v.radiusCard};
  box-shadow: ${v.shadowOverlay};
  padding: ${v.spacerXS} ${v.spacerS};
  background-color: ${v.backgroundTranslucent};
  display: flex;
  justify-content: center;
  backdrop-filter: saturate(180%) blur(1.3rem);
  width: 100%;

  @media (${v.minTablet}) {
    max-width: 28rem;
  }

  @media (${v.minDesktop}) {
    flex-direction: column;
    width: max-content;
    padding: ${v.spacerS} ${v.spacerXS};
  }
`;

const Item = styled(ButtonBase)`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: ${v.textSecondary};
  border-radius: ${v.radiusMedia};
  font-size: 0.75rem;
  width: 5rem;

  &:visited {
    color: ${v.textSecondary};
  }

  &:not(:last-child) {
    margin-right: min(1vw, 1rem);
  }

  &:disabled,
  &:disabled:hover,
  &[disabled] {
    color: ${v.textMain};
    opacity: 1;
  }

  @media (${v.minDesktop}) {
    width: 4.2rem;
    &:not(:last-child) {
      margin-right: 0;
      margin-bottom: min(1vh, 1rem);
    }
  }
`;

interface TabBarProps {
  links: {
    Icon: React.ComponentType<{
      size?: any;
      weight?: any;
    }>;
    label: string;
    href?: string;
    onClick?: () => void;
    isActive?: boolean;
  }[];
}

function TabBar({ links }: TabBarProps) {
  return (
    <Bar>
      {links.map(({ Icon, label, href, isActive, onClick }, i) => (
        <Item
          key={`tab-bar-item-${i}`}
          href={href}
          onClick={onClick}
          disabled={isActive}
        >
          <Icon size={24} weight="bold" />
          <span>{label}</span>
        </Item>
      ))}
    </Bar>
  );
}

export default TabBar;
