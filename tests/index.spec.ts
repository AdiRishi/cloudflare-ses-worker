import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '~/index';

describe('Hello World worker', () => {
  it('responds to /ping (unit style)', async () => {
    const request = new Request('http://example.com/ping');
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, env, ctx);
    await waitOnExecutionContext(ctx);
    expect(await response.text()).toEqual('pong');
  });

  it('responds to /ping (integration style)', async () => {
    const response = await SELF.fetch('https://example.com/ping');
    expect(await response.text()).toEqual('pong');
  });
});
