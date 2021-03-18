import { Helmet } from 'react-helmet-async';
import useScrollToTopOnMount from '../../hooks/useScrollToTopOnMount';
import UserSignUp from '../../components/UserSignUp';

function SignIn() {
  useScrollToTopOnMount();

  return (
    <>
      <Helmet>
        <title>Sign in | Tuja App</title>
      </Helmet>
      <UserSignUp />
    </>
  );
}

export default SignIn;
