import crypto from "crypto";

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders(), body: "" };
  }

  try {
    // ImageKit keys from environment variables
    const privateKey = process.env.ImageKit_Key;
    const publicKey = process.env.ImageKit_PublicKey;
    const urlEndpoint = "https://ik.imagekit.io/techtoys";

    // Generate authentication parameters
    const expire = Math.floor(Date.now() / 1000) + 600; // expires in 10 minutes
    const token = Math.random().toString(36).substring(2); // random string

    // Signature = sha1(privateKey + token + expire)
    const signature = crypto
      .createHash("sha1")
      .update(privateKey + token + expire)
      .digest("hex");

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        token,
        expire,
        signature,
        publicKey,
        urlEndpoint
      })
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