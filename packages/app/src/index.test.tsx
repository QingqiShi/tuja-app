import ReactDOM from 'react-dom';

jest.mock('react-dom', () => ({ render: jest.fn() }));

const mockInitialiseApp = jest.fn();
const mockOnLock = jest.fn();
jest.mock('firebase/app', () => ({
  initializeApp: mockInitialiseApp,
  onLog: mockOnLock,
  analytics: { isSupported: () => false },
}));

const mockCaptureException = jest.fn();
const mockInit = jest.fn();
jest.mock('@sentry/react', () => ({
  init: mockInit,
  captureException: mockCaptureException,
  Severity: jest.requireActual('@sentry/react').Severity,
  ErrorBoundary: jest.requireActual('@sentry/react').ErrorBoundary,
}));

test('renders without crashing', () => {
  const div = document.createElement('div');
  div.id = 'root';
  document.body.appendChild(div);
  require('./index');
  expect(ReactDOM.render).toHaveBeenCalled();

  expect(mockInitialiseApp).toHaveBeenCalled();
  expect(mockInit).toHaveBeenCalled();

  // Send firebase logs to sentry
  expect(mockOnLock).toHaveBeenCalled();
  mockOnLock.mock.calls[0][0]({ args: ['test'], level: 'warn' });
  expect(mockCaptureException).toHaveBeenCalledWith(['test'], {
    level: 'warning',
  });
});
