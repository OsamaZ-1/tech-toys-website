// netlify/functions/myFunction.js

// In-memory cache variables
let cache = null;
let lastFetched = 0;
const CACHE_TTL = 300 * 1000; // 1 minute TTL (adjust as needed)

export async function handler(event, context) {
  const url = process.env.APPS_SCRIPT_URL;

  // Determine fetch options
  const options = {
    method: event.httpMethod,
    headers: { "Content-Type": "application/json" },
  };

  // Forward POST body
  if (event.httpMethod === "POST") {
    options.body = event.body;
  }

  // Forward GET query parameters
  let fetchUrl = url;
  if (event.httpMethod === "GET" && event.queryStringParameters) {
    const query = new URLSearchParams(event.queryStringParameters).toString();
    fetchUrl = query ? `${url}?${query}` : url;
  }

  // Only cache GET requests (POST usually changes data)
  if (event.httpMethod === "GET") {
    const now = Date.now();

    if (cache && now - lastFetched < CACHE_TTL) {
      // Return cached data
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Cache-Control": `public, max-age=${CACHE_TTL / 1000}`, // optional CDN caching
        },
        body: JSON.stringify(cache),
      };
    }
  }

  try {
    const response = await fetch(fetchUrl, options);
    const data = await response.json();

    // Save GET responses to cache
    if (event.httpMethod === "GET") {
      cache = data;
      lastFetched = Date.now();
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": `public, max-age=${CACHE_TTL / 1000}`,
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
}
