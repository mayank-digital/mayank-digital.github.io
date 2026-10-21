/* Demo ERP - the desk shell: top bar, sidebar, role switcher. */
(function (D) {
  var U = D.u, S = D.shell = {};

  D.state = {
    role: "Sales",
    sidebarOpen: false,
    /* in-memory edits: kanban moves, chat messages, punch state */
    moved: {},            /* doctype|name -> new stage */
    chatExtra: {},        /* chat name -> [messages] */
    punch: { in: "09:12", out: null },
    corrections: []       /* demo-only correction requests */
  };

  S.role = function () {
    for (var i = 0; i < D.roles.length; i++) if (D.roles[i].key === D.state.role) return D.roles[i];
    return D.roles[0];
  };
  S.me = function () { return D.personByName(S.role().as) || D.people[0]; };

  S.mount = function () {
    document.body.appendChild(S.topbar());
    document.body.appendChild(S.sidebarEl = U.el("nav.sidebar", { id: "sidebar" }));
    /* Only visible while the drawer is open, below the drawer breakpoint. */
    document.body.appendChild(S.scrimEl = U.el("div.side-scrim", { id: "side-scrim",
      onclick: function () { S.closeDrawer(); } }));
    document.body.appendChild(S.mainEl = U.el("main.main", { id: "main" }));
    S.drawSidebar();
  };

  S.openDrawer = function () {
    S.sidebarEl.classList.add("show");
    if (S.scrimEl) S.scrimEl.classList.add("show");
    document.body.classList.add("drawer-open");
  };
  S.closeDrawer = function () {
    S.sidebarEl.classList.remove("show");
    if (S.scrimEl) S.scrimEl.classList.remove("show");
    document.body.classList.remove("drawer-open");
  };
  S.toggleDrawer = function () {
    if (S.sidebarEl.classList.contains("show")) S.closeDrawer(); else S.openDrawer();
  };

  S.topbar = function () {
    var sel = U.el("select", { "aria-label": "Demo role" },
      D.roles.map(function (r) { return U.el("option", { value: r.key, text: r.label }); }));
    sel.value = D.state.role;
    sel.addEventListener("change", function () {
      D.state.role = sel.value;
      S.drawSidebar();
      S.drawWho();
      D.router.render();
      U.toast("Now viewing as " + S.role().label + " - " + S.me().name + ".", "Role switched");
    });
    S.whoBox = U.el("div.whoami");
    var search = U.el("input.topsearch", {
      type: "text", placeholder: "Search a record or a page…", "aria-label": "Search"
    });
    search.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { D.search(search.value); search.value = ""; }
    });
    /* On a phone the inline box is hidden by CSS and this button takes over, so
     * search stays reachable without stealing the whole top bar. */
    var searchBtn = U.el("button.iconbtn.searchbtn", {
      type: "button", "aria-label": "Search", title: "Search", html: "&#9906;",
      onclick: function () { S.searchDialog(); }
    });
    var bar = U.el("header.topbar", [
      U.el("button.burger", { type: "button", "aria-label": "Menu", title: "Menu",
        html: "&#9776;", onclick: function () { S.toggleDrawer(); } }),
      U.el("div.brand", [U.el("span.logo", "DE"), U.el("span.bn", "Demo ERP")]),
      search,
      U.el("div.spacer"),
      searchBtn,
      U.el("span.samplechip", "Sample data"),
      U.el("div.roleswitch", [U.el("label", { for: "", text: "View as" }), sel]),
      S.whoBox
    ]);
    S.drawWho();
    return bar;
  };

  S.searchDialog = function () {
    var inp = U.el("input", { type: "search", placeholder: "Record number, customer, page…",
      "aria-label": "Search" });
    var m = U.modal("Search", [
      U.el("label", "Search everything"), inp,
      U.el("p.muted.small", { style: "margin:0", text:
        "Looks through every record and every page name in the demo." })
    ], [U.el("button.btn.primary", { type: "button", text: "Search",
      onclick: function () { var v = inp.value; m.close(); D.search(v); } })]);
    inp.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { var v = inp.value; m.close(); D.search(v); }
    });
    setTimeout(function () { try { inp.focus(); } catch (e) {} }, 30);
  };

  S.drawWho = function () {
    if (!S.whoBox) return;
    var me = S.me();
    U.clear(S.whoBox);
    S.whoBox.appendChild(U.el("span.avatar", { text: U.initials(me.name) }));
    S.whoBox.appendChild(U.el("span.nm", { html: U.esc(me.name) + "<small>" + U.esc(me.desig) + "</small>" }));
  };

  S.drawSidebar = function () {
    if (!S.sidebarEl) return;
    var box = U.clear(S.sidebarEl), role = D.state.role;
    var tops = D.nav.filter(function (n) { return !n.parent; });
    var groups = [
      ["", ["home"]],
      ["My workspace", ["my-hr", "my-profile", "my-attendance", "my-leave", "tasks", "chats"]],
      ["Modules", ["sales", "dispatch", "purchase", "accounts", "hr"]],
      ["Setup", ["users", "settings", "integrations", "support"]]
    ];
    groups.forEach(function (g) {
      var ids = g[1].filter(function (id) {
        var n = D.navById[id];
        return n && D.canSee(n, role);
      });
      if (!ids.length) return;
      if (g[0]) box.appendChild(U.el("div.side-h", { text: g[0] }));
      ids.forEach(function (id) {
        var n = D.navById[id];
        var kids = D.nav.filter(function (c) { return c.parent === id && D.canSee(c, role); });
        var row = U.el("button.side-item", { type: "button", data: { page: id } }, [
          U.el("span.ic", { text: n.icon }),
          U.el("span.tw", { text: n.label }),
          kids.length ? U.el("span.caret", { html: "&#9656;" }) : null
        ]);
        row.addEventListener("click", function () {
          if (kids.length) { kidBox.classList.toggle("open"); row.classList.toggle("open"); }
          U.go("#/p/" + id);
          S.closeDrawer();
        });
        box.appendChild(row);
        var kidBox = U.el("div.side-kids", { data: { kidsof: id } });
        kids.forEach(function (c) {
          var k = U.el("button.side-item", { type: "button", data: { page: c.id } }, [
            U.el("span.ic", { text: c.icon }), U.el("span.tw", { text: c.label })
          ]);
          k.addEventListener("click", function (e) {
            e.stopPropagation();
            U.go("#/p/" + c.id);
            S.closeDrawer();
          });
          kidBox.appendChild(k);
        });
        box.appendChild(kidBox);
      });
    });
    var r = S.role();
    box.appendChild(U.el("div.side-note", { html:
      "<b>" + U.esc(r.label) + "</b> &mdash; " + U.esc(r.note) +
      "<br><br>Real roles behind this view: " + U.esc(r.erp.join(", ")) + "." }));
    S.markActive(D.router.current);
  };

  S.markActive = function (route) {
    var id = route && route.page;
    Array.prototype.forEach.call(S.sidebarEl.querySelectorAll(".side-item"), function (b) {
      b.classList.toggle("on", b.dataset.page === id);
    });
    if (id) {
      var n = D.navById[id];
      var parent = n && n.parent ? n.parent : id;
      var kb = S.sidebarEl.querySelector('[data-kidsof="' + parent + '"]');
      if (kb) {
        kb.classList.add("open");
        var pr = S.sidebarEl.querySelector('.side-item[data-page="' + parent + '"]');
        if (pr) pr.classList.add("open");
      }
    }
  };

  /* page scaffolding used by every view */
  S.page = function (opts) {
    var main = U.clear(S.mainEl);
    if (opts.crumbs && opts.crumbs.length) {
      var c = U.el("div.crumbs");
      opts.crumbs.forEach(function (b, i) {
        if (i) c.appendChild(document.createTextNode("  ›  "));
        c.appendChild(b[1] ? U.el("button", { type: "button", text: b[0], onclick: function () { U.go(b[1]); } })
          : U.el("span", { text: b[0] }));
      });
      main.appendChild(c);
    }
    main.appendChild(U.el("div.pagehead", [
      U.el("div", [
        U.el("h1", { text: opts.title }),
        opts.sub ? U.el("div.sub", { text: opts.sub }) : null
      ]),
      opts.acts && opts.acts.length ? U.el("div.acts", opts.acts) : null
    ]));
    if (opts.notice !== false) main.appendChild(U.sampleNote(opts.noticeExtra));
    var body = U.el("div.pagebody");
    main.appendChild(body);
    main.appendChild(U.el("div.footer", { html:
      "<b>Demo ERP</b> &mdash; a static, display-only walkthrough for " + U.esc(D.COMPANY) + ". " +
      "No backend, no database, no login, no network calls. Every name, number and amount on this " +
      "page is invented." }));
    return body;
  };

  S.denied = function (title, needs) {
    var body = S.page({ title: title, sub: "This page is not available to the role you are viewing as." });
    body.appendChild(U.el("div.notice.deny", { html:
      "<b>No permission.</b> The <b>" + U.esc(S.role().label) + "</b> view does not hold the role this page is gated to. " +
      "In the real system it would not appear in the sidebar at all.<br><br>Required: " +
      U.esc((needs || []).join(", ") || "a role you do not hold") +
      ".<br>You hold: " + U.esc(S.role().erp.join(", ")) + "." }));
    body.appendChild(U.el("p.muted.small", "Switch the role at the top right to see it."));
  };

  /* act buttons */
  S.btn = function (label, kind, fn) {
    return U.el("button.btn" + (kind ? "." + kind : ""), {
      type: "button", text: label,
      onclick: fn || function () { U.demoOnly(label); }
    });
  };

  /* search from the top bar: jump to anything whose name or title matches */
  D.search = function (q) {
    if (!q || !q.trim()) return;
    q = q.trim().toLowerCase();
    var hits = [];
    Object.keys(D.sources).forEach(function (dt) {
      var rows = D[D.sources[dt]] || [];
      var meta = D.doctypes[dt];
      if (!meta) return;
      rows.forEach(function (r) {
        var t = [r.name, r.customer, r.customer_name, r.company_name, r.lead_name, r.subject,
          r.title, r.employee_name, r.item_code, r.item_name, r.supplier_name, r.transporter_name,
          r.party_name, r.zone_name].filter(Boolean).join(" ").toLowerCase();
        if (t.indexOf(q) >= 0 && hits.length < 40) hits.push([dt, r]);
      });
    });
    var pages = D.nav.filter(function (n) {
      return n.label.toLowerCase().indexOf(q) >= 0 && D.canSee(n, D.state.role);
    });
    if (!hits.length && !pages.length) { U.toast("Nothing matches “" + q + "”.", "No results"); return; }
    if (!hits.length && pages.length === 1) { U.go("#/p/" + pages[0].id); return; }
    if (hits.length === 1 && !pages.length) { U.go("#/f/" + D.slug(hits[0][0]) + "/" + encodeURIComponent(hits[0][1].name)); return; }
    var body = [];
    if (pages.length) {
      body.push(U.el("div.sec", "Pages"));
      body.push(U.el("div", pages.map(function (p) {
        return U.el("div", { style: "padding:3px 0" }, [U.link(p.label, "#/p/" + p.id, "lnk")]);
      })));
    }
    if (hits.length) {
      body.push(U.el("div.sec", "Records"));
      body.push(U.el("div", hits.slice(0, 20).map(function (h) {
        var dt = h[0], r = h[1], meta = D.doctypes[dt];
        var title = r.name + (r.customer || r.company_name || r.subject || r.title || r.employee_name ?
          " — " + (r.customer || r.company_name || r.subject || r.title || r.employee_name) : "");
        return U.el("div", { style: "padding:3px 0" }, [
          U.el("span.muted.small", { text: meta.label + "  " }),
          U.link(title, "#/f/" + D.slug(dt) + "/" + encodeURIComponent(r.name), "lnk")
        ]);
      })));
    }
    U.modal("Search: " + q, body);
  };
})(window.DEMO = window.DEMO || {});
