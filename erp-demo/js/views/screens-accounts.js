/* Demo ERP - the Accounts screens: billing desk, payments desk, statistics. */
(function (D) {
  var U = D.u, S = D.shell;

  function awaiting() {
    return D.rowsFor("Sales Order").filter(function (o) { return o.custom_order_stage === "With Accounts"; });
  }
  function billed() {
    return D.rowsFor("Sales Order").filter(function (o) { return o.custom_billed_on; })
      .sort(function (a, b) { return b.custom_billed_on > a.custom_billed_on ? 1 : -1; });
  }
  function owed() {
    return D.rowsFor("Sales Order").filter(function (o) {
      return o.custom_balance_remaining > 0 && o.custom_order_stage !== "Closed"; });
  }
  function unverified() {
    var out = [];
    D.rowsFor("Sales Order").forEach(function (o) {
      (o.custom_payments_received || []).forEach(function (p) {
        if (!p.verified) out.push({ order: o, pay: p });
      });
    });
    return out;
  }

  /* ---------------- Billing desk (the Accounts landing page) ---------------- */
  D.screens["billing-desk"] = function (n) {
    var body = S.page({ title: "Accounts", sub: n.sub, crumbs: D.crumbs(n) });
    var aw = awaiting(), bl = billed();
    var thisMonth = bl.filter(function (o) { return o.custom_billed_on >= "2026-06-01"; });
    body.appendChild(U.el("div.cards", [
      U.ncard("Waiting", aw.length, "with accounts, not yet billed", aw.length ? "amber" : "grey"),
      U.ncard("Billed this month", thisMonth.length, "handed to dispatch", "green"),
      U.ncard("Money owed", U.lakh(U.sum(owed(), function (o) { return o.custom_balance_remaining; })),
        owed().length + " orders outstanding", "red", "#/p/payments-desk"),
      U.ncard("Awaiting verification", unverified().length, "a second pair of eyes", unverified().length ? "amber" : "grey", "#/p/payments-desk")
    ]));

    body.appendChild(D.navBlock(["payments-desk", "statistics", "payables", "receivables", "financial-reports", "gst"]));

    body.appendChild(U.el("div.sec", "Awaiting Billing"));
    body.appendChild(U.el("div.muted.small", { style: "margin:-6px 0 10px", text:
      "Bill it in the accounting package, attach the invoice, then press Mark Billed on the order." }));
    var wrap = U.el("div.tablewrap");
    if (!aw.length) wrap.appendChild(U.el("div.empty", "Nothing is waiting to be billed."));
    else {
      var t = U.el("table.dt");
      t.appendChild(U.el("thead", [U.el("tr", ["Order", "Date", "Customer", "GST", "Amount", "Payment terms", ""]
        .map(function (h, i) { return U.el("th" + (i === 4 ? ".num" : ""), { text: h }); }))]));
      t.appendChild(U.el("tbody", aw.map(function (o) {
        return U.el("tr", [
          U.el("td", [U.link(o.name, "#/f/sales-order/" + encodeURIComponent(o.name), "lnk")]),
          U.el("td", { text: U.date(o.transaction_date) }),
          U.el("td", { text: o.customer }),
          U.el("td", [U.el("span.ind." + (o.custom_gst_type === "No GST" ? "grey" : "blue"), { text: o.custom_gst_type })]),
          U.el("td.num", { text: U.money(o.grand_total) }),
          U.el("td", [U.ind(o.custom_payment_terms)]),
          U.el("td", [U.el("button.btn.sm.primary", { type: "button", text: "Mark Billed",
            onclick: function () { billDialog(o); } })])
        ]);
      })));
      wrap.appendChild(t);
    }
    body.appendChild(wrap);

    body.appendChild(U.el("div.sec", "Recently Billed"));
    body.appendChild(U.el("div.muted.small", { style: "margin:-6px 0 10px", text: "The last orders handed to dispatch." }));
    var w2 = U.el("div.tablewrap");
    var t2 = U.el("table.dt");
    t2.appendChild(U.el("thead", [U.el("tr", ["Order", "Customer", "Invoice No", "Invoice", "Billed By", "Billed On", "Now At"]
      .map(function (h) { return U.el("th", { text: h }); }))]));
    t2.appendChild(U.el("tbody", bl.slice(0, 10).map(function (o) {
      return U.el("tr", [
        U.el("td", [U.link(o.name, "#/f/sales-order/" + encodeURIComponent(o.name), "lnk")]),
        U.el("td", { text: o.customer }),
        U.el("td", { text: o.custom_tally_invoice_no || "—" }),
        U.el("td", [o.custom_tally_invoice ? U.el("span.ind.green", { text: "attached" }) :
          U.el("span.ind.red", { text: "not attached" })]),
        U.el("td", { text: o.custom_billed_by }),
        U.el("td", { text: U.datetime(o.custom_billed_on) }),
        U.el("td", [U.ind(o.custom_order_stage)])
      ]);
    })));
    w2.appendChild(t2);
    body.appendChild(w2);

    body.appendChild(U.el("div.notice", { style: "margin-top:14px", html:
      "<b>No invoice, no billing.</b> Marking an order billed requires the invoice number and the attached file, " +
      "so an order cannot reach dispatch with nothing behind it. The attach field itself validates nothing - " +
      "it will accept any path - which is why the number and the file are both asked for in one dialog." }));
    D.views.reportList(body, D.reportsFor.accounts);
  };

  function billDialog(o) {
    var m = U.modal("Mark " + o.name + " billed", [
      U.el("p.muted.small", { style: "margin:0 0 12px", text:
        "The order cannot be marked billed without both of these." }),
      U.el("label", "Invoice number"), U.el("input", { type: "text", placeholder: "INV/26-27/…" }),
      U.el("label", "Invoice (PDF or photo)"), U.el("input", { type: "text", placeholder: "choose a file" }),
      U.el("p.muted.small", { style: "margin:4px 0 0", text:
        "Marking billed moves " + o.name + " from With Accounts to Ready to Dispatch and stamps who did it and when." })
    ], [U.el("button.btn.primary", { type: "button", text: "Attach and mark billed",
      onclick: function () { m.close(); U.demoOnly("mark " + o.name + " billed"); } })]);
  }

  /* ---------------- Payments desk ---------------- */
  D.screens["payments-desk"] = function (n) {
    var body = S.page({ title: "Payments Desk", sub:
      "Money owed, money in, and the queue of payments waiting for a second pair of eyes.",
      crumbs: D.crumbs(n) });
    var st = { view: "owed", q: "" };
    var bar = U.el("div.fbar");
    bar.appendChild(U.el("input", { type: "month", value: "2026-06", title: "Month" }));
    var q = U.el("input", { type: "text", placeholder: "Search customer - every order, paid or not" });
    q.addEventListener("input", function () { st.q = q.value; draw(); });
    bar.appendChild(q);
    bar.appendChild(S.btn("Show", null, function () { draw(); }));
    var vOwed = S.btn("Money owed", "on", function () { st.view = "owed"; flip(); });
    var vAll = S.btn("All orders", null, function () { st.view = "all"; flip(); });
    function flip() { vOwed.classList.toggle("on", st.view === "owed"); vAll.classList.toggle("on", st.view === "all"); draw(); }
    bar.appendChild(vOwed); bar.appendChild(vAll);
    var count = U.el("span.count");
    bar.appendChild(count);
    body.appendChild(bar);

    var ow = owed();
    body.appendChild(U.el("div.strip", [
      U.el("span.s", { html: "Outstanding <b>" + U.esc(U.lakh(U.sum(ow, function (o) { return o.custom_balance_remaining; }))) + "</b>" }),
      U.el("span.s", { html: "Orders owing <b>" + ow.length + "</b>" }),
      U.el("span.s", { html: "Received this month <b>" +
        U.esc(U.lakh(U.sum(D.rowsFor("Sales Order").filter(function (o) { return o.transaction_date >= "2026-06-01"; }),
          function (o) { return o.custom_total_received; }))) + "</b>" }),
      U.el("span.s", { html: "Awaiting verification <b>" + unverified().length + "</b>" })
    ]));

    /* verification queue */
    var uv = unverified();
    body.appendChild(U.el("div.sec", "Payments awaiting verification"));
    body.appendChild(U.el("div.muted.small", { style: "margin:-6px 0 10px", text:
      "A second pair of eyes confirms the money landed. A verified row disappears from this queue." }));
    var vwrap = U.el("div.tablewrap");
    if (!uv.length) vwrap.appendChild(U.el("div.empty", "Nothing is waiting - the queue is empty."));
    else {
      var vt = U.el("table.dt");
      vt.appendChild(U.el("thead", [U.el("tr", ["Payment for", "Customer", "Date received", "Amount",
        "How it arrived", "Reference", "Proof", "Recorded by", ""]
        .map(function (h, i) { return U.el("th" + (i === 3 ? ".num" : ""), { text: h }); }))]));
      vt.appendChild(U.el("tbody", uv.map(function (r) {
        return U.el("tr", [
          U.el("td", [U.link(r.order.name, "#/f/sales-order/" + encodeURIComponent(r.order.name), "lnk")]),
          U.el("td", { text: r.order.customer }),
          U.el("td", { text: U.date(r.pay.payment_date) }),
          U.el("td.num", { text: U.money(r.pay.amount) }),
          U.el("td", [U.ind(r.pay.method)]),
          U.el("td", { text: r.pay.reference_no || "—" }),
          U.el("td", [r.pay.proof ? U.el("span.ind.green", { text: "proof" }) : U.el("span.ind.amber", { text: "no proof" })]),
          U.el("td", { text: r.pay.recorded_by }),
          U.el("td", [U.el("button.btn.sm.primary", { type: "button", text: "Verify",
            onclick: function () { U.demoOnly("verify " + U.money(r.pay.amount) + " on " + r.order.name); } })])
        ]);
      })));
      vwrap.appendChild(vt);
    }
    body.appendChild(vwrap);

    body.appendChild(U.el("div.sec", "The book"));
    var wrap = U.el("div.tablewrap");
    body.appendChild(wrap);
    function draw() {
      var rows = (st.view === "owed" ? owed() : D.rowsFor("Sales Order"))
        .filter(function (o) { return U.matches(o, st.q, ["name", "customer", "custom_sales_person"]); })
        .sort(function (a, b) { return U.days(b.transaction_date) - U.days(a.transaction_date); });
      count.textContent = rows.length + " order" + (rows.length === 1 ? "" : "s");
      U.clear(wrap);
      if (!rows.length) {
        wrap.appendChild(U.el("div.empty", st.view === "owed" ?
          "None of these orders has money outstanding." : "There are no orders here yet."));
        return;
      }
      var t = U.el("table.dt");
      t.appendChild(U.el("thead", [U.el("tr", ["Order", "Customer", "Date", "Total", "Received",
        "Verified", "Pending", "Age", "Terms", ""]
        .map(function (h, i) { return U.el("th" + (i >= 3 && i <= 6 ? ".num" : ""), { text: h }); }))]));
      t.appendChild(U.el("tbody", rows.map(function (o) {
        var age = U.days(o.transaction_date);
        var ageCls = age > 45 ? "red" : (age > 30 ? "amber" : "grey");
        return U.el("tr", [
          U.el("td", [U.link(o.name, "#/f/sales-order/" + encodeURIComponent(o.name), "lnk")]),
          U.el("td", { text: o.customer }),
          U.el("td", { text: U.date(o.transaction_date) }),
          U.el("td.num", { text: U.money(o.grand_total) }),
          U.el("td.num", { text: U.money(o.custom_total_received) }),
          U.el("td.num", { text: U.money(o.custom_verified_received) }),
          U.el("td.num", { html: o.custom_balance_remaining > 0 ?
            "<b>" + U.esc(U.money(o.custom_balance_remaining)) + "</b>" : "—" }),
          U.el("td", [o.custom_balance_remaining > 0 ?
            U.el("span.ind." + ageCls, { text: age + "d" }) : U.el("span.muted", "—")]),
          U.el("td", [U.ind(o.custom_payment_terms || "—")]),
          U.el("td", [o.custom_balance_remaining > 0 ?
            U.el("button.btn.sm.primary", { type: "button", text: "Record Payment",
              onclick: function () { payDialog(o); } }) :
            U.el("span.ind.green", { text: "Paid" })])
        ]);
      })));
      wrap.appendChild(t);
    }
    flip();

    body.appendChild(U.el("div.notice", { style: "margin-top:14px", html:
      "<b>Payments live on the order, not on an invoice.</b> Each payment is a row with its date, amount, method, " +
      "reference, method fee and a screenshot of the slip. The desk warns on a duplicate reference and refuses to " +
      "let an order go past its total without somebody confirming the overpayment." }));
    body.appendChild(U.el("div.notice.warn", { html:
      "<b>Payment Entry is read-only for sales.</b> That was a decision, not an oversight: sales record money here, " +
      "on the order, and accounts verify it. A credit note settles a balance without any money moving - it has to " +
      "zero the balance and leave the <i>received</i> total alone." }));
  };

  function payDialog(o) {
    var meth = U.el("select", ["UPI", "Bank Transfer", "Cash", "Cheque", "Other", "Credit Note"]
      .map(function (x) { return U.el("option", { text: x }); }));
    var amt = U.el("input", { type: "number", value: String(o.custom_balance_remaining) });
    var m = U.modal("Record a payment on " + o.name, [
      U.el("p.muted.small", { style: "margin:0 0 12px", html:
        "Pending on this order: <b>" + U.esc(U.money(o.custom_balance_remaining)) + "</b> of " +
        U.esc(U.money(o.grand_total)) + "." }),
      U.el("label", "Date received"), U.el("input", { type: "date", value: "2026-06-18" }),
      U.el("label", "Amount"), amt,
      U.el("label", "How it arrived"), meth,
      U.el("label", "Reference / UTR / Cheque No"), U.el("input", { type: "text", placeholder: "Leave blank for cash" }),
      U.el("label", "Screenshot / slip"), U.el("input", { type: "text", placeholder: "choose a file" }),
      U.el("label", "Remarks"), U.el("textarea", { rows: "2" }),
      U.el("p.muted.small", { style: "margin:4px 0 0", text:
        "A UPI payment picks up its method fee automatically, and the row lands in the verification queue above " +
        "rather than counting as verified straight away." })
    ], [U.el("button.btn.primary", { type: "button", text: "Record Payment",
      onclick: function () { m.close(); U.demoOnly("record a payment on " + o.name); } })]);
  }

  /* ---------------- Statistics ---------------- */
  D.screens.statistics = function (n) {
    var body = S.page({ title: "Statistics", sub: "Received vs raised, ageing, and who is paying.",
      crumbs: D.crumbs(n), acts: [S.btn("Print", null)] });
    var bar = U.el("div.fbar", [U.el("span.small.muted", "Month"),
      U.el("input", { type: "month", value: "2026-06" }),
      S.btn("Show", "primary", function () { U.demoOnly("change the month"); })]);
    body.appendChild(bar);

    var all = D.rowsFor("Sales Order").filter(function (o) { return o.custom_order_stage !== "Closed"; });
    var month = all.filter(function (o) { return o.transaction_date >= "2026-06-01"; });
    var ow = owed();
    body.appendChild(U.el("div.cards", [
      U.ncard("Orders", month.length, "raised in June", "blue"),
      U.ncard("Value raised", U.lakh(U.sum(month, function (o) { return o.grand_total; })), "grand total", "blue"),
      U.ncard("Received", U.lakh(U.sum(month, function (o) { return o.custom_total_received; })), "money in", "green"),
      U.ncard("Pending", U.lakh(U.sum(ow, function (o) { return o.custom_balance_remaining; })), "across all months", "red"),
      U.ncard("Oldest unpaid", (function () {
        var m = 0; ow.forEach(function (o) { m = Math.max(m, U.days(o.transaction_date)); }); return m + "d";
      })(), "days since the order", "amber")
    ]));

    var split = {};
    all.forEach(function (o) {
      (o.custom_payments_received || []).forEach(function (p) {
        split[p.method] = (split[p.method] || 0) + p.amount;
      });
    });
    var age = { "0-15 days": 0, "16-30 days": 0, "31-45 days": 0, "46-60 days": 0, "over 60 days": 0 };
    ow.forEach(function (o) {
      var d = U.days(o.transaction_date), v = o.custom_balance_remaining;
      if (d <= 15) age["0-15 days"] += v;
      else if (d <= 30) age["16-30 days"] += v;
      else if (d <= 45) age["31-45 days"] += v;
      else if (d <= 60) age["46-60 days"] += v;
      else age["over 60 days"] += v;
    });

    body.appendChild(U.el("div.chartgrid", [
      U.el("div.chartbox", [U.el("h4", "How it came in"), U.bars(split, { fmt: U.lakh })]),
      U.el("div.chartbox", [U.el("h4", "Pending by age"),
        U.bars(age, { order: Object.keys(age), fmt: U.lakh, color: "var(--amber)" })])
    ]));

    var months = [["2026-01", "Jan"], ["2026-02", "Feb"], ["2026-03", "Mar"], ["2026-04", "Apr"], ["2026-05", "May"], ["2026-06", "Jun"]];
    var series = months.map(function (mm) {
      var rows = all.filter(function (o) { return o.transaction_date.slice(0, 7) === mm[0]; });
      return { label: mm[1], a: U.sum(rows, function (o) { return o.grand_total; }),
        b: U.sum(rows, function (o) { return o.custom_total_received; }) };
    });
    body.appendChild(U.el("div.chartbox", { style: "margin-top:14px" }, [
      U.el("h4", "Received vs raised, last six months"),
      U.columns(series, "Raised", "Received", U.lakh)
    ]));

    var topVal = U.groupSum(all, function (o) { return o.customer; }, function (o) { return o.grand_total; });
    var topPend = U.groupSum(ow, function (o) { return o.customer; }, function (o) { return o.custom_balance_remaining; });
    body.appendChild(U.el("div.chartgrid", { style: "margin-top:14px" }, [
      U.el("div.chartbox", [U.el("h4", "Top customers by order value"), U.bars(topVal, { limit: 7, fmt: U.lakh })]),
      U.el("div.chartbox", [U.el("h4", "Top customers by pending amount"),
        U.bars(topPend, { limit: 7, fmt: U.lakh, color: "var(--red)" })])
    ]));

    var byPerson = {};
    all.forEach(function (o) {
      (o.custom_payments_received || []).forEach(function (p) {
        byPerson[p.recorded_by] = (byPerson[p.recorded_by] || 0) + p.amount;
      });
    });
    body.appendChild(U.el("div.chartbox", { style: "margin-top:14px" }, [
      U.el("h4", "Payments recorded, by person"), U.bars(byPerson, { fmt: U.lakh })
    ]));
    body.appendChild(U.el("p.muted.small", { style: "margin-top:12px", text:
      "Percentages and totals here read the order book, not an invoice register, because that is where the money is " +
      "recorded. An order that names a GST template but carries no tax rows would invoice higher than it reads here, " +
      "which is why the order form shows the charged rate alongside the template." }));
  };
})(window.DEMO = window.DEMO || {});
