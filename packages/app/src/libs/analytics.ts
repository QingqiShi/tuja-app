import firebase from 'firebase/app';

type LogEventFn = ReturnType<typeof firebase.analytics>['logEvent'];

let analyticsSupported = { supported: true };
export const setAnalyticsSupport = (isSupported: boolean) => {
  analyticsSupported.supported = isSupported;
};

export const logEvent: LogEventFn = (...args: Parameters<LogEventFn>) => {
  if (
    window.location.hostname !== 'localhost' &&
    analyticsSupported.supported
  ) {
    firebase.analytics().logEvent(...args);
  }
};

export const setAnalyticsUser = (user: firebase.User) => {
  if (
    window.location.hostname !== 'localhost' &&
    analyticsSupported.supported
  ) {
    firebase.analytics().setUserId(user.uid);
  }
};
