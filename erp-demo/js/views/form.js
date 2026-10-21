/* Demo ERP - the shared record form. Walks the field list in data/schema.js and
 * honours Tab Break / Section Break / Column Break exactly as the real desk does. */
(function (D) {
  var U = D.u, S = D.shell;
  D.views = D.views || {};

  function flags(def) { return (def[4] || "").split(",").map(function (s) { return s.trim(); }); }
  function has(def, f) { return flags(def).indexOf(f) >= 0; }

  function fieldNode(dt, row, def, opts) {
    var fname = def[0], flabel = def[1], ftype = def[2], fopts = def[3] || "";
    var v = row[fname];
    var ro = has(def, "ro") || opts.readOnly;
    var wrap = U.el("div.fld" + (ftype === "Check" ? ".chk" : ""));
    if (ftype !== "Check") {
      wrap.appendChild(U.el("label", { html: U.esc(flabel || fname) +
        (has(def, "reqd") ? ' <span class="req">*</span>' : "") }));
    }
    var box;
    if (ftype === "Check") {
      wrap.appendChild(U.el("div.v", [
        U.el("span.box" + (v ? ".on" : ""), { html: v ? "&#10003;" : "" }),
        U.el("span", { text: flabel || fname })
      ]));
      return wrap;
    }
    if (ftype === "Select" && !ro) {
      var sel = U.el("select", { "aria-label": flabel },
        fopts.split("\n").map(function (o) {
          return U.el("option", { value: o, text: o === "" ? "(not set)" : o });
        }));
      sel.value = v == null ? "" : v;
      sel.addEventListener("change", function () {
        U.toast("Demo only, nothing is saved. “" + flabel + "” would become “" +
          (sel.value || "(not set)") + "”.", "No change made");
      });
      box = U.el("div.v", [sel]);
      wrap.appendChild(box);
      return wrap;
    }
    var disp;
    if (ftype === "Currency") disp = v == null || v === "" ? "" : U.money(v);
    else if (ftype === "Date") disp = U.date(v);
    else if (ftype === "Datetime") disp = U.datetime(v);
    else if (ftype === "Time") disp = U.time(v);
    else if (ftype === "Percent") disp = v == null || v === "" ? "" : v + "%";
    else if (ftype === "Float" || ftype === "Int") disp = v == null || v === "" ? "" : U.num(v);
    else disp = v == null ? "" : String(v);

    var cls = ".v" + (ro ? ".ro" : "") +
      (["Small Text", "Text", "Text Editor"].indexOf(ftype) >= 0 ? ".big" : "") +
      (disp === "" ? ".blank" : "");
    box = U.el("div" + cls, { text: disp === "" ? "not set" : disp });
    wrap.appendChild(box);
    if (ftype === "Link" && fopts) wrap.appendChild(U.el("div.hint", { text: "Link › " + fopts }));
    if (ftype === "Attach") wrap.appendChild(U.el("div.hint", { text: disp ? "attached (demo file name only)" : "nothing attached" }));
    return wrap;
  }

  function gridNode(dt, row, def) {
    var child = D.doctypes[def[3]];
    var rows = row[def[0]] || [];
    var out = U.el("div");
    out.appendChild(U.el("div.gridlabel", { text: (def[1] || def[0]) + " — " + rows.length + " row" + (rows.length === 1 ? "" : "s") }));
    if (!child) { out.appendChild(U.el("div.muted.small", "child table " + def[3])); return out; }
    var cols = (child.fields || []).filter(function (f) { return has(f, "lv"); });
    if (!cols.length) cols = (child.fields || []).slice(0, 5);
    if (!rows.length) {
      out.appendChild(U.el("div.empty", "No rows."));
      return out;
    }
    var t = U.el("table.grid");
    t.appendChild(U.el("thead", [U.el("tr", [U.el("th", { text: "#" })].concat(cols.map(function (c) {
      return U.el("th", { text: c[1] || c[0] });
    })))]));
    var tb = U.el("tbody");
    rows.forEach(function (r, i) {
      tb.appendChild(U.el("tr", [U.el("td.gidx", { text: String(r.idx || i + 1),
        data: { label: "#" } })].concat(cols.map(function (c) {
        var v = r[c[0]], t2 = c[2], s;
        if (t2 === "Currency") s = v == null || v === "" ? "—" : U.money(v);
        else if (t2 === "Date") s = U.date(v) || "—";
        else if (t2 === "Datetime") s = U.datetime(v) || "—";
        else if (t2 === "Check") s = v ? "Yes" : "No";
        else if (t2 === "Float" || t2 === "Int") s = v == null || v === "" ? "—" : U.num(v);
        else s = v == null || v === "" ? "—" : String(v);
        if (t2 === "Select" && v) return U.el("td", { data: { label: c[1] || c[0] } }, [U.ind(v)]);
        return U.el("td", { text: s, data: { label: c[1] || c[0] } });
      }))));
    });
    t.appendChild(tb);
    out.appendChild(U.el("div", { style: "overflow-x:auto" }, [t]));
    return out;
  }

  /* the HTML-field widgets the real forms inject */
  function htmlWidget(dt, row, fname) {
    if (fname === "custom_stage_tracker") {
      var stages = D.ORDER_STAGES, cur = row.custom_order_stage;
      var ci = stages.indexOf(cur);
      var track = U.el("div.stagetrack");
      stages.forEach(function (s, i) {
        if (i) track.appendChild(U.el("span.arr", { html: "&#9656;" }));
        var cls = cur === "Closed" ? "" : (i < ci ? ".done" : (i === ci ? ".now" : ""));
        track.appendChild(U.el("span.st" + cls, { text: i === 2 ? "Billed" : s }));
      });
      var out = U.el("div", [track]);
      if (cur === "Closed") out.appendChild(U.el("div.notice.warn", { style: "margin:8px 0 0",
        html: "<b>Closed &mdash; never dispatched.</b> Closed is not cancelled: the order keeps its number and its history, " +
          "it just stops asking to be worked on." }));
      return out;
    }
    if (fname === "custom_party_card" || fname === "custom_party_card_section") {
      var c = null;
      D.customers.forEach(function (x) { if (x.name === row.customer) c = x; });
      if (!c) return U.el("div.muted.small", "No customer card.");
      return U.el("div.partycard", [
        U.el("div.pn", { text: c.customer_name }),
        U.el("div.pr", { text: "Ask for " + c.custom_contact_name + " · " + c.custom_mobile_no }),
        U.el("div.pr", { text: c.custom_address + ", " + c.custom_city + " " + c.custom_pincode }),
        U.el("div.pr", { text: "GSTIN " + c.gstin + " · account owned by " + c.owner_name })
      ]);
    }
    if (fname === "custom_totals_breakdown") {
      var lines = [["Net total", row.total], ["Transport / delivery charge", row.custom_transport_charge],
        ["GST (" + (row.custom_gst_charged_rate || 0) + "%)", row.total_taxes_and_charges],
        ["Grand total", row.grand_total]];
      return U.el("div.partycard", lines.map(function (l, i) {
        return U.el("div" + (i === lines.length - 1 ? ".pn" : ".pr"), {
          text: l[0] + ": " + U.money(l[1]) });
      }).concat([U.el("div.pr", { text: row.custom_transport_charge ?
        "The freight line sits in the grand total as an Actual charge, with GST applied on the previous row total." :
        "No freight on this order." })]));
    }
    if (fname === "custom_history" || fname === "custom_party_history") {
      var party = row.customer || row.company_name || row.customer_name || row.party_name;
      var os = D.orders.filter(function (o) { return o.customer === party; });
      var qs = D.quotations.filter(function (o) { return o.party_name === party; });
      if (!os.length && !qs.length) return U.el("div.muted.small", "Nothing yet for this party.");
      var t = U.el("table.grid");
      t.appendChild(U.el("thead", [U.el("tr", ["Document", "Date", "Status", "Value"].map(function (h) {
        return U.el("th", { text: h });
      }))]));
      var tb = U.el("tbody");
      qs.concat([]).forEach(function (o) {
        tb.appendChild(U.el("tr.clickable", { onclick: function () { U.go("#/f/quotation/" + encodeURIComponent(o.name)); } },
          [U.el("td", [U.el("span.lnk", { text: o.name })]), U.el("td", { text: U.date(o.transaction_date) }),
           U.el("td", [U.ind(o.status)]), U.el("td", { text: U.money(o.grand_total) })]));
      });
      os.forEach(function (o) {
        tb.appendChild(U.el("tr.clickable", { onclick: function () { U.go("#/f/sales-order/" + encodeURIComponent(o.name)); } },
          [U.el("td", [U.el("span.lnk", { text: o.name })]), U.el("td", { text: U.date(o.transaction_date) }),
           U.el("td", [U.ind(o.custom_order_stage)]), U.el("td", { text: U.money(o.grand_total) })]));
      });
      t.appendChild(tb);
      return U.el("div", { style: "overflow-x:auto" }, [t]);
    }
    if (fname === "custom_journey") {
      var seq = ["Lead Received", "Catalog Sent", "Follow Up", "Sample Sent", "1st Order", "2nd Order", "3rd Order", "Regular Customer"];
      var cur = row.custom_stage, ci = seq.indexOf(cur);
      var track = U.el("div.stagetrack");
      seq.forEach(function (s, i) {
        if (i) track.appendChild(U.el("span.arr", { html: "&#9656;" }));
        track.appendChild(U.el("span.st" + (ci >= 0 && i < ci ? ".done" : (i === ci ? ".now" : "")), { text: s }));
      });
      var note = ci < 0 ? U.el("div.muted.small", { style: "margin-top:6px",
        text: "“" + cur + "” sits outside the order journey - it is a parked or lost state." }) : null;
      return U.el("div", [track, note]);
    }
    if (fname === "custom_progress_bar") {
      var p = row.progress || 0;
      return U.el("div", [
        U.el("div.bar", [U.el("span.bl", { text: "Sub-tasks done" }),
          U.el("span.bt", [U.el("span.bf", { style: "width:" + Math.max(1, p) + "%" })]),
          U.el("span.bv", { text: p + "%" })]),
        U.el("div.muted.small", { style: "margin-top:4px",
          text: "Driven by the sub-task table below, not typed in." })
      ]);
    }
    if (fname === "custom_attachments_html") {
      return U.el("div", [
        U.el("div.muted.small", "Files and photos attached to this task. In the real app these are private attachments; here only the names exist."),
        U.el("div", { style: "margin-top:8px;display:flex;gap:8px;flex-wrap:wrap" },
          ["site-photo-1.jpg", "rate-sheet.pdf"].map(function (f) {
            return U.el("span.ind.blue.plain", { text: f });
          }))
      ]);
    }
    if (fname === "custom_chat_html" || fname === "chat") {
      return D.views.chatBlock(row, dt);
    }
    if (fname === "tdf_stock_movement_html") {
      var it = row;
      var inw = 40 + (D.items.indexOf(row) * 23) % 180, out = 20 + (D.items.indexOf(row) * 17) % 120;
      var t2 = U.el("table.grid");
      t2.appendChild(U.el("thead", [U.el("tr", ["Measure", "Quantity"].map(function (h) { return U.el("th", { text: h }); }))]));
      t2.appendChild(U.el("tbody", [["Opening / adjustment", it.on_hand - inw + out], ["Total inward", inw],
        ["Total dispatched", out], ["Current stock", it.on_hand]].map(function (r) {
          return U.el("tr", [U.el("td", { text: r[0] }), U.el("td", { text: U.num(r[1]) })]);
        })));
      return U.el("div", [t2, U.el("div.muted.small", { style: "margin-top:6px",
        text: "Opening + inward − dispatched = current stock. A SKU where that does not add up is flagged on the live dashboard." })]);
    }
    if (fname === "status_actions" || fname === "people_actions" || fname === "summary") return null;
    return U.el("div.muted.small", { text: "(" + fname + ")" });
  }

  D.views.form = function (slug, name) {
    var dt = D.bySlug[slug], meta = dt && D.doctypes[dt];
    if (!meta) { S.page({ title: "Unknown record", sub: slug }); return; }
    var allowed = D.listRoles[dt];
    if (allowed && allowed.length && allowed.indexOf(D.state.role) < 0 && D.state.role !== "Admin") {
      S.denied(meta.label + " " + name, allowed); return;
    }
    var rows = D.rowsFor(dt), row = null;
    rows.forEach(function (r) { if (String(r.name) === String(name)) row = r; });
    if (!row) {
      var b = S.page({ title: "Record not found", sub: meta.label + " " + name });
      b.appendChild(U.el("p", [U.link("Back to the list", "#/l/" + slug, "lnk")]));
      return;
    }

    /* actions, filtered by the demo role and the current stage */
    var role = D.state.role, acts = [];
    (meta.actions || []).forEach(function (a) {
      var roleOk = a.role.indexOf("*") >= 0 || role === "Admin" ||
        a.role.some(function (r) { return r === role || (r === "Sales" && role === "SalesMgr") ||
          (r === "SalesMgr" && role === "SalesMgr"); });
      if (!roleOk) return;
      if (a.when && meta.stageField && row[meta.stageField] !== a.when) return;
      acts.push(S.btn(a.label, a.primary ? "primary" : null));
    });
    acts.push(S.btn("Back to list", null, function () { U.go("#/l/" + slug); }));

    var title = row.name;
    var crumbTitle = meta.plural || meta.label;
    var body = S.page({
      title: title,
      sub: [row.customer, row.customer_name, row.company_name, row.subject, row.title,
        row.employee_name, row.item_name, row.supplier_name, row.transporter_name,
        row.party_name, row.zone_name].filter(Boolean)[0] || meta.label,
      crumbs: [["Home", "#/p/home"], [crumbTitle, "#/l/" + slug], [row.name, null]],
      acts: acts
    });

    /* status strip */
    var strip = U.el("div.formbar", [U.el("span.nm", { text: meta.label })]);
    if (meta.submittable) {
      strip.appendChild(U.ind(row.docstatus === 2 ? "Cancelled" : row.docstatus === 1 ? "Submitted" : "Draft",
        row.docstatus === 2 ? "red" : row.docstatus === 1 ? "blue" : "grey"));
    }
    if (meta.stageField && row[meta.stageField]) strip.appendChild(U.ind(row[meta.stageField]));
    if (row.status && !meta.stageField) strip.appendChild(U.ind(row.status));
    strip.appendChild(U.el("span.muted.small", { text: "naming series " + (meta.naming || "—") }));
    body.appendChild(strip);

    /* walk the field list into tabs / sections / columns */
    var fields = meta.fields || [];
    var tabs = [{ label: null, sections: [] }];
    var sec = null, col = null;
    function newSection(lab) { sec = { label: lab, cols: [[]] }; col = sec.cols[0]; tabs[tabs.length - 1].sections.push(sec); }
    newSection(null);
    fields.forEach(function (def) {
      var t = def[2];
      if (t === "Tab Break") { tabs.push({ label: def[1], sections: [] }); newSection(null); return; }
      if (t === "Section Break") { newSection(def[1] || null); return; }
      if (t === "Column Break") { col = []; sec.cols.push(col); return; }
      col.push(def);
    });
    tabs = tabs.filter(function (tb) {
      return tb.sections.some(function (s) { return s.cols.some(function (c) { return c.length; }); });
    });
    if (tabs.length && tabs[0].label === null) tabs[0].label = "Details";

    var panels = [];
    var tabBar = tabs.length > 1 ? U.el("div.tabs") : null;
    tabs.forEach(function (tb, ti) {
      var panel = U.el("div", { hidden: ti !== 0 });
      tb.sections.forEach(function (s) {
        if (!s.cols.some(function (c) { return c.length; })) return;
        var box = U.el("div.fsec");
        if (s.label) box.appendChild(U.el("h4", { text: s.label }));
        var grid = U.el("div.fcols");
        s.cols.forEach(function (c) {
          if (!c.length) return;
          var cd = U.el("div");
          c.forEach(function (def) {
            if (def[2] === "Table") cd.appendChild(gridNode(dt, row, def));
            else if (def[2] === "HTML") {
              var w = htmlWidget(dt, row, def[0]);
              if (w) {
                if (def[1]) cd.appendChild(U.el("div.gridlabel", { text: def[1] }));
                cd.appendChild(w);
              }
            } else cd.appendChild(fieldNode(dt, row, def, {}));
          });
          grid.appendChild(cd);
        });
        box.appendChild(grid);
        panel.appendChild(box);
      });
      panels.push(panel);
      if (tabBar) {
        var btn = U.el("button" + (ti === 0 ? ".on" : ""), { type: "button", text: tb.label });
        btn.addEventListener("click", function () {
          panels.forEach(function (p, i) { p.hidden = i !== ti; });
          Array.prototype.forEach.call(tabBar.children, function (b, i) { b.classList.toggle("on", i === ti); });
        });
        tabBar.appendChild(btn);
      }
    });
    if (tabBar) body.appendChild(tabBar);
    panels.forEach(function (p) { body.appendChild(p); });

    /* linked documents */
    var links = D.linkedDocs(dt, row);
    if (links.length) {
      body.appendChild(U.el("div.sec", "Connections"));
      body.appendChild(U.el("div.tablewrap", [(function () {
        var t = U.el("table.dt");
        t.appendChild(U.el("thead", [U.el("tr", ["Document", "Type", "Date", "Status"].map(function (h) {
          return U.el("th", { text: h }); }))]));
        t.appendChild(U.el("tbody", links.map(function (l) {
          return U.el("tr.clickable", { onclick: function () { U.go(l.hash); } }, [
            U.el("td", [U.el("span.lnk", { text: l.name })]),
            U.el("td", { text: l.type }),
            U.el("td", { text: U.date(l.date) }),
            U.el("td", [l.status ? U.ind(l.status) : U.el("span.muted", "—")])
          ]);
        })));
        return t;
      })()]));
    }

    body.appendChild(U.el("p.muted.small", { style: "margin-top:14px", text:
      "Fields marked * are mandatory on the real form. Read-only fields are shaded. " +
      "Select boxes can be changed to show the options; nothing is saved." }));
  };

  D.linkedDocs = function (dt, row) {
    var out = [];
    if (dt === "Sales Order") {
      D.deliveryNotes.forEach(function (d) {
        if (d.against_sales_order === row.name)
          out.push({ name: d.name, type: "Delivery Note", date: d.posting_date, status: d.status,
            hash: "#/f/delivery-note/" + encodeURIComponent(d.name) });
      });
      D.paymentEntries.forEach(function (p) {
        if (p.remarks && p.remarks.indexOf(row.name) >= 0)
          out.push({ name: p.name, type: "Payment Entry", date: p.posting_date, status: "Submitted",
            hash: "#/f/payment-entry/" + encodeURIComponent(p.name) });
      });
      D.customers.forEach(function (c) {
        if (c.name === row.customer)
          out.push({ name: c.name, type: "Customer", date: "", status: "",
            hash: "#/f/customer/" + encodeURIComponent(c.name) });
      });
    }
    if (dt === "Customer" || dt === "Lead") {
      var party = row.name === undefined ? "" : (row.customer_name || row.company_name);
      D.orders.forEach(function (o) {
        if (o.customer === party)
          out.push({ name: o.name, type: "Sales Order", date: o.transaction_date, status: o.custom_order_stage,
            hash: "#/f/sales-order/" + encodeURIComponent(o.name) });
      });
      D.quotations.forEach(function (q) {
        if (q.party_name === party)
          out.push({ name: q.name, type: "Quotation", date: q.transaction_date, status: q.status,
            hash: "#/f/quotation/" + encodeURIComponent(q.name) });
      });
    }
    if (dt === "Purchase Receipt") {
      (row.items || []).forEach(function (L) {
        out.push({ name: L.batch_no, type: "Batch / Lot", date: row.posting_date, status: "",
          hash: "#/f/batch/" + encodeURIComponent(L.batch_no) });
      });
    }
    if (dt === "Delivery Note" && row.against_sales_order) {
      out.push({ name: row.against_sales_order, type: "Sales Order", date: row.posting_date, status: "",
        hash: "#/f/sales-order/" + encodeURIComponent(row.against_sales_order) });
    }
    if (dt === "Employee") {
      D.employeeDocuments.forEach(function (d) {
        if (d.employee === row.name)
          out.push({ name: d.name, type: "Employee Document", date: d.date, status: d.document_type,
            hash: "#/f/employee-document/" + encodeURIComponent(d.name) });
      });
      D.leaveApplications.forEach(function (l) {
        if (l.employee === row.name)
          out.push({ name: l.name, type: "Leave Application", date: l.from_date, status: l.status,
            hash: "#/f/leave-application/" + encodeURIComponent(l.name) });
      });
    }
    if (dt === "Batch") {
      D.purchaseReceipts.forEach(function (p) {
        (p.items || []).forEach(function (L) {
          if (L.batch_no === row.name)
            out.push({ name: p.name, type: "Purchase Receipt", date: p.posting_date, status: "",
              hash: "#/f/purchase-receipt/" + encodeURIComponent(p.name) });
        });
      });
    }
    return out.slice(0, 12);
  };
})(window.DEMO = window.DEMO || {});
