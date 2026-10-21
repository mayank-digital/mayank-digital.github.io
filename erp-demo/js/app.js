/* Demo ERP - boot. */
(function (D) {
  function start() {
    D.shell.mount();
    D.router.start();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
  D.start = start;
})(window.DEMO = window.DEMO || {});
