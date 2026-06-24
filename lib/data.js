/* =============================================================================
   data.js  —  TU PANEL DE CONTROL (Antonio, edita SOLO este archivo)
   -----------------------------------------------------------------------------
   Aquí vive todo lo que cambia: tu marca, el enlace de Beehiiv y la lista de
   números de la newsletter. No necesitas tocar el HTML ni el CSS para añadir
   contenido nuevo. Lee los comentarios marcados con  >>>  son tus instrucciones.
   ============================================================================= */
(function () {
  "use strict";

  window.__SITE__ = {

    /* -------------------------------------------------------------------------
       1) MARCA
       ---------------------------------------------------------------------- */
    brand: "Antonio Pineda",
    role: "Estudiante de medicina",            // <<< importante: nunca "Dr."
    field: "Cardiología & Neurociencia",
    newsletterName: "Caso Cero",               // <<< nombre de tu newsletter (cámbialo si quieres)
    newsletterTagline: "El misterio clínico que te enseña a cuidarte.",

    /* -------------------------------------------------------------------------
       2) ENLACES (YouTube + redes)
       ---------------------------------------------------------------------- */
    youtubeUrl: "https://www.youtube.com/channel/UCdR9-VQskP_RJwNQDRdBtOw",   // <<< tu canal real
    social: {
      youtube:  "https://www.youtube.com/channel/UCdR9-VQskP_RJwNQDRdBtOw",
      linkedin: "https://www.linkedin.com/in/antonio-pineda-guerrero-276975370/?locale=es",
      instagram: "https://www.instagram.com/antoniopineda.med"
    },
    contactEmail: "antoniopiredes@gmail.com",    // <<< tu correo de contacto

    /* -------------------------------------------------------------------------
       3) BEEHIIV  —  aquí se conecta el cobro y la captación de correos
       -------------------------------------------------------------------------
       >>> Cuando crees tu publicación en beehiiv.com, copia la URL de tu página
           de suscripción (algo como  https://tunombre.beehiiv.com/subscribe )
           y pégala en "subscribeUrl".
       >>> El formulario de la web enviará al lector a esa página con su correo
           ya escrito (Beehiiv lo rellena solo). Beehiiv gestiona el pago premium.
       >>> OPCIONAL: si prefieres incrustar el formulario nativo de Beehiiv,
           pega la URL del embed en "embedUrl" (la encuentras en beehiiv →
           Subscribe Forms → Embed). Si lo rellenas, la web mostrará ese iframe.
       ---------------------------------------------------------------------- */
    beehiiv: {
      subscribeUrl: "",   // <<< EJEMPLO: "https://casocero.beehiiv.com/subscribe"
      embedUrl: ""        // <<< OPCIONAL: "https://embeds.beehiiv.com/xxxxxxxx"
    },

    /* -------------------------------------------------------------------------
       4) NÚMEROS DE LA NEWSLETTER
       -------------------------------------------------------------------------
       >>> PARA AÑADIR UN NÚMERO NUEVO:
           1. Duplica el archivo  articulos/caso-01.html  y renómbralo
              (ej. articulos/caso-02.html). Escribe dentro tu artículo.
           2. Copia uno de los bloques { ... } de abajo, pégalo ARRIBA del todo
              de esta lista (el más nuevo primero) y cambia sus datos.
           3. Guarda. Listo: aparecerá solo en la web.

       Campos:
         num        -> número de expediente (texto, ej. "02")
         title      -> título del caso
         dek        -> una frase gancho (aparece bajo el título)
         date       -> fecha en texto (ej. "Junio 2026")
         iso        -> fecha técnica AAAA-MM-DD (para ordenar/SEO)
         readMin    -> minutos de lectura (número)
         youtubeId  -> el ID del vídeo de YouTube (lo que va tras "v=" en la URL)
         youtubeUrl -> enlace completo al vídeo
         premium    -> true si el artículo es de pago (muestra el candado)
         file       -> ruta al archivo del artículo
       ---------------------------------------------------------------------- */
    newsletters: [
      {
        num: "01",
        title: "El corredor que se desplomó en el kilómetro 12",
        dek: "Estaba sano. Hasta que su propio corazón le tendió una trampa silenciosa.",
        date: "Junio 2026",
        iso: "2026-06-20",
        readMin: 9,
        youtubeId: "",   // <<< pon aquí el ID real de tu vídeo cuando lo tengas
        youtubeUrl: "https://www.youtube.com/channel/UCdR9-VQskP_RJwNQDRdBtOw",
        premium: true,
        file: "articulos/caso-01.html"
      }
      /* , {  ← descomenta y duplica para el caso 02
        num: "02",
        title: "Tu título aquí",
        dek: "Tu frase gancho aquí.",
        date: "Julio 2026",
        iso: "2026-07-04",
        readMin: 8,
        youtubeId: "VIDEO_ID",
        youtubeUrl: "https://www.youtube.com/watch?v=VIDEO_ID",
        premium: true,
        file: "articulos/caso-02.html"
      } */
    ]
  };
})();
