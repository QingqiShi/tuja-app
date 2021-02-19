import { setAnalyticsSupport, logEvent, setAnalyticsUser } from './analytics';

const mockLogEvent = jest.fn();
const mockSetUserId = jest.fn();
jest.mock('firebase/app', () => ({
  analytics: () => ({ logEvent: mockLogEvent, setUserId: mockSetUserId }),
}));

beforeEach(() => {
  jest
    .spyOn(window, 'location', 'get')
    .mockImplementation(() => ({ hostname: 'tuja.app' } as any));
});

test('log event', () => {
  setAnalyticsSupport(true);
  logEvent('test');
  expect(mockLogEvent).toHaveBeenCalledWith('test');
});

test('set user id', () => {
  setAnalyticsSupport(true);
  setAnalyticsUser({ uid: 'test-user' } as any);
  expect(mockSetUserId).toHaveBeenCalledWith('test-user');
});
