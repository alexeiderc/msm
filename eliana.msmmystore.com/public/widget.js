(function () {
  if (window.__ELIANA_WIDGET_READY__) return;
  window.__ELIANA_WIDGET_READY__ = true;

  var host = window.ELIANA_WIDGET_URL || "https://eliana.msmmystore.com";
  var css = document.createElement("style");
  css.textContent = [
    ".eliana-widget-launcher{position:fixed;right:25px;bottom:25px;width:60px;height:60px;border:0;border-radius:50%;z-index:2147483000;cursor:pointer;background:linear-gradient(135deg,#0F52BA,#00FFFF);box-shadow:0 0 0 5px rgba(0,255,255,.1),0 14px 35px rgba(0,255,255,.4);font-size:27px;transition:transform .2s,box-shadow .2s}",
    ".eliana-widget-launcher:hover{transform:translateY(-3px) scale(1.04);box-shadow:0 0 0 8px rgba(0,255,255,.12),0 18px 42px rgba(0,255,255,.55)}",
    ".eliana-widget-panel{position:fixed;right:24px;bottom:98px;width:380px;height:500px;z-index:2147483000;border:1px solid rgba(0,255,255,.45);border-radius:18px;overflow:hidden;background:#030816;box-shadow:0 20px 65px rgba(0,0,0,.55),0 0 38px rgba(0,255,255,.18);transform:translateY(12px) scale(.96);opacity:0;pointer-events:none;transition:all .25s ease}",
    ".eliana-widget-panel.is-open{transform:translateY(0) scale(1);opacity:1;pointer-events:auto}",
    ".eliana-widget-panel iframe{width:100%;height:100%;border:0;background:#030816}",
    "@media(max-width:520px){.eliana-widget-launcher{right:16px;bottom:16px}.eliana-widget-panel{left:10px;right:10px;bottom:88px;width:auto;height:min(500px,calc(100vh - 112px))}}"
  ].join("");
  document.head.appendChild(css);

  var button = document.createElement("button");
  button.className = "eliana-widget-launcher";
  button.type = "button";
  button.setAttribute("aria-label", "Abrir YO SOY ELIANA");
  button.textContent = "💎";

  var panel = document.createElement("section");
  panel.className = "eliana-widget-panel";
  panel.setAttribute("aria-label", "Chat de YO SOY ELIANA");
  var frame = document.createElement("iframe");
  frame.title = "YO SOY ELIANA - La Incubadora del Futuro";
  frame.loading = "lazy";
  frame.src = host;
  panel.appendChild(frame);

  function toggle() {
    var open = panel.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(open));
    button.textContent = open ? "×" : "💎";
  }

  button.addEventListener("click", toggle);
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && panel.classList.contains("is-open")) toggle();
  });
  document.body.appendChild(panel);
  document.body.appendChild(button);
})();
