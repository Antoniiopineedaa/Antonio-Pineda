# Caso Cero — Web de Antonio Pineda

Tu web está lista. Tienes **dos formas** de gestionarla, elige la que prefieras:

- **La fácil (recomendada): el Panel.** Abre `admin.html` en tu navegador y edítalo
  todo con botones (sección ⭐ de abajo).
- **La manual:** editar `lib/data.js` con el Bloc de notas (resto de la guía).

---

## ⭐ Tu Panel de administrador — `admin.html`

Es tu centro de control visual para **añadir, editar, borrar y ordenar casos**,
**pegar el vídeo de YouTube** (y ver la miniatura al instante) y cambiar tus ajustes,
**sin tocar nada de código**.

**Cómo funciona (importante):** tu web es estática, así que el Panel no "guarda" en el
servidor directamente; **genera los archivos** para que tú los subas. Es muy fácil:

1. Abre `admin.html` (doble clic, o desde la web en `/admin.html`). Tus cambios se
   guardan solos en el navegador mientras trabajas.
2. Edita ajustes y casos. Para un caso nuevo: **+ Añadir caso**, rellena, pega el enlace
   de YouTube (la miniatura aparece sola) y escribe el texto gratis y el adelanto.
3. Pulsa **Descargar data.js**. En cada caso, pulsa **HTML** para bajar su artículo.
4. Sube esos archivos a Hostinger (Administrador de archivos):
   - `data.js` → carpeta `/lib/` (reemplaza el que hay).
   - `caso-XX.html` → carpeta `/articulos/`.
5. Recuerda subir cambios de versión si hace falta (ver punto 5, la caché).

**Privacidad:** el Panel es solo para ti. No hace falta subir `admin.html` ni `admin.js`
a la web pública; puedes usarlos en tu ordenador. Si los subes, cualquiera podría
*generar* archivos, pero **no** modificar tu web (no tiene acceso a tu servidor).

---

## 1. La forma manual: `lib/data.js`

Es tu **panel de control**. Ahí cambias:
- Tu marca, tu correo y tus redes.
- El enlace de **Beehiiv** (suscripción + cobro).
- La lista de números de la newsletter.

Ábrelo, lee los comentarios (las líneas que empiezan con `//`) y edita lo que quieras.
**No necesitas tocar el HTML ni el CSS** para añadir contenido.

---

## 2. Conectar el cobro y las suscripciones (Beehiiv)

La web es preciosa pero "estática": por sí sola no puede cobrar. El cobro y el envío
de correos los hace **Beehiiv** (gratis para empezar; el pago premium va con Stripe).

**Pasos (una sola vez):**
1. Crea tu publicación en [beehiiv.com](https://www.beehiiv.com/).
2. Activa las suscripciones de pago (Settings → Monetization → Paid Subscriptions).
3. Copia la URL de tu página de suscripción, algo como
   `https://casocero.beehiiv.com/subscribe`.
4. Pégala en `lib/data.js`, dentro de `beehiiv:` → `subscribeUrl`.

A partir de ahí, cuando alguien escriba su correo en la web, le llevamos a tu página
de Beehiiv **con el correo ya escrito**. Beehiiv se encarga del resto.

> **Opcional:** si prefieres incrustar el formulario nativo de Beehiiv (con su diseño),
> copia la URL del "embed" (Beehiiv → Subscribe Forms → Embed) y pégala en `embedUrl`.
> Si lo rellenas, la web mostrará ese formulario en vez del nuestro.

---

## 3. Añadir un número nuevo de la newsletter

1. **Copia** el archivo `articulos/caso-01.html` y renómbralo, p. ej. `articulos/caso-02.html`.
2. Ábrelo y cambia:
   - El `<title>` y la descripción de arriba.
   - El número del expediente y el título.
   - En la "portada" (`yt-cover`): pon el **ID de tu vídeo** de YouTube en `data-yt="..."`
     y el enlace completo en `href="..."`. (El ID es lo que va después de `v=` en la URL
     de YouTube: en `youtube.com/watch?v=ABC123`, el ID es `ABC123`.)
   - El texto: lo que va **antes** del bloque `paywall` se ve gratis (el gancho).
     Lo que va dentro de `paywall-fade` sale **difuminado** como adelanto.
     ⚠️ No pegues ahí el artículo entero: solo 1–2 párrafos de adelanto. El texto
     completo lo entregas a tus suscriptores por Beehiiv.
3. **Apunta el número en `lib/data.js`**: copia uno de los bloques `{ ... }` de la lista
   `newsletters`, pégalo **arriba del todo** (el más nuevo va primero) y rellena sus datos,
   incluido `file: "articulos/caso-02.html"`.
4. Guarda. El número aparecerá solo en la home y en la página de la newsletter.

---

## 4. Tus fotos

- `assets/img/antonio-cutout.png` → tu **recorte** (fondo transparente). Es el que
  aparece flotando en la portada y en "Sobre mí", sobre el verde de marca.
- `assets/img/og-card.png` → la **tarjeta para redes** (1200×630): cuando compartas
  un enlace en WhatsApp, X, LinkedIn, etc., se verá esta imagen tuya sobre el verde.

Si cambias el recorte, mantén el nombre `antonio-cutout.png`. Ideal: vertical, fondo
transparente. (Si quieres que regenere la tarjeta de redes con otra foto, pídemelo.)

## 4 bis. SEO — pon tu dominio real

La web ya viene preparada para Google (títulos, descripciones, Open Graph, Twitter,
datos estructurados JSON-LD, `sitemap.xml` y `robots.txt`). Solo falta **una cosa**:
cambiar el dominio de ejemplo `antoniopinedaguerrero.com` por el tuyo de verdad.

Busca y reemplaza `https://antoniopinedaguerrero.com` por tu dominio en estos archivos:
`index.html`, `sobre-mi.html`, `newsletter.html`, `articulos/caso-01.html`,
`sitemap.xml` y `robots.txt`.

Después de subir la web, date de alta gratis en **Google Search Console** y envía
`https://tudominio.com/sitemap.xml`: así Google la indexa antes.

---

## 5. Subir la web a internet (Hostinger)

1. Entra en tu hosting → **Administrador de archivos**.
2. Sube **todo el contenido de esta carpeta** a `public_html`
   (incluido el archivo oculto `.htaccess`, que evita que se quede "pillada" la versión vieja).
3. Listo: `index.html` se abre solo como página principal.

Puedes arrastrar la carpeta también a **Netlify** o **Cloudflare Pages** y funciona igual.

> **Si subes cambios y no los ves:** es la caché. Abre `index.html`, `sobre-mi.html`,
> `newsletter.html` y los artículos, y cambia el número `?v=20260623` por la fecha de hoy
> (`?v=20260815`, por ejemplo) en las líneas de `styles.css`, `data.js` y `main.js`.
> Eso fuerza al navegador a cargar lo nuevo.

---

## 6. Probar la web en tu ordenador

Haz doble clic en `index.html`. Funciona casi todo en local.
(El formulario de suscripción solo "salta" de verdad cuando hayas puesto tu URL de Beehiiv.)

---

## 7. Notas

- La carpeta `assets/photos/source/` guarda tu foto original; puedes borrarla para aligerar.
- La carpeta `tools/` es de desarrollo; puedes ignorarla o borrarla.
- Los textos de ejemplo (el caso del corredor, etc.) son ilustrativos: reemplázalos por los tuyos.
- Todo el sitio recuerda que eres **estudiante de medicina** y aclara que es divulgación,
  no consejo médico.

¿Dudas? Cualquier cambio de copy, color o estructura, pídemelo y lo ajusto.
