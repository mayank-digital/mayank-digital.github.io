/* Demo ERP - the HR screens and the employee self-service pages. */
(function (D) {
  var U = D.u, S = D.shell;

  function todayCol() { return 17; }   /* 18 June is index 17 */
  function glance() {
    var g = D.attendanceGrid, inT = 0, notIn = 0, leave = 0;
    Object.keys(g).forEach(function (k) {
      var c = g[k][todayCol()] ? g[k][todayCol()].c : "";
      if (c === "P" || c === "WFH" || c === "HD") inT++;
      else if (c === "L") leave++;
      else notIn++;
    });
    return { inT: inT, notIn: notIn, leave: leave };
  }
  function pendingLeave() { return D.leaveApplications.filter(function (l) { return l.status === "Open"; }); }
  function pendingCorr() {
    return D.corrections.concat(D.state.corrections).filter(function (c) { return c.status === "Pending"; });
  }
  function openReq() { return D.hrRequests.filter(function (r) { return r.status !== "Resolved"; }); }

  /* ---------------- HR hub ---------------- */
  D.screens["hr-hub"] = function (n) {
    var body = S.page({ title: "HR", sub: n.sub, crumbs: D.crumbs(n) });
    var g = glance();
    body.appendChild(U.el("div.cards", [
      U.ncard("In Today", g.inT, "present, half day or from home", "green", "#/p/att-register"),
      U.ncard("Not In Yet", g.notIn, "no row for today", g.notIn ? "amber" : "grey", "#/p/att-register"),
      U.ncard("On Leave Today", g.leave, "approved leave", "blue", "#/l/leave-application"),
      U.ncard("Pending Leave Approvals", pendingLeave().length, "still drafts", pendingLeave().length ? "amber" : "grey", "#/l/leave-application"),
      U.ncard("Pending Corrections", pendingCorr().length, "missed punches to decide", pendingCorr().length ? "amber" : "grey", "#/l/attendance-correction"),
      U.ncard("Open HR Requests", openReq().length, "not yet resolved", openReq().length ? "amber" : "grey", "#/l/hr-request")
    ]));
    body.appendChild(U.el("div.notice", { html:
      "<b>Those first three cards are report-driven.</b> They read a report rather than counting a doctype, " +
      "because “not in yet” is the <i>absence</i> of an attendance row - and a doctype count cannot count what is " +
      "not there." }));

    body.appendChild(U.el("div.sec", "Queues"));
    body.appendChild(U.el("div.tiles", [
      ["Leave Approvals", "#/l/leave-application", pendingLeave().length + " open"],
      ["Attendance Corrections", "#/l/attendance-correction", pendingCorr().length + " pending"],
      ["HR Requests", "#/l/hr-request", openReq().length + " open"],
      ["Expense Claims", "#/p/expense-claims", D.expenseClaims.filter(function (c) { return c.approval_status === "Draft"; }).length + " draft"]
    ].map(function (x) {
      return U.el("button.tile", { type: "button", onclick: function () { U.go(x[1]); } }, [
        U.el("div.t", { text: x[0] }), U.el("div.h", { text: x[2] })
      ]);
    })));

    body.appendChild(D.navBlock(["att-register", "expense-claims", "salary-payout"], "HR pages"));

    body.appendChild(U.el("div.sec", "Masters and day-to-day"));
    body.appendChild(U.el("div.linkgroups", [
      U.el("div.linkgroup", [U.el("h4", "Team"), U.el("ul", [
        U.el("li", [U.link("Employee", "#/l/employee")]),
        U.el("li", [U.link("Employee Document", "#/l/employee-document")]),
        U.el("li", [U.link("Shift Assignment", "#/l/shift-assignment")])
      ])]),
      U.el("div.linkgroup", [U.el("h4", "Attendance"), U.el("ul", [
        U.el("li", [U.link("Mark / Edit Attendance", "#/l/attendance")]),
        U.el("li", [U.link("Employee Check-ins", "#/l/employee-checkin")]),
        U.el("li", [U.link("Attendance Corrections", "#/l/attendance-correction")]),
        U.el("li", [U.link("Early Closure Days", "#/l/early-closure")])
      ])]),
      U.el("div.linkgroup", [U.el("h4", "Leave & payroll"), U.el("ul", [
        U.el("li", [U.link("Leave Applications", "#/l/leave-application")]),
        U.el("li", [U.link("Salary Slips", "#/l/salary-slip")]),
        U.el("li.plain", "Leave Type"), U.el("li.plain", "Leave Allocation"),
        U.el("li.plain", "Holiday List"), U.el("li.plain", "Leave Control Panel")
      ])])
    ]));

    body.appendChild(U.el("div.notice.warn", { style: "margin-top:14px", html:
      "<b>Three things about attendance that bite.</b> There is no “off day” status - a weekly off is the absence of " +
      "a row, so rows are cancelled rather than deleted. Auto-attendance will mark the whole company absent every " +
      "night if nobody punches. And its window reaches back to the date it is told to start from, so a new joiner " +
      "can pick up absences from before they arrived." }));
    D.views.reportList(body, D.reportsFor.hr);
  };

  /* ---------------- Attendance register ---------------- */
  D.screens["att-register"] = function (n) {
    var body = S.page({ title: "Attendance Register", sub:
      "The month as a grid. Tap any cell to fix the status or the times.", crumbs: D.crumbs(n) });
    var st = { view: "grid", emp: D.employees[0].name };

    var bar = U.el("div.fbar");
    bar.appendChild(S.btn("‹", null, function () { U.demoOnly("previous month"); }));
    bar.appendChild(U.el("span", { style: "font-weight:700;padding:0 6px", text: D.attendanceMonth.label }));
    bar.appendChild(S.btn("›", null, function () { U.demoOnly("next month"); }));
    bar.appendChild(S.btn("This month", null, function () { U.demoOnly("jump to this month"); }));
    var vg = S.btn("Month grid", "on", function () { st.view = "grid"; flip(); });
    var ve = S.btn("One employee", null, function () { st.view = "emp"; flip(); });
    bar.appendChild(vg); bar.appendChild(ve);
    var empSel = U.el("select", { hidden: true }, D.employees.map(function (e) {
      return U.el("option", { value: e.name, text: e.employee_name });
    }));
    empSel.addEventListener("change", function () { st.emp = empSel.value; draw(); });
    bar.appendChild(empSel);
    body.appendChild(bar);

    body.appendChild(U.el("div.reglegend", D.ATT_LEGEND.map(function (l) {
      return U.el("span", { html: '<span class="k c-' + l[0] + '">' + (l[0] === "none" ? "&ndash;" : l[0]) +
        "</span>" + U.esc(l[1]) });
    })));
    body.appendChild(U.el("div.muted.small", { style: "margin:-4px 0 12px", text:
      "A day worked on a weekly off or a holiday carries an orange dot and is paid as an extra day." }));

    var host = U.el("div");
    body.appendChild(host);
    function flip() {
      vg.classList.toggle("on", st.view === "grid");
      ve.classList.toggle("on", st.view === "emp");
      empSel.hidden = st.view !== "emp";
      draw();
    }
    function cellBtn(empName, dayIdx, cell) {
      var code = cell.c || "none";
      var b = U.el("button", { type: "button", class: "c-" + code,
        title: empName + ", " + U.date("2026-06-" + String(dayIdx + 1).padStart(2, "0")) +
          (cell.in ? " · in " + cell.in + ", out " + cell.out : ""),
        text: code === "none" ? "–" : code });
      if (cell.extra) b.innerHTML = U.esc(code) + '<span style="color:#c9881a"> •</span>';
      b.addEventListener("click", function () { editCell(empName, dayIdx, cell); });
      return b;
    }
    function draw() {
      U.clear(host);
      if (st.view === "grid") {
        var wrap = U.el("div.reg");
        var t = U.el("table.regt");
        var head = U.el("tr", [U.el("th.nmcol", { text: "Employee" })]);
        for (var d = 1; d <= D.attendanceMonth.days; d++) {
          var dow = new Date(2026, 5, d).getDay();
          head.appendChild(U.el("th", { text: String(d), style: dow === 0 ? "color:#c0392b" : "" }));
        }
        head.appendChild(U.el("th", { text: "P" }));
        head.appendChild(U.el("th", { text: "A" }));
        t.appendChild(U.el("thead", [head]));
        var tb = U.el("tbody");
        D.employees.forEach(function (e) {
          var row = U.el("tr", [U.el("td.nmcol", [U.link(e.employee_name, "#/f/employee/" + encodeURIComponent(e.name), "lnk")])]);
          var cnt = { P: 0, A: 0 };
          D.attendanceGrid[e.name].forEach(function (cell, i) {
            if (cell.c === "P") cnt.P++;
            if (cell.c === "A") cnt.A++;
            row.appendChild(U.el("td", [cellBtn(e.name, i, cell)]));
          });
          row.appendChild(U.el("td", { html: "<b>" + cnt.P + "</b>" }));
          row.appendChild(U.el("td", { html: "<b>" + cnt.A + "</b>" }));
          tb.appendChild(row);
        });
        t.appendChild(tb);
        wrap.appendChild(t);
        host.appendChild(wrap);
        host.appendChild(U.el("p.muted.small", { style: "margin-top:10px", text:
          "The grid scrolls sideways; the name column stays put. Sunday headings are red. " +
          "Every change is logged on the attendance record with the name of whoever made it and the time." }));
      } else {
        var e = null;
        D.employees.forEach(function (x) { if (x.name === st.emp) e = x; });
        empSel.value = st.emp;
        var wrap2 = U.el("div.tablewrap");
        var t2 = U.el("table.dt");
        t2.appendChild(U.el("thead", [U.el("tr", ["Date", "Status", "In", "Out", "Hours", ""]
          .map(function (h) { return U.el("th", { text: h }); }))]));
        var tb2 = U.el("tbody");
        D.attendanceGrid[e.name].forEach(function (cell, i) {
          var MAP = { P: "Present", A: "Absent", HD: "Half Day", L: "On Leave", WFH: "Work From Home",
            WO: "Weekly Off", H: "Holiday", "": "Nothing recorded" };
          tb2.appendChild(U.el("tr", [
            U.el("td", { text: U.date("2026-06-" + String(i + 1).padStart(2, "0")) }),
            U.el("td", [U.el("span.ind." + (U.indColor(MAP[cell.c]) || "grey"), { text: MAP[cell.c] })]),
            U.el("td", { text: cell.in ? U.time(cell.in) : "—" }),
            U.el("td", { text: cell.out ? U.time(cell.out) : "—" }),
            U.el("td", { text: cell.in && cell.out ? (cell.c === "HD" ? "4.5" : "8.5") : "—" }),
            U.el("td", [U.el("button.btn.sm", { type: "button", text: "Fix",
              onclick: function () { editCell(e.name, i, cell); } })])
          ]));
        });
        t2.appendChild(tb2);
        wrap2.appendChild(t2);
        host.appendChild(wrap2);
      }
    }
    function editCell(empName, dayIdx, cell) {
      var nm = "";
      D.employees.forEach(function (e) { if (e.name === empName) nm = e.employee_name; });
      var sel = U.el("select", [
        U.el("option", { value: "Present", text: "Present" }),
        U.el("option", { value: "Half Day", text: "Half day" }),
        U.el("option", { value: "Absent", text: "Absent" }),
        U.el("option", { value: "Work From Home", text: "Work from home" }),
        U.el("option", { value: "Weekly Off", text: "Weekly off (clear this day)" }),
        U.el("option", { value: "Holiday", text: "Holiday (clear this day)" })
      ]);
      var MAP = { P: "Present", A: "Absent", HD: "Half Day", L: "On Leave", WFH: "Work From Home",
        WO: "Weekly Off", H: "Holiday" };
      if (MAP[cell.c]) sel.value = MAP[cell.c] === "On Leave" ? "Present" : MAP[cell.c];
      var body2 = [
        U.el("p.muted.small", { style: "margin:0 0 12px", html:
          "<b>" + U.esc(nm) + "</b> &mdash; " + U.esc(U.date("2026-06-" + String(dayIdx + 1).padStart(2, "0"))) +
          ". Was: <b>" + U.esc(MAP[cell.c] || "nothing recorded") + "</b>." }),
        U.el("label", "Status"), sel,
        U.el("label", "In time"), U.el("input", { type: "time", value: cell.in || "" }),
        U.el("label", "Out time"), U.el("input", { type: "time", value: cell.out || "" })
      ];
      if (cell.c === "L") {
        body2.push(U.el("div.notice.warn", { style: "margin:4px 0 0", html:
          "This day is covered by an approved leave application. Changing it here would leave the leave record and " +
          "the register disagreeing." }));
      }
      if (cell.c === "WO" || cell.c === "H") {
        body2.push(U.el("div.notice", { style: "margin:4px 0 0", html:
          "There is no “off day” status. Marking somebody present on a weekly off or a holiday creates a row, " +
          "and it is paid as an extra day; choosing <i>Weekly off</i> or <i>Holiday</i> here deletes the row instead " +
          "of setting a status." }));
      }
      var m = U.modal("Edit attendance", body2,
        [U.el("button.btn.primary", { type: "button", text: "Save",
          onclick: function () { m.close(); U.demoOnly("edit " + nm + "'s attendance"); } })]);
    }
    flip();
  };

  /* ---------------- Expense claims ---------------- */
  D.screens["expense-claims"] = function (n) {
    var body = S.page({ title: "Expense Claims", sub: "Claims and employee advances.", crumbs: D.crumbs(n),
      acts: [S.btn("+ New Expense Claim", "primary")] });
    var cs = D.expenseClaims;
    body.appendChild(U.el("div.cards", [
      U.ncard("Draft claims", cs.filter(function (c) { return c.approval_status === "Draft"; }).length, "awaiting a decision", "amber"),
      U.ncard("Approved", cs.filter(function (c) { return c.approval_status === "Approved"; }).length, "this period", "green"),
      U.ncard("Claimed", U.money(U.sum(cs, function (c) { return c.total_claimed_amount; })), "total raised", "blue"),
      U.ncard("Sanctioned", U.money(U.sum(cs, function (c) { return c.total_sanctioned_amount; })), "total approved", "green")
    ]));
    body.appendChild(U.el("div.chartbox", { style: "margin-bottom:14px" }, [
      U.el("h4", "Claimed by employee"),
      U.bars(U.groupSum(cs, function (c) { return c.employee_name; }, function (c) { return c.total_claimed_amount; }),
        { fmt: U.money })
    ]));
    D.views.list ? null : null;
    body.appendChild(U.el("div.sec", "All claims"));
    var wrap = U.el("div.tablewrap");
    var t = U.el("table.dt");
    t.appendChild(U.el("thead", [U.el("tr", ["Claim", "Employee", "Date", "Claimed", "Sanctioned", "Approval", "Status"]
      .map(function (h, i) { return U.el("th" + (i === 3 || i === 4 ? ".num" : ""), { text: h }); }))]));
    t.appendChild(U.el("tbody", cs.map(function (c) {
      return U.el("tr.clickable", { onclick: function () { U.go("#/f/expense-claim/" + encodeURIComponent(c.name)); } }, [
        U.el("td", [U.el("span.lnk", { text: c.name })]),
        U.el("td", { text: c.employee_name }), U.el("td", { text: U.date(c.posting_date) }),
        U.el("td.num", { text: U.money(c.total_claimed_amount) }),
        U.el("td.num", { text: U.money(c.total_sanctioned_amount) }),
        U.el("td", [U.ind(c.approval_status)]), U.el("td", [U.ind(c.status)])
      ]);
    })));
    wrap.appendChild(t);
    body.appendChild(wrap);
    body.appendChild(U.el("p.muted.small", { style: "margin-top:10px", text:
      "Employee advances live on the same page in the real workspace. A claim is drafted by the employee from " +
      "self-service and the approver is the one who submits it." }));
  };

  /* ---------------- Salary payout ---------------- */
  D.screens["salary-payout"] = function (n) {
    var body = S.page({ title: "Salary Payout", sub: "Payroll entry, slips and the salary sheet.",
      crumbs: D.crumbs(n), acts: [S.btn("+ New Payroll Entry", "primary")] });
    var ss = D.salarySlips;
    body.appendChild(U.el("div.cards", [
      U.ncard("Slips", ss.length, "for May 2026", "blue"),
      U.ncard("Draft slips", ss.filter(function (s) { return !s.docstatus; }).length, "not yet submitted", "amber"),
      U.ncard("Gross", U.lakh(U.sum(ss, function (s) { return s.gross_pay; })), "before deductions", "blue"),
      U.ncard("Net payable", U.lakh(U.sum(ss, function (s) { return s.net_pay; })), "after deductions", "green")
    ]));
    body.appendChild(U.el("div.notice", { html:
      "<b>Payment days are the whole trick.</b> Four settings make a slip equal the attendance sheet: unmarked days " +
      "are not paid, half days count as half, leave without pay is subtracted, and the joining date pro-rates a " +
      "first month. Get one wrong and the slip and the register disagree by exactly one day." }));
    body.appendChild(U.el("div.sec", "Salary slips"));
    var wrap = U.el("div.tablewrap");
    var t = U.el("table.dt");
    t.appendChild(U.el("thead", [U.el("tr", ["Slip", "Employee", "Period", "Working days", "Payment days",
      "Gross", "Deductions", "Net", "Status"]
      .map(function (h, i) { return U.el("th" + (i >= 3 && i <= 7 ? ".num" : ""), { text: h }); }))]));
    t.appendChild(U.el("tbody", ss.map(function (s) {
      return U.el("tr.clickable", { onclick: function () { U.go("#/f/salary-slip/" + encodeURIComponent(s.name)); } }, [
        U.el("td", [U.el("span.lnk", { text: s.name })]),
        U.el("td", { text: s.employee_name }),
        U.el("td", { text: "May 2026" }),
        U.el("td.num", { text: U.num(s.total_working_days) }),
        U.el("td.num", { html: "<b>" + U.esc(U.num(s.payment_days)) + "</b>" }),
        U.el("td.num", { text: U.money(s.gross_pay) }),
        U.el("td.num", { text: U.money(s.total_deduction) }),
        U.el("td.num", { text: U.money(s.net_pay) }),
        U.el("td", [U.ind(s.docstatus ? "Submitted" : "Draft", s.docstatus ? "blue" : "grey")])
      ]);
    })));
    wrap.appendChild(t);
    body.appendChild(wrap);
    D.views.reportList(body, ["monthly-salary-sheet"]);
  };

  /* ---------------- My HR (self-service hub) ---------------- */
  D.screens["my-hr"] = function (n) {
    var me = S.me();
    var body = S.page({ title: "My HR", sub: "Everything you can do for yourself, in one place.",
      crumbs: D.crumbs(n) });
    var myLeave = D.leaveApplications.filter(function (l) { return l.employee_name === me.name; });
    var myCorr = D.corrections.concat(D.state.corrections).filter(function (c) { return c.employee_name === me.name; });
    var myDocs = D.employeeDocuments.filter(function (d) { return d.employee_name === me.name; });
    var myReq = D.hrRequests.filter(function (r) { return r.employee_name === me.name; });

    body.appendChild(U.el("div.cards", [
      U.ncard("Leave balance", U.sum(D.leaveBalances, function (b) { return b.allocated - b.used; }) + " days",
        "across all types", "green", "#/p/my-leave"),
      U.ncard("My leave applications", myLeave.length, myLeave.filter(function (l) { return l.status === "Open"; }).length + " still open", "blue", "#/p/my-leave"),
      U.ncard("My corrections", myCorr.length, myCorr.filter(function (c) { return c.status === "Pending"; }).length + " pending", "amber", "#/l/attendance-correction"),
      U.ncard("My documents", myDocs.length, "payslips and letters", "purple", "#/l/employee-document")
    ]));

    body.appendChild(U.el("div.sec", "Self-service"));
    body.appendChild(U.el("div.tiles", [
      ["My Profile", "☻", "#/p/my-profile", "Your own employee record"],
      ["My Attendance", "☑", "#/p/my-attendance", "Your month, day by day"],
      ["My Leave", "⚐", "#/p/my-leave", "Balance and history"],
      ["Apply for Leave", "⚐", null, "Opens the leave form, pre-filled with you"],
      ["Fix Missed Punch", "✎", null, "Send an attendance correction"],
      ["My Documents", "⛃", "#/l/employee-document", "Payslips and letters"],
      ["New Expense Claim", "⌸", null, "Travel, food, freight paid in cash"],
      ["Request to HR", "✉", "#/l/hr-request", "Anything else"],
      ["Holidays", "◷", null, "This year's holiday list"]
    ].map(function (x) {
      return U.el("button.tile", { type: "button",
        onclick: x[2] ? function () { U.go(x[2]); } : function () { U.demoOnly(x[0]); } }, [
        U.el("div.ic", { text: x[1] }), U.el("div.t", { text: x[0] }), U.el("div.h", { text: x[3] })
      ]);
    })));

    body.appendChild(U.el("div.sec", "Leave allocated this year"));
    var wrap = U.el("div.tablewrap");
    var t = U.el("table.dt");
    t.appendChild(U.el("thead", [U.el("tr", ["Leave type", "Allocated", "Used", "Open applications", "Left"]
      .map(function (h, i) { return U.el("th" + (i ? ".num" : ""), { text: h }); }))]));
    t.appendChild(U.el("tbody", D.leaveBalances.map(function (b) {
      return U.el("tr", [U.el("td", { text: b.leave_type }), U.el("td.num", { text: String(b.allocated) }),
        U.el("td.num", { text: String(b.used) }), U.el("td.num", { text: String(b.open) }),
        U.el("td.num", { html: "<b>" + (b.allocated - b.used) + "</b>" })]);
    })));
    wrap.appendChild(t);
    body.appendChild(wrap);

    body.appendChild(U.el("div.sec", "My requests to HR"));
    var w2 = U.el("div.tablewrap");
    if (!myReq.length) w2.appendChild(U.el("div.empty", "You have not raised any requests."));
    else {
      var t2 = U.el("table.dt");
      t2.appendChild(U.el("thead", [U.el("tr", ["Request", "Subject", "Status", "HR contact"]
        .map(function (h) { return U.el("th", { text: h }); }))]));
      t2.appendChild(U.el("tbody", myReq.map(function (r) {
        return U.el("tr.clickable", { onclick: function () { U.go("#/f/hr-request/" + encodeURIComponent(r.name)); } }, [
          U.el("td", [U.el("span.lnk", { text: r.name })]), U.el("td", { text: r.subject }),
          U.el("td", [U.ind(r.status)]), U.el("td", { text: r.hr_contact })
        ]);
      })));
      w2.appendChild(t2);
    }
    body.appendChild(w2);
    body.appendChild(U.el("p.muted.small", { style: "margin-top:10px", text:
      "A login not linked to an employee record sees an empty version of this page rather than an error - " +
      "which is what an administrator account sees." }));
  };

  /* ---------------- My Profile ---------------- */
  D.screens["my-profile"] = function (n) {
    var me = S.me();
    var e = null;
    D.employees.forEach(function (x) { if (x.employee_name === me.name) e = x; });
    var body = S.page({ title: "My Profile", sub: "Your own employee record, read only.", crumbs: D.crumbs(n) });
    if (!e) {
      body.appendChild(U.el("div.notice.warn", "This login is not linked to an employee record, so there is nothing here."));
      return;
    }
    body.appendChild(U.el("div.card.card-pad", { style: "margin-bottom:14px" }, [
      U.el("div", { style: "display:flex;gap:14px;align-items:center" }, [
        U.el("span.avatar", { style: "width:52px;height:52px;font-size:18px", text: U.initials(e.employee_name) }),
        U.el("div", [
          U.el("div", { style: "font-weight:700;font-size:18px", text: e.employee_name }),
          U.el("div.muted", { text: e.designation + " · " + e.department })
        ])
      ])
    ]));
    var facts = [
      ["Employee Code", e.employee_code], ["Status", e.status], ["Department", e.department],
      ["Designation", e.designation], ["Reporting Manager", (function () {
        var r = ""; D.employees.forEach(function (x) { if (x.name === e.reports_to) r = x.employee_name; });
        return r || "Not assigned yet";
      })()],
      ["Date of Joining", U.date(e.date_of_joining)], ["Date of Birth", U.date(e.date_of_birth)],
      ["Gender", e.gender], ["Mobile Number", e.cell_number],
      ["Shift", e.default_shift], ["Holiday List", e.holiday_list],
      ["Bank Name", "not shown in the demo"], ["Bank A/C No.", "not shown in the demo"]
    ];
    body.appendChild(U.el("dl.facts", facts.map(function (f) {
      return U.el("div.f", [U.el("dt", { text: f[0] }), U.el("dd", { text: f[1] || "—" })]);
    })));
    body.appendChild(U.el("p.muted.small", { style: "margin-top:12px", text:
      "This is a read-only card over the employee record - an employee can see their own row but not edit it, " +
      "and cannot see anybody else's. Bank details exist on the real record; they are deliberately not " +
      "reproduced in this demo." }));
    body.appendChild(U.el("p", { style: "margin-top:8px" }, [
      U.link("Open the full employee record", "#/f/employee/" + encodeURIComponent(e.name), "lnk")
    ]));
  };

  /* ---------------- My Attendance ---------------- */
  D.screens["my-attendance"] = function (n) {
    var me = S.me(), e = null;
    D.employees.forEach(function (x) { if (x.employee_name === me.name) e = x; });
    var body = S.page({ title: "My Attendance", sub: "Your month, day by day.", crumbs: D.crumbs(n) });
    if (!e) { body.appendChild(U.el("div.notice.warn", "This login is not linked to an employee record.")); return; }
    var row = D.attendanceGrid[e.name];
    var cnt = { P: 0, A: 0, HD: 0, L: 0, WFH: 0, WO: 0, H: 0 };
    row.forEach(function (c) { if (cnt[c.c] !== undefined) cnt[c.c]++; });
    var bar = U.el("div.fbar", [S.btn("‹"), U.el("span", { style: "font-weight:700;padding:0 6px", text: "June 2026" }),
      S.btn("›"), U.el("span.count", { text: "your own record only" })]);
    body.appendChild(bar);
    body.appendChild(U.el("div.cards", [
      U.ncard("Present", cnt.P, "full days", "green"),
      U.ncard("Half days", cnt.HD, "counted as half", "amber"),
      U.ncard("Absent", cnt.A, "no punch, no leave", cnt.A ? "red" : "grey"),
      U.ncard("On leave", cnt.L, "approved", "blue"),
      U.ncard("From home", cnt.WFH, "work from home", "purple")
    ]));
    var MAP = { P: "Present", A: "Absent", HD: "Half Day", L: "On Leave", WFH: "Work From Home",
      WO: "Weekly Off", H: "Holiday", "": "Nothing recorded" };
    var wrap = U.el("div.tablewrap");
    var t = U.el("table.dt");
    t.appendChild(U.el("thead", [U.el("tr", ["Date", "Status", "In", "Out", "Hours", ""]
      .map(function (h) { return U.el("th", { text: h }); }))]));
    t.appendChild(U.el("tbody", row.map(function (c, i) {
      var late = c.in && c.in > "09:30";
      return U.el("tr", [
        U.el("td", { text: U.date("2026-06-" + String(i + 1).padStart(2, "0")) }),
        U.el("td", [U.el("span.ind." + (U.indColor(MAP[c.c]) || "grey"), { text: MAP[c.c] }),
          late ? U.el("span.ind.amber", { style: "margin-left:6px", text: "Late" }) : null]),
        U.el("td", { text: c.in ? U.time(c.in) : "—" }),
        U.el("td", { text: c.out ? U.time(c.out) : "—" }),
        U.el("td", { text: c.in && c.out ? (c.c === "HD" ? "4.5" : "8.5") : "—" }),
        U.el("td", [(c.c === "A" || (c.c === "P" && !c.out)) ?
          U.el("button.btn.sm", { type: "button", text: "Request Correction",
            onclick: function () { corrDialog(e, i); } }) : U.el("span.muted", "")])
      ]);
    })));
    wrap.appendChild(t);
    body.appendChild(wrap);

    body.appendChild(U.el("div.sec", "My corrections"));
    var myCorr = D.corrections.concat(D.state.corrections).filter(function (c) { return c.employee_name === me.name; });
    var w2 = U.el("div.tablewrap");
    if (!myCorr.length) w2.appendChild(U.el("div.empty", "You have not sent any corrections."));
    else {
      var t2 = U.el("table.dt");
      t2.appendChild(U.el("thead", [U.el("tr", ["Request", "Dates", "Reason", "Status", "Decided"]
        .map(function (h) { return U.el("th", { text: h }); }))]));
      t2.appendChild(U.el("tbody", myCorr.map(function (c) {
        return U.el("tr", [
          U.el("td", { text: c.name }),
          U.el("td", { text: U.date(c.from_date) + (c.to_date !== c.from_date ? " – " + U.date(c.to_date) : "") }),
          U.el("td", { text: c.reason }),
          U.el("td", [U.ind(c.status)]),
          U.el("td", { text: U.datetime(c.decided_on) || "—" })
        ]);
      })));
      w2.appendChild(t2);
    }
    body.appendChild(w2);
    body.appendChild(U.el("p.muted.small", { style: "margin-top:10px", text:
      "A correction is a request, not an edit: HR decide, and what the decision changed is written on the request " +
      "so it can be read back later." }));
  };

  function corrDialog(e, dayIdx) {
    var date = "2026-06-" + String(dayIdx + 1).padStart(2, "0");
    var inT = U.el("input", { type: "time", value: "09:10" });
    var outT = U.el("input", { type: "time", value: "18:25" });
    var reason = U.el("textarea", { rows: "3", placeholder: "What happened?" });
    var m = U.modal("Request a correction", [
      U.el("p.muted.small", { style: "margin:0 0 12px", html:
        "<b>" + U.esc(e.employee_name) + "</b> &mdash; " + U.esc(U.date(date)) + "." }),
      U.el("label", "From Date"), U.el("input", { type: "date", value: date }),
      U.el("label", "To Date"), U.el("input", { type: "date", value: date }),
      U.el("label", "Proposed In Time"), inT,
      U.el("label", "Proposed Out Time"), outT,
      U.el("label", "Reason"), reason,
      U.el("p.muted.small", { style: "margin:4px 0 0", text:
        "A blank time field reaches the server as the current clock time, not as blank - so both times are always sent." })
    ], [U.el("button.btn.primary", { type: "button", text: "Send to HR", onclick: function () {
      D.state.corrections.push({ name: "ATT-COR-DEMO" + (D.state.corrections.length + 1),
        employee: e.name, employee_name: e.employee_name, from_date: date, to_date: date,
        proposed_in_time: date + " " + inT.value + ":00", proposed_out_time: date + " " + outT.value + ":00",
        reason: reason.value || "(no reason typed)", status: "Pending", approver: "Ishaan Dhingra",
        decided_by: "", decided_on: "", applied_on: "", application_log: "" });
      m.close();
      U.toast("Demo only, nothing is saved. The request is shown in this tab so you can see where it lands.", "Request added");
      D.router.render();
    } })]);
  }

  /* ---------------- My Leave ---------------- */
  D.screens["my-leave"] = function (n) {
    var me = S.me();
    var body = S.page({ title: "My Leave", sub: "Balance and history.", crumbs: D.crumbs(n),
      acts: [S.btn("Apply for Leave", "primary", leaveDialog)] });
    body.appendChild(U.el("div.cards", D.leaveBalances.map(function (b) {
      return U.ncard(b.leave_type, (b.allocated - b.used) + " left",
        b.allocated + " allocated, " + b.used + " used" + (b.open ? ", " + b.open + " open" : ""), "green");
    })));
    var mine = D.leaveApplications.filter(function (l) { return l.employee_name === me.name; });
    body.appendChild(U.el("div.sec", "Leaves this year"));
    var wrap = U.el("div.tablewrap");
    if (!mine.length) wrap.appendChild(U.el("div.empty", "No leave applied for this year."));
    else {
      var t = U.el("table.dt");
      t.appendChild(U.el("thead", [U.el("tr", ["Application", "Type", "From", "To", "Days", "Status", "Approver"]
        .map(function (h, i) { return U.el("th" + (i === 4 ? ".num" : ""), { text: h }); }))]));
      t.appendChild(U.el("tbody", mine.map(function (l) {
        return U.el("tr.clickable", { onclick: function () { U.go("#/f/leave-application/" + encodeURIComponent(l.name)); } }, [
          U.el("td", [U.el("span.lnk", { text: l.name })]), U.el("td", { text: l.leave_type }),
          U.el("td", { text: U.date(l.from_date) }), U.el("td", { text: U.date(l.to_date) }),
          U.el("td.num", { text: U.num(l.total_leave_days) }), U.el("td", [U.ind(l.status)]),
          U.el("td", { text: l.leave_approver })
        ]);
      })));
      wrap.appendChild(t);
    }
    body.appendChild(wrap);
    body.appendChild(U.el("div.notice", { style: "margin-top:14px", html:
      "<b>Why an open application is a draft.</b> The approver is the one who submits a leave application, so " +
      "anything still waiting for a decision has never been submitted. A pending-leave queue is therefore a list " +
      "of drafts, not of submitted documents." }));
    body.appendChild(U.el("div.sec", "Holiday list"));
    var w2 = U.el("div.tablewrap");
    var t2 = U.el("table.dt");
    t2.appendChild(U.el("thead", [U.el("tr", ["Date", "Occasion"].map(function (h) { return U.el("th", { text: h }); }))]));
    t2.appendChild(U.el("tbody", D.holidays.map(function (h) {
      return U.el("tr", [U.el("td", { text: U.date(h.date) }), U.el("td", { text: h.description })]);
    })));
    w2.appendChild(t2);
    body.appendChild(w2);
  };

  function leaveDialog() {
    var m = U.modal("Apply for leave", [
      U.el("label", "Leave Type"),
      U.el("select", D.leaveBalances.map(function (b) { return U.el("option", { text: b.leave_type }); })),
      U.el("label", "From Date"), U.el("input", { type: "date", value: "2026-06-22" }),
      U.el("label", "To Date"), U.el("input", { type: "date", value: "2026-06-23" }),
      U.el("label", "Reason"), U.el("textarea", { rows: "3" }),
      U.el("p.muted.small", { style: "margin:4px 0 0", text:
        "Allocations are pro-rated from the joining date, so a first-year balance is smaller than the full entitlement." })
    ], [U.el("button.btn.primary", { type: "button", text: "Send to approver",
      onclick: function () { m.close(); U.demoOnly("apply for leave"); } })]);
  }

  /* ---------------- Tasks ---------------- */
  D.screens.tasks = function (n) {
    var body = S.page({ title: "Tasks", sub: "The board, its counters, and every task as a record.",
      crumbs: D.crumbs(n), acts: [S.btn("+ New Task", "primary"), S.btn("List view", null, function () { U.go("#/l/task"); })] });
    var ts = D.rowsFor("Task");
    body.appendChild(U.el("div.cards", [
      U.ncard("All Tasks", ts.length, "every stage", "blue", "#/l/task"),
      U.ncard("To Do", ts.filter(function (t) { return t.custom_stage === "To Do"; }).length, "not started", "grey"),
      U.ncard("In Progress", ts.filter(function (t) { return t.custom_stage === "In Progress"; }).length, "being worked on", "amber"),
      U.ncard("Completed", ts.filter(function (t) { return t.custom_stage === "Done"; }).length, "done", "green")
    ]));
    D.views.kanban("tasks", { inline: true, host: body });
    body.appendChild(U.el("div.notice", { style: "margin-top:16px", html:
      "<b>A task carries its own discussion.</b> Open any card and the form has sub-tasks that drive the progress " +
      "percentage, private attachments, and a chat thread - the same chat widget the Chats desk uses." }));
  };
})(window.DEMO = window.DEMO || {});
/* Chats screen registration (the renderer lives in views/chat.js). */
(function (D) { D.screens.chats = function () { D.views.chats(); }; })(window.DEMO = window.DEMO || {});
