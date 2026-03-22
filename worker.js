export default {
  async fetch(request, env) {
    try {
      return await env.ASSETS.fetch(request);
    } catch {
      const url = new URL(request.url);
      url.pathname = '/';
      return env.ASSETS.fetch(new Request(url.toString(), request));
    }
  }
};
