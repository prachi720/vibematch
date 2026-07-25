// Edge Runtime config
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  return new Response(
    JSON.stringify({ 
      status: 'healthy', 
      timestamp: new Date().toISOString() 
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
