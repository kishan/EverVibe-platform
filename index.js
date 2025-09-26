import 'dotenv/config';
import express from "express";
import crypto from "crypto";

const app = express();
app.use(express.json());

// --- Env ---
const {
  PORT = 3000,
  VAPI_API_KEY,
  VAPI_ASSISTANT_ID,
  VAPI_PHONE_NUMBER_ID,
  VAPI_WEBHOOK_SECRET, // optional for webhook signature verification
} = process.env;

if (!VAPI_API_KEY) {
  console.error("Missing VAPI_API_KEY in env");
  process.exit(1);
}

// --- Helpers ---
async function vapiCall({ assistantId, phoneNumberId, customerNumber, metadata, idempotencyKey }) {
  const body = {
    assistantId: assistantId || VAPI_ASSISTANT_ID,
    phoneNumberId: phoneNumberId || VAPI_PHONE_NUMBER_ID,
    customerNumber,
    metadata: metadata || {},
  };

  const res = await fetch("https://api.vapi.ai/call", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VAPI_API_KEY}`,
      "Content-Type": "application/json",
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Vapi error ${res.status}: ${text}`);
  }
  return res.json();
}

function requireFields(obj, fields) {
  const missing = fields.filter((f) => obj[f] == null || obj[f] === "");
  if (missing.length) {
    const err = new Error(`Missing required field(s): ${missing.join(", ")}`);
    err.status = 400;
    throw err;
  }
}

// --- Routes ---

// Health check
app.get("/health", (_req, res) => res.json({ ok: true, service: "evervibe-vapi-outbound" }));

/**
 * POST /call
 * Body:
 * {
 *   "customerNumber": "+14155551234",
 *   "assistantId": "optional-override",
 *   "phoneNumberId": "optional-override",
 *   "metadata": { "userId": "abc123", "reason": "evening-checkin" }
 * }
 */
app.post("/call", async (req, res) => {
  try {
    requireFields(req.body, ["customerNumber"]);
    const idempotencyKey =
      req.headers["idempotency-key"] ||
      crypto.createHash("sha256").update(JSON.stringify(req.body)).digest("hex");

    const result = await vapiCall({
      assistantId: req.body.assistantId,
      phoneNumberId: req.body.phoneNumberId,
      customerNumber: req.body.customerNumber,
      metadata: req.body.metadata,
      idempotencyKey,
    });

    res.status(202).json({ ok: true, id: result.id, idempotencyKey });
  } catch (err) {
    res.status(err.status || 500).json({ ok: false, error: err.message });
  }
});

/**
 * POST /vapi/webhook
 * Optional: verify signature if Vapi sends one (customize header name & algo as needed).
 */
app.post("/vapi/webhook", (req, res) => {
  try {
    if (VAPI_WEBHOOK_SECRET) {
      const signature = req.header("x-vapi-signature");
      const computed = crypto
        .createHmac("sha256", VAPI_WEBHOOK_SECRET)
        .update(JSON.stringify(req.body))
        .digest("hex");
      if (signature !== computed) {
        return res.status(401).json({ ok: false, error: "Invalid signature" });
      }
    }

    // Handle events: started, completed, failed, transcript available, etc.
    const { type, data } = req.body || {};
    console.log(`[VAPI EVENT] ${type}`, data);

    // Example: store outcome to Airtable (stub)
    // await airtableUpsert({ callId: data.id, status: type, ... });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`evervibe-vapi-outbound listening on :${PORT}`);
});