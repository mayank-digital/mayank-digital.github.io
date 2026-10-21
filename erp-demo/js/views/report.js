/* Demo ERP - report viewer. One renderer for every custom report. */
(function (D) {
  var U = D.u, S = D.shell;
  D.views = D.views || {};

  D.views.report = function (key) {
    var r = D.reports[key];
    if (!r) { S.page({ title: "Unknown report", sub: key }); return; }
    var rows = r.rows();
    var body = S.page({
      title: r.label,
      sub: r.blurb,
      crumbs: [["Home", "#/p/home"], [r.label, null]],
      acts: [S.btn("Export", null), S.btn("Print", null)]
    });
    body.appendChild(U.el("div.strip", [
      U.el("span.s", { html: "<b>" + U.esc(r.type) + "</b>" }),
      U.el("span.s", { html: "on <b>" + U.esc(r.ref) + "</b>" }),
      U.el("span.s", { html: "<b>" + rows.length + "</b> row" + (rows.length === 1 ? "" : "s") })
    ]));
    var wrap = U.el("div.tablewrap");
    if (!rows.length) {
      wrap.appendChild(U.el("div.empty", "No rows for this period."));
    } else {
      /* .rpt keeps the horizontal-scroll grid on a phone: a report is a
       * matrix, and stacking it into cards would destroy it. */
      var t = U.el("table.dt.rpt");
      t.appendChild(U.el("thead", [U.el("tr", r.cols.map(function (c, i) {
        return U.el("th" + ((r.num || []).indexOf(i) >= 0 ? ".num" : ""), { text: c });
      }))]));
      t.appendChild(U.el("tbody", rows.map(function (row) {
        return U.el("tr", row.map(function (v, i) {
          var isNum = (r.num || []).indexOf(i) >= 0;
          var txt;
          if (v == null || v === "") txt = "—";
          else if (isNum && typeof v === "number" && Math.abs(v) > 999) txt = U.money(v);
          else if (isNum) txt = U.num(v);
          else txt = String(v);
          return U.el("td" + (isNum ? ".num" : ""), { text: txt });
        }));
      })));
      /* total row for money columns */
      var money = (r.num || []).filter(function (i) {
        return rows.some(function (row) { return typeof row[i] === "number" && Math.abs(row[i]) > 999; });
      });
      if (money.length) {
        t.appendChild(U.el("tfoot", [U.el("tr", r.cols.map(function (c, i) {
          if (i === 0) return U.el("td", { html: "<b>Total</b>" });
          if (money.indexOf(i) < 0) return U.el("td");
          return U.el("td.num", { html: "<b>" + U.esc(U.money(U.sum(rows, function (row) { return row[i]; }))) + "</b>" });
        }))]));
      }
      wrap.appendChild(t);
    }
    body.appendChild(wrap);
    body.appendChild(U.el("p.muted.small", { style: "margin-top:12px", text:
      "Report-type number cards elsewhere in the demo read their value from a report like this one, " +
      "rather than counting a doctype directly." }));
  };

  D.views.reportList = function (host, keys, title) {
    host.appendChild(U.el("div.sec", title || "Reports"));
    host.appendChild(U.el("div.linkgroups", [U.el("div.linkgroup", [
      U.el("ul", keys.map(function (k) {
        var r = D.reports[k];
        return U.el("li", [U.el("button", { type: "button", text: r.label,
          onclick: function () { U.go("#/r/" + k); } }),
          U.el("span.muted.small", { text: "  " + r.type })]);
      }))
    ])]));
  };
})(window.DEMO = window.DEMO || {});
