import styled from 'styled-components';
import { v } from '../../theme';
import TextLink from '../atoms/TextLink';
import EdgePadding from '../layout/EdgePadding';

const Container = styled(EdgePadding)`
  display: flex;
  align-items: center;
  height: 10rem;
`;

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${v.textSecondary};
  padding: ${v.spacerM} 0;
`;

const Name = styled.span`
  font-weight: ${v.fontBold};
`;

const LinksContainer = styled.nav`
  > * {
    margin-left: ${v.spacerS};
  }
`;

interface FooterProps {
  links?: { label: string; href: string }[];
}

function Footer({ links }: FooterProps) {
  return (
    <Container as="footer">
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
