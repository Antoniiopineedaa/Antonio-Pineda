/* =============================================================================
   main.js — Antonio Pineda · Caso Cero
   Patrón IIFE clásico (sin módulos): funciona en file://, FTP y CDN.
   Cada init va envuelto en safe() para que un fallo no rompa el resto.
   ============================================================================= */
(function () {
  "use strict";

  var DATA = window.__SITE__ || {};
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  var $  = function (s, sc) { return (sc || document).querySelector(s); };
  var $$ = function (s, sc) { return Array.prototype.slice.call((sc || document).querySelectorAll(s)); };
  var escHTML = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  };
  function safe(fn, name) { try { fn(); } catch (e) { console.warn("[" + name + "]", e); } }

  // Resolver "a.b" dentro de DATA
  function resolve(path) {
    return String(path).split(".").reduce(function (o, k) {
      return (o && o[k] != null) ? o[k] : null;
    }, DATA);
  }

  function ytThumb(id) { return "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg"; }

  /* ---------------------------------------------------------------------------
     Data binding: textos y enlaces desde data.js (una sola fuente)
     [data-bind="newsletterName"]  -> textContent
     [data-href="youtubeUrl"]      -> href (contactEmail => mailto:)
     --------------------------------------------------------------------------- */
  function bindData() {
    $$("[data-bind]").forEach(function (el) {
      var v = resolve(el.getAttribute("data-bind"));
      if (v != null && v !== "") el.textContent = v;
    });
    $$("[data-href]").forEach(function (el) {
      var key = el.getAttribute("data-href");
      var v = resolve(key);
      if (!v) return;
      el.setAttribute("href", key === "contactEmail" ? "mailto:" + v : v);
    });
  }

  /* ---------------------------------------------------------------------------
     YouTube covers: cargar miniatura del vídeo si hay ID
     Elementos: <a class="yt-cover" data-yt="ID" data-yt-url="...">
     --------------------------------------------------------------------------- */
  function initYouTubeCovers(root) {
    $$(".yt-cover[data-yt]", root || document).forEach(function (cover) {
      if (cover.dataset.ytBound) return;
      cover.dataset.ytBound = "1";
      var id = cover.getAttribute("data-yt");
      if (!id) return;
      var img = document.createElement("img");
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      img.addEventListener("load", function () { img.classList.add("is-loaded"); });
      img.src = ytThumb(id);
      cover.insertBefore(img, cover.firstChild);
    });
  }

  /* ---------------------------------------------------------------------------
     Tarjetas de newsletter desde data.js (archivo + destacado del home)
     --------------------------------------------------------------------------- */
  function issueCardHTML(it) {
    var ytUrl = it.youtubeUrl || (DATA.youtubeUrl || "#");
    var coverAttrs = 'class="yt-cover" data-yt-url="' + escHTML(ytUrl) + '"' +
      (it.youtubeId ? ' data-yt="' + escHTML(it.youtubeId) + '"' : "");
    var premium = it.premium
      ? '<span class="pill premium"><span class="dot"></span>Premium</span>'
      : '<span class="pill">Gratis</span>';
    return '' +
      '<article class="issue-card reveal" data-delay="1">' +
        '<a ' + coverAttrs + ' href="' + escHTML(ytUrl) + '" target="_blank" rel="noopener" aria-label="Ver el vídeo en YouTube" data-hover>' +
          '<span class="yt-badge">▶ YouTube</span>' +
          '<span class="yt-play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></span>' +
        '</a>' +
        '<div class="issue-body">' +
          '<div class="issue-meta">' + premium + '<span>Exp. ' + escHTML(it.num) + '</span><span>' + escHTML(it.date) + '</span></div>' +
          '<h3>' + escHTML(it.title) + '</h3>' +
          '<p class="dek">' + escHTML(it.dek) + '</p>' +
          '<div class="issue-foot">' +
            '<span class="read">Leer el caso <span class="arrow">→</span></span>' +
            '<span class="eyebrow-num">' + escHTML(it.readMin) + ' min</span>' +
          '</div>' +
        '</div>' +
        '<a class="issue-link" href="' + escHTML(it.file) + '" aria-label="Leer ' + escHTML(it.title) + '" style="position:absolute;inset:0;z-index:1"></a>' +
      '</article>';
  }

  function mountIssues() {
    var list = DATA.newsletters || [];
    var box = $("[data-issues]");
    if (box && !box.dataset.mounted && list.length) {
      box.dataset.mounted = "1";
      box.style.position = box.style.position || "relative";
      box.innerHTML = list.map(function (it) {
        // tarjeta con posición relativa para el enlace overlay
        return issueCardHTML(it).replace('class="issue-card reveal"', 'class="issue-card reveal" style="position:relative"');
      }).join("");
      initYouTubeCovers(box);
      bindReveals(box);
    }

    // Destacado (último número) en el home
    var feat = $("[data-latest]");
    if (feat && !feat.dataset.mounted && list.length) {
      feat.dataset.mounted = "1";
      var it = list[0];
      var ytUrl = it.youtubeUrl || (DATA.youtubeUrl || "#");
      feat.innerHTML = '' +
        '<a class="yt-cover reveal" ' + (it.youtubeId ? 'data-yt="' + escHTML(it.youtubeId) + '"' : "") +
          ' href="' + escHTML(ytUrl) + '" target="_blank" rel="noopener" data-hover aria-label="Ver el vídeo en YouTube">' +
          '<span class="yt-badge">▶ Ver en YouTube</span>' +
          '<span class="yt-play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></span>' +
        '</a>' +
        '<div class="feature-copy reveal" data-delay="1">' +
          '<div class="issue-meta" style="margin-bottom:.9rem">' +
            (it.premium ? '<span class="pill premium"><span class="dot"></span>Premium</span>' : '<span class="pill">Gratis</span>') +
            '<span>Expediente ' + escHTML(it.num) + '</span><span>' + escHTML(it.date) + '</span>' +
          '</div>' +
          '<h3 class="h2" style="margin-bottom:.8rem">' + escHTML(it.title) + '</h3>' +
          '<p class="lead" style="max-width:46ch">' + escHTML(it.dek) + '</p>' +
          '<a class="btn btn-primary btn-lg" style="margin-top:1.8rem" href="' + escHTML(it.file) + '" data-hover>Leer el caso completo <span class="arrow">→</span></a>' +
        '</div>';
      initYouTubeCovers(feat);
      bindReveals(feat);
    }
  }

  /* ---------------------------------------------------------------------------
     Suscripción (conector Beehiiv)
     - Si beehiiv.embedUrl está puesto: incrusta el iframe nativo de Beehiiv.
     - Si no: el formulario propio redirige a beehiiv.subscribeUrl con el correo.
     --------------------------------------------------------------------------- */
  function initSubscribe() {
    var bh = DATA.beehiiv || {};

    // Modo embed (iframe nativo de Beehiiv)
    if (bh.embedUrl) {
      $$("[data-sub-embed]").forEach(function (slot) {
        if (slot.dataset.embedBound) return;
        slot.dataset.embedBound = "1";
        var form = slot.querySelector(".sub-form");
        if (form) form.style.display = "none";
        var ifr = document.createElement("iframe");
        ifr.src = bh.embedUrl;
        ifr.title = "Suscríbete";
        ifr.setAttribute("scrolling", "no");
        ifr.style.height = "320px";
        var wrap = slot.querySelector(".sub-embed") || slot;
        wrap.appendChild(ifr);
      });
    }

    // Formulario propio -> redirección a Beehiiv con el email
    $$("[data-sub-form]").forEach(function (form) {
      if (form.dataset.subBound) return;
      form.dataset.subBound = "1";
      var input = form.querySelector('input[type="email"]');
      var msg = form.parentNode.querySelector(".sub-msg");
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!form.reportValidity()) return;
        var email = (input && input.value || "").trim();
        var url = bh.subscribeUrl;
        if (url) {
          var go = url + (url.indexOf("?") > -1 ? "&" : "?") + "email=" + encodeURIComponent(email);
          if (msg) msg.textContent = "Te llevamos a la página segura de suscripción…";
          window.location.href = go;
        } else {
          if (msg) msg.textContent = "Suscripción aún no conectada (pega tu URL de Beehiiv en lib/data.js → beehiiv.subscribeUrl).";
          console.warn("[subscribe] Falta DATA.beehiiv.subscribeUrl");
        }
      });
    });
  }

  /* ---------------------------------------------------------------------------
     Navegación
     --------------------------------------------------------------------------- */
  function initNav() {
    var nav = $("[data-nav]");
    if (!nav) return;
    var onScroll = function () { nav.classList.toggle("is-solid", window.scrollY > 24); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var toggle = $("[data-nav-toggle]");
    var menu = $("[data-nav-menu]");
    function setOpen(open) {
      nav.classList.toggle("is-open", open);
      if (menu) menu.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
      if (toggle) toggle.setAttribute("aria-expanded", open ? "true" : "false");
    }
    if (toggle) toggle.addEventListener("click", function () { setOpen(!nav.classList.contains("is-open")); });
    if (menu) $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { setOpen(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });

    // marcar enlace activo según la página
    var page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    $$("a[href]", nav).forEach(function (a) {
      var href = (a.getAttribute("href") || "").split("/").pop().toLowerCase();
      if (href && href === page) { a.classList.add("is-active"); a.setAttribute("aria-current", "page"); }
    });
  }

  // Scroll suave nativo para anclas
  function initSmoothAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 80,
        behavior: reduced ? "auto" : "smooth"
      });
    });
  }

  /* ---------------------------------------------------------------------------
     Splash (doble red de seguridad: CSS @2.6s + JS)
     --------------------------------------------------------------------------- */
  function initSplash() {
    var splash = $("[data-splash]");
    if (!splash) return;
    var hide = function () { splash.classList.add("is-out"); };
    if (document.readyState === "complete") setTimeout(hide, 500);
    else window.addEventListener("load", function () { setTimeout(hide, 350); });
    setTimeout(hide, 2400); // seguridad JS
  }

  /* ---------------------------------------------------------------------------
     Cursor + luz diagnóstica (la firma)
     --------------------------------------------------------------------------- */
  function initCursor() {
    if (!fineHover) return;
    var dot = $("[data-cursor]");
    var ring = $("[data-cursor-ring]");
    var light = $("[data-diag-light]");
    if (!dot && !ring && !light) return;

    var rx = 0, ry = 0, tx = 0, ty = 0, first = false;

    window.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      if (dot) dot.style.transform = "translate3d(" + tx + "px," + ty + "px,0)";
      if (light) {
        light.style.setProperty("--mx", tx + "px");
        light.style.setProperty("--my", ty + "px");
      }
      if (!first) {
        first = true;
        rx = tx; ry = ty;
        if (dot) dot.classList.add("is-ready");
        if (ring) ring.classList.add("is-ready");
        if (light) light.classList.add("is-ready");
      }
    }, { passive: true });

    function loop() {
      rx += (tx - rx) * 0.18;
      ry += (ty - ry) * 0.18;
      if (ring) ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0)";
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    // Hover grande sobre elementos interactivos (mouseover/out + relatedTarget)
    var SEL = "a, button, [data-hover], input, .issue-card";
    document.addEventListener("mouseover", function (e) {
      var t = e.target.closest && e.target.closest(SEL);
      if (t && ring) ring.classList.add("is-hover");
    });
    document.addEventListener("mouseout", function (e) {
      var t = e.target.closest && e.target.closest(SEL);
      if (t && ring && !(e.relatedTarget && t.contains(e.relatedTarget))) ring.classList.remove("is-hover");
    });
  }

  /* ---------------------------------------------------------------------------
     Split text (palabras) — preserva <br> y <em>
     --------------------------------------------------------------------------- */
  function splitWords(el) {
    if (el.dataset.splitDone) return $$(".split-word", el);
    el.dataset.splitDone = "1";
    el.setAttribute("aria-label", el.textContent.trim().replace(/\s+/g, " "));
    var wrap = function (text) {
      return text.split(/(\s+)/).map(function (w) {
        if (!w) return "";                                   // ignora cadenas vacías
        return /^\s+$/.test(w) ? " " : '<span class="split-word" aria-hidden="true">' + escHTML(w) + "</span>";
      }).join("");
    };
    var html = Array.prototype.map.call(el.childNodes, function (node) {
      if (node.nodeType === 3) return wrap(node.textContent);
      if (node.nodeName === "BR") return "<br>";
      if (node.nodeType === 1) {
        var tag = node.tagName.toLowerCase();
        return "<" + tag + ' class="' + node.className + '">' + wrap(node.textContent) + "</" + tag + ">";
      }
      return "";
    }).join("");
    html = html.replace(/^\s+/, "").replace(/\s+$/, "");      // sin espacio inicial/final (evita sangría)
    el.innerHTML = html;
    return $$(".split-word", el);
  }

  /* ---------------------------------------------------------------------------
     Reveals (IntersectionObserver) + red de seguridad 6s
     --------------------------------------------------------------------------- */
  var revealIO = null;
  function getIO() {
    if (revealIO || typeof IntersectionObserver === "undefined") return revealIO;
    revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        if (el.hasAttribute("data-split")) {
          var words = splitWords(el);
          words.forEach(function (w, i) {
            setTimeout(function () { w.classList.add("is-in"); }, reduced ? 0 : i * 32);
          });
        } else {
          el.classList.add("is-visible");
        }
        if (el.classList.contains("ecg-line")) el.classList.add("is-revealed");
        revealIO.unobserve(el);
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -4% 0px" });
    return revealIO;
  }

  function bindReveals(root) {
    var io = getIO();
    var els = $$(".reveal, .ecg-line", root || document);
    if (!io) { els.forEach(function (el) { el.classList.add("is-visible", "is-revealed"); }); return; }
    els.forEach(function (el) {
      if (el.dataset.revBound) return;
      el.dataset.revBound = "1";
      io.observe(el);
    });
  }

  function initRevealSafety() {
    setTimeout(function () {
      $$(".reveal:not(.is-visible), .ecg-line:not(.is-revealed)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight + 200) {
          if (el.hasAttribute("data-split")) splitWords(el).forEach(function (w) { w.classList.add("is-in"); });
          el.classList.add("is-visible", "is-revealed");
        }
      });
    }, 6000);
  }

  /* ---------------------------------------------------------------------------
     Botones magnéticos sutiles
     --------------------------------------------------------------------------- */
  function initMagnetic() {
    if (!fineHover || reduced) return;
    $$("[data-magnetic]").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.18;
        var y = (e.clientY - r.top - r.height / 2) * 0.28;
        btn.style.transform = "translate(" + x + "px," + y + "px)";
      });
      btn.addEventListener("mouseleave", function () { btn.style.transform = ""; });
    });
  }

  /* ---------------------------------------------------------------------------
     Conteo de números (data-count-to) — "vivo" al entrar en pantalla
     --------------------------------------------------------------------------- */
  function initCountUp() {
    var els = $$("[data-count-to]");
    if (!els.length) return;
    if (typeof IntersectionObserver === "undefined" || reduced) {
      els.forEach(function (el) { el.textContent = el.getAttribute("data-count-to"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target; io.unobserve(el);
        var to = parseFloat(el.getAttribute("data-count-to")) || 0;
        var dur = 1100, t0 = null;
        function step(t) {
          if (!t0) t0 = t;
          var p = Math.min(1, (t - t0) / dur);
          el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------------------
     Boot
     --------------------------------------------------------------------------- */
  function boot() {
    safe(bindData, "bindData");
    safe(mountIssues, "mountIssues");
    safe(initYouTubeCovers, "initYouTubeCovers");
    safe(initSubscribe, "initSubscribe");
    safe(initNav, "initNav");
    safe(initSmoothAnchors, "initSmoothAnchors");
    safe(initSplash, "initSplash");
    safe(initCursor, "initCursor");
    safe(function () { bindReveals(document); }, "bindReveals");
    safe(initRevealSafety, "initRevealSafety");
    safe(initMagnetic, "initMagnetic");
    safe(initCountUp, "initCountUp");

    if (window.gsap && window.ScrollTrigger) {
      try { gsap.registerPlugin(ScrollTrigger); } catch (_) {}
    }
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
