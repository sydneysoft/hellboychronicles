const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store, max-age=0");
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const siteKey = String(process.env.RECAPTCHA_SITE_KEY || "").trim();
  const secretKey = String(process.env.RECAPTCHA_SECRET_KEY || "").trim();
  if (!siteKey && !secretKey) return response.status(200).json({ ok: true, enabled: false });
  if (!siteKey || !secretKey) return response.status(503).json({ ok: false, enabled: false, error: "recaptcha_configuration_incomplete" });

  const token = String(request.body?.token || "").trim();
  const action = String(request.body?.action || "storylingo_visit").trim();
  if (!token) return response.status(400).json({ ok: false, enabled: true, error: "missing_token" });

  try {
    const body = new URLSearchParams({ secret: secretKey, response: token });
    const verifyResponse = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });
    const result = await verifyResponse.json().catch(() => ({}));
    const minScore = Math.max(0, Math.min(1, Number(process.env.RECAPTCHA_MIN_SCORE || 0.5)));
    const score = Number(result?.score ?? 0);
    const ok = verifyResponse.ok && result?.success === true && result?.action === action && score >= minScore;

    return response.status(ok ? 200 : 403).json({
      ok,
      enabled: true,
      score,
      action: result?.action || null,
      hostname: result?.hostname || null,
      error: ok ? null : "verification_failed",
    });
  } catch {
    return response.status(503).json({ ok: false, enabled: true, error: "verification_unavailable" });
  }
}
