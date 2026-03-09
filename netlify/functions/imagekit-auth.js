import crypto from "crypto";

export async function handler(event) {
  // Handle preflight CORS requests
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders(), body: "" };
  }

  try {
    const privateKey = process.env.ImageKit_Key;
    const publicKey = process.env.ImageKit_PublicKey;
    const urlEndpoint = "https://ik.imagekit.io/techtoys";

    // 1. Generate token and expire
    const token = Math.random().toString(36).substring(2);        // random string
    const expire = (Math.floor(Date.now() / 1000) + 600).toString(); // expires in 10 min, string

    // HMAC-SHA1 of "token + expire" using privateKey
    const hmac = crypto.createHmac("sha1", process.env.ImageKit_Key);
    hmac.update(token + expire);
    const signature = hmac.digest("hex");

    // 3. Return auth parameters to frontend
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ token, expire, signature, publicKey, urlEndpoint })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}