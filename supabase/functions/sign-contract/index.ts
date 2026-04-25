import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase service role environment variables.");
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (request.method === "GET") {
      const url = new URL(request.url);
      const workspaceId = String(url.searchParams.get("ws") || "").trim();
      const contractToken = String(url.searchParams.get("ct") || "").trim();
      const writeToken = String(url.searchParams.get("wt") || "").trim();
      const { contract } = await loadAuthorizedContract(workspaceId, contractToken, writeToken);
      return jsonResponse({ contract: sanitizeContract(contract) });
    }

    if (request.method === "POST") {
      const payload = await request.json();
      const workspaceId = String(payload.ws || "").trim();
      const contractToken = String(payload.ct || "").trim();
      const writeToken = String(payload.wt || "").trim();
      const signerName = String(payload.signerName || "").trim();
      const imageData = String(payload.imageData || "").trim();
      const userAgent = String(payload.userAgent || "").trim();
      const fallbackContract = payload.fallbackContract;

      if (!signerName) return errorResponse("缺少签署人姓名。", 400);
      if (!imageData.startsWith("data:image/")) return errorResponse("签名图片格式无效。", 400);

      const { row, store, contract } = await loadAuthorizedContract(workspaceId, contractToken, writeToken, fallbackContract);
      const now = new Date().toISOString();
      const snapshot = contract.snapshot || buildSnapshot(contract, store);
      const signature = {
        signerName,
        imageData,
        confirmedAt: contract.confirmedAt || now,
        signedAt: now,
        userAgent,
      };
      signature.snapshotHash = await makeSnapshotHash(snapshot, signature);

      contract.status = "signed";
      contract.confirmedAt = contract.confirmedAt || signature.confirmedAt;
      contract.signedAt = signature.signedAt;
      contract.signature = signature;
      contract.updatedAt = now;
      contract.snapshot = {
        ...(snapshot || {}),
        fields: {
          ...(snapshot?.fields || contract.fields || {}),
          partyASignDate: snapshot?.fields?.partyASignDate || contract.fields?.partyASignDate || "",
          partyASignature: snapshot?.fields?.partyASignature || contract.fields?.partyASignature || "",
        },
        clauses: clone(snapshot?.clauses || []),
        clauseVersion: snapshot?.clauseVersion || "",
        clauseSeedVersion: snapshot?.clauseSeedVersion || "",
        publishedAt: contract.publishedAt || snapshot?.publishedAt || now,
        signature: clone(signature),
        signedAt: signature.signedAt,
      };
      contract.audit = Array.isArray(contract.audit) ? contract.audit : [];
      contract.audit.push({
        action: "乙方签署",
        detail: `${signerName} 完成合同签署`,
        at: now,
      });

      const { error } = await admin
        .from("workspace_state")
        .update({ payload: store })
        .eq("workspace_id", row.workspace_id);

      if (error) throw error;

      return jsonResponse({ contract: sanitizeContract(contract) });
    }

    return errorResponse("不支持的请求方法。", 405);
  } catch (error) {
    console.error(error);
    return errorResponse(error instanceof Error ? error.message : "签署服务异常。", 500);
  }
});

async function loadAuthorizedContract(
  workspaceId: string,
  contractToken: string,
  writeToken: string,
  fallbackContract?: Record<string, unknown>,
) {
  if (!workspaceId || !contractToken || !writeToken) {
    throw new Error("签署链接缺少必要参数。");
  }

  const { data: row, error } = await admin
    .from("workspace_state")
    .select("workspace_id,payload")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (error) throw error;
  if (!row) {
    throw new Error("未找到对应的合同工作区。");
  }

  const store = normalizeStore(row.payload);
  let contract = store.contracts.find((item: Record<string, unknown>) => item && item.token === contractToken);

  if (!contract && fallbackContract) {
    contract = restoreFallbackContract(store, fallbackContract, contractToken, writeToken);
  }

  if (!contract) {
    throw new Error("未找到对应的合同。");
  }

  if (String(contract.signWriteToken || "") !== writeToken) {
    const authError = new Error("签署链接已失效或权限无效。");
    authError.name = "Forbidden";
    throw authError;
  }

  if (!contract.snapshot) {
    contract.snapshot = buildSnapshot(contract, store);
  }

  return { row, store, contract };
}

