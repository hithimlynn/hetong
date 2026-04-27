const UPSTREAM_URL =
  process.env.SUPABASE_SIGNER_UPSTREAM ||
  "https://fvffxmrqpvgenxqrourq.supabase.co/functions/v1/sign-contract";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
  "Cache-Control": "no-store",
};

module.exports = async (req, res) => {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (!["GET", "POST"].includes(req.method)) {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  try {
    const upstreamUrl = buildUpstreamUrl(req);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const upstreamResponse = await fetch(upstreamUrl, {
      method: req.method,
      headers: req.method === "POST"
        ? { "Content-Type": "text/plain;charset=UTF-8" }
        : undefined,
      body: req.method === "POST" ? serializeBody(req.body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const text = await upstreamResponse.text();
    const contentType = upstreamResponse.headers.get("content-type") || "application/json; charset=utf-8";

    res.status(upstreamResponse.status);
    res.setHeader("Content-Type", contentType);
    res.send(text);
  } catch (error) {
    const aborted = error && error.name === "AbortError";
    res.status(aborted ? 504 : 502).json({
      error: aborted ? "Signer gateway timed out." : "Signer gateway request failed.",
    });
  }
};

function buildUpstreamUrl(req) {
  if (req.method !== "GET") return UPSTREAM_URL;
  const url = new URL(UPSTREAM_URL);
  const query = req.query || {};
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      value.forEach((item) => url.searchParams.append(key, String(item)));
    } else if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

function serializeBody(body) {
  if (body == null) return "{}";
  if (typeof body === "string") return body;
  return JSON.stringify(body);
}

function setCorsHeaders(res) {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
}
