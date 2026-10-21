/* Demo ERP - small helpers. No libraries, no network. */
(function (D) {
  var U = D.u = {};

  U.esc = function (s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };

  /* element builder: el("div.card", {attrs}, [children|string]) */
  U.el = function (spec, attrs, kids) {
    var m = /^([a-z0-9]+)?((?:[.#][^.#]+)*)$/i.exec(spec || "div") || [];
    var node = document.createElement(m[1] || "div");
    (m[2] || "").split(/(?=[.#])/).forEach(function (t) {
      if (!t) return;
      if (t[0] === ".") node.classList.add(t.slice(1));
      else node.id = t.slice(1);
    });
    if (attrs && typeof attrs === "object" && !Array.isArray(attrs)) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v == null || v === false) return;
        if (k === "html") node.innerHTML = v;
        else if (k === "text") node.textContent = v;
        else if (k.slice(0, 2) === "on" && typeof v === "function") node.addEventListener(k.slice(2), v);
        else if (k === "data" && typeof v === "object") Object.keys(v).forEach(function (d) { node.dataset[d] = v[d]; });
        else node.setAttribute(k, v === true ? "" : v);
      });
    } else if (attrs != null) { kids = attrs; }
    if (kids != null) {
      (Array.isArray(kids) ? kids : [kids]).forEach(function (c) {
        if (c == null || c === false) return;
        node.appendChild(typeof c === "string" || typeof c === "number"
          ? document.createTextNode(String(c)) : c);
      });
    }
    return node;
  };
  U.frag = function (kids) {
    var f = document.createDocumentFragment();
    (kids || []).forEach(function (c) { if (c) f.appendChild(c); });
    return f;
  };
  U.clear = function (n) { while (n && n.firstChild) n.removeChild(n.firstChild); return n; };

  /* ---------- formatting ---------- */
  U.money = function (v, withSym) {
    var n = Number(v || 0), neg = n < 0;
    n = Math.round(Math.abs(n));
    var s = String(n), out;
    if (s.length > 3) {
      var last3 = s.slice(-3), rest = s.slice(0, -3);
      out = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3;
    } else { out = s; }
    return (neg ? "-" : "") + (withSym === false ? "" : "₹") + out;
  };
  U.lakh = function (v) {
    var n = Number(v || 0);
    if (Math.abs(n) >= 10000000) return "₹" + (n / 10000000).toFixed(2) + " Cr";
    if (Math.abs(n) >= 100000) return "₹" + (n / 100000).toFixed(2) + " L";
    return U.money(n);
  };
  U.num = function (v) {
    var n = Number(v || 0);
    return (Math.round(n * 100) / 100).toString();
  };
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  /* Dates read DD-MM-YYYY throughout, the way they are written in India. The
   * stored values stay ISO (YYYY-MM-DD) so they still sort correctly. */
  U.date = function (s) {
    if (!s) return "";
    var p = String(s).slice(0, 10).split("-");
    if (p.length !== 3) return String(s);
    return p[2] + "-" + p[1] + "-" + p[0];
  };
  U.dateShort = function (s) {            /* DD-MM, for chart axis labels */
    if (!s) return "";
    var p = String(s).slice(0, 10).split("-");
    return p.length === 3 ? p[2] + "-" + p[1] : String(s);
  };
  U.dateLong = function (s) {             /* 18 June 2026, for a page heading */
    if (!s) return "";
    var p = String(s).slice(0, 10).split("-");
    if (p.length !== 3) return String(s);
    var FULL = ["January", "February", "March", "April", "May", "June", "July",
      "August", "September", "October", "November", "December"];
    return Number(p[2]) + " " + (FULL[Number(p[1]) - 1] || "") + " " + p[0];
  };
  U.datetime = function (s) {
    if (!s) return "";
    var d = U.date(s), t = String(s).slice(11, 16);
    if (!t) return d;
    var h = Number(t.slice(0, 2)), m = t.slice(3, 5);
    var ap = h >= 12 ? "pm" : "am", h12 = h % 12 === 0 ? 12 : h % 12;
    return d + ", " + h12 + ":" + m + " " + ap;
  };
  U.time = function (s) {
    if (!s) return "";
    var t = String(s).length > 10 ? String(s).slice(11, 16) : String(s).slice(0, 5);
    var h = Number(t.slice(0, 2)), m = t.slice(3, 5);
    if (isNaN(h)) return t;
    var ap = h >= 12 ? "pm" : "am", h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ":" + m + " " + ap;
  };
  U.days = function (from, to) {
    return Math.round((new Date(to || D.TODAY) - new Date(from)) / 86400000);
  };
  U.initials = function (n) {
    return String(n || "?").split(/\s+/).slice(0, 2).map(function (w) { return w[0] || ""; }).join("").toUpperCase();
  };
  U.MON = MON;

  /* ---------- indicators ---------- */
  U.indColor = function (v) { return D.indicators[v] || "grey"; };
  U.ind = function (v, cls) {
    if (v == null || v === "") return U.el("span.muted", "—");
    return U.el("span.ind." + (cls || U.indColor(v)), { text: String(v) });
  };

  /* ---------- toast ---------- */
  var toastBox = null;
  U.toast = function (msg, title, kind) {
    if (!toastBox) {
      toastBox = U.el("div.toasts");
      document.body.appendChild(toastBox);
    }
    var t = U.el("div.toast" + (kind ? "." + kind : ""), [
      title ? U.el("b", { text: title }) : null,
      U.el("span", { text: msg })
    ]);
    toastBox.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 4200);
  };
  /* The one message every write-shaped button shows. */
  U.demoOnly = function (what) {
    U.toast("Demo only, nothing is saved." + (what ? " (" + what + ")" : ""), "No change made");
  };

  /* ---------- modal ---------- */
  U.modal = function (title, bodyNodes, footNodes) {
    var scrim = U.el("div.modal-scrim");
    function close() { if (scrim.parentNode) scrim.parentNode.removeChild(scrim); }
    var box = U.el("div.modal", [
      U.el("div.mh", [U.el("h3", { text: title }), U.el("button", { type: "button", "aria-label": "Close", onclick: close, html: "&times;" })]),
      U.el("div.mb", bodyNodes || []),
      U.el("div.mf", (footNodes || []).concat([U.el("button.btn", { type: "button", text: "Close", onclick: close })]))
    ]);
    scrim.appendChild(box);
    scrim.addEventListener("click", function (e) { if (e.target === scrim) close(); });
    document.body.appendChild(scrim);
    return { close: close, box: box };
  };

  /* ---------- misc ---------- */
  U.go = function (hash) { window.location.hash = hash; };
  U.link = function (text, hash, cls) {
    return U.el("button." + (cls || "lnkbtn"), {
      type: "button", text: text,
      onclick: function (e) { e.stopPropagation(); U.go(hash); }
    });
  };
  U.sortBy = function (arr, key, desc) {
    return arr.slice().sort(function (a, b) {
      var x = a[key], y = b[key];
      if (x == null) x = ""; if (y == null) y = "";
      if (typeof x === "number" && typeof y === "number") return desc ? y - x : x - y;
      return desc ? String(y).localeCompare(String(x)) : String(x).localeCompare(String(y));
    });
  };
  U.sum = function (arr, fn) { return arr.reduce(function (s, x) { return s + (Number(fn(x)) || 0); }, 0); };
  U.uniq = function (arr) { var s = []; arr.forEach(function (x) { if (x && s.indexOf(x) < 0) s.push(x); }); return s; };
  U.groupCount = function (arr, fn) {
    var m = {};
    arr.forEach(function (x) { var k = fn(x); if (k == null || k === "") k = "(blank)"; m[k] = (m[k] || 0) + 1; });
    return m;
  };
  U.groupSum = function (arr, keyFn, valFn) {
    var m = {};
    arr.forEach(function (x) { var k = keyFn(x); if (k == null || k === "") k = "(blank)"; m[k] = (m[k] || 0) + (Number(valFn(x)) || 0); });
    return m;
  };
  U.matches = function (obj, q, keys) {
    if (!q) return true;
    q = q.toLowerCase();
    return (keys || Object.keys(obj)).some(function (k) {
      var v = obj[k];
      return typeof v !== "object" && String(v == null ? "" : v).toLowerCase().indexOf(q) >= 0;
    });
  };

  /* bar chart from a {label: value} map */
  U.bars = function (map, opts) {
    opts = opts || {};
    var keys = Object.keys(map);
    if (opts.order) keys = opts.order.filter(function (k) { return map[k] !== undefined; });
    else keys = keys.sort(function (a, b) { return map[b] - map[a]; });
    if (opts.limit) keys = keys.slice(0, opts.limit);
    var max = 0;
    keys.forEach(function (k) { max = Math.max(max, Math.abs(map[k])); });
    if (!keys.length) return U.el("div.muted.small", "Nothing to show yet.");
    return U.el("div.bars", keys.map(function (k) {
      var pct = max ? Math.max(1.5, (Math.abs(map[k]) / max) * 100) : 0;
      return U.el("div.bar", [
        U.el("span.bl", { text: k, title: k }),
        U.el("span.bt", [U.el("span.bf", { style: "width:" + pct + "%" + (opts.color ? ";background:" + opts.color : "") })]),
        U.el("span.bv", { text: opts.fmt ? opts.fmt(map[k]) : String(map[k]) })
      ]);
    }));
  };

  /* grouped column chart: series = [{label, a, b}] */
  U.columns = function (series, legendA, legendB, fmt) {
    var max = 0;
    series.forEach(function (s) { max = Math.max(max, s.a || 0, s.b || 0); });
    var chart = U.el("div.colchart", series.map(function (s) {
      var ha = max ? Math.max(3, (s.a / max) * 120) : 3;
      var hb = max ? Math.max(3, (s.b / max) * 120) : 3;
      return U.el("div.cc", [
        U.el("span.ccv", { text: fmt ? fmt(s.a) : String(s.a) }),
        U.el("div", { style: "display:flex;gap:3px;align-items:flex-end;width:100%;justify-content:center" }, [
          U.el("span.ccb", { style: "height:" + ha + "px", title: legendA + ": " + (fmt ? fmt(s.a) : s.a) }),
          U.el("span.ccb.alt", { style: "height:" + hb + "px", title: legendB + ": " + (fmt ? fmt(s.b) : s.b) })
        ]),
        U.el("span.ccl", { text: s.label, title: s.label })
      ]);
    }));
    return U.el("div", [chart, U.el("div.legend", [
      U.el("span", { html: '<i style="background:var(--accent)"></i>' + U.esc(legendA) }),
      U.el("span", { html: '<i style="background:#9fcdf7"></i>' + U.esc(legendB) })
    ])]);
  };

  /* number card */
  U.ncard = function (label, value, hint, color, hash) {
    return U.el(hash ? "button.ncard.c-" + (color || "grey") : "div.ncard.c-" + (color || "grey"), {
      type: hash ? "button" : null,
      onclick: hash ? function () { U.go(hash); } : null
    }, [
      U.el("div.lab", { text: label }),
      U.el("div.val", { text: String(value) }),
      hint ? U.el("div.hint", { text: hint }) : null
    ]);
  };

  /* Phone card metadata, applied once per render.
   * A list view sets these itself; every other table in the demo gets them
   * from here, so a phone can stack any table into labelled cards without
   * each screen having to care. .rpt tables are left alone - they stay a
   * scrolling grid, because a report is a matrix. */
  U.autoLabel = function (root) {
    if (!root) return;
    var tables = root.querySelectorAll("table.dt:not(.rpt)");
    Array.prototype.forEach.call(tables, function (t) {
      var ths = t.querySelectorAll("thead th");
      var heads = Array.prototype.map.call(ths, function (th) { return th.textContent || ""; });
      var rows = t.querySelectorAll("tbody tr");
      Array.prototype.forEach.call(rows, function (tr) {
        var keys = 0;
        Array.prototype.forEach.call(tr.children, function (td, i) {
          var head = (heads[i] || "").trim();
          if (!td.dataset.label && head) td.dataset.label = head;
          if (td.className.indexOf("col-title") >= 0 || td.className.indexOf("col-status") >= 0 ||
              td.className.indexOf("col-act") >= 0 ||
              td.className.indexOf("m-key") >= 0 || td.className.indexOf("m-rest") >= 0) {
            if (td.className.indexOf("m-key") >= 0) keys++;
            return;
          }
          if (i === 0) td.classList.add("col-title");
          /* A blank column heading means an action column. It gets no label and
           * is never hidden: on a phone the button spans the card. */
          else if (!head && td.querySelector("button")) td.classList.add("col-act");
          else if (td.querySelector(".ind")) td.classList.add("col-status");
          else if (keys < 3) { td.classList.add("m-key"); keys++; }
          else td.classList.add("m-rest");
        });
      });
    });
  };

  U.sampleNote = function (extra) {
    return U.el("div.notice", { html:
      "<b>Sample data.</b> Every person, company, phone number, amount and message on this page is invented for the demo. " +
      "Nothing is saved - buttons that would write say so." + (extra ? " " + U.esc(extra) : "") });
  };
})(window.DEMO = window.DEMO || {});
