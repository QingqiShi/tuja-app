import styled from 'styled-components';
import { v } from '../../theme';
import TextLink from '../atoms/TextLink';
import EdgePadding from '../layout/EdgePadding';

const Container = styled(EdgePadding)`
  margin-top: ${v.spacerM};
`;

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${v.textSecondary};
  border-top: 1px solid ${v.backgroundHover};
  padding: ${v.spacerM} 0;
`;

const Name = styled.span`
  font-weight: ${v.fontBold};
`;

const LinksContainer = styled.div`
  > * {
    margin-left: ${v.spacerS};
  }
`;

interface FooterProps {
  links?: { label: string; href: string }[];
}

function Footer({ links }: FooterProps) {
  return (
    <Container>
      <Wrapper>
        <div>
          <Name>Tuja</Name> © {new Date().getFullYear()}
        </div>
        <LinksContainer>
          {links?.map(({ label, href }) => (
            <TextLink key={label} href={href}>
              {label}
            </TextLink>
          ))}
        </LinksContainer>
      </Wrapper>
    </Container>
  );
}

export default Footer;
