import { analytics } from 'firebase/app';

type LogEventFn = ReturnType<typeof analytics>['logEvent'];

export const logEvent: LogEventFn = (...args: Parameters<LogEventFn>) => {
  if (window.location.hostname !== 'localhost') {
    analytics().logEvent(...args);
  }
};
