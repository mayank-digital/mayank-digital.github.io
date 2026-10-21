/* Demo ERP - the Sales & CRM screens. */
(function (D) {
  var U = D.u, S = D.shell;

  function myOrders() {
    var me = S.me().name, all = D.rowsFor("Sales Order");
    if (D.state.role === "SalesMgr" || D.state.role === "Admin") return all;
    return all;
  }
  function stageCount(stage) {
    return D.rowsFor("Sales Order").filter(function (o) { return o.custom_order_stage === stage; }).length;
  }

  /* ---------------- Sales & CRM home ---------------- */
  D.screens["sales-home"] = function (n) {
    var me = S.me();
    var body = S.page({ title: "Sales & CRM", sub: n.sub, crumbs: D.crumbs(n),
      acts: [S.btn("+ New Sales Order", "primary"), S.btn("+ New Quotation")] });

    var myLeads = D.rowsFor("Lead").filter(function (l) {
      return l.lead_owner === me.name &&
        ["Not Interested", "Irrelevant", "Regular Customer"].indexOf(l.custom_stage) < 0;
    });
    var withAcc = stageCount("With Accounts"), ready = stageCount("Ready to Dispatch");
    var mySold = U.sum(D.rowsFor("Sales Order").filter(function (o) {
      return o.custom_sales_person === me.name && o.custom_order_stage !== "Closed";
    }), function (o) { return o.grand_total; });

    body.appendChild(U.el("div.cards", [
      U.ncard("My Open Leads", myLeads.length, "yours, still in play", "blue", "#/p/leads"),
      U.ncard("Orders With Accounts", withAcc, "waiting to be billed", "amber", "#/p/orders"),
      U.ncard("Ready to Dispatch", ready, "billed and waiting to go out", "purple", "#/p/orders"),
      U.ncard("Booked by me", U.lakh(mySold), "across every live order", "green", "#/p/insights")
    ]));
    body.appendChild(U.el("div.notice", { html:
      "<b>Who punches the order.</b> Whoever takes the order punches it from their own login, and that login is what " +
      "fills in <b>Sales Person</b> - which is what Insights counts as <i>your</i> sales. Punching one for a colleague " +
      "means changing that field afterwards." }));

    body.appendChild(U.el("div.sec", "What do you want to do?"));
    body.appendChild(U.el("div.bigbtns", [
      U.el("button.bigbtn", { type: "button", onclick: function () { U.demoOnly("new sales order"); } }, [
        U.el("span.t", "+ New Sales Order"),
        U.el("span.h", "For an order that is confirmed. The customer box finds Leads too - pick one and it becomes a customer on the way through.")
      ]),
      U.el("button.bigbtn", { type: "button", onclick: function () { U.demoOnly("new quotation"); } }, [
        U.el("span.t", "+ New Quotation"),
        U.el("span.h", "For a price you are still quoting. It can be raised against a Lead directly, with no customer record at all.")
      ])
    ]));

    body.appendChild(D.navBlock(["find-customer", "leads", "orders", "sales-payments", "insights", "sales-stock"]));

    body.appendChild(U.el("div.sec", "Your most recent leads"));
    var wrap = U.el("div.tablewrap");
    var t = U.el("table.dt");
    t.appendChild(U.el("thead", [U.el("tr", ["Lead", "Company", "Stage", "City", "Next follow-up"].map(function (h) {
      return U.el("th", { text: h }); }))]));
    t.appendChild(U.el("tbody", myLeads.slice(0, 6).map(function (l) {
      return U.el("tr.clickable", { onclick: function () { U.go("#/f/lead/" + encodeURIComponent(l.name)); } }, [
        U.el("td", [U.el("span.lnk", { text: l.name })]),
        U.el("td", { text: l.company_name }),
        U.el("td", [U.ind(l.custom_stage)]),
        U.el("td", { text: l.custom_city || "—" }),
        U.el("td", { text: U.datetime(l.custom_next_followup) || "—" })
      ]);
    })));
    if (!myLeads.length) wrap.appendChild(U.el("div.empty", "You do not own any open leads in the sample data."));
    else wrap.appendChild(t);
    body.appendChild(wrap);
    body.appendChild(U.el("div.notice.warn", { style: "margin-top:14px", html:
      "<b>A note on ownership.</b> Closing the lead pool so each lead has an owner also means anyone who owns none " +
      "sees an empty board. A bulk ownership change is a visibility change for everybody, not just a tidy-up." }));
    D.views.reportList(body, ["payment-pending-orders"], "Reports");
  };

  /* ---------------- Leads: board first, list second ---------------- */
  D.screens.leads = function (n) {
    var body = S.page({ title: "Leads", sub: "The board is the default view - every lead by stage. The list is behind the toggle.",
      crumbs: D.crumbs(n), acts: [S.btn("+ New Lead", "primary"), S.btn("List view", null, function () { U.go("#/l/lead"); })] });
    var stages = U.groupCount(D.rowsFor("Lead"), function (l) { return l.custom_stage; });
    body.appendChild(U.el("div.strip", D.LEAD_STAGES.filter(function (s) { return stages[s]; }).map(function (s) {
      return U.el("span.s", { html: U.esc(s) + " <b>" + stages[s] + "</b>" });
    })));
    D.views.kanban("leads", { inline: true, host: body });
    body.appendChild(U.el("div.notice", { style: "margin-top:16px", html:
      "<b>The lead is the master record.</b> A lead is not thrown away when it becomes a customer - it keeps the stage, " +
      "the owner and the order journey, and the customer record is created alongside it. That is why the stage list runs " +
      "past the first order to <i>Regular Customer</i>." }));
  };

  /* ---------------- Orders ---------------- */
  D.screens.orders = function (n) {
    var body = S.page({ title: "Orders", sub: "The whole order book. Search by number, customer, courier or docket.",
      crumbs: D.crumbs(n), acts: [S.btn("+ New Sales Order", "primary"), S.btn("Full list view", null, function () { U.go("#/l/sales-order"); })] });

    var st = { q: "", stage: "", mine: false };
    var bar = U.el("div.fbar");
    var q = U.el("input", { type: "text", placeholder: "Search an order - number, customer, courier, tracking" });
    q.addEventListener("input", function () { st.q = q.value; draw(); });
    var sel = U.el("select", [U.el("option", { value: "", text: "Every stage" })].concat(
      ["Order Placed", "With Accounts", "Ready to Dispatch", "Dispatched", "Delivered", "Closed"].map(function (s) {
        return U.el("option", { value: s, text: s === "Ready to Dispatch" ? "Billed - ready to dispatch" : s });
      })));
    sel.addEventListener("change", function () { st.stage = sel.value; draw(); });
    var mine = S.btn("Only mine", null, function () { st.mine = !st.mine; mine.classList.toggle("on", st.mine); draw(); });
    bar.appendChild(q); bar.appendChild(sel); bar.appendChild(mine);
    var count = U.el("span.count");
    bar.appendChild(count);
    body.appendChild(bar);

    var wrap = U.el("div.tablewrap");
    body.appendChild(wrap);
    function draw() {
      var rows = D.rowsFor("Sales Order").filter(function (o) {
        if (st.stage && o.custom_order_stage !== st.stage) return false;
        if (st.mine && o.custom_sales_person !== S.me().name) return false;
        return U.matches(o, st.q, ["name", "customer", "custom_courier_name", "custom_tracking_id", "custom_sales_person"]);
      });
      count.textContent = rows.length + " order" + (rows.length === 1 ? "" : "s");
      U.clear(wrap);
      if (!rows.length) { wrap.appendChild(U.el("div.empty", "Nothing found.")); return; }
      var t = U.el("table.dt");
      t.appendChild(U.el("thead", [U.el("tr", ["Order", "Date", "Customer", "Stage", "Value", "Payment", "Made by"]
        .map(function (h, i) { return U.el("th" + (i === 4 ? ".num" : ""), { text: h }); }))]));
      t.appendChild(U.el("tbody", rows.map(function (o) {
        var pay = o.custom_balance_remaining <= 0 ? ["Paid", "green"] :
          (o.custom_total_received > 0 ? ["Part paid", "amber"] : ["Nothing yet", "grey"]);
        return U.el("tr.clickable", { onclick: function () { U.go("#/f/sales-order/" + encodeURIComponent(o.name)); } }, [
          U.el("td", [U.el("span.lnk", { text: o.name })]),
          U.el("td", { text: U.date(o.transaction_date) }),
          U.el("td", { text: o.customer }),
          U.el("td", [U.ind(o.custom_order_stage === "Ready to Dispatch" ? "Ready to Dispatch" : o.custom_order_stage)]),
          U.el("td.num", { text: U.money(o.grand_total) }),
          U.el("td", [U.el("span.ind." + pay[1], { text: pay[0] })]),
          U.el("td", { text: o.custom_sales_person })
        ]);
      })));
      wrap.appendChild(t);
    }
    draw();
    body.appendChild(U.el("div.notice", { style: "margin-top:14px", html:
      "<b>The six stages.</b> Order Placed &rarr; With Accounts &rarr; Billed / Ready to Dispatch &rarr; Dispatched " +
      "&rarr; Delivered, plus <b>Closed</b> off to one side. Each handover is a button that only the owning role sees: " +
      "accounts press <i>Mark Billed</i>, dispatch enter the docket, dispatch press <i>Mark Delivered</i>. " +
      "Closed is not cancelled - the order keeps its number and its history." }));
    body.appendChild(U.el("div.notice.warn", { html:
      "<b>No sales invoice behind the order.</b> Money is recorded as payment rows on the order itself, which is why " +
      "the payments desk reads the order book rather than an invoice register." }));
  };

  /* ---------------- Insights ---------------- */
  D.screens.insights = function (n) {
    var everybody = D.state.role === "SalesMgr" || D.state.role === "Admin";
    var body = S.page({ title: "Insights", sub: "Who sold what, and where the pipeline sits.", crumbs: D.crumbs(n),
      acts: [S.btn("Refresh", null, function () { D.router.render(); })] });

    var periods = [["month", "This month"], ["last", "Last month"], ["quarter", "Last 3 months"], ["all", "All time"]];
    var st = { period: "quarter" };
    var bar = U.el("div.fbar");
    var sel = U.el("select", periods.map(function (p) { return U.el("option", { value: p[0], text: p[1] }); }));
    sel.value = st.period;
    sel.addEventListener("change", function () { st.period = sel.value; draw(); });
    bar.appendChild(sel);
    bar.appendChild(U.el("span.count", { text: everybody ? "Everybody's numbers - you are a Sales Manager." :
      "Your own numbers only." }));
    body.appendChild(bar);

    var host = U.el("div");
    body.appendChild(host);

    function inPeriod(d) {
      if (st.period === "all") return true;
      if (st.period === "month") return d >= "2026-06-01";
      if (st.period === "last") return d >= "2026-05-01" && d < "2026-06-01";
      return d >= "2026-04-01";
    }
    function draw() {
      U.clear(host);
      var orders = D.rowsFor("Sales Order").filter(function (o) {
        return inPeriod(o.transaction_date) && o.custom_order_stage !== "Closed" &&
          (everybody || o.custom_sales_person === S.me().name);
      });
      var leads = D.rowsFor("Lead").filter(function (l) { return everybody || l.lead_owner === S.me().name; });

      host.appendChild(U.el("div.cards", [
        U.ncard("Orders", orders.length, "submitted in the period", "blue"),
        U.ncard("Order value", U.lakh(U.sum(orders, function (o) { return o.grand_total; })), "grand total", "green"),
        U.ncard("Received", U.lakh(U.sum(orders, function (o) { return o.custom_total_received; })), "money in", "green"),
        U.ncard("Outstanding", U.lakh(U.sum(orders, function (o) { return Math.max(0, o.custom_balance_remaining); })), "still owed", "amber"),
        U.ncard("Open leads", leads.filter(function (l) {
          return ["Not Interested", "Irrelevant"].indexOf(l.custom_stage) < 0; }).length, "in the pipeline", "purple")
      ]));

      host.appendChild(U.el("div.sec", "Sold by each person"));
      var byPerson = {};
      D.rowsFor("Sales Order").filter(function (o) { return inPeriod(o.transaction_date) && o.custom_order_stage !== "Closed"; })
        .forEach(function (o) {
          byPerson[o.custom_sales_person] = byPerson[o.custom_sales_person] || { n: 0, v: 0 };
          byPerson[o.custom_sales_person].n++;
          byPerson[o.custom_sales_person].v += o.grand_total;
        });
      var names = Object.keys(byPerson).sort(function (a, b) { return byPerson[b].v - byPerson[a].v; });
      var tot = U.sum(names, function (nm) { return byPerson[nm].v; });
      var wrap = U.el("div.tablewrap");
      var t = U.el("table.dt");
      t.appendChild(U.el("thead", [U.el("tr", ["Sales person", "Orders", "Order value", "Share"]
        .map(function (h, i) { return U.el("th" + (i ? ".num" : ""), { text: h }); }))]));
      t.appendChild(U.el("tbody", names.map(function (nm) {
        var r = byPerson[nm], you = nm === S.me().name;
        return U.el("tr", [
          U.el("td", { html: U.esc(nm) + (you ? ' <span class="ind blue plain">you</span>' : "") }),
          U.el("td.num", { text: String(r.n) }),
          U.el("td.num", { text: U.money(r.v) }),
          U.el("td.num", { text: tot ? Math.round(r.v / tot * 100) + "%" : "0%" })
        ]);
      })));
      wrap.appendChild(names.length ? t : U.el("div.empty", "No submitted orders in this period."));
      host.appendChild(wrap);
      if (!everybody) {
        host.appendChild(U.el("p.muted.small", { style: "margin-top:8px", text:
          "A sales user sees the whole table but only their own cards above. A Sales Manager sees everybody's cards." }));
      }

      host.appendChild(U.el("div.chartgrid", { style: "margin-top:18px" }, [
        U.el("div.chartbox", [U.el("h4", "Pipeline by stage"),
          U.bars(U.groupCount(leads, function (l) { return l.custom_stage; }), { order: D.LEAD_STAGES })]),
        U.el("div.chartbox", [U.el("h4", "By product interest"),
          U.bars(U.groupCount(leads, function (l) { return l.custom_product_interest; }), { limit: 8 })]),
        U.el("div.chartbox", [U.el("h4", "Where they came from"),
          U.bars(U.groupCount(leads, function (l) { return l.source; }), { limit: 8 })]),
        U.el("div.chartbox", [U.el("h4", "Order value by customer"),
          U.bars(U.groupSum(orders, function (o) { return o.customer; }, function (o) { return o.grand_total; }),
            { limit: 8, fmt: U.lakh })])
      ]));
    }
    draw();
  };

  /* ---------------- Find Customer ---------------- */
  D.screens["find-customer"] = function (n) {
    var body = S.page({ title: "Find a Customer", sub:
      "Before ringing a new company, check whether it is already one of ours and who looks after it. " +
      "This searches everybody's customers, not just yours.", crumbs: D.crumbs(n) });
    var bar = U.el("div.fbar");
    var q = U.el("input", { type: "text", placeholder: "Company, contact name, or phone number" });
    var out = U.el("div");
    function run() {
      U.clear(out);
      var term = q.value.trim();
      if (!term) {
        out.appendChild(U.el("div.empty", "Type a company, a contact name or a number, then press Search."));
        return;
      }
      var hits = D.customers.filter(function (c) {
        return U.matches(c, term, ["customer_name", "custom_contact_name", "custom_mobile_no",
          "custom_call_number", "custom_city", "gstin"]);
      });
      var leadHits = D.leads.filter(function (l) {
        return U.matches(l, term, ["company_name", "lead_name", "mobile_no", "custom_city"]) &&
          !D.customers.some(function (c) { return c.customer_name === l.company_name; });
      });
      if (!hits.length && !leadHits.length) {
        out.appendChild(U.el("div.card.card-pad", [
          U.el("p", { style: "margin:0", html: "<b>Nothing found.</b> If it is genuinely new, it is yours to take." })
        ]));
        return;
      }
      hits.forEach(function (c) {
        out.appendChild(U.el("div.rowcard", [
          U.el("div.rh", [U.el("span.t", { text: c.customer_name }),
            U.el("span.ind.green", { text: "Existing customer" }), U.el("span.sp"),
            U.el("span.muted.small", { text: c.custom_customer_type })]),
          U.el("div.rb", [
            U.el("span", { html: "Ask for <b>" + U.esc(c.custom_contact_name) + "</b>" }),
            U.el("span", { text: c.custom_mobile_no }),
            c.custom_call_number ? U.el("span", { text: "alt " + c.custom_call_number }) : null,
            U.el("span", { text: c.custom_city + ", " + c.custom_state })
          ]),
          U.el("div.rb", [U.el("span", { html: "Account owned by <b>" + U.esc(c.owner_name) + "</b>" })])
        ]));
      });
      leadHits.forEach(function (l) {
        out.appendChild(U.el("div.rowcard", [
          U.el("div.rh", [U.el("span.t", { text: l.company_name }),
            U.el("span.ind.blue", { text: "Lead, not yet a customer" }), U.ind(l.custom_stage)]),
          U.el("div.rb", [
            U.el("span", { html: "Ask for <b>" + U.esc(l.lead_name) + "</b>" }),
            U.el("span", { text: l.mobile_no }),
            U.el("span", { text: (l.custom_city || "—") + (l.custom_state ? ", " + l.custom_state : "") }),
            U.el("span", { html: "Owned by <b>" + U.esc(l.lead_owner) + "</b>" })
          ])
        ]));
      });
    }
    q.addEventListener("keydown", function (e) { if (e.key === "Enter") run(); });
    bar.appendChild(q);
    bar.appendChild(U.el("button.btn.primary", { type: "button", text: "Search", onclick: run }));
    body.appendChild(bar);
    body.appendChild(U.el("div.notice", { html:
      "<b>This is a read-only card.</b> It shows the firm, who to ask for, how to reach them and whose account it is - " +
      "nothing else. Orders, prices and GST stay with the salesperson who owns the relationship. " +
      "It is open to every login precisely so that nobody cold-calls a colleague's customer." }));
    body.appendChild(out);
    run();
    body.appendChild(U.el("p.muted.small", { style: "margin-top:12px", text:
      "Try: a company name, a contact's first name, or part of a phone number. " +
      "A customer's number is not in the stock mobile field, so the search reads the custom one as well." }));
  };

  /* ---------------- Stock on hand (sales, read-only) ---------------- */
  D.screens["sales-stock"] = function (n) {
    var body = S.page({ title: "Stock on hand", sub: "What is on the shelf right now - read only for sales.",
      crumbs: D.crumbs(n) });
    var st = { q: "", low: false };
    var bar = U.el("div.fbar");
    var q = U.el("input", { type: "text", placeholder: "Search a SKU or product" });
    q.addEventListener("input", function () { st.q = q.value; draw(); });
    var low = S.btn("Only low stock", null, function () { st.low = !st.low; low.classList.toggle("on", st.low); draw(); });
    bar.appendChild(q); bar.appendChild(low);
    var count = U.el("span.count");
    bar.appendChild(count);
    body.appendChild(bar);
    var wrap = U.el("div.tablewrap");
    body.appendChild(wrap);
    function draw() {
      var rows = D.items.filter(function (it) {
        if (it.disabled) return false;
        if (st.low && !(it.reorder_level > 0 && it.on_hand <= it.reorder_level)) return false;
        return U.matches(it, st.q, ["item_code", "item_name", "custom_sku_variant", "item_group"]);
      });
      count.textContent = rows.length + " SKU" + (rows.length === 1 ? "" : "s");
      U.clear(wrap);
      if (!rows.length) { wrap.appendChild(U.el("div.empty", "Nothing found.")); return; }
      var t = U.el("table.dt");
      t.appendChild(U.el("thead", [U.el("tr", ["SKU", "Product", "Variant", "Unit", "On hand", ""]
        .map(function (h, i) { return U.el("th" + (i === 4 ? ".num" : ""), { text: h }); }))]));
      t.appendChild(U.el("tbody", rows.map(function (it) {
        var isLow = it.reorder_level > 0 && it.on_hand <= it.reorder_level;
        return U.el("tr", [
          U.el("td", { text: it.item_code }),
          U.el("td", { text: it.item_name }),
          U.el("td", { text: it.custom_sku_variant || "—" }),
          U.el("td", { text: it.stock_uom }),
          U.el("td.num", { text: U.num(it.on_hand) }),
          U.el("td", [isLow ? U.el("span.ind.red", { text: "LOW" }) : U.el("span.muted", "")])
        ]);
      })));
      wrap.appendChild(t);
    }
    draw();
    body.appendChild(U.el("p.muted.small", { style: "margin-top:12px", text:
      "Sales can read the shelf but not move it. Anything at or below its reorder level is flagged LOW; " +
      "a reorder level of zero means no warning was asked for on that SKU." }));
  };
})(window.DEMO = window.DEMO || {});
