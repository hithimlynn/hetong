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
  const startedAt = Date.now();
  const requestId = makeRequestId();
  res.setHeader("X-Signer-Request-Id", requestId);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (!["GET", "POST"].includes(req.method)) {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  let timeout;
  try {
    const upstreamUrl = buildUpstreamUrl(req);
    const controller = new AbortController();
    timeout = setTimeout(() => controller.abort(), 25000);
    const body = req.method === "POST" ? await buildPostBody(req) : undefined;
    const bodyBytes = body ? Buffer.byteLength(body, "utf8") : 0;

    const upstreamResponse = await fetch(upstreamUrl, {
      method: req.method,
      headers: req.method === "POST"
        ? { "Content-Type": "text/plain;charset=UTF-8" }
        : undefined,
      body,
      signal: controller.signal,
    });

    clearTimeout(timeout);
    timeout = null;

    const text = await upstreamResponse.text();
    const data = parseJson(text);

    if (!upstreamResponse.ok) {
      const upstreamError = data && data.error ? String(data.error) : summarizeText(text);
      console.error("[sign-contract] upstream failed", {
        requestId,
        method: req.method,
        status: upstreamResponse.status,
        durationMs: Date.now() - startedAt,
        bodyBytes,
        error: upstreamError,
      });
      sendJson(res, upstreamResponse.status, {
        error: normalizeUpstreamError(upstreamError, upstreamResponse.status),
        upstreamStatus: upstreamResponse.status,
        upstreamError,
        requestId,
      });
      return;
    }

    console.info("[sign-contract] upstream ok", {
      requestId,
      method: req.method,
      status: upstreamResponse.status,
      durationMs: Date.now() - startedAt,
      bodyBytes,
    });
    sendJson(res, upstreamResponse.status, data || {});
  } catch (error) {
    if (timeout) clearTimeout(timeout);
    const aborted = error && error.name === "AbortError";
    const message = aborted ? "Signer gateway timed out." : "Signer gateway request failed.";
    console.error("[sign-contract] gateway failed", {
      requestId,
      method: req.method,
      durationMs: Date.now() - startedAt,
      error: error && error.message ? error.message : String(error),
    });
    sendJson(res, aborted ? 504 : 502, { error: message, requestId });
  }
};

function makeRequestId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

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

async function buildPostBody(req) {
  const payload = parsePayload(await readBody(req));
  const query = req.query || {};
  ["ws", "ct", "wt"].forEach((key) => {
    if (!payload[key] && query[key] != null) {
      payload[key] = Array.isArray(query[key]) ? String(query[key][0] || "") : String(query[key]);
    }
  });
  return JSON.stringify(payload);
}

function readBody(req) {
  if (req.body != null) {
    return Promise.resolve(req.body);
  }
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function parsePayload(raw) {
  if (raw && typeof raw === "object" && !Buffer.isBuffer(raw)) return { ...raw };
  const text = Buffer.isBuffer(raw) ? raw.toString("utf8") : String(raw || "");
  if (!text.trim()) return {};
  if (/^\s*[\[{]/.test(text)) {
    return JSON.parse(text);
  }
  const payload = {};
  const params = new URLSearchParams(text);
  for (const [key, value] of params.entries()) payload[key] = value;
  return payload;
}

function parseJson(text) {
  try {
    return text ? JSON.parse(text) : {};
  } catch (error) {
    return { error: summarizeText(text) };
  }
}

function normalizeUpstreamError(message, status) {
  if (/Internal Server Error/i.test(message)) {
    return "Signer service is temporarily unavailable. Please retry.";
  }
  if (/timeout|timed out/i.test(message)) {
    return "Signer service timed out. Please retry.";
  }
  if (/Forbidden|invalid|expired|permission|not allowed/i.test(message)) {
    return "Signer link is invalid. Please ask party A to publish again.";
  }
  return message || `Signer service failed with status ${status}.`;
}

function summarizeText(text) {
  return String(text || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 500);
}

function sendJson(res, status, payload) {
  res.status(status);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.json(payload);
}

function setCorsHeaders(res) {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
}
