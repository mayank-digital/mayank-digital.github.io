# Demo ERP — feature inventory

Everything the real system contains, and what this static demo reproduces.

The demo company is **Saptarang Prints Pvt Ltd (Demo)**; every person, firm,
number and amount below is invented, Indian, and screened against the real data
so that no full name coincides.

The system is a customisation layer on top of an open-source ERP framework
(an ERP app plus its HR and India-tax modules). The customisation is one app
that adds doctypes, custom fields, workspaces, screens, client scripts,
server-side APIs, boards, reports and number cards. "Screen" below means a
hand-written page block rather than a stock list-and-form view.

Legend
- **Built** — a working screen in this demo
- **Shown** — reproduced as a list of links, for completeness, without its own screen
- **Omitted** — deliberately left out; the reason is given

---

## 1. Navigation and shell

| Item | Kind | Status |
|---|---|---|
| Desk shell (sidebar, top bar, breadcrumbs, back) | screen | Built |
| App launcher — role-filtered tile grid on Home | screen | Built |
| Geofenced punch widget (punch in / punch out card) | screen | Built |
| Push-notification anchor | screen block | Omitted — needs a service worker and a server |
| Keystroke guard (stops a workspace stealing every letter typed into a block) | screen block | Omitted — no awesomebar to guard against here |
| Top-bar search across every record and page | — | Built |
| Role switcher (7 dummy roles) | demo-only | Built |
| Hamburger drawer + scrim under 768px | responsive | Built |
| Compact top bar with a full-screen search dialog on phones | responsive | Built |
| List views as stacked cards on phones, with collapsible filters | responsive | Built |
| Single-column forms and a horizontally scrolling tab strip | responsive | Built |
| Kanban snap-scroll, one column per screen, move-by-dropdown | responsive | Built |
| Number cards two per row, charts full width | responsive | Built |
| Full-screen chat with a pinned composer, full-screen dialogs | responsive | Built |
| 44px touch targets, no hover-only action, no overflow at 360px | responsive | Built |

### Workspace tree, with the roles each page is gated to

| Workspace | Parent | Real roles | Status |
|---|---|---|---|
| Home | — | everyone | Built |
| My HR | — | Employee | Built |
| My Profile | — | Employee | Built |
| My Attendance | — | Employee | Built |
| My Leave | — | Employee | Built |
| Tasks | — | Employee, Projects User | Built |
| Chats | — | Employee | Built |
| Sales & CRM | — | Sales Manager, Sales User, System Manager | Built |
| › Find Customer | Sales & CRM | everyone | Built |
| › Leads | Sales & CRM | Sales Manager, Sales User | Built |
| › Orders | Sales & CRM | Sales Manager, Sales User | Built |
| › Payments | Sales & CRM | Sales Manager, Sales User | Built |
| › Insights | Sales & CRM | Sales Manager, Sales User | Built |
| › Stock on hand | Sales & CRM | Sales, Accounts, Stock, Dispatch Viewer | Built |
| Dispatch | — | Dispatch Viewer, Stock Manager, Stock User | Built |
| › Dispatch Board | Dispatch | everyone | Built |
| › Stock In | Dispatch | Dispatch Viewer, Stock Manager/User | Built |
| › Stock Out | Dispatch | Dispatch Viewer, Stock Manager/User | Built |
| › Returns | Dispatch | Stock Manager, Stock User | Built |
| › Live Stock | Dispatch | Accounts, Sales, Stock, Dispatch Viewer | Built |
| › Daily Summary | Dispatch | Accounts, Sales, Stock, Dispatch Viewer | Built |
| › SKU & Products | Dispatch | Dispatch Viewer, Stock Manager/User | Built |
| › Vendors & Transport | Dispatch | Dispatch Viewer, Stock Manager/User | Built |
| Purchase & Import | — | System Manager | Built (links + cards) |
| Accounts (billing desk) | — | Accounts Manager, Accounts User | Built |
| › Payments Desk | Accounts | Accounts Manager, Accounts User | Built |
| › Statistics | Accounts | Accounts Manager, Accounts User | Built |
| › Payables | Accounts | System Manager | Shown |
| › Receivables | Accounts | System Manager | Shown |
| › Financial Reports | Accounts | System Manager | Shown |
| › GST | Accounts | System Manager | Shown |
| HR | — | HR Manager, HR User | Built |
| › Attendance Register | HR | HR Manager, HR User | Built |
| › Expense Claims | HR | HR Manager, HR User | Built |
| › Salary Payout | HR | HR Manager | Built |
| Users | — | System Manager | Shown |
| Settings | — | System Manager | Shown |
| Integrations | — | System Manager | Shown |
| Support | — | Support Team, System Manager | Shown |

