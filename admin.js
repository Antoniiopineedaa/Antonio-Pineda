/* =============================================================================
   admin.js — Panel de Antonio (herramienta local)
   ---------------------------------------------------------------------------
   Edita ajustes y casos en una interfaz visual y GENERA los archivos listos
   para subir a Hostinger:  data.js  y los  articulos/caso-XX.html
   Guarda tu trabajo en el navegador (localStorage) para que no se pierda.
   No necesita servidor: todo ocurre en tu navegador.
   ============================================================================= */
(function () {
  "use strict";

  var LS_KEY = "casocero_admin_v1";
  var $ = function (s, sc) { return (sc || document).querySelector(s); };
  var $$ = function (s, sc) { return Array.prototype.slice.call((sc || document).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  };

  /* ---------- Estado ---------- */
  function fromSite() {
    var s = window.__SITE__ || {};
    return {
      config: {
        siteUrl: s.siteUrl || "https://antoniopinedaguerrero.com",
        brand: s.brand || "Antonio Pineda",
        role: s.role || "Estudiante de medicina",
        field: s.field || "Cardiología & Neurociencia",
        newsletterName: s.newsletterName || "Caso Cero",
        newsletterTagline: s.newsletterTagline || "",
        youtubeUrl: s.youtubeUrl || "",
        contactEmail: s.contactEmail || "",
        gaId: s.gaId || "",
        social: {
          youtube: (s.social && s.social.youtube) || "",
          linkedin: (s.social && s.social.linkedin) || "",
          instagram: (s.social && s.social.instagram) || ""
        }
      },
      newsletters: (s.newsletters || []).map(function (n) { return Object.assign({}, n); })
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return fromSite();
  }
  function save() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {}
    flashSaved();
  }
  var state = load();

  /* ---------- Utilidades ---------- */
  function ytId(input) {
    var v = (input || "").trim();
    if (!v) return "";
    var m = v.match(/(?:youtu\.be\/|v=|\/shorts\/|\/embed\/)([A-Za-z0-9_-]{6,})/);
    if (m) return m[1];
    if (/^[A-Za-z0-9_-]{6,}$/.test(v)) return v; // ya es un ID
    return "";
  }
  function ytUrl(id) { return id ? "https://www.youtube.com/watch?v=" + id : (state.config.youtubeUrl || ""); }
  function ytThumb(id) { return id ? "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg" : ""; }
  function slugFile(num) { return "articulos/caso-" + String(num || "").padStart(2, "0") + ".html"; }

  function download(filename, text, mime) {
    var blob = new Blob([text], { type: (mime || "text/plain") + ";charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
  }

  var savedTimer;
  function flashSaved() {
    var el = $("#adm-saved");
    if (!el) return;
    el.classList.add("show");
    clearTimeout(savedTimer);
    savedTimer = setTimeout(function () { el.classList.remove("show"); }, 1200);
  }

  /* ---------- Generar data.js ---------- */
  function genDataJs() {
    var c = state.config;
    var out = {
      brand: c.brand, role: c.role, field: c.field,
      newsletterName: c.newsletterName, newsletterTagline: c.newsletterTagline,
      youtubeUrl: c.youtubeUrl,
      social: c.social,
      contactEmail: c.contactEmail,
      gaId: c.gaId,
      siteUrl: c.siteUrl,
      newsletters: state.newsletters.map(function (n) {
        var clean = {};
        Object.keys(n).forEach(function (k) { if (k.charAt(0) !== "_") clean[k] = n[k]; });
        return clean;
      })
    };
    return "/* data.js — generado por el Panel de Antonio (admin.html). Súbelo a /lib/ */\n" +
           "(function(){ \"use strict\";\n  window.__SITE__ = " +
           JSON.stringify(out, null, 2).replace(/\n/g, "\n  ") +
           ";\n})();\n";
  }

  /* ---------- Generar artículo HTML ---------- */
  function paras(text) {
    return String(text || "").split(/\n\s*\n/).map(function (p) {
      return p.trim();
    }).filter(Boolean).map(function (p) {
      return "        <p>" + esc(p).replace(/\n/g, "<br>") + "</p>";
    }).join("\n");
  }

  function genArticleHtml(n) {
    var c = state.config;
    var a = n._article || {};
    var id = n.youtubeId || "";
    var url = n.youtubeUrl || ytUrl(id);
    var base = (c.siteUrl || "").replace(/\/$/, "");
    var canonical = base + "/" + slugFile(n.num);
    var title = n.title || "Caso";
    var desc = n.dek || "";
    var category = a.category || "Caso clínico";
    var gateTitle = a.gateTitle || "Sigue leyendo gratis";
    var gateText = a.gateText || ("Déjame tu correo y te desbloqueo el resto del caso —y todos los demás—. Te avisaré de cada caso nuevo. Sin spam.");
    var gateBtn = a.gateBtn || "Desbloquear";
    var teaserTitle = a.teaserTitle || "Lo que tú puedes hacer";
    var freeHtml = paras(a.free) || "        <p>Escribe aquí el caso (el gancho que se ve gratis).</p>";
    var teaserHtml = paras(a.teaser) || "            <p>Escribe aquí 1 o 2 párrafos de adelanto de la parte práctica.</p>";
    var premiumHtml = paras(a.premiumFull) || "          <p>Escribe aquí la parte que se desbloquea cuando el lector deja su correo.</p>";

    return [
'<!DOCTYPE html>',
'<html lang="es">',
'<head>',
'  <meta charset="UTF-8" />',
'  <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
'  <title>' + esc(title) + ' · ' + esc(c.newsletterName) + ' Nº ' + esc(n.num) + '</title>',
'  <meta name="description" content="' + esc(desc) + '" />',
'  <meta name="author" content="' + esc(c.brand) + '" />',
'  <meta name="robots" content="index, follow" />',
'  <meta name="theme-color" content="#0B3D2E" />',
'  <link rel="canonical" href="' + esc(canonical) + '" />',
'  <link rel="icon" href="../assets/favicon.svg" type="image/svg+xml" />',
'  <meta property="og:type" content="article" />',
'  <meta property="og:locale" content="es_ES" />',
'  <meta property="og:title" content="' + esc(title) + '" />',
'  <meta property="og:description" content="' + esc(desc) + '" />',
'  <meta property="og:url" content="' + esc(canonical) + '" />',
'  <meta property="og:image" content="' + esc(base) + '/assets/img/og-card.png" />',
'  <meta name="twitter:card" content="summary_large_image" />',
'  <meta name="twitter:image" content="' + esc(base) + '/assets/img/og-card.png" />',
'  <link rel="preconnect" href="https://fonts.googleapis.com" />',
'  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />',
'  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,400;1,9..144,500&family=Hanken+Grotesk:wght@300;400;500;600&family=Spline+Sans+Mono:wght@400;500&display=swap" />',
'  <link rel="stylesheet" href="../styles.css?v=20260630c" />',
'  <script type="application/ld+json">',
'  {"@context":"https://schema.org","@type":"Article","headline":' + JSON.stringify(title) + ',"author":{"@type":"Person","name":' + JSON.stringify(c.brand) + '},"datePublished":' + JSON.stringify(n.iso || "") + ',"inLanguage":"es","image":' + JSON.stringify(base + "/assets/img/og-card.png") + ',"mainEntityOfPage":' + JSON.stringify(canonical) + ',"isAccessibleForFree":' + (n.premium ? "false" : "true") + '}',
'  <\/script>',
'</head>',
'<body>',
'  <a class="skip-link" href="#main">Saltar al contenido</a>',
'  <span class="cursor" data-cursor aria-hidden="true"></span>',
'  <span class="cursor-ring" data-cursor-ring aria-hidden="true"></span>',
'  <div class="diag-light" data-diag-light aria-hidden="true"></div>',
'  <div class="grain" aria-hidden="true"></div>',
'  <header class="nav" data-nav>',
'    <a class="brand-mark" href="../index.html" aria-label="Inicio"><b data-bind="brand">' + esc(c.brand) + '</b></a>',
'    <nav class="nav-links" aria-label="Principal">',
'      <a class="ulink" href="../index.html">Inicio</a>',
'      <a class="ulink" href="../sobre-mi.html">Sobre mí</a>',
'      <a class="ulink" href="../newsletter.html">Newsletter</a>',
'    </nav>',
'    <div class="nav-right">',
'      <a class="btn btn-signal" href="#suscribirse" data-hover data-magnetic>Suscribirse</a>',
'      <button class="nav-toggle" data-nav-toggle aria-label="Abrir menú" aria-expanded="false"><span></span><span></span><span></span></button>',
'    </div>',
'  </header>',
'  <div class="nav-menu" data-nav-menu>',
'    <a href="../index.html">Inicio</a>',
'    <a href="../sobre-mi.html">Sobre <em>mí</em></a>',
'    <a href="../newsletter.html">Newsletter</a>',
'    <p class="menu-foot" data-bind="field">' + esc(c.field) + '</p>',
'  </div>',
'  <main id="main" class="page">',
'    <article class="article container">',
'      <div class="article-head">',
'        <p class="kicker is-center" style="justify-content:center">Caso Nº ' + esc(n.num) + ' · ' + esc(category) + '</p>',
'        <h1 class="h2">' + esc(title) + '</h1>',
'        <div class="article-meta">',
'          ' + (n.premium ? '<span class="pill premium"><span class="dot"></span>Premium</span>' : '<span class="pill">Gratis</span>'),
'          <span>' + esc(n.date) + '</span>',
'          <span>' + esc(n.readMin) + ' min</span>',
'          <span>' + esc(c.brand) + '</span>',
'        </div>',
'      </div>',
'      <div class="article-cover reveal">',
'        <a class="yt-cover"' + (id ? ' data-yt="' + esc(id) + '"' : '') + ' href="' + esc(url) + '" target="_blank" rel="noopener" data-hover aria-label="Ver el caso en YouTube">',
'          <span class="yt-badge">▶ Ver el caso en YouTube</span>',
'          <span class="yt-play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></span>',
'        </a>',
'      </div>',
'      <div class="prose reveal" data-delay="1">',
freeHtml,
'      </div>',
'      <div class="paywall" id="seguir-leyendo">',
'        <div data-locked>',
'          <div class="paywall-fade" aria-hidden="true">',
'            <div class="prose">',
'              <h3>' + esc(teaserTitle) + '</h3>',
teaserHtml,
'            </div>',
'          </div>',
'          <div class="paywall-gate">',
'            <div class="lock" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg></div>',
'            <h3>' + esc(gateTitle) + '</h3>',
'            <p>' + esc(gateText) + '</p>',
'            <form class="sub-form" data-sub-form novalidate>',
'              <input type="email" name="email" placeholder="tu@correo.com" autocomplete="email" required aria-label="Tu correo electrónico" />',
'              <button class="btn btn-signal" type="submit" data-hover>' + esc(gateBtn) + ' <span class="arrow">→</span></button>',
'            </form>',
'            <p class="sub-msg" role="status" aria-live="polite"></p>',
'            <p class="sub-note">Es gratis. Te das de baja cuando quieras.</p>',
'          </div>',
'        </div>',
'        <div class="prose premium reveal" data-premium hidden>',
'          <h3>' + esc(teaserTitle) + '</h3>',
premiumHtml,
'        </div>',
'      </div>',
'      <p class="sub-note" style="max-width:680px;margin:2.5rem auto 0;text-align:center;color:var(--ink-mute)">Divulgación con fines educativos, no consejo médico. Si algo te preocupa, acude a tu médico.</p>',
'    </article>',
'  </main>',
'  <footer class="footer"><div class="container"><div class="footer-bottom" style="border:0"><span>© <span id="year">2026</span> ' + esc(c.brand) + ' · ' + esc(c.role) + '</span><span><a href="../privacidad.html">Privacidad</a> · Divulgación, no consejo médico</span></div></div></footer>',
'  <script defer src="../lib/gsap.min.js"></script>',
'  <script defer src="../lib/ScrollTrigger.min.js"></script>',
'  <script defer src="../lib/data.js?v=20260630c"></script>',
'  <script defer src="../main.js?v=20260630c"></script>',
'  <script>document.getElementById("year").textContent=new Date().getFullYear();</script>',
'</body>',
'</html>',
''
    ].join("\n");
  }

  /* ---------- Render: Ajustes ---------- */
  function field(label, value, key, ph, type) {
    return '<label class="adm-field"><span>' + esc(label) + '</span>' +
      '<input type="' + (type || "text") + '" value="' + esc(value) + '" data-cfg="' + key + '" placeholder="' + esc(ph || "") + '" /></label>';
  }
  function renderSettings() {
    var c = state.config;
    $("#adm-settings").innerHTML =
      '<h2 class="h2">Ajustes</h2>' +
      '<div class="adm-grid">' +
        field("Tu nombre / marca", c.brand, "brand") +
        field("Tu rol", c.role, "role", "Estudiante de medicina") +
        field("Tu campo", c.field, "field") +
        field("Nombre de la newsletter", c.newsletterName, "newsletterName") +
        field("Lema de la newsletter", c.newsletterTagline, "newsletterTagline") +
        field("Tu dominio (para SEO)", c.siteUrl, "siteUrl", "https://tudominio.com") +
        field("Correo de contacto", c.contactEmail, "contactEmail", "hola@...", "email") +
        field("Canal de YouTube", c.youtubeUrl, "youtubeUrl", "https://youtube.com/@...") +
        field("YouTube (social)", c.social.youtube, "social.youtube") +
        field("LinkedIn", c.social.linkedin, "social.linkedin") +
        field("Instagram", c.social.instagram, "social.instagram") +
        field("Google Analytics (ID)", c.gaId, "gaId", "G-XXXXXXXXXX") +
      '</div>' +
      '<p class="adm-note" style="margin-top:1rem">Los correos se captan con Beehiiv vía la función <code>/api/subscribe</code>. La clave de Beehiiv se configura en Vercel (variables de entorno), no aquí.</p>';

    $$("[data-cfg]", $("#adm-settings")).forEach(function (inp) {
      inp.addEventListener("input", function () {
        var path = inp.getAttribute("data-cfg").split(".");
        var o = state.config;
        for (var i = 0; i < path.length - 1; i++) o = o[path[i]];
        o[path[path.length - 1]] = inp.value;
        save();
      });
    });
  }

  /* ---------- Render: lista de casos ---------- */
  function renderCases() {
    var box = $("#adm-cases-list");
    if (!state.newsletters.length) {
      box.innerHTML = '<p class="adm-empty">Aún no hay casos. Pulsa “Añadir caso”.</p>';
      return;
    }
    box.innerHTML = state.newsletters.map(function (n, i) {
      var id = n.youtubeId || "";
      var thumb = ytThumb(id);
      return '<div class="adm-case">' +
        '<div class="adm-case-thumb">' + (thumb ? '<img src="' + esc(thumb) + '" alt="" />' : '<span>▶</span>') + '</div>' +
        '<div class="adm-case-info">' +
          '<strong>Nº ' + esc(n.num) + ' · ' + esc(n.title || "(sin título)") + '</strong>' +
          '<span>' + esc(n.date || "") + ' · ' + esc(n.readMin || "?") + ' min · ' + (n.premium ? "Premium" : "Gratis") + (id ? " · vídeo ✓" : " · sin vídeo") + '</span>' +
        '</div>' +
        '<div class="adm-case-actions">' +
          '<button class="adm-mini" data-up="' + i + '" title="Subir">↑</button>' +
          '<button class="adm-mini" data-down="' + i + '" title="Bajar">↓</button>' +
          '<button class="adm-mini" data-edit="' + i + '">Editar</button>' +
          '<button class="adm-mini" data-html="' + i + '">HTML</button>' +
          '<button class="adm-mini danger" data-del="' + i + '">Borrar</button>' +
        '</div>' +
      '</div>';
    }).join("");

    $$("[data-up]", box).forEach(function (b) { b.onclick = function () { var i = +b.dataset.up; if (i > 0) { var t = state.newsletters[i - 1]; state.newsletters[i - 1] = state.newsletters[i]; state.newsletters[i] = t; save(); renderCases(); } }; });
    $$("[data-down]", box).forEach(function (b) { b.onclick = function () { var i = +b.dataset.down; if (i < state.newsletters.length - 1) { var t = state.newsletters[i + 1]; state.newsletters[i + 1] = state.newsletters[i]; state.newsletters[i] = t; save(); renderCases(); } }; });
    $$("[data-edit]", box).forEach(function (b) { b.onclick = function () { openEditor(+b.dataset.edit); }; });
    $$("[data-del]", box).forEach(function (b) { b.onclick = function () { var i = +b.dataset.del; if (confirm("¿Borrar el caso Nº " + state.newsletters[i].num + "?")) { state.newsletters.splice(i, 1); save(); renderCases(); } }; });
    $$("[data-html]", box).forEach(function (b) { b.onclick = function () { var n = state.newsletters[+b.dataset.html]; download("caso-" + String(n.num).padStart(2, "0") + ".html", genArticleHtml(n), "text/html"); }; });
  }

  /* ---------- Editor de caso ---------- */
  function openEditor(index) {
    var isNew = index == null;
    var n = isNew ? { num: nextNum(), title: "", dek: "", date: defaultDate(), iso: defaultIso(), readMin: 7, youtubeId: "", premium: true, _article: {} }
                  : JSON.parse(JSON.stringify(state.newsletters[index]));
    if (!n._article) n._article = {};
    var a = n._article;

    var modal = $("#adm-modal");
    modal.innerHTML =
      '<div class="adm-modal-card">' +
        '<div class="adm-modal-head"><h3>' + (isNew ? "Nuevo caso" : "Editar caso Nº " + esc(n.num)) + '</h3><button class="adm-mini" id="adm-close">✕</button></div>' +
        '<div class="adm-modal-body">' +
          '<div class="adm-grid">' +
            efield("Número", n.num, "num", "01") +
            efield("Fecha (texto)", n.date, "date", "Junio 2026") +
            efield("Fecha (AAAA-MM-DD)", n.iso, "iso", "", "date") +
            efield("Minutos de lectura", n.readMin, "readMin", "7", "number") +
          '</div>' +
          efieldFull("Título del caso", n.title, "title", "El corredor que se desplomó…") +
          efieldFull("Frase gancho (dek)", n.dek, "dek", "Una línea que enganche") +
          '<label class="adm-field"><span>Vídeo de YouTube (pega el enlace o el ID)</span>' +
            '<input type="text" id="adm-yt" value="' + esc(n.youtubeId) + '" placeholder="https://youtu.be/XXXX o el ID" /></label>' +
          '<div id="adm-yt-prev" class="adm-yt-prev"></div>' +
          '<label class="adm-check"><input type="checkbox" id="adm-premium" ' + (n.premium ? "checked" : "") + ' /> <span>Lleva muro (se desbloquea al dejar el correo)</span></label>' +
          '<hr class="adm-hr" />' +
          '<p class="adm-note">Contenido del artículo. Separa los párrafos con una línea en blanco.</p>' +
          efieldFull("Categoría (sale junto al número)", a.category, "_category", "Corazón") +
          efieldArea("Texto GRATIS (el gancho que se ve)", a.free, "_free", 7) +
          efieldFull("Título del adelanto difuminado", a.teaserTitle, "_teaserTitle", "Lo que tú puedes hacer hoy") +
          efieldArea("Adelanto difuminado (1 o 2 párrafos)", a.teaser, "_teaser", 4) +
          efieldArea("Contenido que se DESBLOQUEA con el correo", a.premiumFull, "_premiumFull", 8) +
          '<div class="adm-grid">' +
            efieldFull("Título del muro", a.gateTitle, "_gateTitle", "Sigue leyendo gratis") +
            efieldFull("Texto del botón", a.gateBtn, "_gateBtn", "Desbloquear") +
          '</div>' +
          efieldFull("Texto del muro", a.gateText, "_gateText", "Déjame tu correo y te desbloqueo el resto…") +
        '</div>' +
        '<div class="adm-modal-foot">' +
          '<button class="btn btn-ghost" id="adm-cancel">Cancelar</button>' +
          '<button class="btn btn-signal" id="adm-save">Guardar caso</button>' +
        '</div>' +
      '</div>';
    modal.classList.add("open");

    function readForm() {
      n.num = val("num"); n.date = val("date"); n.iso = val("iso");
      n.readMin = +val("readMin") || 0; n.title = val("title"); n.dek = val("dek");
      n.youtubeId = ytId($("#adm-yt").value);
      n.youtubeUrl = ytUrl(n.youtubeId);
      n.premium = $("#adm-premium").checked;
      n.file = slugFile(n.num);
      n._article = {
        category: val("_category"), free: val("_free"),
        teaserTitle: val("_teaserTitle"), teaser: val("_teaser"), premiumFull: val("_premiumFull"),
        gateTitle: val("_gateTitle"), gateBtn: val("_gateBtn"), gateText: val("_gateText")
      };
    }
    function val(k) { var el = modal.querySelector('[data-e="' + k + '"]'); return el ? el.value : ""; }

    function previewYt() {
      var id = ytId($("#adm-yt").value);
      $("#adm-yt-prev").innerHTML = id
        ? '<img src="' + ytThumb(id) + '" alt="miniatura" /><span>ID detectado: <code>' + esc(id) + '</code> ✓</span>'
        : '<span class="adm-muted">Pega un enlace de YouTube para ver la miniatura.</span>';
    }
    $("#adm-yt").addEventListener("input", previewYt); previewYt();

    function close() { modal.classList.remove("open"); modal.innerHTML = ""; }
    $("#adm-close").onclick = close; $("#adm-cancel").onclick = close;
    $("#adm-save").onclick = function () {
      readForm();
      if (!n.num) { alert("Pon un número de caso."); return; }
      if (isNew) state.newsletters.unshift(n); else state.newsletters[index] = n;
      save(); renderCases(); close();
    };
  }

  function efield(label, v, key, ph, type) {
    return '<label class="adm-field"><span>' + esc(label) + '</span><input type="' + (type || "text") + '" data-e="' + key + '" value="' + esc(v) + '" placeholder="' + esc(ph || "") + '" /></label>';
  }
  function efieldFull(label, v, key, ph) {
    return '<label class="adm-field adm-full"><span>' + esc(label) + '</span><input type="text" data-e="' + key + '" value="' + esc(v) + '" placeholder="' + esc(ph || "") + '" /></label>';
  }
  function efieldArea(label, v, key, rows) {
    return '<label class="adm-field adm-full"><span>' + esc(label) + '</span><textarea data-e="' + key + '" rows="' + (rows || 5) + '" placeholder="Un párrafo. Línea en blanco para separar.">' + esc(v) + '</textarea></label>';
  }

  function nextNum() {
    var max = 0;
    state.newsletters.forEach(function (n) { var x = parseInt(n.num, 10); if (x > max) max = x; });
    return String(max + 1).padStart(2, "0");
  }
  function defaultDate() {
    var meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
    var d = new Date(); return meses[d.getMonth()] + " " + d.getFullYear();
  }
  function defaultIso() { return new Date().toISOString().slice(0, 10); }

  /* ---------- Arranque ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    renderSettings();
    renderCases();
    $("#adm-add").onclick = function () { openEditor(null); };
    $("#adm-dl-data").onclick = function () { download("data.js", genDataJs(), "application/javascript"); };
    $("#adm-reset").onclick = function () {
      if (confirm("Esto descarta tus cambios locales y vuelve a cargar lo que hay en data.js. ¿Seguir?")) {
        localStorage.removeItem(LS_KEY); state = fromSite(); renderSettings(); renderCases();
      }
    };
  });
})();
