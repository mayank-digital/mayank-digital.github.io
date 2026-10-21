/* Demo ERP - kanban board. Cards can be dragged between columns, or moved with
 * the select on the card (which is how it works on a phone in the real app).
 * The move lives in memory only. */
(function (D) {
  var U = D.u, S = D.shell;
  D.views = D.views || {};

  var COLOR = { "Lead Received": "grey", "Catalog Sent": "blue", "Follow Up": "amber",
    "Sample Sent": "purple", "Not Reachable": "cyan", "Future Customer": "amber",
    "Not Interested": "red", "1st Order": "green", "2nd Order": "green", "3rd Order": "green",
    "Regular Customer": "pink", "Irrelevant": "grey",
    "To Do": "grey", "In Progress": "amber", "Under Review": "purple",
    "Done": "green", "On Hold": "amber", "Cancelled": "red" };
  function dot(stage) {
    var map = { grey: "#7a8793", blue: "#2490ef", amber: "#c9881a", purple: "#7b5ea7",
      cyan: "#1f8a9b", red: "#d64c3f", green: "#38a169", pink: "#c2558b" };
    return map[COLOR[stage] || "grey"];
  }

  D.views.kanban = function (key, opts) {
    opts = opts || {};
    var b = D.boards[key];
    if (!b) { S.page({ title: "Unknown board", sub: key }); return; }
    var dt = b.doctype, meta = D.doctypes[dt];
    var allowed = D.listRoles[dt];
    if (allowed && allowed.length && allowed.indexOf(D.state.role) < 0 && D.state.role !== "Admin") {
      S.denied(b.label, allowed); return;
    }
    var st = { q: "", mine: false };
    var ownerF = D.ownerField[dt];

    var body = opts.inline ? opts.host : S.page({
      title: b.label,
      sub: "A board on " + meta.label + ", grouped by " + (function () {
        var l = b.field; (meta.fields || []).forEach(function (f) { if (f[0] === b.field) l = f[1]; }); return l;
      })() + ". Drag a card, or use the dropdown on it.",
      crumbs: [["Home", "#/p/home"], [b.label, null]],
      acts: [S.btn("+ New " + meta.label, "primary"), S.btn("List view", null, function () { U.go("#/l/" + D.slug(dt)); })]
    });

    var bar = U.el("div.fbar");
    var q = U.el("input", { type: "text", placeholder: "Search " + meta.plural.toLowerCase() + "…" });
    q.addEventListener("input", function () { st.q = q.value; draw(); });
    bar.appendChild(q);
    if (ownerF) {
      var mine = S.btn("Only mine", null, function () { st.mine = !st.mine; mine.classList.toggle("on", st.mine); draw(); });
      bar.appendChild(mine);
    }
    bar.appendChild(S.btn("List view", null, function () { U.go("#/l/" + D.slug(dt)); }));
    var count = U.el("span.count");
    bar.appendChild(count);
    body.appendChild(bar);

    body.appendChild(U.el("div.kbhint", { text:
      "Drag a card to another column to move it, or pick a stage on the card. The move is kept in this browser tab only." }));

    var wrap = U.el("div.kbwrap");
    var board = U.el("div.kb");
    wrap.appendChild(board);
    body.appendChild(wrap);

    function move(name, to) {
      D.state.moved[dt + "|" + name] = to;
      U.toast("Demo only, nothing is saved. " + name + " shown in “" + to + "” for this tab.", "Card moved");
      draw();
    }

    function draw() {
      var rows = D.rowsFor(dt).filter(function (r) {
        if (st.mine && ownerF && r[ownerF] !== S.me().name) return false;
        return U.matches(r, st.q, [b.titleField, "name"].concat(b.cardFields));
      });
      count.textContent = rows.length + " card" + (rows.length === 1 ? "" : "s");
      U.clear(board);
      b.columns.forEach(function (stage) {
        var inCol = rows.filter(function (r) { return r[b.field] === stage; });
        var col = U.el("div.kbcol", { data: { stage: stage } });
        col.appendChild(U.el("h4", [
          U.el("span.dot", { style: "background:" + dot(stage) }),
          U.el("span", { text: stage }),
          U.el("span.n", { text: String(inCol.length) })
        ]));
        inCol.forEach(function (r) {
          var card = U.el("div.kbcard", { draggable: "true" });
          card.appendChild(U.el("div.ttl", { text: String(r[b.titleField] || r.name) }));
          var rw = U.el("div.rw");
          b.cardFields.forEach(function (f) {
            var v = r[f];
            if (v == null || v === "") return;
            if (f === "progress") v = v + "%";
            if (f === "custom_due_date") v = "due " + U.date(v);
            rw.appendChild(U.el("span", { text: String(v) }));
          });
          card.appendChild(rw);
          card.appendChild(U.el("div.rw", { style: "margin-top:4px" },
            [U.el("span.ind." + (COLOR[stage] || "grey"), { text: r.name })]));
          var sel = U.el("select.mv", { "aria-label": "Move " + r.name },
            b.columns.map(function (c) { return U.el("option", { value: c, text: c }); }));
          sel.value = stage;
          sel.addEventListener("click", function (e) { e.stopPropagation(); });
          sel.addEventListener("change", function () { move(r.name, sel.value); });
          card.appendChild(sel);
          card.addEventListener("click", function () {
            U.go("#/f/" + D.slug(dt) + "/" + encodeURIComponent(r.name));
          });
          card.addEventListener("dragstart", function (e) {
            card.classList.add("dragging");
            if (e.dataTransfer) { e.dataTransfer.setData("text/plain", r.name); e.dataTransfer.effectAllowed = "move"; }
          });
          card.addEventListener("dragend", function () { card.classList.remove("dragging"); });
          col.appendChild(card);
        });
        if (!inCol.length) col.appendChild(U.el("div.muted.small", { style: "padding:8px 2px", text: "Nothing here." }));
        col.addEventListener("dragover", function (e) { e.preventDefault(); col.classList.add("drop"); });
        col.addEventListener("dragleave", function () { col.classList.remove("drop"); });
        col.addEventListener("drop", function (e) {
          e.preventDefault();
          col.classList.remove("drop");
          var n = e.dataTransfer && e.dataTransfer.getData("text/plain");
          if (n) move(n, stage);
        });
        board.appendChild(col);
      });
    }
    draw();
    if (!opts.inline) {
      body.appendChild(U.el("p.muted.small", { style: "margin-top:12px", text:
        "Card titles and body rows come from the board definition, not from the list view - which is why a board card " +
        "cannot be styled like a list row." }));
    }
  };
})(window.DEMO = window.DEMO || {});
