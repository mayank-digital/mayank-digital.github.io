/* Demo ERP - the shared list view. One renderer for every doctype, driven by
 * listColumns and filters in data/schema.js. */
(function (D) {
  var U = D.u, S = D.shell;
  D.views = D.views || {};

  function value(dt, row, f) {
    var meta = D.doctypes[dt], def = null;
    (meta.fields || []).forEach(function (x) { if (x[0] === f) def = x; });
    var v = row[f];
    if (f === "name") return row.name;
    if (!def) return v;
    var t = def[2];
    if (t === "Currency") return U.money(v);
    if (t === "Date") return U.date(v);
    if (t === "Datetime") return U.datetime(v);
    if (t === "Check") return v ? "Yes" : "No";
    if (t === "Percent") return (v || 0) + "%";
    if (t === "Float" || t === "Int") return U.num(v);
    return v;
  }
  function isNumeric(dt, f) {
    var def = null;
    (D.doctypes[dt].fields || []).forEach(function (x) { if (x[0] === f) def = x; });
    return def && ["Currency", "Float", "Int", "Percent"].indexOf(def[2]) >= 0;
  }
  function label(dt, f) {
    if (f === "name") return "ID";
    var out = f;
    (D.doctypes[dt].fields || []).forEach(function (x) { if (x[0] === f) out = x[1] || f; });
    /* a few list-only columns that are not form fields */
    var extra = { on_hand: "On Hand", owner_name: "Account Owner", rates: "Rates", last_used: "Last Used",
      shipments: "Shipments", last_inward: "Last Inward", assigned_to: "Assigned To", progress: "Progress",
      docstatus: "Status", employee_code: "Code", batch_qty: "Batch Qty", states: "States in this zone" };
    return extra[f] || out;
  }
  function isStatusCol(dt, f) {
    var def = null;
    (D.doctypes[dt].fields || []).forEach(function (x) { if (x[0] === f) def = x; });
    return (def && def[2] === "Select") || f === "docstatus";
  }

  D.rowsFor = function (dt) {
    var rows = (D[D.sources[dt]] || []).slice();
    /* apply in-memory kanban moves */
    var meta = D.doctypes[dt];
    if (meta && meta.stageField) {
      rows = rows.map(function (r) {
        var mv = D.state.moved[dt + "|" + r.name];
        if (!mv) return r;
        var c = {}; Object.keys(r).forEach(function (k) { c[k] = r[k]; });
        c[meta.stageField] = mv;
        return c;
      });
    }
    return rows;
  };

  /* record-level scoping: a sales user sees their own leads first, and only
   * their own numbers in Insights - mirrored here as an "Only mine" toggle. */
  D.ownerField = { "Lead": "lead_owner", "Sales Order": "custom_sales_person", "Customer": "owner_name",
    "Quotation": null, "Task": "assigned_to" };

  D.views.list = function (slug, preset) {
    var dt = D.bySlug[slug];
    if (!dt || !D.doctypes[dt]) { S.page({ title: "Unknown list", sub: slug }); return; }
    var meta = D.doctypes[dt];
    var allowed = D.listRoles[dt];
    if (allowed && allowed.length && allowed.indexOf(D.state.role) < 0 && D.state.role !== "Admin") {
      S.denied(meta.plural || meta.label, allowed);
      return;
    }
    var st = { q: "", filters: {}, mine: false, sort: null, desc: true };
    if (preset) Object.keys(preset).forEach(function (k) { st.filters[k] = preset[k]; });

    var cols = meta.listColumns || ["name"];
    /* On a phone a card shows the title, the status chip and up to three more
     * fields. These are those three. */
    var keyCols = cols.filter(function (c, i) {
      return i > 0 && !isStatusCol(dt, c);
    }).slice(0, 3);
    var acts = [];
    if ((meta.actions || []).length) {
      acts.push(S.btn("+ New " + meta.label, "primary", function () { U.demoOnly("new " + meta.label); }));
    }
    if (D.boards.leads && dt === "Lead") acts.push(S.btn("Open the board", null, function () { U.go("#/k/leads"); }));
    if (dt === "Task") acts.push(S.btn("Open the board", null, function () { U.go("#/k/tasks"); }));

    var body = S.page({
      title: meta.plural || meta.label,
      sub: meta.blurb || "",
      crumbs: [["Home", "#/p/home"], [meta.plural || meta.label, null]],
      acts: acts
    });

    /* ---- filter bar ----
     * The search box is always visible. The filters go inside .fbar-more, which
     * is `display:contents` on a desktop (so the bar looks exactly as before)
     * and a collapsible panel below the phone breakpoint. */
    var bar = U.el("div.fbar");
    var q = U.el("input", { type: "text", placeholder: "Search " + (meta.plural || meta.label).toLowerCase() + "…" });
    q.addEventListener("input", function () { st.q = q.value; draw(); });
    bar.appendChild(q);
    var more = U.el("div.fbar-more");
    var toggle = U.el("button.btn.fbar-toggle", { type: "button",
      "aria-expanded": "false", "aria-controls": "fbar-more",
      onclick: function () {
        var open = more.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.textContent = open ? "Hide filters" : "Filters";
      } }, "Filters");
    more.id = "fbar-more";
    bar.appendChild(toggle);
    bar.appendChild(more);
    (meta.filters || []).forEach(function (f) {
      var fname = f[0], flabel = f[1];
      var def = null;
      (meta.fields || []).forEach(function (x) { if (x[0] === fname) def = x; });
      var opts = def && def[3] ? def[3].split("\n") : U.uniq(D.rowsFor(dt).map(function (r) { return r[fname]; }));
      var sel = U.el("select", { "aria-label": flabel },
        [U.el("option", { value: "", text: flabel + ": any" })].concat(
          opts.filter(function (o) { return o !== ""; }).map(function (o) {
            return U.el("option", { value: o, text: String(o) });
          })));
      if (st.filters[fname]) sel.value = st.filters[fname];
      sel.addEventListener("change", function () { st.filters[fname] = sel.value; draw(); });
      more.appendChild(sel);
    });
    var ownerF = D.ownerField[dt];
    if (ownerF) {
      var mine = S.btn("Only mine", null, function () {
        st.mine = !st.mine; mine.classList.toggle("on", st.mine); draw();
      });
      more.appendChild(mine);
    }
    var count = U.el("span.count");
    bar.appendChild(count);
    body.appendChild(bar);

    var wrap = U.el("div.tablewrap.listcards");
    body.appendChild(wrap);

    function filtered() {
      var rows = D.rowsFor(dt);
      var keys = cols.concat(["name", "customer", "company_name", "lead_name", "subject", "title",
        "employee_name", "item_name", "supplier_name", "transporter_name", "party_name", "zone_name",
        "custom_tracking_id", "custom_courier_name", "mobile_no", "custom_mobile_no", "custom_city"]);
      rows = rows.filter(function (r) {
        if (!U.matches(r, st.q, U.uniq(keys))) return false;
        for (var k in st.filters) {
          if (!st.filters[k]) continue;
          if (String(r[k] == null ? "" : r[k]) !== st.filters[k]) return false;
        }
        if (st.mine && ownerF && r[ownerF] !== S.me().name) return false;
        return true;
      });
      if (st.sort) rows = U.sortBy(rows, st.sort, st.desc);
      return rows;
    }

    function draw() {
      var rows = filtered();
      count.textContent = rows.length + " of " + D.rowsFor(dt).length;
      U.clear(wrap);
      if (!rows.length) {
        wrap.appendChild(U.el("div.empty", "Nothing matches the filters above."));
        return;
      }
      var table = U.el("table.dt");
      table.appendChild(U.el("thead", [U.el("tr", cols.map(function (c) {
        var th = U.el("th" + (isNumeric(dt, c) ? ".num" : ""), { text: label(dt, c),
          style: "cursor:pointer", title: "Sort by " + label(dt, c) });
        th.addEventListener("click", function () {
          st.desc = st.sort === c ? !st.desc : false;
          st.sort = c; draw();
        });
        return th;
      }))]));
      var tb = U.el("tbody");
      rows.forEach(function (r) {
        var tr = U.el("tr.clickable", {
          onclick: function () { U.go("#/f/" + slug + "/" + encodeURIComponent(r.name)); }
        });
        cols.forEach(function (c, ci) {
          /* col-title / col-status / m-key / m-rest drive the phone card layout:
           * the title and the status chip head the card, two or three key
           * fields follow as label-and-value lines, the rest are hidden. */
          var role = ci === 0 ? ".col-title"
            : (isStatusCol(dt, c) ? ".col-status" : (keyCols.indexOf(c) >= 0 ? ".m-key" : ".m-rest"));
          var td = U.el("td" + (isNumeric(dt, c) ? ".num" : "") + role);
          td.dataset.label = label(dt, c);
          if (c === "name" || c === "item_code" || c === "transporter_name" || c === "supplier_name" ||
              c === "customer_name" || c === "zone_name" || c === "employee_name" && dt === "Employee") {
            td.appendChild(U.el("span.lnk", { text: String(r[c] == null ? r.name : r[c]) }));
          } else if (isStatusCol(dt, c) && r[c]) {
            td.appendChild(U.ind(r[c]));
          } else if (c === "docstatus") {
            td.appendChild(U.ind(r.docstatus === 2 ? "Cancelled" : r.docstatus === 1 ? "Submitted" : "Draft",
              r.docstatus === 2 ? "red" : r.docstatus === 1 ? "blue" : "grey"));
          } else if (c === "progress") {
            td.appendChild(U.el("span", { text: (r.progress || 0) + "%" }));
          } else if (c === "disabled") {
            td.appendChild(U.ind(r.disabled ? "Disabled" : "Active", r.disabled ? "grey" : "green"));
          } else if (c === "on_hand" || c === "batch_qty") {
            var low = c === "on_hand" && r.reorder_level > 0 && r.on_hand <= r.reorder_level;
            td.appendChild(U.el("span", { text: U.num(r[c]) }));
            if (low) td.appendChild(U.el("span.ind.red", { text: "LOW", style: "margin-left:6px" }));
          } else {
            var v = value(dt, r, c);
            td.textContent = (v == null || v === "") ? "—" : String(v);
            if (v == null || v === "") td.className += " muted";
          }
          tr.appendChild(td);
        });
        tb.appendChild(tr);
      });
      table.appendChild(tb);
      wrap.appendChild(table);
    }
    draw();

    body.appendChild(U.el("p.muted.small", { style: "margin-top:12px" , text:
      "Click any row to open the record. Column headers sort. " +
      ((meta.filters || []).length ? "The dropdowns are the standard filters on this list." : "") }));
  };
})(window.DEMO = window.DEMO || {});