function sanitizeContract(contract: Record<string, unknown>) {
  return {
    id: contract.id,
    status: contract.status,
    token: contract.token,
    fields: clone(contract.fields || {}),
    snapshot: clone(contract.snapshot || null),
    signature: clone(contract.signature || null),
    confirmedAt: contract.confirmedAt || "",
    signedAt: contract.signedAt || "",
    publishedAt: contract.publishedAt || "",
    updatedAt: contract.updatedAt || "",
  };
}

function normalizeStore(payload: Record<string, unknown>) {
  const next = payload && typeof payload === "object" ? clone(payload) : {};
  next.contracts = Array.isArray(next.contracts) ? next.contracts : [];
  return next as { contracts: Array<Record<string, unknown>> };
}

function restoreFallbackContract(
  store: { contracts: Array<Record<string, unknown>> },
  fallbackContract: Record<string, unknown>,
  contractToken: string,
  writeToken: string,
) {
  const normalized = normalizeFallbackContract(fallbackContract, contractToken, writeToken);
  if (!normalized) return null;
  store.contracts.push(normalized);
  return normalized;
}

function normalizeFallbackContract(
  fallbackContract: Record<string, unknown>,
  contractToken: string,
  writeToken: string,
) {
  if (!fallbackContract || typeof fallbackContract !== "object") return null;
  const token = String(fallbackContract.token || "").trim();
  if (!token || token !== contractToken) return null;
  const snapshot = fallbackContract.snapshot && typeof fallbackContract.snapshot === "object"
    ? clone(fallbackContract.snapshot)
    : null;
  const fields = fallbackContract.fields && typeof fallbackContract.fields === "object"
    ? clone(fallbackContract.fields)
    : clone(snapshot?.fields || {});
  const publishedAt = String(
    fallbackContract.publishedAt
      || snapshot?.publishedAt
      || fallbackContract.updatedAt
      || new Date().toISOString(),
  );
  return {
    id: String(fallbackContract.id || `share-${crypto.randomUUID()}`),
    status: String(fallbackContract.status || "published"),
    token,
    signWriteToken: writeToken,
    fields,
    snapshot,
    signature: clone(fallbackContract.signature || snapshot?.signature || null),
    confirmedAt: String(fallbackContract.confirmedAt || ""),
    signedAt: String(fallbackContract.signedAt || ""),
    publishedAt,
    updatedAt: String(fallbackContract.updatedAt || fallbackContract.signedAt || publishedAt),
    createdAt: String(fallbackContract.createdAt || publishedAt.slice(0, 10)),
    audit: Array.isArray(fallbackContract.audit) ? clone(fallbackContract.audit) : [],
  };
}

function buildSnapshot(contract: Record<string, unknown>, store: Record<string, unknown>) {
  const clauseVersions = Array.isArray(store.clauseVersions) ? store.clauseVersions : [];
  const activeClauseVersionId = String(store.activeClauseVersionId || "");
  const activeVersion =
    clauseVersions.find((version: Record<string, unknown>) => version.id === activeClauseVersionId) ||
    clauseVersions[clauseVersions.length - 1] ||
    {};

  return {
    fields: clone(contract.fields || {}),
    clauses: clone(activeVersion.sections || []),
    clauseVersion: activeVersion.version || "",
    clauseSeedVersion: activeVersion.seedVersion || "",
    publishedAt: contract.publishedAt || new Date().toISOString(),
  };
}

async function makeSnapshotHash(snapshot: unknown, signature: Record<string, string>) {
  const payload = JSON.stringify({
    snapshot,
    signature: {
      signerName: signature.signerName,
      signedAt: signature.signedAt,
      userAgent: signature.userAgent,
    },
  });
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function clone<T>(value: T): T {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, status);
}
