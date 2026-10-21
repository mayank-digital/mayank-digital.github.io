# Demo ERP — a static walkthrough

A display-only walkthrough of a custom ERP, built as plain HTML, CSS and
JavaScript so it can be hosted as a static site and clicked through by anyone.

There is **no backend, no database, no login and no network request**. Every
screen is drawn in the browser from two data files. Nothing is saved: buttons
that would write — Save, Submit, Mark Billed, Record Payment, Verify, Approve —
show a short *"Demo only, nothing is saved"* message instead.

**All data is invented.** Every person, company, supplier, courier, phone
number, e-mail address, GST reference, amount, date and chat message in this
demo was made up for it. The cast is Indian — people from across the north,
south, west and east, businesses of the usual Indian shapes (*Prints Pvt Ltd*,
*Traders*, *Garments*, *Enterprises*), and addresses in real Indian cities and
states. The company itself is **Saptarang Prints Pvt Ltd (Demo)**; the
application is called *Demo ERP*.

Conventions, all deliberate:

| | |
|---|---|
| Phone numbers | `+91 98XXX XX412` — the subscriber digits are literal `X`, so no number here can ever be dialled, and no ten-digit run exists anywhere in the files |
| GST references | `DEMO-GSTIN-07A` — a state code and a letter, deliberately *not* the 15-character checksummed format, so nothing could pass a format check |
| Amounts | `₹1,25,000` — the Indian lakh/crore grouping, with `₹1.25 L` and `₹1.25 Cr` on the summary cards |
| Dates | `18-06-2026` (DD-MM-YYYY) on screen; stored ISO so they still sort |
| Document numbers | a neutral series: `SO-2026-0001`, `DN-2026-0001`, `QTN-2026-0007`, `EMP-001` |
| E-mail addresses | `@example.com`, the domain reserved for documentation |

Every page carries a *Sample data* label.

---

## What the system is

An ERP for a company that imports and distributes printing consumables — inks,
film rolls, adhesive powder — to print shops and garment makers. It is built on
an open-source ERP framework, and the customisation adds roughly forty screens
on top of the stock ones: one console per department, a lead board, an order
flow with its own payment rows, a dispatch board, five stock screens, a
payments desk and an editable attendance register.

The design decision that shapes everything else: **the order is the source of
truth, not an invoice.** Billing happens in a separate accounting package and
the invoice is attached to the order, so money is recorded as payment rows on
the order itself. Every accounts screen reads the order book.

---

## Walking through it

Open `index.html`, or the published site. It is built for a phone as well as a
desktop — see *On a phone* below. The **role switcher** at the top right
is the thing to try first — it changes the sidebar, the screens and what the
data is scoped to. Seven roles are offered:

| Role | Sees |
|---|---|
| Sales | The sales console, their own leads, the whole order book. No payables, receivables or tax screens. |
| Sales Manager | The same, but everybody's numbers in Insights instead of only their own. |
| Accounts | Billing desk, payments desk, statistics. |
| Dispatch / Stock | Dispatch console, stock in and out, returns, courier rate cards. |
| HR | Attendance register, leave, corrections, claims, payroll. |
| Employee | Only the self-service pages — punch, attendance, leave, documents, chat. |
| Administrator | Everything, including the setup workspaces. |

A page a role cannot open shows the permission message it would get, and names
the roles required. In the real system it would not appear in the sidebar at
all; here it is reachable so the difference can be seen.

### Module by module

**Home** — a geofenced punch card (punch in, punch out, done for today) and a
launcher that only shows the tools the current role can open.

**Sales & CRM** — counters for open leads, orders with accounts and orders ready
to dispatch; then six pages:

- *Find Customer* is open to every login and read-only. It answers one question
  before somebody cold-calls a company: is this already ours, and whose account
  is it? It shows the firm, who to ask for, how to reach them and the account
  owner — and nothing else, because orders and prices stay with the person who
  owns the relationship.
- *Leads* is a board first and a list second. Twelve stages run from *Lead
  Received* past the first order to *Regular Customer*, because the lead is the
  master record and is kept when it becomes a customer. Drag a card, or use the
  dropdown on it.
- *Orders* is the whole order book, searchable by number, customer, courier or
  docket. Six stages, each handover a button only the owning role sees.
