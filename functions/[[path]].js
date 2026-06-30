export async function onRequest(context) {
  const { request, next } = context;
  if (request.method === 'GET') {
    return next();
  }
  return new Response('Method Not Allowed', { status: 405 });
}
