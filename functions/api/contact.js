// Cloudflare Pages Function: POST /api/contact
// Inoltra il messaggio del form a TO_EMAIL tramite Resend (https://resend.com).
//
// Variabili d'ambiente (Pages > Settings > Variables and Secrets):
//   RESEND_API_KEY  (secret, obbligatoria)
//   TO_EMAIL        (opzionale, default pierluigidirita@outlook.it)
//   FROM_EMAIL      (opzionale, default "Sito Pierluigi <onboarding@resend.dev>")

const DEFAULT_TO = "pierluigidirita@outlook.it";
const DEFAULT_FROM = "Sito Pierluigi <onboarding@resend.dev>";
const GOALS = {
  riabilitazione: "Riabilitazione",
  benessere: "Crescita personale",
  muscoli: "Crescita muscolare",
  atletica: "Preparazione atletica",
};
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const clean = (value, max) => (typeof value === "string" ? value.trim().slice(0, max) : "");

export async function onRequestPost({ request, env }) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Richiesta non valida." }, 400);
  }

  // Honeypot: i bot compilano il campo nascosto, le persone no.
  if (clean(payload.website, 100)) return json({ ok: true });

  const name = clean(payload.name, 100);
  const contact = clean(payload.contact, 150);
  const message = clean(payload.message, 2000);
  const goal = GOALS[clean(payload.goal, 20)] || "Non specificato";

  if (!name || !contact) {
    return json({ error: "Inserisci nome e un recapito." }, 400);
  }
  if (!env.RESEND_API_KEY) {
    return json({ error: "Invio non configurato." }, 500);
  }

  const replyTo = EMAIL_RE.test(contact) ? contact : undefined;
  const text = [
    `Nome: ${name}`,
    `Recapito: ${contact}`,
    `Obiettivo: ${goal}`,
    "",
    message || "(nessun messaggio)",
  ].join("\n");
  const html = `
    <h2 style="margin:0 0 12px">Nuova richiesta dal sito</h2>
    <p><strong>Nome:</strong> ${escapeHtml(name)}<br>
    <strong>Recapito:</strong> ${escapeHtml(contact)}<br>
    <strong>Obiettivo:</strong> ${escapeHtml(goal)}</p>
    <p style="white-space:pre-wrap">${escapeHtml(message || "(nessun messaggio)")}</p>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.FROM_EMAIL || DEFAULT_FROM,
      to: [env.TO_EMAIL || DEFAULT_TO],
      reply_to: replyTo,
      subject: `Nuova richiesta da ${name} · ${goal}`,
      text,
      html,
    }),
  });

  if (!res.ok) {
    console.error("Resend error", res.status, await res.text());
    return json({ error: "Non sono riuscito a inviare il messaggio." }, 502);
  }
  return json({ ok: true });
}

export const onRequest = () => json({ error: "Metodo non consentito." }, 405);
