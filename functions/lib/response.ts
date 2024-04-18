export function json(body: object, status = 200) {
  const response = new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*", // Allows all domains
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", // Specify methods
      "Access-Control-Allow-Headers": "Content-Type" // Specify headers
    }
  });
  return response;
}

export function error(message: string, status: number) {
  const response = new Response(JSON.stringify({ error: message }, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*", // Allows all domains
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", // Specify methods
      "Access-Control-Allow-Headers": "Content-Type" // Specify headers
    }
  });
  return response;
}
