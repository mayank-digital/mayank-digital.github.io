/* Demo ERP - page dispatcher, the Home launcher, and the link-list workspaces. */
(function (D) {
  var U = D.u, S = D.shell;
  D.views = D.views || {};

  D.views.page = function (id) {
    var n = D.navById[id];
    if (!n) { S.page({ title: "Unknown page", sub: id }); return; }
    if (!D.canSee(n, D.state.role)) { S.denied(n.label, n.erp); return; }
    var fn = D.screens[n.kind];
    if (!fn) { S.page({ title: n.label, sub: n.sub }); return; }
    fn(n);
  };

  D.screens = {};

  /* ---------------- Home: punch card + app launcher ---------------- */
  D.screens.home = function (n) {
    var me = S.me(), role = S.role();
    var body = S.page({
      title: "Hello, " + me.name.split(" ")[0],
      sub: "The desk home: today's punch card, and a launcher showing only the tools your role can open.",
      acts: [S.btn("Refresh", null, function () { D.router.render(); })]
    });

    /* punch widget */
    var p = D.state.punch;
    var card = U.el("div.punchcard");
    function drawPunch() {
      U.clear(card);
      card.appendChild(U.el("div.greet", { text: me.name }));
      card.appendChild(U.el("div.date", { text: "Thursday, " + U.date(D.TODAY) + " · General Shift" }));
      var times = U.el("div.times");
      times.appendChild(U.el("div", { html: "Punched in<b>" + (p.in ? U.time(p.in) : "--:--") + "</b>" }));
      times.appendChild(U.el("div", { html: "Punched out<b>" + (p.out ? U.time(p.out) : "--:--") + "</b>" }));
      card.appendChild(times);
      if (!p.in) {
        card.appendChild(U.el("button.punchbtn", { type: "button", text: "Punch In",
          onclick: function () { p.in = "09:12"; drawPunch(); U.demoOnly("punch in"); } }));
      } else if (!p.out) {
        card.appendChild(U.el("button.punchbtn.out", { type: "button", text: "Punch Out",
          onclick: function () { p.out = "18:30"; drawPunch(); U.demoOnly("punch out"); } }));
      } else {
        card.appendChild(U.el("button.punchbtn.done", { type: "button", disabled: true, text: "✓  Done for today" }));
      }
      card.appendChild(U.el("div.muted.small", { style: "margin-top:10px",
        text: "The punch is geofenced. The geofence lives on the shift assignment, not on the shift type." }));
      card.appendChild(U.el("p", { style: "margin:8px 0 0" },
        [U.link("Missed a punch? Send a correction", "#/l/attendance-correction", "lnk")]));
    }
    drawPunch();

    var mineBox = U.el("div.tiles");
    var workBox = U.el("div.tiles");
    var MY = ["my-hr", "my-profile", "my-attendance", "my-leave", "tasks", "chats"];
    D.nav.forEach(function (x) {
      if (x.id === "home") return;
      if (!D.canSee(x, D.state.role)) return;
      if (x.parent) return;
      var tile = U.el("button.tile", { type: "button", onclick: function () { U.go("#/p/" + x.id); } }, [
        U.el("div.ic", { text: x.icon }),
        U.el("div.t", { text: x.label }),
        U.el("div.h", { text: x.sub })
      ]);
      (MY.indexOf(x.id) >= 0 ? mineBox : workBox).appendChild(tile);
    });

    body.appendChild(U.el("div.punch", [card, U.el("div", [
      U.el("div.sec", { style: "margin-top:0" }, "My tools"),
      mineBox
    ])]));
    body.appendChild(U.el("div.sec", "Work areas"));
    body.appendChild(workBox);

    body.appendChild(U.el("div.sec", "What this view can and cannot see"));
    body.appendChild(U.el("div.card.card-pad", [
      U.el("p", { style: "margin:0 0 8px", html:
        "You are viewing as <b>" + U.esc(role.label) + "</b> (" + U.esc(me.name) + ", " + U.esc(me.desig) + "). " +
        U.esc(role.note) }),
      U.el("p", { style: "margin:0", html: "Real roles behind this view: <b>" + U.esc(role.erp.join(", ")) + "</b>. " +
        "Switch at the top right to watch the sidebar and the screens change." })
    ]));
  };

  /* ---------------- link-list workspaces ---------------- */
  D.screens.links = function (n) {
    var cfg = D.linkPages[n.id] || {};
    var body = S.page({ title: n.label, sub: n.sub, crumbs: crumbs(n) });
    if (cfg.cards && cfg.cards.length) {
      body.appendChild(U.el("div.cards", cfg.cards.map(function (c) {
        return U.ncard(c.label, c.value, c.hint, c.color);
      })));
    }
    if (cfg.shortcuts && cfg.shortcuts.length) {
      body.appendChild(U.el("div.sec", "Your shortcuts"));
      body.appendChild(U.el("div.tiles", cfg.shortcuts.map(function (s) {
        var dt = s[1];
        var live = dt && D.sources[dt];
        var cnt = live ? (D[D.sources[dt]] || []).length : null;
        return U.el("button.tile", { type: "button",
          onclick: live ? function () { U.go("#/l/" + D.slug(dt)); } : function () {
            U.toast("“" + s[0] + "” is a stock ERPNext screen that is not part of this walkthrough.", "Not in the demo");
          } }, [
          U.el("div.t", { text: s[0] }),
          U.el("div.h", { text: live ? cnt + " record" + (cnt === 1 ? "" : "s") + " in the demo" : "stock screen, not reproduced" })
        ]);
      })));
    }
    (cfg.groups || []).length && body.appendChild(U.el("div.sec", "Everything on this page"));
    if (cfg.groups) {
      body.appendChild(U.el("div.linkgroups", cfg.groups.map(function (g) {
        return U.el("div.linkgroup", [
          U.el("h4", { text: g[0] }),
          U.el("ul", g[1].map(function (l) {
            var dt = l[1], live = dt && D.sources[dt];
            if (live) {
              return U.el("li", [U.el("button", { type: "button", text: l[0],
                onclick: function () { U.go("#/l/" + D.slug(dt)); } })]);
            }
            return U.el("li.plain", { text: l[0] });
          }))
        ]);
      })));
      body.appendChild(U.el("p.muted.small", { style: "margin-top:12px", text:
        "Blue entries open a screen in this demo. Grey entries are stock ERPNext doctypes and reports that are " +
        "part of the real workspace but outside the walkthrough." }));
    }
    if (n.id === "purchase") {
      body.appendChild(U.el("div.sec", "Import shipments"));
      body.appendChild(U.el("div.notice", { html:
        "<b>Why a receipt, not a stock entry.</b> Stock coming in from a supplier is posted as a Purchase Receipt so " +
        "that the lot number carries the vendor with it. That link is the only thing that lets stock on the shelf be " +
        "attributed back to who it was bought from - see the vendor stock reports under Dispatch." }));
      D.views.reportList(body, ["todays-stock-receipts", "vendor-stock-balance", "vendor-stock-movement"], "Reports");
    }
    if (n.id === "receivables") {
      body.appendChild(U.el("div.notice.warn", { html:
        "<b>Why this register can disagree with the order book.</b> Day-to-day billing happens outside this system and " +
        "the invoice is attached to the order, so the order book is the source of truth for what was sold. " +
        "The invoice register here exists for compliance reporting." }));
    }
    if (n.id === "support") {
      body.appendChild(U.el("div.notice", { html:
        "<b>Not the chat desk.</b> This is the stock ERPNext support module. Internal questions between departments " +
        "go through <b>Chats</b> instead, which is a custom screen over the native comment store." }));
    }
  };

  function crumbs(n) {
    var c = [["Home", "#/p/home"]];
    if (n.parent) c.push([D.navById[n.parent].label, "#/p/" + n.parent]);
    c.push([n.label, null]);
    return c;
  }
  D.crumbs = crumbs;

  /* a reusable "where do you want to go?" nav block, as the real consoles use */
  D.navBlock = function (ids, title) {
    var kids = ids.map(function (id) { return D.navById[id]; })
      .filter(function (x) { return x && D.canSee(x, D.state.role); });
    if (!kids.length) return null;
    return U.el("div", [
      U.el("div.sec", title || "Where do you want to go?"),
      U.el("div.tiles", kids.map(function (k) {
        return U.el("button.tile", { type: "button", onclick: function () { U.go("#/p/" + k.id); } }, [
          U.el("div.ic", { text: k.icon }),
          U.el("div.t", { text: k.label }),
          U.el("div.h", { text: k.sub })
        ]);
      }))
    ]);
  };
})(window.DEMO = window.DEMO || {});
