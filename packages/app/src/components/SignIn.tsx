import { forwardRef, useState, useMemo } from 'react';
import styled from 'styled-components/macro';
import { RiMailSendLine } from 'react-icons/ri';
import { FaMagic, FaRegQuestionCircle } from 'react-icons/fa';
import { Button, SignInButton, TextInput, Type } from '@tuja/components';
import useAuth from 'hooks/useAuth';
import { Center } from 'commonStyledComponents';
import { ReactComponent as GoogleLogo } from 'assets/google.svg';

const Container = styled.div`
  max-width: ${({ theme }) =>
    `calc(425px - ${theme.spacings.m} * 2 - ${theme.spacings.s})`};
  width: 100%;
  background-color: ${({ theme }) => theme.colors.backgroundRaised};
  padding: ${({ theme }) =>
    `${theme.spacings.l} ${theme.spacings.m} ${theme.spacings.m}`};
  border-radius: ${({ theme }) => theme.spacings.xs};
  box-shadow: 0 0 ${({ theme }) => theme.spacings.s} 0 rgba(0, 0, 0, 0.1);

  @media (${({ theme }) => theme.breakpoints.minLaptop}) {
    max-width: ${({ theme }) =>
      `calc(500px - ${theme.spacings.m} * 2 - ${theme.spacings.s})`};
  }

  form {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
`;

const LargeIcon = styled.div`
  display: block;
  font-size: 3rem;
`;

const Seperator = styled.div`
  display: flex;
  align-items: center;
  text-transform: uppercase;
  margin: ${({ theme }) => theme.spacings.l} 0;
  color: ${({ theme }) => theme.colors.textSecondaryOnBackground};

  &:before {
    content: '';
    flex-grow: 1;
    border-bottom: 1px solid ${({ theme }) => theme.colors.disabled};
    margin-right: ${({ theme }) => theme.spacings.m};
  }

  &:after {
    content: '';
    flex-grow: 1;
    border-bottom: 1px solid ${({ theme }) => theme.colors.disabled};
    margin-left: ${({ theme }) => theme.spacings.m};
  }
`;

const ThirdPartySignInContainers = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const SignInPopOut = forwardRef<HTMLDivElement>((_, ref) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    state,
    signOut,
    signIn,
    reset,
    confirmEmail,
    signInWithGoogle,
  } = useAuth();

  const content = useMemo(() => {
    switch (state) {
      case 'SIGNED_IN':
        return (
          <Center>
            <Button variant="primary" onClick={signOut}>
              Sign Out
            </Button>
          </Center>
        );
      case 'SIGNING_IN':
        return (
          <Center>
            <Type scale="body1">Signing in...</Type>
          </Center>
        );
      case 'CONFIRM_EMAIL':
        return (
          <form
            method="POST"
            onSubmit={(e) => {
              e.preventDefault();
              confirmEmail(email);
            }}
          >
            <LargeIcon>
              <FaRegQuestionCircle />
            </LargeIcon>
            <TextInput
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              label="Email"
              placeholder="hi@example.com"
              helperText="Please confirm your email address again to sign in."
              required
              autoFocus
            />
            <Button variant="shout" disabled={isLoading}>
              Confirm Sign In
            </Button>
          </form>
        );
      case 'EMAIL_SENT':
        return (
          <Center>
            <LargeIcon>
              <FaMagic />
            </LargeIcon>
            <Type scale="h4" as="p">
              Email sent
            </Type>
            <Type scale="body2">
              We just emailed a magic link to {email || 'you'}, use the link to
              sign in securely.
            </Type>
            <Button variant="primary" onClick={reset}>
              Try Again
            </Button>
          </Center>
        );
      default:
        return (
          <div>
            <Type scale="h4">Sign in with Email</Type>
            <form
              method="POST"
              onSubmit={async (e) => {
                e.preventDefault();
                setIsLoading(true);
                await signIn(email);
                setIsLoading(false);
              }}
            >
              <TextInput
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                label="Email"
                placeholder="hi@example.com"
                helperText="Sign in or create new account with a magic link sent to your email, no password needed!"
                required
                autoFocus
              />
              <Button
                variant="shout"
                endIcon={<RiMailSendLine />}
                disabled={isLoading}
              >
                Get Sign In Link
              </Button>
            </form>

            <Seperator>Or</Seperator>

            <ThirdPartySignInContainers>
              <SignInButton
                icon={<GoogleLogo />}
                bgColor="#FFFFFF"
                onClick={async () => {
                  setIsLoading(true);
                  await signInWithGoogle();
                  setIsLoading(false);
                }}
                shortText="Google"
                disabled={isLoading}
              >
                Sign in with Google
              </SignInButton>
            </ThirdPartySignInContainers>
          </div>
        );
    }
  }, [
    confirmEmail,
    email,
    isLoading,
    reset,
    signIn,
    signInWithGoogle,
    signOut,
    state,
  ]);

  return <Container ref={ref}>{content}</Container>;
});

export default SignInPopOut;
