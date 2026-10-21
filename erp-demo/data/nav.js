/* Demo ERP - the sidebar tree.
 * Mirrors the real workspace tree, including which roles each page is gated to.
 * `roles` lists the demo role keys that may open the page; [] means everybody.
 * `erp` records the real ERPNext role names behind the gate, shown on screen.
 */
(function (D) {
  function P(id, label, icon, kind, roles, erp, parent, sub) {
    return { id: id, label: label, icon: icon, kind: kind, roles: roles || [],
      erp: erp || [], parent: parent || null, sub: sub || "" };
  }
  var ALL = [];                /* everybody */
  var SALES = ["Sales", "SalesMgr", "Admin"];
  var ACC = ["Accounts", "Admin"];
  var DIS = ["Dispatch", "Admin"];
  var HR = ["HR", "Admin"];
  var ADM = ["Admin"];
  var WIDE = ["Sales", "SalesMgr", "Accounts", "Dispatch", "Admin"];

  D.nav = [
    P("home", "Home", "⌂", "home", ALL, [], null, "The launcher, and today's punch card"),

    P("my-hr", "My HR", "☺", "my-hr", ALL, ["Employee"], null, "Employee self-service hub"),
    P("my-profile", "My Profile", "☻", "my-profile", ALL, ["Employee"], null, "Your own employee record, read only"),
    P("my-attendance", "My Attendance", "☑", "my-attendance", ALL, ["Employee"], null, "Your month, and a request to fix a missed punch"),
    P("my-leave", "My Leave", "⚐", "my-leave", ALL, ["Employee"], null, "Balance and history"),

    P("tasks", "Tasks", "✓", "tasks", ALL, ["Employee", "Projects User"], null, "The task board and its counters"),
    P("chats", "Chats", "✉", "chats", ALL, ["Employee"], null, "Internal chat desk"),

    P("sales", "Sales & CRM", "₹", "sales-home", SALES, ["Sales Manager", "Sales User", "System Manager"], null,
      "Your pipeline and what you have sold"),
    P("find-customer", "Find Customer", "⌕", "find-customer", ALL, [], "sales",
      "Is this company already ours, and whose account is it?"),
    P("leads", "Leads", "⚑", "leads", SALES, ["Sales Manager", "Sales User", "System Manager"], "sales",
      "The board - every lead, by stage"),
    P("orders", "Orders", "▤", "orders", SALES, ["Sales Manager", "Sales User", "System Manager"], "sales",
      "The whole order book, searchable"),
    P("sales-payments", "Payments", "◉", "payments-desk", SALES, ["Sales Manager", "Sales User", "System Manager"], "sales",
      "What has come in on your orders"),
    P("insights", "Insights", "▦", "insights", SALES, ["Sales Manager", "Sales User", "System Manager"], "sales",
      "Who sold what, and where the pipeline sits"),
    P("sales-stock", "Stock on hand", "▣", "sales-stock", WIDE,
      ["Sales Manager", "Sales User", "Accounts Manager", "Stock User", "Dispatch Viewer", "System Manager"], "sales",
      "What is on the shelf right now - read only"),

    P("dispatch", "Dispatch", "✈", "dispatch-home", DIS,
      ["Dispatch Viewer", "Stock Manager", "Stock User", "System Manager"], null, "One console for everything that moves"),
    P("dispatch-board", "Dispatch Board", "◫", "dispatch-board", ALL, [], "dispatch",
      "Every order out of accounts and not yet finished"),
    P("stock-in", "Stock In", "⬇", "stock-in", DIS, ["Dispatch Viewer", "Stock Manager", "Stock User", "System Manager"], "dispatch",
      "One shipment: vendor, invoice, lot and quantities"),
    P("stock-out", "Stock Out", "⬆", "stock-out", DIS, ["Dispatch Viewer", "Stock Manager", "Stock User", "System Manager"], "dispatch",
      "Customer, then the order, then what is going"),
    P("returns", "Returns", "↩", "returns", DIS, ["Stock Manager", "Stock User", "System Manager"], "dispatch",
      "Goods coming back - shelf or defective bin"),
    P("live-stock", "Live Stock", "▣", "live-stock", WIDE,
      ["Accounts Manager", "Dispatch Viewer", "Sales Manager", "Sales User", "Stock Manager", "Stock User", "System Manager"], "dispatch",
      "What is on the shelf right now, with value"),
    P("daily-summary", "Daily Summary", "▤", "daily-summary", WIDE,
      ["Accounts Manager", "Dispatch Viewer", "Sales Manager", "Sales User", "Stock Manager", "Stock User", "System Manager"], "dispatch",
      "What came in and went out, day by day"),
    P("sku", "SKU & Products", "▩", "sku", DIS, ["Dispatch Viewer", "Stock Manager", "Stock User", "System Manager"], "dispatch",
      "The product list, reorder levels and rates"),
    P("vendors", "Vendors & Transport", "⛟", "vendors", DIS, ["Dispatch Viewer", "Stock Manager", "Stock User", "System Manager"], "dispatch",
      "Suppliers, couriers and their rate charts"),

    P("purchase", "Purchase & Import", "⬚", "purchase", ADM, ["System Manager"], null,
      "Material requests, purchase orders, receipts and landed cost"),

    P("accounts", "Accounts", "◧", "billing-desk", ACC, ["Accounts Manager", "Accounts User", "System Manager"], null,
      "The billing desk: what is waiting, and what has just been billed"),
    P("payments-desk", "Payments Desk", "◉", "payments-desk", ACC, ["Accounts Manager", "Accounts User", "System Manager"], "accounts",
      "Money owed, money in, and the verification queue"),
    P("statistics", "Statistics", "▦", "statistics", ACC, ["Accounts Manager", "Accounts User", "System Manager"], "accounts",
      "Received vs raised, ageing, and who is paying"),
    P("payables", "Payables", "←", "links", ADM, ["System Manager"], "accounts", "Supplier invoices, payments and reports"),
    P("receivables", "Receivables", "→", "links", ADM, ["System Manager"], "accounts", "Sales invoices, payments and reports"),
    P("financial-reports", "Financial Reports", "▥", "links", ADM, ["System Manager"], "accounts", "Statements, ledgers and profitability"),
    P("gst", "GST India", "⌸", "links", ADM, ["System Manager"], "accounts", "Returns, registers and the e-invoice logs"),

    P("hr", "HR", "⚕", "hr-hub", HR, ["HR Manager", "HR User", "System Manager"], null,
      "Today at a glance, the queues, and every HR screen"),
    P("att-register", "Attendance Register", "▦", "att-register", HR, ["HR Manager", "HR User", "System Manager"], "hr",
      "A month grid you can correct cell by cell"),
    P("expense-claims", "Expense Claims", "⌸", "expense-claims", HR, ["HR Manager", "HR User", "System Manager"], "hr",
      "Claims and employee advances"),
    P("salary-payout", "Salary Payout", "₹", "salary-payout", HR, ["HR Manager", "System Manager"], "hr",
      "Payroll entry, slips and the salary sheet"),

    P("users", "Users", "☷", "links", ADM, ["System Manager"], null, "Users, roles, permissions and logs"),
    P("settings", "Settings", "⚙", "links", ADM, ["System Manager"], null, "System, print, email, workflow and module settings"),
    P("integrations", "Integrations", "⇄", "links", ADM, ["System Manager"], null, "Backups, Google services, webhooks and push"),
    P("support", "Support", "⛨", "links", ADM, ["Support Team", "System Manager"], null, "Issues, maintenance and service levels")
  ];

  D.navById = {};
  D.nav.forEach(function (n) { D.navById[n.id] = n; });

  D.canSee = function (node, roleKey) {
    if (roleKey === "Admin") return true;
    if (!node.roles || !node.roles.length) return true;
    return node.roles.indexOf(roleKey) >= 0;
  };
})(window.DEMO = window.DEMO || {});
