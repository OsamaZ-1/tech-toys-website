export async function handler(event) {
  const url = process.env.APPS_SCRIPT_URL;

  if (!url) return { statusCode: 500, body: JSON.stringify({ error: "APPS_SCRIPT_URL not defined" }) };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders(), body: "" };
  }

  const options = { method: event.httpMethod, headers: { "Content-Type": "application/json" } };
  if (event.httpMethod === "POST") options.body = event.body;

  let fetchUrl = url;
  if (event.httpMethod === "GET" && event.queryStringParameters) {
    const query = new URLSearchParams(event.queryStringParameters).toString();
    fetchUrl = query ? `${url}?${query}` : url;
  }

  try {
    const response = await fetch(fetchUrl, options);
    const data = await response.json();

    const headers = {
      ...corsHeaders(),
      "Content-Type": "application/json",
      "Cache-Control": event.httpMethod === "GET" ? "public, max-age=5, stale-while-revalidate=300" : "no-store",
    };

    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ success: false, error: err.message }) };
  }
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
