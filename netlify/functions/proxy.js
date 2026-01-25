// netlify/functions/myFunction.js

// Cache per URL
const cache = new Map();
const CACHE_TTL = 60 * 1000; // 1 minute

export async function handler(event, context) {
  const url = process.env.APPS_SCRIPT_URL;

  if (!url) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "APPS_SCRIPT_URL is not defined" }),
    };
  }

  const options = {
    method: event.httpMethod,
    headers: { "Content-Type": "application/json" },
  };

  // Forward POST body
  if (event.httpMethod === "POST") {
    options.body = event.body;
  }

  // Build fetch URL (with query params)
  let fetchUrl = url;
  if (event.httpMethod === "GET" && event.queryStringParameters) {
    const query = new URLSearchParams(event.queryStringParameters).toString();
    fetchUrl = query ? `${url}?${query}` : url;
  }

  // 🔹 GET cache lookup (per URL)
  if (event.httpMethod === "GET") {
    const cached = cache.get(fetchUrl);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Cache-Control": `public, max-age=${CACHE_TTL / 1000}`,
        },
        body: JSON.stringify(cached.data),
      };
    }
  }

  try {
    const response = await fetch(fetchUrl, options);
    const data = await response.json();

    // 🔹 Store cache per URL
    if (event.httpMethod === "GET") {
      cache.set(fetchUrl, {
        data,
        timestamp: Date.now(),
      });
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


/*
export async function handler(event, context) {
  const url = process.env.APPS_SCRIPT_URL;

  // Determine fetch options
  const options = {
    method: event.httpMethod, // 'GET', 'POST', etc.
    headers: { "Content-Type": "application/json" },
  };

  // Forward POST body
  if (event.httpMethod === "POST") {
    options.body = event.body; // forward JSON string from frontend
  }

  // Forward GET query parameters
  let fetchUrl = url;
  if (event.httpMethod === "GET" && event.queryStringParameters) {
    const query = new URLSearchParams(event.queryStringParameters).toString();
    fetchUrl = query ? `${url}?${query}` : url;
  }

  try {
    const response = await fetch(fetchUrl, options);
    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // allow requests from your frontend
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
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
*/