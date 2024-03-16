export type Env = {
  ENVIRONMENT: 'production' | 'development' | 'testing';
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return new Response('Hello World!');
  },
};
