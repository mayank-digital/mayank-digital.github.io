/* Demo ERP - the Dispatch console and the stock screens. */
(function (D) {
  var U = D.u, S = D.shell;

  function lowItems() {
    return D.items.filter(function (it) { return !it.disabled && it.reorder_level > 0 && it.on_hand <= it.reorder_level; });
  }
  function stockValue() {
    return U.sum(D.items, function (it) { return it.on_hand * it.valuation_rate; });
  }

  /* ---------------- Dispatch home ---------------- */
  D.screens["dispatch-home"] = function (n) {
    var body = S.page({ title: "Dispatch", sub: n.sub, crumbs: D.crumbs(n) });
    var ready = D.rowsFor("Sales Order").filter(function (o) { return o.custom_order_stage === "Ready to Dispatch"; });
    var withAcc = D.rowsFor("Sales Order").filter(function (o) { return o.custom_order_stage === "With Accounts"; });
    var noTrack = D.rowsFor("Sales Order").filter(function (o) {
      return o.custom_order_stage === "Dispatched" && !o.custom_tracking_id; });
    var today = D.deliveryNotes.filter(function (d) { return d.posting_date === "2026-06-17"; });

    body.appendChild(U.el("div.cards", [
      U.ncard("Orders to Dispatch", ready.length, "billed and released", "purple", "#/p/dispatch-board"),
      U.ncard("Not Released Yet", withAcc.length, "still with accounts", "amber", "#/p/dispatch-board"),
      U.ncard("Dispatched Today", today.length, "delivery notes submitted", "green", "#/l/delivery-note"),
      U.ncard("Waiting On Tracking", noTrack.length, "gone out, no docket yet", noTrack.length ? "red" : "grey", "#/p/dispatch-board"),
      U.ncard("Low Stock", lowItems().length, "at or below reorder level", lowItems().length ? "red" : "grey", "#/p/live-stock"),
      U.ncard("Stock value", U.lakh(stockValue()), "at valuation rate", "blue", "#/p/live-stock")
    ]));
    body.appendChild(U.el("div.strip", [
      U.el("span.s", { html: "Stock as of <b>18 Jun 2026</b>" }),
      U.el("span.s", { html: "<b>" + D.items.filter(function (i) { return !i.disabled; }).length + "</b> SKUs tracked" }),
      U.el("span.s", { html: "<b>" + D.batches.filter(function (b) { return b.on_hand > 0; }).length + "</b> lots on the shelf" })
    ]));

    body.appendChild(U.el("div.sec", "What do you want to do?"));
    body.appendChild(U.el("div.bigbtns", [
      U.el("button.bigbtn", { type: "button", onclick: function () { U.go("#/p/stock-out"); } }, [
        U.el("span.t", "Send Stock Out"),
        U.el("span.h", "Pick the customer, then THE ORDER, then what is going. One order, one delivery note, one tracked flow.")
      ]),
      U.el("button.bigbtn", { type: "button", onclick: function () { U.go("#/p/stock-in"); } }, [
        U.el("span.t", "Record Stock In"),
        U.el("span.h", "One shipment - vendor, invoice, lot and quantities.")
      ]),
      U.el("button.bigbtn", { type: "button", onclick: function () { U.go("#/p/returns"); } }, [
        U.el("span.t", "Record a Return"),
        U.el("span.h", "Goods coming back - some to the shelf, some to the defective bin.")
      ])
    ]));

    body.appendChild(D.navBlock(["dispatch-board", "stock-in", "stock-out", "returns", "live-stock",
      "daily-summary", "sku", "vendors"]));
    D.views.reportList(body, D.reportsFor.dispatch);
  };

  /* ---------------- Dispatch board ---------------- */
  D.screens["dispatch-board"] = function (n) {
    var body = S.page({ title: "Dispatch Board", sub:
      "Every order that is out of accounts and not yet finished. Change where one has got to without opening it.",
      crumbs: D.crumbs(n) });
    var st = { q: "", done: false };
    var bar = U.el("div.fbar");
    var q = U.el("input", { type: "text", placeholder: "Order, customer, transporter or docket number" });
    q.addEventListener("input", function () { st.q = q.value; draw(); });
    bar.appendChild(q);
    var lab = U.el("label", { style: "font-size:12.5px;color:var(--ink-2);display:flex;gap:6px;align-items:center" });
    var cb = U.el("input", { type: "checkbox" });
    cb.addEventListener("change", function () { st.done = cb.checked; draw(); });
    lab.appendChild(cb); lab.appendChild(document.createTextNode("show completed"));
    bar.appendChild(lab);
    var count = U.el("span.count");
    bar.appendChild(count);
    body.appendChild(bar);
    var host = U.el("div");
    body.appendChild(host);

    var STATUSES = ["Order Received", "Packing", "Shipped", "In Transit", "Delivery", "Completed"];
    function draw() {
      var rows = D.rowsFor("Sales Order").filter(function (o) {
        if (o.custom_order_stage === "Order Placed" || o.custom_order_stage === "Closed") return false;
        if (!st.done && o.custom_order_stage === "Delivered") return false;
        return U.matches(o, st.q, ["name", "customer", "custom_courier_name", "custom_tracking_id",
          "custom_dispatch_transporter"]);
      });
      count.textContent = rows.length + " order" + (rows.length === 1 ? "" : "s");
      U.clear(host);
      if (!rows.length) { host.appendChild(U.el("div.empty", "Nothing found.")); return; }
      rows.forEach(function (o) {
        var card = U.el("div.rowcard");
        card.appendChild(U.el("div.rh", [
          U.el("span.t", [U.link(o.name, "#/f/sales-order/" + encodeURIComponent(o.name), "lnk")]),
          U.el("span", { text: o.customer }),
          U.ind(o.custom_order_stage),
          U.el("span.sp"),
          U.el("span.muted.small", { text: U.money(o.grand_total) })
        ]));
        var row = U.el("div.rb");
        row.appendChild(U.el("span", { html: "Courier <b>" + U.esc(o.custom_courier_name || "not set") + "</b>" }));
        row.appendChild(U.el("span", { html: "Docket <b>" + U.esc(o.custom_tracking_id || "not set") + "</b>" }));
        row.appendChild(U.el("span", { text: o.custom_delivery_dest_city + ", " + o.custom_delivery_dest_state }));
        row.appendChild(U.el("span", { text: o.custom_delivery_boxes + " box, " + o.custom_delivery_weight + " kg" }));
        card.appendChild(row);
        var acts = U.el("div.rb", { style: "margin-top:9px;align-items:center" });
        var sel = U.el("select", { "aria-label": "Dispatch status for " + o.name, style: "font-size:12.5px;padding:4px 7px;border:1px solid var(--line);border-radius:6px" },
          STATUSES.map(function (s) { return U.el("option", { value: s, text: s }); }));
        sel.value = o.custom_dispatch_status;
        sel.addEventListener("change", function () {
          U.toast("Demo only, nothing is saved. " + o.name + " would move to “" + sel.value + "”.", "Status changed");
        });
        acts.appendChild(U.el("span", { html: "<b>Now at</b>" }));
        acts.appendChild(sel);
        if (!o.custom_tracking_id) {
          acts.appendChild(U.el("button.btn.sm.primary", { type: "button", text: "Add courier & docket",
            onclick: function () { trackDialog(o); } }));
        } else {
          acts.appendChild(U.el("button.btn.sm", { type: "button", text: "Edit tracking",
            onclick: function () { trackDialog(o); } }));
        }
        if (o.custom_order_stage === "Dispatched") {
          acts.appendChild(U.el("button.btn.sm", { type: "button", text: "Mark Delivered",
            onclick: function () { U.demoOnly("mark " + o.name + " delivered"); } }));
        }
        card.appendChild(acts);
        host.appendChild(card);
      });
    }
    draw();
    body.appendChild(U.el("div.notice", { style: "margin-top:14px", html:
      "<b>Why this board exists.</b> Saving a courier and a docket number is what moves an order from " +
      "<i>Ready to Dispatch</i> to <i>Dispatched</i>, so the whole handover is one dialog rather than a form. " +
      "A completed order drops off the board unless you tick <i>show completed</i>." }));
  };

  function trackDialog(o) {
    var sel = U.el("select", D.transporters.filter(function (t) { return !t.disabled; })
      .map(function (t) { return U.el("option", { text: t.transporter_name }); }));
    if (o.custom_courier_name) sel.value = o.custom_courier_name;
    var m = U.modal("Dispatch " + o.name, [
      U.el("p.muted.small", { style: "margin:0 0 12px", text:
        "Courier and docket number. Saving them moves the order to Dispatched." }),
      U.el("label", "Courier / Transport"), sel,
      U.el("label", "Tracking / Docket ID"), U.el("input", { type: "text", value: o.custom_tracking_id || "", placeholder: "Docket number" }),
      U.el("label", "Tracking Link"), U.el("input", { type: "text", placeholder: "Optional. Must be a full web address." }),
      U.el("p.muted.small", { style: "margin:4px 0 0", text:
        "The courier is managed on the courier rate cards, so the dropdown only offers active ones." })
    ], [U.el("button.btn.primary", { type: "button", text: "Save and dispatch",
      onclick: function () { m.close(); U.demoOnly("save tracking for " + o.name); } })]);
  }

  /* ---------------- Stock In ---------------- */
  D.screens["stock-in"] = function (n) {
    var body = S.page({ title: "Stock In", sub: "One shipment: vendor, their invoice, the lot number and the quantities.",
      crumbs: D.crumbs(n), acts: [S.btn("+ Record Inward", "primary", inwardDialog)] });
    var bar = U.el("div.fbar");
    var sup = U.el("select", [U.el("option", { value: "", text: "All suppliers" })].concat(
      D.suppliers.map(function (s) { return U.el("option", { text: s.supplier_name }); })));
    var from = U.el("input", { type: "date", value: "2026-05-01" });
    var to = U.el("input", { type: "date", value: "2026-06-18" });
    bar.appendChild(U.el("span.small.muted", "From")); bar.appendChild(from);
    bar.appendChild(U.el("span.small.muted", "to")); bar.appendChild(to);
    bar.appendChild(sup);
    bar.appendChild(S.btn("Apply", null, function () { draw(); }));
    var count = U.el("span.count");
    bar.appendChild(count);
    body.appendChild(bar);
    var host = U.el("div");
    body.appendChild(host);
    function draw() {
      var rows = D.purchaseReceipts.filter(function (p) {
        if (sup.value && p.supplier !== sup.value) return false;
        return p.posting_date >= from.value && p.posting_date <= to.value;
      });
      count.textContent = rows.length + " shipment" + (rows.length === 1 ? "" : "s");
      U.clear(host);
      if (!rows.length) { host.appendChild(U.el("div.empty", "No inwards match that filter yet.")); return; }
      rows.forEach(function (p) {
        var card = U.el("div.rowcard");
        card.appendChild(U.el("div.rh", [
          U.el("span.t", [U.link(p.name, "#/f/purchase-receipt/" + encodeURIComponent(p.name), "lnk")]),
          U.el("span", { text: p.supplier }),
          U.el("span.ind.green", { text: "Received" }),
          U.el("span.sp"),
          U.el("span.muted.small", { text: U.date(p.posting_date) })
        ]));
        card.appendChild(U.el("div.rb", [
          U.el("span", { html: "Supplier invoice <b>" + U.esc(p.supplier_invoice_no) + "</b>" }),
          U.el("span", { html: "<b>" + U.num(p.total_qty) + "</b> units" }),
          U.el("span", { html: "Shipment value <b>" + U.esc(U.money(p.grand_total)) + "</b>" }),
          U.el("span", { html: "<b>" + p.items.length + "</b> SKU rows" })
        ]));
        var t = U.el("table.grid", { style: "margin-top:9px" });
        t.appendChild(U.el("thead", [U.el("tr", ["SKU", "Product", "Lot", "Qty", "Unit", "Rate", "Line value"]
          .map(function (h) { return U.el("th", { text: h }); }))]));
        t.appendChild(U.el("tbody", p.items.map(function (L) {
          return U.el("tr", [U.el("td", { text: L.item_code }), U.el("td", { text: L.item_name }),
            U.el("td", [U.link(L.batch_no, "#/f/batch/" + encodeURIComponent(L.batch_no), "lnk")]),
            U.el("td", { text: U.num(L.qty) }), U.el("td", { text: L.uom }),
            U.el("td", { text: U.money(L.rate) }), U.el("td", { text: U.money(L.amount) })]);
        })));
        card.appendChild(U.el("div", { style: "overflow-x:auto" }, [t]));
        host.appendChild(card);
      });
    }
    draw();
    body.appendChild(U.el("div.notice", { style: "margin-top:14px", html:
      "<b>Why every row needs a lot.</b> The lot number is the only thing that ties stock on the shelf back to the " +
      "vendor it came from. Receive without one and the vendor stock reports simply cannot see it." }));
  };

  function inwardDialog() {
    var sup = U.el("select", D.suppliers.map(function (s) { return U.el("option", { text: s.supplier_name }); }));
    var sku = U.el("select", D.items.filter(function (i) { return !i.disabled; })
      .map(function (i) { return U.el("option", { text: i.item_code + " — " + i.item_name }); }));
    var m = U.modal("Record Inward", [
      U.el("label", "Supplier"), sup,
      U.el("label", "Date received"), U.el("input", { type: "date", value: "2026-06-18" }),
      U.el("label", "Supplier Invoice / Challan No"), U.el("input", { type: "text", placeholder: "Their document number" }),
      U.el("label", "Material Receipt into"), U.el("select", [U.el("option", "Main Store"), U.el("option", "Defective Bin")]),
      U.el("div.sec", { style: "margin:14px 0 8px" }, "What came in"),
      U.el("label", "SKU"), sku,
      U.el("label", "Batch / Lot No"), U.el("input", { type: "text", placeholder: "LOT-2026-xxx" }),
      U.el("label", "Quantity"), U.el("input", { type: "number", value: "0" }),
      U.el("label", "Rate"), U.el("input", { type: "number", value: "0" }),
      U.el("p.muted.small", { style: "margin:4px 0 0", text:
        "The real dialog adds SKU rows one after another and refuses to post if any row has no SKU or a quantity of zero." })
    ], [U.el("button.btn.primary", { type: "button", text: "Save Inward",
      onclick: function () { m.close(); U.demoOnly("post a purchase receipt"); } })]);
  }

  /* ---------------- Stock Out ---------------- */
  D.screens["stock-out"] = function (n) {
    var body = S.page({ title: "Stock Out", sub:
      "Customer, then the order, then what is going. One order, one delivery note, one tracked flow.",
      crumbs: D.crumbs(n), acts: [S.btn("+ Send Stock Out", "primary", outwardDialog)] });
    var count = U.el("span.count");
    var bar = U.el("div.fbar", [U.el("span.small.muted", "From"),
      U.el("input", { type: "date", value: "2026-05-01" }), U.el("span.small.muted", "to"),
      U.el("input", { type: "date", value: "2026-06-18" }), S.btn("Apply", null, function () { U.demoOnly("apply the filter"); }), count]);
    body.appendChild(bar);
    var rows = D.deliveryNotes.filter(function (d) { return !d.is_return; });
    count.textContent = rows.length + " delivery note" + (rows.length === 1 ? "" : "s");
    var host = U.el("div");
    rows.forEach(function (d) {
      var card = U.el("div.rowcard");
      card.appendChild(U.el("div.rh", [
        U.el("span.t", [U.link(d.name, "#/f/delivery-note/" + encodeURIComponent(d.name), "lnk")]),
        U.el("span", { text: d.customer }),
        U.el("span.ind.blue", { text: "SENT" }),
        U.el("span.sp"),
        U.el("span.muted.small", { text: U.date(d.posting_date) })
      ]));
      card.appendChild(U.el("div.rb", [
        U.el("span", { html: "Against <b>" + U.esc(d.against_sales_order || "no order") + "</b>" }),
        U.el("span", { html: "Courier <b>" + U.esc(d.custom_courier_name || "—") + "</b>" }),
        U.el("span", { html: "Docket <b>" + U.esc(d.custom_tracking_id || "—") + "</b>" }),
        U.el("span", { html: "<b>" + U.num(d.total_qty) + "</b> units, " + U.esc(U.money(d.grand_total)) })
      ]));
      var t = U.el("table.grid", { style: "margin-top:9px" });
      t.appendChild(U.el("thead", [U.el("tr", ["SKU", "Product", "Lot", "Qty", "Unit"]
        .map(function (h) { return U.el("th", { text: h }); }))]));
      t.appendChild(U.el("tbody", d.items.map(function (L) {
        return U.el("tr", [U.el("td", { text: L.item_code }), U.el("td", { text: L.item_name }),
          U.el("td", { text: L.batch_no }), U.el("td", { text: U.num(L.qty) }), U.el("td", { text: L.uom })]);
      })));
      card.appendChild(U.el("div", { style: "overflow-x:auto" }, [t]));
      host.appendChild(card);
    });
    body.appendChild(host);
    body.appendChild(U.el("div.notice", { style: "margin-top:14px", html:
      "<b>The order comes second, not first.</b> The dialog asks for the customer, then shows that customer's open " +
      "orders, then the SKUs on the chosen order - so stock cannot leave against the wrong order. " +
      "Sending without an order is possible but is marked as a standalone outward: stock moved, nothing billed." }));
  };

  function outwardDialog() {
    var who = U.el("input", { type: "text", placeholder: "Search customer or lead" });
    var ord = U.el("select", [U.el("option", "Pick an order")].concat(
      D.rowsFor("Sales Order").filter(function (o) { return o.custom_order_stage === "Ready to Dispatch"; })
        .map(function (o) { return U.el("option", { text: o.name + " — " + o.customer }); })));
    var m = U.modal("Send Stock Out", [
      U.el("p.muted.small", { style: "margin:0 0 12px", text: "Step 1 of 3 - who is it going to?" }),
      U.el("label", "Customer or lead"), who,
      U.el("label", "Which order?"), ord,
      U.el("div.sec", { style: "margin:14px 0 8px" }, "What is going out"),
      U.el("p.muted.small", { style: "margin:0 0 10px", text:
        "On the real screen the SKU rows appear here, pre-filled from the chosen order with what is still to send, " +
        "and the quantity on each row is capped at what remains." }),
      U.el("label", "Dispatch date"), U.el("input", { type: "date", value: "2026-06-18" }),
      U.el("label", "Courier / Transport"),
      U.el("select", D.transporters.filter(function (t) { return !t.disabled; })
        .map(function (t) { return U.el("option", { text: t.transporter_name }); })),
      U.el("label", "Tracking / Docket ID"), U.el("input", { type: "text", placeholder: "Docket number" })
    ], [U.el("button.btn", { type: "button", text: "Send without an order",
          onclick: function () { m.close(); U.demoOnly("standalone outward"); } }),
        U.el("button.btn.primary", { type: "button", text: "Send Stock Out",
          onclick: function () { m.close(); U.demoOnly("post a delivery note"); } })]);
  }

  /* ---------------- Returns ---------------- */
  D.screens.returns = function (n) {
    var body = S.page({ title: "Returns", sub: "Goods coming back - some to the shelf, some to the defective bin.",
      crumbs: D.crumbs(n), acts: [S.btn("Return with no order", null, function () { U.demoOnly("standalone return"); })] });
    var bar = U.el("div.fbar");
    var q = U.el("input", { type: "text", placeholder: "Search an order number or a customer" });
    q.addEventListener("input", function () { draw(); });
    bar.appendChild(q);
    bar.appendChild(S.btn("Find", null, function () { draw(); }));
    body.appendChild(bar);

    body.appendChild(U.el("div.sec", "Which delivery did the goods go out on?"));
    var wrap = U.el("div.tablewrap");
    body.appendChild(wrap);
    function draw() {
      var rows = D.deliveryNotes.filter(function (d) { return !d.is_return; })
        .filter(function (d) { return U.matches(d, q.value, ["name", "customer", "against_sales_order"]); });
      U.clear(wrap);
      if (!rows.length) { wrap.appendChild(U.el("div.empty", "Nothing found.")); return; }
      var t = U.el("table.dt");
      t.appendChild(U.el("thead", [U.el("tr", ["Delivery", "Date", "Customer", "Order", "Units sent", ""]
        .map(function (h, i) { return U.el("th" + (i === 4 ? ".num" : ""), { text: h }); }))]));
      t.appendChild(U.el("tbody", rows.map(function (d) {
        return U.el("tr", [
          U.el("td", [U.link(d.name, "#/f/delivery-note/" + encodeURIComponent(d.name), "lnk")]),
          U.el("td", { text: U.date(d.posting_date) }),
          U.el("td", { text: d.customer }),
          U.el("td", { text: d.against_sales_order || "—" }),
          U.el("td.num", { text: U.num(d.total_qty) }),
          U.el("td", [U.el("button.btn.sm.primary", { type: "button", text: "Return from this",
            onclick: function () { returnDialog(d); } })])
        ]);
      })));
      wrap.appendChild(t);
    }
    draw();

    body.appendChild(U.el("div.sec", "Defective stock waiting for a decision"));
    var def = U.el("div.tablewrap");
    var dt = U.el("table.dt");
    dt.appendChild(U.el("thead", [U.el("tr", ["SKU", "Product", "Lot", "Qty", "Came back on", "Reason", ""]
      .map(function (h, i) { return U.el("th" + (i === 3 ? ".num" : ""), { text: h }); }))]));
    dt.appendChild(U.el("tbody", [U.el("tr", [
      U.el("td", { text: "AHP-MELT-05" }), U.el("td", { text: "Adhesive Powder - Hot Melt (5 kg pouch)" }),
      U.el("td", { text: "LOT-2026-108" }), U.el("td.num", { text: "2" }),
      U.el("td", { text: U.date("2026-06-14") }), U.el("td", { text: "Damaged in transit" }),
      U.el("td", [U.el("button.btn.sm.danger", { type: "button", text: "Write it off",
        onclick: function () { U.demoOnly("write off defective stock"); } })])
    ])]));
    def.appendChild(dt);
    body.appendChild(def);
    body.appendChild(U.el("div.notice.warn", { style: "margin-top:14px", html:
      "<b>Writing off cannot be undone.</b> Defective stock sits in its own bin until somebody decides. " +
      "Cancelling a return has to happen in order - cancel the voucher, re-read the ledger, then the bundles, " +
      "then the voucher itself; a standalone return with no delivery behind it invents a new lot." }));
  };

  function returnDialog(d) {
    var rows = d.items.map(function (L) {
      return U.el("div", { style: "border:1px solid var(--line);border-radius:6px;padding:10px;margin-bottom:10px" }, [
        U.el("div", { style: "font-weight:600;font-size:13px", text: L.item_code + " — " + L.item_name }),
        U.el("div.muted.small", { style: "margin-bottom:8px", text: "Lot " + L.batch_no + " · " + U.num(L.qty) + " " + L.uom + " still returnable" }),
        U.el("label", "How many came back"), U.el("input", { type: "number", value: "0", min: "0", max: String(L.qty) }),
        U.el("label", "What is happening to it"),
        U.el("select", [U.el("option", "Back to stock"), U.el("option", "Defective")])
      ]);
    });
    var m = U.modal("Return from " + d.name, [
      U.el("p.muted.small", { style: "margin:0 0 12px", text: "Which SKUs came back, and where each one goes." })
    ].concat(rows).concat([
      U.el("label", "Reason"), U.el("input", { type: "text", placeholder: "Damaged in transit, wrong item, …" }),
      U.el("label", "Note"), U.el("textarea", { rows: "2", placeholder: "Anything else" }),
      U.el("label", "Photo"), U.el("input", { type: "text", value: "", placeholder: "kept private, attached to the return" })
    ]), [U.el("button.btn.primary", { type: "button", text: "Record the return",
      onclick: function () { m.close(); U.demoOnly("record a return against " + d.name); } })]);
  }

  /* ---------------- Live stock dashboard ---------------- */
  D.screens["live-stock"] = function (n) {
    var body = S.page({ title: "Live Stock", sub: "What is on the shelf right now, with value.", crumbs: D.crumbs(n) });
    var active = D.items.filter(function (i) { return !i.disabled; });
    body.appendChild(U.el("div.cards", [
      U.ncard("SKUs tracked", active.length, "excluding disabled", "blue"),
      U.ncard("Stock value", U.lakh(stockValue()), "at valuation rate", "green"),
      U.ncard("Low stock", lowItems().length, "at or below reorder level", lowItems().length ? "red" : "grey"),
      U.ncard("Lots on the shelf", D.batches.filter(function (b) { return b.on_hand > 0; }).length, "with stock left", "purple"),
      U.ncard("Ledger mismatches", 0, "SKUs whose ledger does not add up", "grey")
    ]));
    var wrap = U.el("div.tablewrap");
    var t = U.el("table.dt");
    t.appendChild(U.el("thead", [U.el("tr", ["SKU", "Product", "Unit", "Opening / Adj", "Total Inward",
      "Total Dispatched", "Current Stock", "Reorder Level", "Status"]
      .map(function (h, i) { return U.el("th" + (i >= 3 && i <= 7 ? ".num" : ""), { text: h }); }))]));
    t.appendChild(U.el("tbody", D.items.map(function (it, i) {
      var inw = 40 + (i * 23) % 180, out = 20 + (i * 17) % 120;
      var low = it.reorder_level > 0 && it.on_hand <= it.reorder_level;
      return U.el("tr.clickable", { onclick: function () { U.go("#/f/item/" + encodeURIComponent(it.item_code)); } }, [
        U.el("td", [U.el("span.lnk", { text: it.item_code })]),
        U.el("td", { text: it.item_name + (it.custom_sku_variant ? " (" + it.custom_sku_variant + ")" : "") }),
        U.el("td", { text: it.stock_uom }),
        U.el("td.num", { text: U.num(it.on_hand - inw + out) }),
        U.el("td.num", { text: U.num(inw) }),
        U.el("td.num", { text: U.num(out) }),
        U.el("td.num", { html: "<b>" + U.esc(U.num(it.on_hand)) + "</b>" }),
        U.el("td.num", { text: it.reorder_level ? U.num(it.reorder_level) : "—" }),
        U.el("td", [it.disabled ? U.el("span.ind.grey", { text: "Disabled" }) :
          (low ? U.el("span.ind.red", { text: "LOW STOCK - REORDER" }) : U.el("span.ind.green", { text: "OK" }))])
      ]);
    })));
    wrap.appendChild(t);
    body.appendChild(wrap);
    body.appendChild(U.el("p.muted.small", { style: "margin-top:10px", text:
      "Opening + inward − dispatched = current stock. Any SKU where that does not hold is counted as a ledger " +
      "mismatch in the card above, because it means a voucher was posted outside the normal flow." }));
    D.views.reportList(body, ["item-stock-movement", "items-below-reorder-level", "vendor-stock-balance"]);
  };

  /* ---------------- Daily summary ---------------- */
  D.screens["daily-summary"] = function (n) {
    var body = S.page({ title: "Daily Summary", sub: "What came in and went out, day by day.", crumbs: D.crumbs(n) });
    var bar = U.el("div.fbar", [
      U.el("span.small.muted", "From"), U.el("input", { type: "date", value: "2026-06-08" }),
      U.el("span.small.muted", "to"), U.el("input", { type: "date", value: "2026-06-18" }),
      S.btn("Show", "primary", function () { U.demoOnly("change the range"); }),
      S.btn("Today"), S.btn("Last 7 days"), S.btn("This month")
    ]);
    body.appendChild(bar);
    body.appendChild(U.el("div.chartbox", { style: "margin-bottom:14px" }, [
      U.el("h4", "In and out, by day"),
      U.columns(D.dailyStock.slice().reverse().map(function (d) {
        return { label: U.dateShort(d.date), a: d.in_qty, b: d.out_qty };
      }), "Qty in", "Qty out", U.num)
    ]));
    var wrap = U.el("div.tablewrap");
    var t = U.el("table.dt");
    t.appendChild(U.el("thead", [U.el("tr", ["Date", "SKUs moved", "Stock In", "Stock Out", "Documents", "Closing"]
      .map(function (h, i) { return U.el("th" + (i ? ".num" : ""), { text: h }); }))]));
    t.appendChild(U.el("tbody", D.dailyStock.map(function (d) {
      return U.el("tr", [
        U.el("td", { text: U.date(d.date) }),
        U.el("td.num", { text: String(d.skus) }),
        U.el("td.num", { text: d.in_qty ? U.num(d.in_qty) : "—" }),
        U.el("td.num", { text: d.out_qty ? U.num(d.out_qty) : "—" }),
        U.el("td.num", { text: String(d.docs) }),
        U.el("td.num", { text: U.num(d.closing) })
      ]);
    })));
    wrap.appendChild(t);
    body.appendChild(wrap);
    body.appendChild(U.el("p.muted.small", { style: "margin-top:10px", text:
      "A day with no movement still gets a row, so a gap in the register is visible rather than invisible." }));
    D.views.reportList(body, ["daily-stock-movement-summary", "daily-dispatch-summary-report"]);
  };

  /* ---------------- SKU master ---------------- */
  D.screens.sku = function (n) {
    var body = S.page({ title: "SKU & Products", sub: "The product list, reorder levels and rates.",
      crumbs: D.crumbs(n), acts: [S.btn("+ Add SKU", "primary", skuDialog), S.btn("Full list view", null, function () { U.go("#/l/item"); })] });
    var st = { q: "" };
    var bar = U.el("div.fbar");
    var q = U.el("input", { type: "text", placeholder: "Search SKU, name or category" });
    q.addEventListener("input", function () { st.q = q.value; draw(); });
    bar.appendChild(q);
    var count = U.el("span.count");
    bar.appendChild(count);
    body.appendChild(bar);
    var wrap = U.el("div.tablewrap");
    body.appendChild(wrap);
    function draw() {
      var rows = D.items.filter(function (it) {
        return U.matches(it, st.q, ["item_code", "item_name", "custom_sku_variant", "item_group"]);
      });
      count.textContent = rows.length + " SKU" + (rows.length === 1 ? "" : "s");
      U.clear(wrap);
      if (!rows.length) { wrap.appendChild(U.el("div.empty", "Nothing matches.")); return; }
      var t = U.el("table.dt");
      t.appendChild(U.el("thead", [U.el("tr", ["SKU Code", "Product Name", "Variant", "Category", "Unit",
        "In Stock", "Reorder", "HSN Code", "Status", ""]
        .map(function (h, i) { return U.el("th" + (i === 5 || i === 6 ? ".num" : ""), { text: h }); }))]));
      t.appendChild(U.el("tbody", rows.map(function (it) {
        var low = it.reorder_level > 0 && it.on_hand <= it.reorder_level;
        return U.el("tr.clickable", { onclick: function () { U.go("#/f/item/" + encodeURIComponent(it.item_code)); } }, [
          U.el("td", [U.el("span.lnk", { text: it.item_code })]),
          U.el("td", { text: it.item_name }),
          U.el("td", { text: it.custom_sku_variant || "—" }),
          U.el("td", { text: it.item_group }),
          U.el("td", { text: it.stock_uom }),
          U.el("td.num", { html: U.esc(U.num(it.on_hand)) + (low ? ' <span class="ind red">LOW</span>' : "") }),
          U.el("td.num", { text: it.reorder_level ? U.num(it.reorder_level) : "—" }),
          U.el("td", { html: it.gst_hsn_code ? U.esc(it.gst_hsn_code) :
            '<span class="ind red">NO HSN - add one before it is invoiced</span>' }),
          U.el("td", [it.disabled ? U.el("span.ind.grey", { text: "Disabled" }) : U.el("span.ind.green", { text: "Active" })]),
          U.el("td", [U.el("button.btn.sm", { type: "button", text: "Edit",
            onclick: function (e) { e.stopPropagation(); skuDialog(it); } })])
        ]);
      })));
      wrap.appendChild(t);
    }
    draw();
    body.appendChild(U.el("p.muted.small", { style: "margin-top:10px", text:
      "A reorder level of zero means no low-stock warning was asked for on that SKU. Switching a SKU off keeps it on " +
      "old orders and drops it out of every dropdown." }));
  };

  function skuDialog(it) {
    it = it || {};
    var cats = U.uniq(D.items.map(function (x) { return x.item_group; }));
    var cat = U.el("select", cats.map(function (c) { return U.el("option", { text: c }); }));
    if (it.item_group) cat.value = it.item_group;
    var m = U.modal(it.item_code ? "Edit " + it.item_code : "Add SKU", [
      U.el("label", "SKU Code"), U.el("input", { type: "text", value: it.item_code || "" }),
      U.el("label", "Product Name"), U.el("input", { type: "text", value: it.item_name || "" }),
      U.el("label", "Variant"), U.el("input", { type: "text", value: it.custom_sku_variant || "",
        placeholder: "Optional - Cyan, 24 inch double matte." }),
      U.el("label", "Category"), cat,
      U.el("label", "Unit"), U.el("select", ["Litre", "Roll", "Kg", "Nos"].map(function (u) {
        var o = U.el("option", { text: u }); if (it.stock_uom === u) o.selected = true; return o; })),
      U.el("label", "Reorder Level"), U.el("input", { type: "number", value: String(it.reorder_level || 0) }),
      U.el("p.muted.small", { style: "margin:-6px 0 11px", text: "Leave 0 if you do not want a low-stock warning." }),
      U.el("label", "Units per Package (for QR label)"), U.el("input", { type: "number", value: String(it.custom_units_per_package || 1) }),
      U.el("label", "HSN Code"), U.el("input", { type: "text", value: it.gst_hsn_code || "" })
    ], [U.el("button.btn.primary", { type: "button", text: it.item_code ? "Save" : "Create SKU",
      onclick: function () { m.close(); U.demoOnly("save a SKU"); } })]);
  }

  /* ---------------- Vendors & Transport ---------------- */
  D.screens.vendors = function (n) {
    var body = S.page({ title: "Vendors & Transport", sub: "Suppliers, couriers and their rate charts.",
      crumbs: D.crumbs(n) });

    body.appendChild(U.el("div.sec", "Vendors"));
    var vbar = U.el("div.fbar", [U.el("input", { type: "text", placeholder: "Search vendor, city or contact" }),
      S.btn("+ Add Vendor", "primary"), S.btn("Full list view", null, function () { U.go("#/l/supplier"); })]);
    body.appendChild(vbar);
    var vwrap = U.el("div.tablewrap");
    var vt = U.el("table.dt");
    vt.appendChild(U.el("thead", [U.el("tr", ["Vendor", "Contact", "Mobile", "City", "Shipments", "Last Inward", "Status"]
      .map(function (h, i) { return U.el("th" + (i === 4 ? ".num" : ""), { text: h }); }))]));
    vt.appendChild(U.el("tbody", D.suppliers.map(function (s) {
      return U.el("tr.clickable", { onclick: function () { U.go("#/f/supplier/" + encodeURIComponent(s.supplier_name)); } }, [
        U.el("td", [U.el("span.lnk", { text: s.supplier_name })]),
        U.el("td", { text: s.contact_person }), U.el("td", { text: s.mobile_no }),
        U.el("td", { text: s.city }), U.el("td.num", { text: String(s.shipments) }),
        U.el("td", { text: U.date(s.last_inward) }),
        U.el("td", [s.disabled ? U.el("span.ind.grey", { text: "Disabled" }) : U.el("span.ind.green", { text: "Active" })])
      ]);
    })));
    vwrap.appendChild(vt);
    body.appendChild(vwrap);

    body.appendChild(U.el("div.sec", "Couriers & transport"));
    var cbar = U.el("div.fbar", [U.el("input", { type: "text", placeholder: "Search courier or contact" }),
      S.btn("+ Add Courier", "primary"), S.btn("Full list view", null, function () { U.go("#/l/transporter"); })]);
    body.appendChild(cbar);
    body.appendChild(U.el("div.muted.small", { style: "margin:-6px 0 10px" , html:
      "Click a courier to see its rate card. <b>Single rate changes are edited there; bulk updates go through the sheet re-import.</b>" }));
    var cwrap = U.el("div.tablewrap");
    var ct = U.el("table.dt");
    ct.appendChild(U.el("thead", [U.el("tr", ["Courier / Transport", "Contact", "Mobile", "City / Hub",
      "Rates", "Last Used", "Status"].map(function (h, i) { return U.el("th" + (i === 4 ? ".num" : ""), { text: h }); }))]));
    ct.appendChild(U.el("tbody", D.transporters.map(function (t) {
      return U.el("tr.clickable", { onclick: function () { U.go("#/f/transporter/" + encodeURIComponent(t.transporter_name)); } }, [
        U.el("td", [U.el("span.lnk", { text: t.transporter_name })]),
        U.el("td", { text: t.contact_person }), U.el("td", { text: t.mobile_no }),
        U.el("td", { text: t.city }), U.el("td.num", { text: String(t.rates) }),
        U.el("td", { text: U.date(t.last_used) }),
        U.el("td", [t.disabled ? U.el("span.ind.grey", { text: "Disabled" }) : U.el("span.ind.green", { text: "Active" })])
      ]);
    })));
    cwrap.appendChild(ct);
    body.appendChild(cwrap);

    body.appendChild(U.el("div.sec", "Delivery zones"));
    var zwrap = U.el("div.tablewrap");
    var zt = U.el("table.dt");
    zt.appendChild(U.el("thead", [U.el("tr", ["Zone", "States in this zone", "Notes"].map(function (h) {
      return U.el("th", { text: h }); }))]));
    zt.appendChild(U.el("tbody", D.zones.map(function (z) {
      return U.el("tr.clickable", { onclick: function () { U.go("#/f/delivery-zone/" + encodeURIComponent(z.zone_name)); } }, [
        U.el("td", [U.el("span.lnk", { text: z.zone_name })]),
        U.el("td", { text: z.states }),
        U.el("td.muted", { text: z.notes || "—" })
      ]);
    })));
    zwrap.appendChild(zt);
    body.appendChild(zwrap);
    body.appendChild(U.el("div.notice", { style: "margin-top:14px", html:
      "<b>Zone sets the rate; the contract sets the surcharge.</b> Moving a state from one zone to another changes " +
      "the per-kilo rate it is priced at, and does <i>not</i> move the state surcharge, which is written on the " +
      "rate row as a named list of states. Zones and surcharges have to be edited separately." }));
    body.appendChild(U.el("div.notice.warn", { html:
      "<b>Seven itemised charge lines.</b> A fare is base rate, minimum freight, docket charge, loading/handling, " +
      "out-of-area, state surcharge and GST on their freight - each one a separate column on the rate row, " +
      "so the number quoted can be explained line by line. What the customer pays at delivery is never counted " +
      "as ours." }));
  };
})(window.DEMO = window.DEMO || {});