Fourteen further stock workspaces (Selling, Buying, Stock, Projects,
Manufacturing, Assets, Quality, Website, Payroll, Tools, CRM, Recruitment,
Performance, Build) exist but are **hidden** in the real system, because the
custom screens replaced them. They are omitted here for the same reason.

---

## 2. Custom doctypes

Seventeen doctypes are added by the customisation. Submittable / child-table
status and the naming series are as in the real app, with a neutral series.

| Doctype | Kind | Status |
|---|---|---|
| Team Issue (shown to users as "Chat") | document | Built — list, form, chat thread |
| Team Issue Participant | child table | Built |
| Attendance Correction | document | Built — list, form |
| Early Closure | document | Built — list, form |
| HR Request | document | Built — list, form |
| Employee Document | document | Built — list, form |
| Order Payment row | child table | Built — on the order form |
| Order Document row | child table | Built — on the order form |
| Transporter | document | Built — list, form with rate card |
| Delivery Rate | child table | Built — the seven-column rate row |
| Delivery Zone | document | Built — list, form |
| Transport Rate | child table | Built (as part of the rate card) |
| Payment Charge Settings | single | Shown — a settings page, no records |
| Payment Method Charge | child table | Built (the method fee on a payment row) |
| Sub-task | child table | Built — on the task form |
| City Spelling | document | Omitted — a data-cleaning helper with no screen |
| Leave Ref Counter | document | Omitted — an internal counter, never opened by a user |

## 3. Custom fields on stock doctypes

426 custom fields across 24 doctypes. The demo reproduces the field **labels,
types, option lists and layout** (tab / section / column breaks) for the ones
users actually work with:

| Doctype | Custom fields | Status |
|---|---|---|
| Sales Order | 75 | Built — all five tabs |
| Lead | 44 | Built |
| Customer | 24 | Built |
| Delivery Note | 8 | Built |
| Task | 9 | Built |
| Employee | 4 | Built |
| Attendance | 3 | Built |
| Leave Application | 2 | Built |
| Item | 4 | Built |
| Sales Invoice, Purchase Invoice, Company, Address, Contact, and nine others | ~250 | Shown or omitted — mostly tax-module fields with no custom screen |

---

## 4. Order flow

The order is the spine of the system. There is **no sales invoice behind it**:
billing happens in a separate accounting package and the invoice is attached to
the order, so the order book is the source of truth for what was sold.

