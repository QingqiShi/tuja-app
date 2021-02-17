import { render, waitFor } from '@testing-library/react';
import { PortfolioProcessorProvider } from './usePortfolioProcessor';

jest.useFakeTimers();
(document as any).timeline = { currentTime: 500 };

test('render provider', async () => {
  const { getByText } = render(
    <PortfolioProcessorProvider>test</PortfolioProcessorProvider>
  );
  await waitFor(() => {});
  expect(getByText('test')).toBeInTheDocument();
});