- *Payments* and *Insights* are the sales-side views of the money and the
  pipeline. Insights shows a sales user their own numbers and a sales manager
  everybody's.
- *Stock on hand* is the shelf, read-only.

**Dispatch** — one console with six counters and three large actions, then eight
pages. The *Dispatch Board* is the one that gets used all day: every order out
of accounts and not yet finished, with the status changeable inline and courier
plus docket enterable in a single dialog, because saving those two things is
what moves an order to *Dispatched*. *Stock In* records one shipment with its
lot number; *Stock Out* asks for the customer, then the order, then the SKUs, so
stock cannot leave against the wrong order. *Returns* splits what came back
between the shelf and a defective bin. *Live Stock*, *Daily Summary*, *SKU &
Products* and *Vendors & Transport* cover the rest, including the courier rate
cards — seven separate charge columns, so a quoted fare can be explained line by
line.

**Purchase & Import** — material requests, purchase orders, receipts and landed
cost. Inward from a supplier is posted as a purchase receipt rather than a stock
entry, because the lot number is the only thing that carries the vendor on to
the shelf; the vendor stock reports depend on it.

**Accounts** — the landing page is a billing desk: what is waiting to be billed,
what was just billed, and a dialog that will not mark an order billed without
both the invoice number and the file. The *Payments Desk* has a verification
queue — a second pair of eyes confirms the money landed, and the row disappears
once it is done. *Statistics* is the month in charts: how the money came in,
pending by age, raised versus received over six months, top customers, and who
recorded what.

**HR** — six counters, three of which read a report rather than counting records,
because "not in yet" is the *absence* of an attendance row and a record count
cannot count what is not there. The *Attendance Register* is a month grid you
can correct cell by cell; it exists because there is no "off day" status in the
stock model — a weekly off is the absence of a row. *Expense Claims* and
*Salary Payout* complete the module, including payment days, the four settings
that make a payslip agree with the register.

**My HR / My Profile / My Attendance / My Leave** — employee self-service. Your
own record, your own month, your own leave, and a correction request for a
missed punch. A correction is a request, not an edit: HR decide, and what the
decision changed is written on the request.

**Tasks** — a six-stage board. Open any card and the form has sub-tasks that
drive the progress bar, attachments, and its own discussion thread.

**Chats** — internal chat raised at a department or at one person, with seven
views, four counters, escalation and a reopen count. Type a message and send it;
it stays in the browser tab. In the real system this is a chat interface built
over the framework's native comment store, which is what gives it realtime
updates, mentions and private attachments for free.

**Reports** — fourteen reports, reachable from the module pages or directly.

`FEATURES.md` is the full inventory: every module, doctype, workspace, screen,
board, report and dashboard, marked as built, shown as links, or omitted with a
reason.

---

## On a phone

The demo is responsive, and the desktop layout is untouched. Below 768px:

- the sidebar becomes a **hamburger drawer** that slides in over a tap-to-close
  scrim, and the top bar goes compact — the role switcher stays visible and
  search moves to a button that opens a full-screen search
- **list views become stacked cards**: the record number as the heading, the
  status as a chip, two or three key fields as labelled lines, the rest hidden.
  Reports and the attendance register keep a scrolling grid instead, because a
  matrix stops being readable if you stack it
- **filters collapse** behind a single *Filters* button, with the search box
  still on show
- **forms go to one column** and the tab strip scrolls sideways
- **kanban boards** scroll horizontally with snap, one column per screen width,
  and every card has a *move to* dropdown, so nothing needs dragging
- **dashboards** put number cards two to a row (one below 400px) and charts full
  width
- the **chat thread fills the screen** with the message box pinned to the bottom,
  above the home-bar inset
- **dialogs go full screen**
- every tappable thing is at least 44px, no action is hidden behind a hover, and
  there is no horizontal page scroll at 360px

## What is interactive

Everything below works, in memory only, and resets on reload:

- Sidebar and tile navigation, with hash routes so a refresh keeps the page
- Role switching, which redraws the sidebar and re-scopes the screens
- List search, column sort, standard filters, and "only mine"
- Opening a record from any list row, and its tabs
- Moving a kanban card — drag it, or use the dropdown on the card
- Typing and sending a chat message, on a chat or on a task
- Punching in and out on the home card
- Dialogs: record a payment, mark billed, dispatch with tracking, record a
  return, add a SKU, request an attendance correction, apply for leave, edit an
  attendance cell