| Feature | Status |
|---|---|
| Six stages: Order Placed → With Accounts → Ready to Dispatch → Dispatched → Delivered, plus Closed | Built |
| Stage tracker widget on the form | Built |
| Stage buttons gated by role — accounts *Mark Billed*, dispatch *Dispatch with tracking* and *Mark Delivered* | Built |
| Closed ≠ cancelled: the order keeps its number and history | Built (explained on the form) |
| Payment rows on the order: date, amount, method, reference, method fee, proof | Built |
| Received / verified / balance totals | Built |
| Payment QR selection | Built |
| GST template vs GST actually charged, side by side | Built |
| Transport charge as a line in the grand total | Built |
| Delivery selector: zone, service, weight, boxes, transit estimate, calculated charge | Built |
| Out-of-area, over-100-kg box, approximate-charge flags | Built |
| First-mile leg and charge | Built |
| "What the customer pays at delivery" — never counted as ours | Built |
| How the fare was worked out, in words | Built |
| Dispatch tracking: courier, docket, tracking link, actual delivery date | Built |
| Why the transporter changed, with a reason list | Built |
| Supporting documents table | Built |
| Customer card and the party's quotation/order history, on the form | Built |
| Invoice number and attachment, required to mark billed | Built |
| Print format with a payment QR code | Omitted — needs server-side PDF rendering |

## 5. Sales & CRM

| Feature | Status |
|---|---|
| Sales home: four counters, two big actions, page nav, your recent leads | Built |
| Lead board — 12 stages, drag or dropdown to move a card | Built |
| Lead list with stage, category, temperature, type and source filters | Built |
| Lead form: contact, billing, classification, requirement and pricing, parked/lost | Built |
| Order journey widget on the lead | Built |
| Lead as the master record — kept when it becomes a customer | Built (explained) |
| India / International lead split, with the international address fields | Built |
| Duplicate-lead warning | Omitted — needs a server lookup |
| Customer list and form, including the rates we give | Built |
| Quotation list and form, raisable against a lead with no customer | Built |
| Orders screen with stage filter and "only mine" | Built |
| Insights: counters, sold-by-person table, four charts, own-vs-everybody scoping | Built |
| Find Customer — open to every login, read-only, shows the account owner | Built |
| Stock on hand, read-only for sales | Built |
| Lead ownership and the "closing the pool blinds whoever owns none" problem | Built (explained) |

## 6. Dispatch and stock

| Feature | Status |
|---|---|
| Dispatch home: six counters, three big actions, page nav, report list | Built |
| Dispatch board: change a status inline, add courier and docket in one dialog | Built |
| Stock In: supplier, their invoice, lot number, SKU rows, shipment value | Built |
| Why inward is a purchase receipt and not a stock entry (vendor attribution) | Built (explained) |
| Stock Out: customer → order → SKU rows, one order one delivery note | Built |
| Standalone outward (stock moved, nothing billed) | Built |
| Returns: pick the delivery, split rows between shelf and defective bin | Built |
| Defective bin, with a write-off that cannot be undone | Built |
| Live stock dashboard: opening + inward − dispatched = current, with mismatch count | Built |
| Daily summary: in/out/closing per day, with a column chart | Built |
| SKU master: inline edit, reorder level, HSN warning, disable | Built |
| Vendors, couriers, and the courier rate card | Built |
| Delivery zones, and why a zone move does not move the surcharge | Built (explained) |
| Batch / lot records, linked back to the receipt and the vendor | Built |
| Batch QR label printing | Omitted — needs server-side PDF rendering |

## 7. Accounts

| Feature | Status |
|---|---|
| Billing desk: awaiting billing, recently billed, four counters | Built |
| Mark Billed dialog requiring both the invoice number and the file | Built |
| Payments desk: money-owed / all-orders views, ageing, record a payment | Built |
| Verification queue — a second pair of eyes, and the row disappears when done | Built |
| Duplicate-reference and overpayment warnings | Built (explained in the dialog) |
| Payment Entry read-only for sales, by decision | Built (explained) |
| Credit note that settles a balance with no money moving | Built (explained) |
| Statistics: five counters, method split, ageing, six-month raised-vs-received, top customers, by-person | Built |
| Payables / Receivables / Financial Reports / GST workspaces | Shown |
| Sales Invoice register, kept for compliance only | Built (list + form) |

## 8. HR, attendance and payroll

