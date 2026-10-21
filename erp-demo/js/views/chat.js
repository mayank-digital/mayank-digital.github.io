/* Demo ERP - the chat desk and one chat thread.
 * The real thing is a UI over the native comment store, which is what gives it
 * realtime updates, mentions and private attachments. Here it is in memory. */
(function (D) {
  var U = D.u, S = D.shell;
  D.views = D.views || {};

  function msgsFor(c) {
    return (c.messages || []).concat(D.state.chatExtra[c.name] || []);
  }

  D.views.chats = function () {
    var acts = [S.btn("+ Start Chat", "primary", function () { newChat(); }),
      S.btn("All Chats", null, function () { U.go("#/l/team-issue"); })];
    var body = S.page({
      title: "Chats",
      sub: "Internal chat raised at a department or at one person. Every chat has a status, a priority and its own thread.",
      crumbs: [["Home", "#/p/home"], ["Chats", null]],
      acts: acts
    });

    var open = D.chats.filter(function (c) { return c.status !== "Closed"; });
    body.appendChild(U.el("div.cards", [
      U.ncard("New Chats", D.chats.filter(function (c) { return c.status === "Created"; }).length, "nobody has replied yet", "blue"),
      U.ncard("Under Process", D.chats.filter(function (c) { return c.status === "Under Process"; }).length, "being worked on", "amber"),
      U.ncard("Awaiting Close", D.chats.filter(function (c) { return c.status === "Resolved"; }).length, "resolved, waiting to be closed", "green"),
      U.ncard("Escalated", D.chats.filter(function (c) { return c.is_escalated && c.status !== "Closed"; }).length,
        "high priority with no reply", "red")
    ]));

    var views = [["My Chats", function (c) { return c.raised_by_name === S.me().name; }],
      ["Sent to Me", function (c) { return c.target_label === S.me().name; }],
      ["Department Inbox", function (c) { return c.target_type === "Department" && c.target_label === S.me().dept; }],
      ["Participating", function (c) { return (c.participants || []).some(function (p) { return p.full_name === S.me().name; }); }],
      ["Escalated", function (c) { return !!c.is_escalated; }],
      ["Closed History", function (c) { return c.status === "Closed"; }],
      ["Everything", function () { return true; }]];
    var st = { view: 6 };

    var tabs = U.el("div.tabs");
    views.forEach(function (v, i) {
      var btn = U.el("button" + (i === st.view ? ".on" : ""), { type: "button", text: v[0] });
      btn.addEventListener("click", function () {
        st.view = i;
        Array.prototype.forEach.call(tabs.children, function (b, k) { b.classList.toggle("on", k === i); });
        draw();
      });
      tabs.appendChild(btn);
    });
    body.appendChild(U.el("div.sec", "Chat desk"));
    body.appendChild(tabs);

    var grid = U.el("div");
    body.appendChild(grid);

    function draw() {
      U.clear(grid);
      var rows = D.chats.filter(views[st.view][1]);
      if (!rows.length) {
        grid.appendChild(U.el("div.empty", "Nothing in this view."));
        return;
      }
      rows.forEach(function (c) {
        var m = msgsFor(c), last = m[m.length - 1];
        var card = U.el("div.rowcard", { style: "cursor:pointer",
          onclick: function () { U.go("#/c/" + encodeURIComponent(c.name)); } });
        card.appendChild(U.el("div.rh", [
          U.el("span.t", { text: c.title }),
          U.ind(c.status),
          U.ind(c.priority),
          c.is_escalated ? U.el("span.ind.red", { text: "Escalated" }) : null,
          U.el("span.sp"),
          U.el("span.muted.small", { text: c.name })
        ]));
        card.appendChild(U.el("div.rb", [
          U.el("span", { html: "To <b>" + U.esc(c.target_label) + "</b> (" + U.esc(c.target_type) + ")" }),
          U.el("span", { html: "From <b>" + U.esc(c.raised_by_name) + "</b>" }),
          U.el("span", { text: m.length + " message" + (m.length === 1 ? "" : "s") }),
          U.el("span", { text: "last activity " + U.datetime(c.last_activity_on) })
        ]));
        if (last) card.appendChild(U.el("div.muted.small", { style: "margin-top:6px",
          text: "“" + (last.text.length > 140 ? last.text.slice(0, 140) + "…" : last.text) + "”" }));
        grid.appendChild(card);
      });
    }
    draw();
  };

  function newChat() {
    var sel = U.el("select", [U.el("option", "Department"), U.el("option", "Person")]);
    var target = U.el("select", ["Sales", "Accounts", "Dispatch", "Human Resources", "Management"].map(function (d) {
      return U.el("option", { text: d });
    }));
    var pr = U.el("select", ["Low", "Medium", "High"].map(function (p) { return U.el("option", { text: p }); }));
    pr.value = "Medium";
    var m = U.modal("Start a chat", [
      U.el("label", "Subject"), U.el("input", { type: "text", placeholder: "One line about it" }),
      U.el("label", "Send To"), sel,
      U.el("label", "To Department"), target,
      U.el("label", "Priority"), pr,
      U.el("label", "Description"), U.el("textarea", { rows: "4", placeholder: "What is the question?" })
    ], [U.el("button.btn.primary", { type: "button", text: "Send",
      onclick: function () { m.close(); U.demoOnly("start a chat"); } })]);
  }

  /* one thread, full screen */
  D.views.chatThread = function (name) {
    var c = null;
    D.chats.forEach(function (x) { if (x.name === name) c = x; });
    if (!c) { S.page({ title: "Chat not found", sub: name }); return; }
    var body = S.page({
      title: c.title,
      sub: c.name + " · to " + c.target_label + " · started by " + c.raised_by_name,
      crumbs: [["Home", "#/p/home"], ["Chats", "#/p/chats"], [c.name, null]],
      acts: [S.btn("Mark Resolved", "primary"), S.btn("Add Participant"), S.btn("Escalate"),
        S.btn("Open as a record", null, function () { U.go("#/f/team-issue/" + encodeURIComponent(c.name)); })]
    });
    body.appendChild(U.el("div.strip", [
      U.el("span.s", [U.ind(c.status)]),
      U.el("span.s", [U.ind(c.priority)]),
      c.is_escalated ? U.el("span.s", [U.el("span.ind.red", { text: "Escalated" })]) : null,
      U.el("span.s", { html: "started <b>" + U.esc(U.datetime(c.opened_on)) + "</b>" }),
      c.reopen_count ? U.el("span.s", { html: "reopened <b>" + c.reopen_count + "</b>&times;" }) : null
    ]));
    body.appendChild(D.views.chatBlock(c, "Team Issue", true));
  };

  /* the chat widget, reused on the Team Issue and Task forms */
  D.views.chatBlock = function (row, dt, big) {
    var isTask = dt === "Task";
    var key = row.name;
    if (isTask) {
      /* a task's discussion is seeded from its description so the screen is not empty */
      if (!D.state.chatExtra["task:" + key]) {
        D.state.chatExtra["task:" + key] = [
          { who: row.assigned_to, at: "16-06-2026, 9:40 am", text: "Picked this up. " +
            (row.custom_subtasks && row.custom_subtasks.length ? "Working through the sub-tasks top down." : "Will update here.") },
          { who: S.me().name === row.assigned_to ? "Aniket Bhardwaj" : S.me().name, at: "16-06-2026, 10:05 am",
            text: "Noted - shout if anything blocks it." }
        ];
      }
    }
    var msgs = isTask ? D.state.chatExtra["task:" + key].slice()
      : (row.messages || []).concat(D.state.chatExtra[key] || []);

    var pane = U.el("div.chatpane");
    if (!isTask) {
      pane.appendChild(U.el("div.hd", [
        U.el("h3", { text: row.title || "Discussion" }),
        U.el("div.meta", [
          U.el("span", { text: "To " + row.target_label }),
          U.el("span", { text: (row.participants || []).length + " participant" + ((row.participants || []).length === 1 ? "" : "s") }),
          U.el("span", { text: "mentions and attachments are private to the thread" })
        ])
      ]));
    }
    var list = U.el("div.msgs", { style: big ? "max-height:520px" : "" });
    function drawMsgs() {
      U.clear(list);
      msgs.forEach(function (m) {
        var mine = m.who === S.me().name;
        var sys = m.who === "system";
        list.appendChild(U.el("div.msg" + (sys ? ".sys" : (mine ? ".me" : "")), [
          sys ? null : U.el("span.who", { text: m.who }),
          U.el("div.bub", { text: m.text }),
          U.el("span.tm", { text: m.at })
        ]));
      });
      if (!msgs.length) list.appendChild(U.el("div.muted.small", "No messages yet."));
      list.scrollTop = list.scrollHeight;
    }
    drawMsgs();
    pane.appendChild(list);

    var ta = U.el("textarea", { rows: "1", placeholder: "Type a message, then Send. @ a colleague to pull them in." });
    ta.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
    });
    function send() {
      var t = ta.value.trim();
      if (!t) return;
      var now = new Date();
      var stamp = D.u.date(D.TODAY) + ", " + String(now.getHours() % 12 || 12) + ":" +
        String(now.getMinutes()).padStart(2, "0") + " " + (now.getHours() >= 12 ? "pm" : "am");
      var m = { who: S.me().name, at: stamp, text: t };
      msgs.push(m);
      if (isTask) D.state.chatExtra["task:" + key].push(m);
      else { D.state.chatExtra[key] = D.state.chatExtra[key] || []; D.state.chatExtra[key].push(m); }
      ta.value = "";
      drawMsgs();
      U.toast("Demo only, nothing is saved. Your message stays in this browser tab.", "Message added");
    }
    pane.appendChild(U.el("div.composer", [
      ta,
      U.el("button.btn", { type: "button", text: "Attach", onclick: function () { U.demoOnly("attach a file"); } }),
      U.el("button.btn.primary", { type: "button", text: "Send", onclick: send })
    ]));

    if (!big) return pane;

    var side = U.el("div.chatlist");
    D.chats.forEach(function (c) {
      var b = U.el("button.ch" + (c.name === row.name ? ".on" : ""), { type: "button",
        onclick: function () { U.go("#/c/" + encodeURIComponent(c.name)); } });
      b.appendChild(U.el("div.t", [U.el("span", { text: c.title }), U.ind(c.status)]));
      b.appendChild(U.el("div.m", { text: c.target_label + " · " + U.datetime(c.last_activity_on) }));
      side.appendChild(b);
    });
    return U.el("div.chatlayout.chatfull", [side, pane]);
  };
})(window.DEMO = window.DEMO || {});
