/* =============================================================================
   /api/subscribe  —  Buzón de correos (función de servidor en Vercel)
   -----------------------------------------------------------------------------
   Recibe un correo desde el formulario de la web y lo da de alta en Beehiiv
   (el plan gratis de Beehiiv incluye API). El front-end, al recibir "ok",
   desbloquea el contenido premium.

   La clave y el ID NO viven en el código: se leen de variables de entorno que
   pones tú en Vercel → Settings → Environment Variables:
     BEEHIIV_API_KEY         -> beehiiv → Settings → API (empieza por algo largo)
     BEEHIIV_PUBLICATION_ID  -> el ID de tu publicación (empieza por "pub_")
   ============================================================================= */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido" });
  }

  // El cuerpo puede llegar ya parseado o como texto.
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const email = (body && body.email ? String(body.email) : "").trim().toLowerCase();

  const valido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!valido) return res.status(400).json({ error: "Correo no válido" });

  const API_KEY = process.env.BEEHIIV_API_KEY;
  const PUB_ID = process.env.BEEHIIV_PUBLICATION_ID;
  if (!API_KEY || !PUB_ID) {
    console.error("[subscribe] Faltan BEEHIIV_API_KEY o BEEHIIV_PUBLICATION_ID en Vercel.");
    return res.status(500).json({ error: "El buzón aún no está configurado." });
  }

  try {
    const r = await fetch(
      `https://api.beehiiv.com/v2/publications/${PUB_ID}/subscriptions`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          reactivate_existing: true,
          send_welcome_email: true,
          utm_source: "web",
          referring_site: (body && body.source) || "antoniopinedaguerrero.com"
        })
      }
    );

    if (r.ok) return res.status(200).json({ ok: true });

    const detalle = await r.text().catch(() => "");
    console.error("[subscribe] Beehiiv respondió", r.status, detalle);
    return res.status(502).json({ error: "No se pudo registrar el correo. Inténtalo de nuevo." });
  } catch (e) {
    console.error("[subscribe] Error de red con Beehiiv:", e);
    return res.status(502).json({ error: "No se pudo conectar. Inténtalo de nuevo." });
  }
}
