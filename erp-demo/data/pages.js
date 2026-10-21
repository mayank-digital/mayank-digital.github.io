/* Demo ERP - page configuration: which records back each doctype, the link
 * lists on the settings-style workspaces, the kanban boards, the custom
 * reports and the number cards. */
(function (D) {

  /* doctype -> the array in records.js that backs its list view */
  D.sources = {
    "Sales Order": "orders", "Quotation": "quotations", "Lead": "leads", "Customer": "customers",
    "Delivery Note": "deliveryNotes", "Item": "items", "Batch": "batches", "Stock Entry": "stockEntries",
    "Transporter": "transporters", "Delivery Zone": "zones",
    "Purchase Receipt": "purchaseReceipts", "Purchase Order": "purchaseOrders", "Supplier": "suppliers",
    "Payment Entry": "paymentEntries", "Sales Invoice": "salesInvoices",
    "Task": "tasks", "Team Issue": "chats",
    "Employee": "employees", "Attendance": "attendance", "Attendance Correction": "corrections",
    "Leave Application": "leaveApplications", "HR Request": "hrRequests",
    "Employee Document": "employeeDocuments", "Early Closure": "earlyClosures",
    "Expense Claim": "expenseClaims", "Salary Slip": "salarySlips",
    "Employee Checkin": "checkins", "Shift Assignment": "shiftAssignments"
  };

  D.slug = function (s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); };
  D.bySlug = {};
  Object.keys(D.sources).forEach(function (dt) { D.bySlug[D.slug(dt)] = dt; });

  /* which doctypes each role may open a list for */
  D.listRoles = {
    "Sales Order": ["Sales", "SalesMgr", "Accounts", "Dispatch", "Admin"],
    "Quotation": ["Sales", "SalesMgr", "Admin"],
    "Lead": ["Sales", "SalesMgr", "Admin"],
    "Customer": ["Sales", "SalesMgr", "Accounts", "Admin"],
    "Delivery Note": ["Dispatch", "Accounts", "Sales", "SalesMgr", "Admin"],
    "Item": ["Dispatch", "Sales", "SalesMgr", "Accounts", "Admin"],
    "Batch": ["Dispatch", "Admin"], "Stock Entry": ["Dispatch", "Admin"],
    "Transporter": ["Dispatch", "Sales", "SalesMgr", "Admin"], "Delivery Zone": ["Dispatch", "Sales", "SalesMgr", "Admin"],
    "Purchase Receipt": ["Dispatch", "Admin"], "Purchase Order": ["Admin"], "Supplier": ["Dispatch", "Admin"],
    "Payment Entry": ["Accounts", "Admin"], "Sales Invoice": ["Accounts", "Admin"],
    "Task": [], "Team Issue": [],
    "Employee": ["HR", "Admin"], "Attendance": ["HR", "Admin"],
    "Attendance Correction": ["HR", "Employee", "Sales", "SalesMgr", "Accounts", "Dispatch", "Admin"],
    "Leave Application": [], "HR Request": [], "Employee Document": [],
    "Early Closure": ["HR", "Admin"], "Expense Claim": [], "Salary Slip": ["HR", "Admin"],
    "Employee Checkin": ["HR", "Admin"], "Shift Assignment": ["HR", "Admin"]
  };

  /* ---------------- link-list workspaces ---------------- */
  D.linkPages = {
    purchase: {
      shortcuts: [["Purchase Order", "Purchase Order"], ["Supplier", "Supplier"],
        ["Purchase Receipt", "Purchase Receipt"], ["Landed Cost", null]],
      cards: [{ label: "Requests to Order", value: 2, hint: "submitted, pending or partly ordered", color: "amber" },
              { label: "Open Purchase Orders", value: 2, hint: "to receive or to bill", color: "blue" },
              { label: "Receipts this month", value: 5, hint: "shipments landed in June", color: "green" }],
      groups: [
        ["Purchasing", [["Material Request", null], ["Purchase Order", "Purchase Order"]]],
        ["Receiving & Costing", [["Purchase Receipt", "Purchase Receipt"], ["Purchase Invoice", null], ["Landed Cost Voucher", null]]],
        ["Suppliers", [["Supplier", "Supplier"]]]
      ]
    },
    payables: {
      shortcuts: [["Accounts Payable", null], ["Purchase Invoice", null], ["Journal Entry", null], ["Payment Entry", "Payment Entry"]],
      groups: [
        ["Invoicing", [["Purchase Invoice", null], ["Supplier", "Supplier"]]],
        ["Payments", [["Payment Entry", "Payment Entry"], ["Journal Entry", null], ["Payment Reconciliation", null]]],
        ["Reports", [["Accounts Payable", null], ["Accounts Payable Summary", null], ["Purchase Register", null],
          ["Item-wise Purchase Register", null], ["Purchase Order Analysis", null],
          ["Received Items To Be Billed", null], ["Supplier Ledger Summary", null]]]
      ]
    },
    receivables: {
      shortcuts: [["Sales Invoice", "Sales Invoice"], ["Payment Entry", "Payment Entry"],
        ["Accounts Receivable", null], ["Cost Center", null]],
      groups: [
        ["Invoicing", [["Sales Invoice", "Sales Invoice"], ["Customer", "Customer"]]],
        ["Payments", [["Payment Entry", "Payment Entry"], ["Payment Request", null],
          ["Payment Reconciliation", null], ["Payment Gateway Account", null]]],
        ["Dunning", [["Dunning", null], ["Dunning Type", null]]],
        ["Reports", [["Accounts Receivable", null], ["Accounts Receivable Summary", null], ["Sales Register", null],
          ["Item-wise Sales Register", null], ["Sales Order Analysis", null], ["Delivered Items To Be Billed", null]]]
      ]
    },
    "financial-reports": {
      groups: [
        ["Profitability", [["Gross Profit", null], ["Profitability Analysis", null],
          ["Sales Invoice Trends", null], ["Purchase Invoice Trends", null]]],
        ["Financial Statements", [["Trial Balance", null], ["Profit and Loss Statement", null],
          ["Balance Sheet", null], ["Cash Flow", null], ["Consolidated Financial Statement", null]]],
        ["Ledgers", [["General Ledger", null], ["Customer Ledger Summary", null], ["Supplier Ledger Summary", null]]],
        ["Other Reports", [["Trial Balance for Party", null], ["Payment Period Based On Invoice Date", null],
          ["Customer Credit Balance", null], ["Sales Payment Summary", null], ["Address And Contacts", null]]]
      ]
    },
    gst: {
      shortcuts: [["GSTR-1 Beta", null], ["Purchase Reconciliation Tool", null],
        ["GST Settings", null], ["HSN Code", null], ["GSTR-3B", null]],
      cards: [{ label: "Pending e-Waybills", value: 0, hint: "submitted invoices awaiting a waybill", color: "grey" },
              { label: "Pending e-Invoices", value: 0, hint: "submitted invoices not yet reported", color: "grey" },
              { label: "Active e-Invoice, Cancelled Invoice", value: 0, hint: "needs a cancellation upstream", color: "grey" }],
      groups: [
        ["Sales and Purchase Reports", [["GSTR-1", null], ["GST Sales Register", null], ["GST Purchase Register", null],
          ["GST Itemised Sales Register", null], ["GST Itemised Purchase Register", null], ["Bill of Entry Summary", null]]],
        ["Logs", [["e-Waybill Log", null], ["e-Invoice Log", null], ["GST Return Log", null],
          ["GST Inward Supply", null], ["Integration Request", null]]],
        ["Other GST Reports", [["e-Invoice Summary", null], ["GSTR-3B Details", null], ["GST Balance", null],
          ["HSN-wise Summary of Outward Supplies", null], ["Audit Trail", null], ["GSTIN Status", null]]]
      ]
    },
    users: {
      shortcuts: [["User", null], ["Role", null], ["Permission Manager", null], ["User Profile", null], ["User Type", null]],
      groups: [
        ["Users", [["User", null], ["Role", null], ["Role Profile", null], ["Module Profile", null]]],
        ["Permissions", [["Role Permissions Manager", null], ["User Permissions", null],
          ["Role Permission for Page and Report", null], ["Permitted Documents For User", null], ["Document Share Report", null]]],
        ["Logs", [["Activity Log", null], ["Access Log", null]]]
      ]
    },
    settings: {
      shortcuts: [["Print Settings", null], ["System Settings", null], ["Accounts Settings", null],
        ["Global Defaults", null], ["Stock Settings", null], ["Selling Settings", null], ["Buying Settings", null]],
      groups: [
        ["Data", [["Import Data", null], ["Export Data", null], ["Bulk Update", null],
          ["Download Backups", null], ["Deleted Documents", null]]],
        ["Email / Notifications", [["Email Account", null], ["Email Domain", null], ["Notification", null],
          ["Email Template", null], ["Auto Email Report", null], ["Newsletter", null], ["Notification Settings", null]]],
        ["Printing", [["Print Format Builder", null], ["Print Settings", null], ["Print Format", null], ["Print Style", null]]],
        ["Workflow", [["Workflow", null], ["Workflow State", null], ["Workflow Action", null]]],
        ["Core", [["System Settings", null], ["Domain Settings", null], ["Global Defaults", null]]],
        ["Module Settings", [["Accounts Settings", null], ["Stock Settings", null], ["Selling Settings", null],
          ["Buying Settings", null], ["CRM Settings", null], ["Projects Settings", null], ["Support Settings", null]]]
      ]
    },
    integrations: {
      groups: [
        ["Backup", [["Dropbox Settings", null], ["S3 Backup Settings", null], ["Google Drive", null]]],
        ["Google Services", [["Google Settings", null], ["Google Contacts", null], ["Google Calendar", null]]],
        ["Settings", [["Webhook", null], ["Slack Webhook URL", null], ["SMS Settings", null]]],
        ["Authentication", [["Social Login Key", null], ["LDAP Settings", null],
          ["OAuth Client", null], ["OAuth Provider Settings", null]]],
        ["Push Notifications", [["Push Notification Settings", null]]]
      ]
    },
    support: {
      shortcuts: [["Issue", null], ["Maintenance Visit", null], ["Service Level Agreement", null]],
      groups: [
        ["Issues", [["Issue", null], ["Issue Type", null], ["Issue Priority", null]]],
        ["Maintenance", [["Maintenance Schedule", null], ["Maintenance Visit", null]]],
        ["Service Level Agreement", [["Service Level Agreement", null]]],
        ["Warranty", [["Warranty Claim", null], ["Serial No", null]]],
        ["Reports", [["First Response Time for Issues", null]]]
      ]
    }
  };

  /* ---------------- kanban boards ---------------- */
  D.boards = {
    leads: {
      label: "Lead Pipeline", doctype: "Lead", field: "custom_stage",
      columns: D.LEAD_STAGES,
      cardFields: ["company_name", "lead_name", "mobile_no", "custom_city", "custom_state", "lead_owner"],
      titleField: "company_name"
    },
    tasks: {
      label: "Task Board", doctype: "Task", field: "custom_stage",
      columns: D.TASK_STAGES,
      cardFields: ["priority", "progress", "custom_due_date", "assigned_to"],
      titleField: "subject"
    }
  };

  /* ---------------- custom reports ---------------- */
  D.reports = {
    "payment-pending-orders": {
      label: "Payment Pending Orders", type: "Query Report", ref: "Sales Order",
      blurb: "Every submitted order with money still outstanding, oldest first.",
      cols: ["Order", "Customer", "Date", "Stage", "Grand Total", "Received", "Pending", "Age (days)"],
      rows: function () {
        var out = [];
        D.orders.forEach(function (o) {
          if (o.custom_balance_remaining <= 0 || o.custom_order_stage === "Closed") return;
          out.push([o.name, o.customer, o.transaction_date, o.custom_order_stage,
            o.grand_total, o.custom_total_received, o.custom_balance_remaining,
            Math.round((new Date(D.TODAY) - new Date(o.transaction_date)) / 86400000)]);
        });
        return out.sort(function (a, b) { return b[7] - a[7]; });
      },
      num: [4, 5, 6, 7]
    },
    "todays-dispatch-orders": {
      label: "Today's Dispatch Orders", type: "Script Report", ref: "Delivery Note",
      blurb: "Delivery notes submitted today, with the courier and the docket number.",
      cols: ["Delivery Note", "Customer", "Against Order", "Courier", "Tracking ID", "Qty", "Value"],
      rows: function () {
        return D.deliveryNotes.filter(function (d) { return d.posting_date >= "2026-06-12"; })
          .map(function (d) { return [d.name, d.customer, d.against_sales_order, d.custom_courier_name,
            d.custom_tracking_id, d.total_qty, d.grand_total]; });
      },
      num: [5, 6]
    },
    "todays-stock-receipts": {
      label: "Today's Stock Receipts", type: "Script Report", ref: "Purchase Receipt",
      blurb: "What came in, by supplier and lot.",
      cols: ["Receipt", "Supplier", "Date", "Supplier Invoice", "Qty", "Value"],
      rows: function () {
        return D.purchaseReceipts.map(function (p) {
          return [p.name, p.supplier, p.posting_date, p.supplier_invoice_no, p.total_qty, p.grand_total];
        });
      },
      num: [4, 5]
    },
    "daily-stock-movement-summary": {
      label: "Daily Stock Movement Summary", type: "Script Report", ref: "Item",
      blurb: "In, out and closing quantity for each day in the range.",
      cols: ["Date", "SKUs moved", "Qty In", "Qty Out", "Documents", "Closing Qty"],
      rows: function () {
        return D.dailyStock.map(function (d) { return [d.date, d.skus, d.in_qty, d.out_qty, d.docs, d.closing]; });
      },
      num: [1, 2, 3, 4, 5]
    },
    "daily-dispatch-summary-report": {
      label: "Daily Dispatch Summary Report", type: "Script Report", ref: "Item",
      blurb: "Dispatches per day with the number of orders and the value that left.",
      cols: ["Date", "Delivery Notes", "Orders", "Qty Out", "Value Out"],
      rows: function () {
        return D.dailyStock.filter(function (d) { return d.out_qty; }).map(function (d) {
          return [d.date, Math.max(1, Math.round(d.docs / 2)), Math.max(1, Math.round(d.docs / 2)),
            d.out_qty, d.out_qty * 1250];
        });
      },
      num: [1, 2, 3, 4]
    },
    "item-stock-movement": {
      label: "Item Stock Movement", type: "Script Report", ref: "Item",
      blurb: "Per SKU: opening, inward, dispatched and closing. The closing column is what the live dashboard shows.",
      cols: ["SKU", "Product", "Unit", "Opening / Adj", "Total Inward", "Total Dispatched", "Current Stock"],
      rows: function () {
        return D.items.map(function (it, i) {
          var inw = 40 + (i * 23) % 180, out = 20 + (i * 17) % 120;
          return [it.item_code, it.item_name, it.stock_uom, it.on_hand - inw + out, inw, out, it.on_hand];
        });
      },
      num: [3, 4, 5, 6]
    },
    "items-below-reorder-level": {
      label: "Items Below Reorder Level", type: "Script Report", ref: "Item",
      blurb: "Anything at or below its reorder level. A reorder level of zero means no warning was asked for.",
      cols: ["SKU", "Product", "Variant", "Unit", "On Hand", "Reorder Level", "Short By"],
      rows: function () {
        return D.items.filter(function (it) { return it.reorder_level > 0 && it.on_hand <= it.reorder_level; })
          .map(function (it) { return [it.item_code, it.item_name, it.custom_sku_variant, it.stock_uom,
            it.on_hand, it.reorder_level, it.reorder_level - it.on_hand]; });
      },
      num: [4, 5, 6]
    },
    "vendor-stock-balance": {
      label: "Vendor Stock Balance", type: "Script Report", ref: "Item",
      blurb: "Stock still on the shelf, attributed to the vendor it came from. Only the lot carries that link, so a SKU with no lot cannot appear here.",
      cols: ["Supplier", "SKU", "Lot", "Received", "Still On Hand", "Value"],
      rows: function () {
        return D.batches.filter(function (b) { return b.on_hand > 0; }).slice(0, 18).map(function (b) {
          var it = null; D.items.forEach(function (x) { if (x.item_code === b.item) it = x; });
          return [b.supplier, b.item, b.name, b.batch_qty, b.on_hand, b.on_hand * (it ? it.valuation_rate : 0)];
        });
      },
      num: [3, 4, 5]
    },
    "vendor-stock-movement": {
      label: "Vendor Stock Movement", type: "Script Report", ref: "Item",
      blurb: "The same attribution, but as movement rather than balance.",
      cols: ["Supplier", "Lots", "Qty Received", "Qty Dispatched", "Qty On Hand"],
      rows: function () {
        var by = {};
        D.batches.forEach(function (b) {
          by[b.supplier] = by[b.supplier] || { lots: 0, recv: 0, hand: 0 };
          by[b.supplier].lots++; by[b.supplier].recv += b.batch_qty; by[b.supplier].hand += b.on_hand;
        });
        return Object.keys(by).map(function (s) {
          return [s, by[s].lots, by[s].recv, by[s].recv - by[s].hand, by[s].hand];
        });
      },
      num: [1, 2, 3, 4]
    },
    "monthly-salary-sheet": {
      label: "Monthly Salary Sheet", type: "Script Report", ref: "Employee",
      blurb: "One row per employee for the month. Payment days are what make this agree with the attendance register.",
      cols: ["Employee", "Name", "Designation", "Working Days", "Payment Days", "Gross Pay", "Deductions", "Net Pay"],
      rows: function () {
        return D.salarySlips.map(function (s) {
          var e = null; D.employees.forEach(function (x) { if (x.name === s.employee) e = x; });
          return [s.employee, s.employee_name, e ? e.designation : "", s.total_working_days,
            s.payment_days, s.gross_pay, s.total_deduction, s.net_pay];
        });
      },
      num: [3, 4, 5, 6, 7]
    },
    "tdf-today-at-a-glance": {
      label: "Today At A Glance", type: "Script Report", ref: "Employee",
      blurb: "The counters behind the HR number cards: in today, not in yet, and on leave. Report-type number cards read their value from here.",
      cols: ["Measure", "Count"],
      rows: function () {
        var g = D.attendanceGrid, inT = 0, notIn = 0, leave = 0;
        Object.keys(g).forEach(function (k) {
          var c = g[k][17] ? g[k][17].c : "";
          if (c === "P" || c === "WFH" || c === "HD") inT++;
          else if (c === "L") leave++;
          else notIn++;
        });
        return [["In Today", inT], ["Not In Yet", notIn], ["On Leave Today", leave],
          ["Pending Leave Approvals", D.leaveApplications.filter(function (l) { return l.status === "Open"; }).length],
          ["Pending Corrections", D.corrections.filter(function (c) { return c.status === "Pending"; }).length],
          ["Open HR Requests", D.hrRequests.filter(function (r) { return r.status !== "Resolved"; }).length]];
      },
      num: [1]
    },
    "monthly-attendance-sheet": {
      label: "Monthly Attendance Sheet", type: "Standard (HRMS)", ref: "Attendance",
      blurb: "The stock HRMS report. The custom register on the page above is the editable version of the same grid.",
      cols: ["Employee", "Name", "Present", "Absent", "Half Day", "On Leave", "Work From Home"],
      rows: function () {
        return D.employees.map(function (e) {
          var r = D.attendanceGrid[e.name], c = { P: 0, A: 0, HD: 0, L: 0, WFH: 0 };
          r.forEach(function (x) { if (c[x.c] !== undefined) c[x.c]++; });
          return [e.name, e.employee_name, c.P, c.A, c.HD, c.L, c.WFH];
        });
      },
      num: [2, 3, 4, 5, 6]
    }
  };

  D.reportsFor = {
    dispatch: ["todays-dispatch-orders", "daily-dispatch-summary-report", "daily-stock-movement-summary",
      "item-stock-movement", "items-below-reorder-level", "vendor-stock-balance", "vendor-stock-movement",
      "todays-stock-receipts"],
    accounts: ["payment-pending-orders"],
    hr: ["monthly-salary-sheet", "monthly-attendance-sheet", "tdf-today-at-a-glance"]
  };
})(window.DEMO = window.DEMO || {});
