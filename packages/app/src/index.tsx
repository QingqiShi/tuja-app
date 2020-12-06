import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import firebase from 'firebase/app';
import 'firebase/analytics';
import 'firebase/performance';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

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

if (window.location.hostname === 'localhost') {
  firebase.analytics().setAnalyticsCollectionEnabled(false);
} else {
  firebase.analytics();
  firebase.performance();
}

ReactDOM.render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