- Top-bar search across every record and page

## What is deliberately not here

Anything that needs a server: PDF print formats and QR labels, realtime chat
updates and mentions, e-mail and push notifications, server-side validation,
permission enforcement (the role switcher imitates it), data import, and the
scheduled jobs. `FEATURES.md` lists each one.

---

## Technical notes

- Plain HTML, CSS and JavaScript. No framework, no build step, no package
  manager, and nothing loaded from a CDN — the page makes no network requests
  at all.
- One shared renderer per view kind — list, form, kanban, dashboard, report,
  chat — driven by configuration, not a file per screen. The doctype
  definitions in `data/schema.js` carry field labels, types, option lists and
  the tab / section / column layout; the form renderer walks them the way the
  real desk does.
- Hash-based routes (`#/p/orders`, `#/l/sales-order`, `#/f/sales-order/SO-2026-0001`,
  `#/k/leads`, `#/r/payment-pending-orders`, `#/c/ISS-00018`) so refresh and
  the browser back button both work on a static host.
- Relative paths throughout, and a `.nojekyll` file, so it works unchanged from
  a repository root.
- Responsive in three layers: the full desktop layout, a narrower sidebar
  between 768px and 1100px, and the phone layout below 768px. Wide content
  scrolls inside its own container, never the page.
- One pass after each render (`U.autoLabel`) copies each table's column headings
  onto its cells and tags them title / status / key / action, which is what lets
  *any* table in the demo become a labelled card on a phone without each screen
  having to know about it.
- Verified headless with jsdom: 197 distinct routes rendered under each of the
  7 roles — 1379 renders — with no JavaScript errors, plus 22 interaction
  checks (kanban move, chat send, punch, search, filters, tabs, modals, the
  drawer, the mobile search dialog, card metadata on every table) and 33
  assertions that the mobile CSS rule each view type depends on actually
  exists.

### File layout

```
index.html              the only page
.nojekyll               tells the static host not to run a site generator
css/app.css             all styling
data/schema.js          doctype definitions: fields, labels, options, layout
data/records.js         the sample records - all invented
data/nav.js             the workspace tree and its role gating
data/pages.js           list sources, link lists, boards, reports
js/util.js              helpers: element builder, formatting, charts, toasts
js/shell.js             top bar, sidebar, role switcher, page scaffold
js/router.js            hash router
js/app.js               boot
js/views/list.js        the shared list view
js/views/form.js        the shared record form
js/views/kanban.js      the shared board
js/views/report.js      the shared report view
js/views/chat.js        chat desk, chat thread, chat widget
js/views/pages.js       page dispatcher, Home, link-list workspaces
js/views/screens-*.js   the custom screens, by module
```

---

## How to publish

The whole thing is static files, so any static host will serve it. To put it on
GitHub Pages through the website, with no command line:

1. Sign in to GitHub and create a **new public repository**. Leave it empty —
   no README, no .gitignore, no licence.
2. On the empty repository page, choose **uploading an existing file**.
3. Drag in **everything from this folder**, keeping the folder structure:
   `index.html`, `README.md`, `FEATURES.md`, `.nojekyll`, and the `css`, `data`
   and `js` folders. `index.html` must end up at the top level of the
   repository, not inside a subfolder.
   - If the upload box will not accept the `.nojekyll` file because it starts
     with a dot, create it instead: **Add file → Create new file**, name it
     `.nojekyll`, leave it empty, and commit.
4. Commit the upload to the `main` branch.
5. Open **Settings → Pages**. Under *Build and deployment*, set **Source** to
   *Deploy from a branch*, then **Branch** to `main` and the folder to `/ (root)`.
   Save.
6. Wait a minute or two and reload the Settings → Pages screen. It will show the
   address the site is published at. Open it, and the demo should load with the
   Home page.

If the page loads but is unstyled, the `css` folder did not upload — re-upload
it. If a link 404s, `.nojekyll` is missing: add it as in step 3.

---

## A note on the data

Nothing in this demo came out of a live system. The field labels, option lists,
stage names and screen layouts mirror the real application, because that is what
the demo is for. Every **value** — names, companies, numbers, amounts, dates,
messages — is invented, and was screened so that no invented full person name or
company name coincides with a real one. There is no real company name, logo,
domain, internal address, key or credential anywhere in these files.