| Feature | Status |
|---|---|
| HR hub: six counters (three report-driven), queues, masters, report list | Built |
| Attendance register: month grid, sticky name column, per-cell editor | Built |
| One-employee view of the same month | Built |
| No "off day" status — a weekly off is the absence of a row | Built (explained) |
| Day worked on an off day or holiday, marked and paid as an extra day | Built |
| Early Closure day, with the minimum-hours rule and its apply log | Built |
| Attendance Correction — employee requests, HR decides, the change is logged | Built |
| Employee check-ins (raw punches) | Built |
| Shift assignment, where the punch geofence lives | Built |
| Leave applications — pending leave is a draft, because the approver submits | Built (explained) |
| Leave balances, pro-rated from the joining date | Built |
| Expense claims and the claim chart | Built |
| Salary slips and payment days — the four settings that make a slip match the register | Built |
| Monthly salary sheet report | Built |
| Employee documents (payslips, letters), visible to the employee and HR only | Built |
| Employee exit: type, relieving date, interview, exclude-from-payroll | Built |
| Employee codes as the company's own staff codes | Built |
| Auto-attendance marking everybody absent nightly if nobody punches | Built (explained) |
| Payroll entry and salary structures | Shown |

## 9. Employee self-service

| Feature | Status |
|---|---|
| My HR hub — nine tiles, leave table, my requests | Built |
| My Profile — read-only card over your own employee record | Built |
| My Attendance — month list, late flags, request a correction | Built |
| Correction request dialog (and why a blank time field is dangerous) | Built |
| My Leave — balances, history, holiday list, apply | Built |
| My documents and my claims | Built |
| Empty-state for a login with no employee record | Built (explained) |
| Onboarding banner | Omitted — it is stored per browser, nothing to show |

## 10. Tasks and chat

| Feature | Status |
|---|---|
| Task board — 6 stages, drag or dropdown | Built |
| Task counters | Built |
| Task form: sub-tasks driving the progress bar, attachments, discussion | Built |
| Chat desk — seven views (mine, sent to me, department inbox, participating, escalated, closed, everything) | Built |
| Four chat counters | Built |
| Chat thread: messages, participants, status, priority, escalation, reopen count | Built |
| Type a message and send it | Built (in-memory) |
| Chat built over the native comment store | Built (explained) |
| Realtime updates, @mentions, private attachments | Omitted — all three need a server |
| Bell notifications vs e-mail | Omitted — no server |

## 11. Boards, reports, dashboards

| Item | Kind | Status |
|---|---|---|
| Lead Pipeline board (12 columns) | kanban | Built |
| Task Board (6 columns) | kanban | Built |
| Payment Pending Orders | query report | Built |
| Today's Dispatch Orders | script report | Built |
| Today's Stock Receipts | script report | Built |
| Daily Stock Movement Summary | script report | Built |
| Daily Dispatch Summary Report | script report | Built |
| Item Stock Movement | script report | Built |
| Items Below Reorder Level | script report | Built |
| Vendor Stock Balance | script report | Built |
| Vendor Stock Movement | script report | Built |
| Monthly Salary Sheet | script report | Built |
| Today At A Glance | script report | Built |
| Monthly Attendance Sheet | stock report | Built |
| 87 number cards | dashboard | Built where they sit on a reproduced page |
| 71 dashboard charts | dashboard | Built as hand-drawn bar and column charts on the pages that carry them |
| 14 stock module dashboards | dashboard | Omitted — they belong to the hidden stock workspaces |

## 12. Behind the screens, in the real system only

These are the parts that cannot exist without a server, and are described
rather than reproduced:

- 129 server-side scripts: API endpoints, document hooks and scheduled jobs
- 62 client scripts shaping forms per role, and the guards on top of them
- 38 hand-written page blocks (this demo re-implements the 25 that users open)
- Role permissions, user permissions and permission queries — reproduced here
  only as "which pages and lists a role can open", via the role switcher
- E-mail and bell notification policy
- PDF print formats, including QR codes
- Data imports and the go-live migration
