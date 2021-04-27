import styled from 'styled-components';
import { v } from '../../theme';
import TextLink from '../atoms/TextLink';
import EdgePadding from '../layout/EdgePadding';

const Container = styled(EdgePadding)`
  display: flex;
  align-items: center;
  min-height: 10rem;
`;

const Wrapper = styled.div`
  width: 100%;
  color: ${v.textSecondary};
  padding: ${v.spacerM} 0;

  @media (${v.minTablet}) {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  > :first-child {
    margin-bottom: ${v.spacerM};

    @media (${v.minTablet}) {
      margin-bottom: 0;
    }
  }
`;

const Name = styled.span`
  font-weight: ${v.fontBold};
`;

const LinksContainer = styled.nav`
  text-align: right;

  > * {
    display: block;
    padding: ${v.spacerXS} 0;

    @media (${v.minTablet}) {
      display: inline-block;
      padding: 0;
      margin-left: ${v.spacerS};
    }
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
