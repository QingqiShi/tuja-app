import { Request, Response } from 'node-fetch';
import { handleStockLogo } from './handleStockLogo';

declare const global: { [key: string]: unknown };

// Setup worker globals
beforeAll(async () => {
  global.fetch = jest.fn();
  global.Response = Response;
});

test('convert ticker to website url using map', async () => {
  // Given
  (global.fetch as jest.Mock).mockReturnValue({
    blob: async () => new Blob(),
  });
  const request = new Request('http://localhost/stockLogo?ticker=AAPL.US');

  // When
  const response = await handleStockLogo(request as never);

  // Then
  expect(global.fetch as jest.Mock).toHaveBeenCalledWith(
    'http://logo.clearbit.com/apple.com?size=80',
    {
      cf: { cacheEverything: true, cacheTtl: 2592000 },
    }
  );
  expect(response.status).toBe(200);
});

test('specify size', async () => {
  // Given
  (global.fetch as jest.Mock).mockReturnValue({
    blob: async () => new Blob(),
  });
  const request = new Request(
    'http://localhost/stockLogo?ticker=AAPL.US&size=54'
  );

  // When
  await handleStockLogo(request as never);

  // Then
  expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe(
    'http://logo.clearbit.com/apple.com?size=54'
  );
});

test('ishares fallback', async () => {
  // Given
  (global.fetch as jest.Mock).mockReturnValue({
    blob: async () => new Blob(),
  });
  const request = new Request(
    'http://localhost/stockLogo?ticker=BLAH.LSE&name=iSharesBlah'
  );

  // When
  await handleStockLogo(request as never);

  // Then
  expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe(
    'http://logo.clearbit.com/ishares.com?size=80'
  );
});

test('vanguard fallback', async () => {
  // Given
  (global.fetch as jest.Mock).mockReturnValue({
    blob: async () => new Blob(),
  });
  const request = new Request(
    'http://localhost/stockLogo?ticker=BLAH.LSE&name=VanguardBlah'
  );

  // When
  await handleStockLogo(request as never);

  // Then
  expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe(
    'http://logo.clearbit.com/vanguard.com?size=80'
  );
});

test('invesco fallback', async () => {
  // Given
  (global.fetch as jest.Mock).mockReturnValue({
    blob: async () => new Blob(),
  });
  const request = new Request(
    'http://localhost/stockLogo?ticker=BLAH.LSE&name=InvescoBlah'
  );

  // When
  await handleStockLogo(request as never);

  // Then
  expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe(
    'http://logo.clearbit.com/invesco.com?size=80'
  );
});

test('hsbc fallback', async () => {
  // Given
  (global.fetch as jest.Mock).mockReturnValue({
    blob: async () => new Blob(),
  });
  const request = new Request(
    'http://localhost/stockLogo?ticker=BLAH.LSE&name=HSBCBlah'
  );

  // When
  await handleStockLogo(request as never);

  // Then
  expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe(
    'http://logo.clearbit.com/hsbc.com?size=80'
  );
});

test('error when missing ticker', async () => {
  // Given
  const request = new Request('http://localhost/stockLogo');

  // When
  const response = await handleStockLogo(request as never);

  // Then
  expect(global.fetch as jest.Mock).not.toHaveBeenCalled();
  expect(await response.text()).toBe('Missing ticker');
  expect(response.status).toBe(400);
});

test('return not found', async () => {
  // Given
  (global.fetch as jest.Mock).mockReturnValue({
    blob: async () => new Blob(),
  });
  const request = new Request(
    'http://localhost/stockLogo?ticker=BLAH.LSE&name=Blah'
  );

  // When
  const response = await handleStockLogo(request as never);

  // Then
  expect(global.fetch as jest.Mock).not.toHaveBeenCalled();
  expect(response.status).toBe(404);
});
