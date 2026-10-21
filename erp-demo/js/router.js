/* Demo ERP - hash router. Routes:
 *   #/p/<page>                     a workspace or custom screen
 *   #/l/<doctype-slug>             list view
 *   #/f/<doctype-slug>/<name>      record form
 *   #/k/<board>                    kanban board
 *   #/r/<report>                   report view
 *   #/c/<chat-name>                one chat thread
 */
(function (D) {
  var U = D.u, R = D.router = {};
  R.current = { page: "home" };

  R.parse = function () {
    var h = (window.location.hash || "").replace(/^#\/?/, "");
    var parts = h.split("/").filter(function (x) { return x !== ""; }).map(decodeURIComponent);
    if (!parts.length) return { kind: "page", page: "home" };
    var k = parts[0];
    if (k === "p") return { kind: "page", page: parts[1] || "home" };
    if (k === "l") return { kind: "list", dt: parts[1] };
    if (k === "f") return { kind: "form", dt: parts[1], name: parts.slice(2).join("/") };
    if (k === "k") return { kind: "kanban", board: parts[1] };
    if (k === "r") return { kind: "report", report: parts[1] };
    if (k === "c") return { kind: "chat", name: parts[1] };
    return { kind: "page", page: "home" };
  };

  R.render = function () {
    var r = R.parse();
    R.current = r;
    try {
      if (r.kind === "page") D.views.page(r.page);
      else if (r.kind === "list") D.views.list(r.dt);
      else if (r.kind === "form") D.views.form(r.dt, r.name);
      else if (r.kind === "kanban") D.views.kanban(r.board);
      else if (r.kind === "report") D.views.report(r.report);
      else if (r.kind === "chat") D.views.chatThread(r.name);
    } catch (e) {
      var body = D.shell.page({ title: "Something went wrong", sub: "This screen could not be drawn." });
      body.appendChild(U.el("div.notice.deny", { text: String(e && e.message || e) }));
      if (window.console) window.console.error(e);
    }
    D.shell.markActive(r);
    /* Give every table the metadata the phone card layout needs. */
    try { U.autoLabel(D.shell.mainEl); } catch (e) { if (window.console) window.console.error(e); }
    window.scrollTo(0, 0);
  };

  R.start = function () {
    window.addEventListener("hashchange", R.render);
    R.render();
  };
})(window.DEMO = window.DEMO || {});
