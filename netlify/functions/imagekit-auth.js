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

    // 2. Generate SHA1 signature = privateKey + token + expire
    const signature = crypto
      .createHash("sha1")
      .update(privateKey + token + expire)
      .digest("hex");

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