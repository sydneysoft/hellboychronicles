export default function handler(request, response) {
  const siteKey = String(process.env.RECAPTCHA_SITE_KEY || "").trim();
  const secretKey = String(process.env.RECAPTCHA_SECRET_KEY || "").trim();
  const enabled = Boolean(siteKey && secretKey);

  response.setHeader("Cache-Control", "no-store, max-age=0");
  response.status(200).json({ enabled, siteKey: enabled ? siteKey : "", provider: "google-recaptcha-v3" });
}
