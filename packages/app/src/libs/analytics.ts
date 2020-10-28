import firebase from 'firebase/app';

type LogEventFn = ReturnType<typeof firebase.analytics>['logEvent'];

export const logEvent: LogEventFn = (...args: Parameters<LogEventFn>) => {
  if (window.location.hostname !== 'localhost') {
    firebase.analytics().logEvent(...args);
  }
};
