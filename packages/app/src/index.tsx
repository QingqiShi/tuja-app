import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import firebase from 'firebase/app';
import 'firebase/analytics';
import 'firebase/performance';
import './index.css';
import { setAnalyticsSupport } from './libs/analytics';
import App from './App';
import * as serviceWorker from './serviceWorker';

Sentry.init({
  dsn:
    'https://de80755a62ab40938ee851877d57417e@o527329.ingest.sentry.io/5643505',
  integrations: [new Integrations.BrowserTracing()],
  tracesSampleRate: 1.0,
});

firebase.initializeApp({
  apiKey: 'AIzaSyBHHoqcowFL7iaC2LP6QrP-pQyxUCqB3QM',
  authDomain: 'portfolio-mango.firebaseapp.com',
  databaseURL: 'https://portfolio-mango.firebaseio.com',
  projectId: 'portfolio-mango',
  storageBucket: 'portfolio-mango.appspot.com',
  messagingSenderId: '145026996121',
  appId: '1:145026996121:web:55ed0fda14434ae6656508',
  measurementId: 'G-EFQ8TK3ZR3',
});

(async () => {
  const isAnalyticsSupported = await firebase.analytics.isSupported();
  setAnalyticsSupport(isAnalyticsSupported);
  if (window.location.hostname === 'localhost') {
    if (isAnalyticsSupported) {
      firebase.analytics().setAnalyticsCollectionEnabled(false);
    }
  } else {
    if (isAnalyticsSupported) {
      firebase.analytics();
    }
    firebase.performance();
  }
})();

ReactDOM.render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={'An error has occurred'}>
      <HelmetProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </HelmetProvider>
    </Sentry.ErrorBoundary>
  </StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
