/* Demo ERP - doctype definitions.
 * Field tuple: [fieldname, label, fieldtype, options, flags]
 *   fieldtype   Data Select Link Currency Float Int Date Datetime Time Check
 *               Small Text Text Text Editor Attach Percent Table HTML
 *               Section Break / Column Break / Tab Break
 *   options     Select -> "A\nB\nC"   Link -> target doctype   Table -> child doctype
 *   flags       comma list: reqd, ro (read only), lv (in list view)
 * Every label, option list and layout below mirrors a real screen; every VALUE
 * elsewhere in this demo is invented.
 */
(function (D) {
  var STATES = "\nAndhra Pradesh\nAssam\nBihar\nDelhi\nGoa\nGujarat\nHaryana\nKarnataka\nKerala\n" +
    "Madhya Pradesh\nMaharashtra\nOdisha\nPunjab\nRajasthan\nTamil Nadu\nTelangana\n" +
    "Uttar Pradesh\nUttarakhand\nWest Bengal";

  D.ORDER_STAGES = ["Order Placed", "With Accounts", "Ready to Dispatch", "Dispatched", "Delivered"];
  D.LEAD_STAGES = ["Lead Received", "Catalog Sent", "Follow Up", "Sample Sent", "Not Reachable",
    "Future Customer", "Not Interested", "1st Order", "2nd Order", "3rd Order", "Regular Customer", "Irrelevant"];
  D.TASK_STAGES = ["To Do", "In Progress", "Under Review", "Done", "On Hold", "Cancelled"];
  D.STATES = STATES;

  D.doctypes = {

  /* ======================= SALES & CRM ======================= */
  "Sales Order": {
    label: "Sales Order", plural: "Sales Orders", icon: "▤",
    naming: "SO-2026-####", submittable: true, stageField: "custom_order_stage",
    blurb: "A confirmed order. It carries its own payment rows, delivery charge and dispatch tracking - no separate sales invoice is raised in this system.",
    listColumns: ["name", "customer", "transaction_date", "custom_order_stage", "grand_total", "custom_total_received", "custom_sales_person"],
    filters: [["custom_order_stage", "Order Stage"], ["custom_dispatch_status", "Dispatch Status"], ["custom_payment_terms", "Payment Terms"]],
    fields: [
      ["tb_main", "Order", "Tab Break"],
      ["sb_party", "", "Section Break"],
      ["customer", "Customer", "Link", "Customer", "reqd,lv"],
      ["custom_sales_person", "Sales Person", "Link", "User", "lv"],
      ["col_1", "", "Column Break"],
      ["transaction_date", "Date", "Date", "", "reqd,lv"],
      ["delivery_date", "Required By", "Date"],
      ["custom_party_card_section", "", "Section Break"],
      ["custom_party_card", "Customer", "HTML"],
      ["sb_stage", "Order Progress", "Section Break"],
      ["custom_order_stage", "Order Stage", "Select", "Order Placed\nWith Accounts\nReady to Dispatch\nDispatched\nDelivered\nClosed", "reqd,lv"],
      ["custom_stage_tracker", "Progress", "HTML"],
      ["col_stage", "", "Column Break"],
      ["custom_billed_by", "Billed By", "Link", "User", "ro"],
      ["custom_billed_on", "Billed On", "Datetime", "", "ro"],
      ["sb_items", "Items", "Section Break"],
      ["items", "Items", "Table", "Sales Order Item", "reqd"],
      ["sb_totals", "Totals", "Section Break"],
      ["total", "Net Total", "Currency", "", "ro"],
      ["custom_gst_type", "GST", "Select", "No GST\nGST 9%\nGST 18%"],
      ["custom_gst_charged_rate", "GST Actually Charged (%)", "Percent", "", "ro"],
      ["col_tot", "", "Column Break"],
      ["total_taxes_and_charges", "Total Taxes and Charges", "Currency", "", "ro"],
      ["grand_total", "Grand Total", "Currency", "", "ro,lv"],
      ["custom_totals_breakdown", "", "HTML"],

      ["tb_pay", "Payment", "Tab Break"],
      ["custom_payment_section", "Payment Received", "Section Break"],
      ["custom_payment_terms", "Payment Terms", "Select", "\nAdvance\nPart Advance\nCOD\nCredit"],
      ["custom_payments_received", "Payments Received", "Table", "TDF Order Payment"],
      ["col_pay", "", "Column Break"],
      ["custom_total_received", "Total Received", "Currency", "", "ro,lv"],
      ["custom_verified_received", "Verified Received", "Currency", "", "ro"],
      ["custom_balance_remaining", "Balance Remaining", "Currency", "", "ro"],
      ["sb_qr", "Payment QR", "Section Break"],
      ["custom_show_payment_qr", "Show Payment QR", "Select", "Yes\nNo"],
      ["custom_payment_qr", "Payment QR", "Select", "Primary QR\nTemp QR"],

      ["tb_tax", "Tax & Document", "Tab Break"],
      ["custom_taxdoc_section", "Tax & Document", "Section Break"],
      ["custom_bill_book", "Bill Book", "Data"],
      ["custom_tally_invoice_no", "Accounting Invoice No", "Data"],
      ["col_tax", "", "Column Break"],
      ["custom_tally_invoice", "Accounting Invoice", "Attach"],
      ["custom_import_ref", "Import Reference", "Data", "", "ro"],
      ["sb_po", "Customer's Purchase Order", "Section Break"],
      ["po_no", "Customer's Purchase Order", "Data"],
      ["po_date", "Customer's Purchase Order Date", "Date"],

      ["tb_del", "Delivery & Freight", "Tab Break"],
      ["custom_delivery_section", "Delivery & Freight", "Section Break"],
      ["custom_delivery_mode", "Delivery", "Select", "\nSelf Pickup\nDelivery"],
      ["custom_delivery_by", "Delivery By / Mode", "Select", "\nSelf Pickup\nTrain\nTransport\nDelivery Partner"],
      ["custom_delivery_partner", "Transport / Partner", "Link", "Transporter"],
      ["col_del", "", "Column Break"],
      ["custom_delivery_dest_city", "Deliver To (City)", "Data"],
      ["custom_delivery_dest_state", "Deliver To (State)", "Select", STATES],
      ["custom_delivery_weight", "Approx Weight (kg)", "Float"],
      ["custom_delivery_boxes", "Boxes", "Int"],
      ["sb_chg", "Charges", "Section Break"],
      ["custom_delivery_service", "Service", "Data", "", "ro"],
      ["custom_delivery_transit", "Transit Estimate", "Data", "", "ro"],
      ["custom_delivery_charge", "Calculated Delivery Charge", "Currency", "", "ro"],
      ["custom_delivery_first_mile", "First-mile Leg", "Data", "", "ro"],
      ["custom_delivery_first_mile_charge", "First-mile Charge", "Currency", "", "ro"],
      ["col_chg", "", "Column Break"],
      ["custom_transport_charge", "Transport / Delivery Charge", "Currency"],
      ["custom_delivery_topay", "Customer Pays At Delivery", "Currency", "", "ro"],
      ["custom_actual_freight", "Actual Freight Paid", "Currency"],
      ["custom_delivery_oda", "Out of delivery area / remote", "Check"],
      ["custom_delivery_big_box", "A single box is over 100 kg", "Check"],
      ["custom_delivery_is_approx", "Delivery charge is approximate", "Check"],
      ["sb_note", "", "Section Break"],
      ["custom_delivery_rate_note", "How this fare was worked out", "Small Text", "", "ro"],
      ["custom_delivery_breakdown", "Delivery Charge Breakdown", "Small Text", "", "ro"],

      ["tb_dis", "Dispatch Tracking", "Tab Break"],
      ["custom_dispatch_section", "Dispatch Tracking", "Section Break"],
      ["custom_dispatch_status", "Dispatch Status", "Select", "Order Received\nPacking\nShipped\nIn Transit\nDelivery\nCompleted", "lv"],
      ["custom_dispatch_transporter", "Dispatched With", "Link", "Transporter"],
      ["custom_courier_name", "Courier Name", "Data"],
      ["col_dis", "", "Column Break"],
      ["custom_tracking_id", "Tracking ID", "Data", "", "lv"],
      ["custom_tracking_link", "Tracking Link", "Data"],
      ["custom_actual_delivery_date", "Actual Delivery Date", "Date"],
      ["sb_chg2", "Why the transporter changed", "Section Break"],
      ["custom_dispatch_change_reason", "Why The Transporter Changed", "Select",
        "\nCustomer choice changed\nTransporter unavailable\nBetter option available\nOther"],
      ["custom_dispatch_change_note", "Change Note", "Small Text"],

      ["tb_doc", "Documents", "Tab Break"],
      ["custom_order_documents", "Supporting Documents", "Table", "TDF Order Document"],
      ["sb_hist", "History", "Section Break"],
      ["custom_party_history", "Quotations & Orders", "HTML"]
    ],
    actions: [
      { label: "Mark Billed", role: ["Accounts"], when: "With Accounts", primary: true },
      { label: "Dispatch with tracking", role: ["Dispatch"], when: "Ready to Dispatch", primary: true },
      { label: "Mark Delivered", role: ["Dispatch"], when: "Dispatched", primary: true },
      { label: "Record Payment", role: ["Accounts", "Sales"] },
      { label: "Print", role: ["*"] },
      { label: "Close Order", role: ["Admin"] }
    ]
  },

  "Sales Order Item": {
    label: "Item Row", child: true,
    fields: [
      ["item_code", "Item Code", "Link", "Item", "reqd,lv"],
      ["item_name", "Item Name", "Data", "", "lv"],
      ["qty", "Qty", "Float", "", "reqd,lv"],
      ["uom", "UOM", "Link", "UOM", "lv"],
      ["rate", "Rate", "Currency", "", "reqd,lv"],
      ["amount", "Amount", "Currency", "", "ro,lv"],
      ["item_tax_template", "Item Tax Template", "Link", "Item Tax Template"]
    ]
  },
  "TDF Order Payment": {
    label: "Payment Row", child: true,
    fields: [
      ["payment_date", "Date", "Date", "", "reqd,lv"],
      ["amount", "Amount", "Currency", "", "reqd,lv"],
      ["method", "Method", "Select", "UPI\nBank Transfer\nCash\nCheque\nOther\nCredit Note", "reqd,lv"],
      ["reference_no", "Reference No", "Data", "", "lv"],
      ["charge_amount", "Method Fee", "Currency", "", "lv"],
      ["proof", "Proof", "Attach", "", "lv"],
      ["remarks", "Remarks", "Small Text"],
      ["recorded_by", "Recorded By", "Link", "User", "ro"],
      ["recorded_on", "Recorded On", "Datetime", "", "ro"]
    ]
  },
  "TDF Order Document": {
    label: "Supporting Document", child: true,
    fields: [
      ["title", "What is it", "Data", "", "reqd,lv"],
      ["document", "File", "Attach", "", "reqd,lv"],
      ["uploaded_by", "Added By", "Link", "User", "lv"],
      ["uploaded_on", "Added On", "Datetime"]
    ]
  },

  "Quotation": {
    label: "Quotation", plural: "Quotations", icon: "▧",
    naming: "QTN-2026-####", submittable: true,
    blurb: "A price that is still being quoted. It can be raised straight against a Lead, so no customer record is needed to send one out.",
    listColumns: ["name", "party_name", "quotation_to", "transaction_date", "valid_till", "status", "grand_total"],
    filters: [["status", "Status"], ["quotation_to", "Quotation To"]],
    fields: [
      ["sb_party", "", "Section Break"],
      ["quotation_to", "Quotation To", "Select", "Customer\nLead", "reqd,lv"],
      ["party_name", "Party", "Link", "Lead", "reqd,lv"],
      ["col_1", "", "Column Break"],
      ["transaction_date", "Date", "Date", "", "reqd,lv"],
      ["valid_till", "Valid Till", "Date", "", "lv"],
      ["status", "Status", "Select", "Draft\nOpen\nOrdered\nExpired\nLost", "ro,lv"],
      ["sb_items", "Items", "Section Break"],
      ["items", "Items", "Table", "Sales Order Item", "reqd"],
      ["sb_tot", "Totals", "Section Break"],
      ["total", "Net Total", "Currency", "", "ro"],
      ["custom_gst_type", "GST", "Select", "No GST\nGST 9%\nGST 18%"],
      ["col_t", "", "Column Break"],
      ["total_taxes_and_charges", "Total Taxes and Charges", "Currency", "", "ro"],
      ["grand_total", "Grand Total", "Currency", "", "ro,lv"],
      ["sb_del", "Delivery & Freight", "Section Break"],
      ["custom_delivery_dest_city", "Deliver To (City)", "Data"],
      ["custom_delivery_dest_state", "Deliver To (State)", "Select", STATES],
      ["col_d", "", "Column Break"],
      ["custom_delivery_weight", "Approx Weight (kg)", "Float"],
      ["custom_transport_charge", "Transport / Delivery Charge", "Currency"],
      ["sb_hist", "History", "Section Break"],
      ["custom_history", "Quotations & Orders", "HTML"]
    ],
    actions: [
      { label: "Create Sales Order", role: ["Sales", "Admin"], primary: true },
      { label: "Print", role: ["*"] },
      { label: "Mark Lost", role: ["Sales", "Admin"] }
    ]
  },

  "Lead": {
    label: "Lead", plural: "Leads", icon: "⚑",
    naming: "LEAD-2026-####", stageField: "custom_stage",
    blurb: "The master record for anyone we sell to. A lead is never deleted when it becomes a customer - it keeps the stage, the owner and the order journey.",
    listColumns: ["name", "company_name", "lead_name", "mobile_no", "custom_city", "custom_stage", "custom_lead_category", "lead_owner"],
    filters: [["custom_stage", "Stage"], ["custom_lead_category", "Lead Category"],
      ["custom_lead_temperature", "Lead Temperature"], ["custom_customer_type", "Customer Type"], ["source", "Source"]],
    fields: [
      ["sb_top", "", "Section Break"],
      ["lead_name", "Person", "Data", "", "reqd,lv"],
      ["company_name", "Company Name", "Data", "", "lv"],
      ["custom_cb_top1", "", "Column Break"],
      ["custom_lead_category", "Lead Category", "Select", "India\nInternational", "reqd,lv"],
      ["custom_stage", "Stage", "Select", "Lead Received\nCatalog Sent\nFollow Up\nSample Sent\nNot Reachable\nFuture Customer\nNot Interested\n1st Order\n2nd Order\n3rd Order\nRegular Customer\nIrrelevant", "reqd,lv"],
      ["custom_cb_top2", "", "Column Break"],
      ["custom_next_followup", "Next Follow-up", "Datetime", "", "lv"],
      ["custom_lead_temperature", "Lead Temperature", "Select", "\nHot\nWarm\nCold"],
      ["sb_journey", "", "Section Break"],
      ["custom_journey", "Order Journey", "HTML"],
      ["sb_contact", "Contact", "Section Break"],
      ["mobile_no", "Mobile No", "Data", "", "lv"],
      ["email_id", "Email", "Data"],
      ["custom_cb_contact", "", "Column Break"],
      ["custom_website", "Website", "Data"],
      ["source", "Source", "Link", "Lead Source"],
      ["lead_owner", "Lead Owner", "Link", "User", "lv"],
      ["custom_sec_biz", "Company & Billing Details", "Section Break"],
      ["custom_gstin", "GSTIN", "Data"],
      ["custom_address", "Address", "Small Text"],
      ["custom_cb_biz", "", "Column Break"],
      ["custom_city", "City", "Data", "", "lv"],
      ["custom_state", "State", "Select", STATES],
      ["custom_pincode", "Pincode", "Data"],
      ["custom_country", "Country", "Link", "Country"],
      ["custom_sec_class", "Classification", "Section Break"],
      ["custom_customer_type", "Customer Type", "Select",
        "\nPrinting Machine Owner\nDistributor & Wholesaler\nImporter\nMachine Owner & Supplier\nMiddleman", "lv"],
      ["custom_cb_class", "", "Column Break"],
      ["custom_product_interest", "Product Interest", "Select",
        "\nPigment Ink\nTransfer Film Roll\nAdhesive Powder\nInk + Roll + Powder\nCleaning Solution\nInk + Roll\nRoll + Powder"],
      ["custom_req_section", "Requirement & Pricing", "Section Break"],
      ["custom_ink_qty", "Ink Qty (Litre)", "Float"],
      ["custom_ink_rate", "Ink Rate (per Litre)", "Currency"],
      ["custom_cb_req1", "", "Column Break"],
      ["custom_roll_qty", "Roll Qty (Rolls)", "Float"],
      ["custom_roll_rate", "Roll Rate (per Roll)", "Currency"],
      ["custom_cb_req2", "", "Column Break"],
      ["custom_powder_qty", "Powder Qty (Kg)", "Float"],
      ["custom_powder_rate", "Powder Rate (per Kg)", "Currency"],
      ["custom_est_value", "Estimated Value", "Currency", "", "ro"],
      ["custom_sec_notes", "Parked / Lost", "Section Break"],
      ["custom_reason", "Parked / Lost Reason", "Small Text"],
      ["sb_conv", "Conversion", "Section Break"],
      ["custom_convert_to_customer", "Convert to Customer", "Check"],
      ["custom_customer_created", "Customer Created", "Check", "", "ro"],
      ["sb_hist", "History", "Section Break"],
      ["custom_history", "Quotations & Orders", "HTML"]
    ],
    actions: [
      { label: "New Quotation", role: ["Sales", "Admin"], primary: true },
      { label: "New Sales Order", role: ["Sales", "Admin"] },
      { label: "Convert to Customer", role: ["Sales", "Admin"] },
      { label: "Log a Follow-up", role: ["Sales", "Admin"] }
    ]
  },

  "Customer": {
    label: "Customer", plural: "Customers", icon: "⌂",
    naming: "name", blurb: "Created from a lead on the way to the first order. The lead stays the master; the customer carries the rates we give and the billing details.",
    listColumns: ["name", "custom_contact_name", "custom_mobile_no", "custom_city", "custom_state", "custom_customer_type", "owner_name"],
    filters: [["custom_state", "State"], ["custom_customer_type", "Business Type"], ["custom_lead_category", "Lead Category"]],
    fields: [
      ["sb_top", "", "Section Break"],
      ["customer_name", "Customer Name", "Data", "", "reqd,lv"],
      ["customer_group", "Customer Group", "Link", "Customer Group"],
      ["col_1", "", "Column Break"],
      ["territory", "Territory", "Link", "Territory"],
      ["owner_name", "Account Owner", "Link", "User", "lv"],
      ["custom_contact_sec", "Contact & Billing", "Section Break"],
      ["custom_contact_name", "Contact Person", "Data", "", "lv"],
      ["custom_mobile_no", "WhatsApp / Mobile No", "Data", "", "lv"],
      ["custom_call_number", "Call Number (Alternate)", "Data"],
      ["custom_cb_contact", "", "Column Break"],
      ["gstin", "GSTIN / UIN", "Data"],
      ["custom_address", "Address", "Small Text"],
      ["custom_city", "City", "Data", "", "lv"],
      ["custom_state", "State", "Select", STATES, "lv"],
      ["custom_pincode", "Pincode", "Data"],
      ["custom_class_section", "Classification", "Section Break"],
      ["custom_customer_type", "Business Type", "Select",
        "\nPrinting Machine Owner\nDistributor & Wholesaler\nImporter\nMachine Owner & Supplier\nMiddleman", "lv"],
      ["custom_lead_category", "Lead Category", "Select", "India\nInternational"],
      ["custom_cb_class", "", "Column Break"],
      ["custom_product_interest", "Product Interest", "Select",
        "\nPigment Ink\nTransfer Film Roll\nAdhesive Powder\nInk + Roll + Powder\nCleaning Solution"],
      ["custom_rates_sec", "Rates We Give", "Section Break"],
      ["custom_ink_rate", "Pigment Ink Rate (per Litre)", "Currency"],
      ["custom_cb_rate1", "", "Column Break"],
      ["custom_roll_rate", "Film Roll Rate (per Roll)", "Currency"],
      ["custom_cb_rate2", "", "Column Break"],
      ["custom_powder_rate", "Adhesive Powder Rate (per Kg)", "Currency"],
      ["sb_hist", "History", "Section Break"],
      ["custom_history", "Quotations & Orders", "HTML"]
    ],
    actions: [
      { label: "New Sales Order", role: ["Sales", "Admin"], primary: true },
      { label: "New Quotation", role: ["Sales", "Admin"] },
      { label: "Customer Ledger", role: ["Accounts", "Admin"] }
    ]
  },

  /* ======================= DISPATCH & STOCK ======================= */
  "Delivery Note": {
    label: "Delivery Note", plural: "Delivery Notes", icon: "✈",
    naming: "DN-2026-####", submittable: true,
    blurb: "One order, one delivery note. The note moves the stock and carries the courier and docket number; no sales invoice is raised behind it.",
    listColumns: ["name", "customer", "posting_date", "status", "custom_courier_name", "custom_tracking_id", "grand_total"],
    filters: [["status", "Status"], ["custom_courier_name", "Courier"]],
    fields: [
      ["sb_top", "", "Section Break"],
      ["customer", "Customer", "Link", "Customer", "reqd,lv"],
      ["against_sales_order", "Against Sales Order", "Link", "Sales Order"],
      ["col_1", "", "Column Break"],
      ["posting_date", "Date", "Date", "", "reqd,lv"],
      ["status", "Status", "Select", "Draft\nTo Bill\nCompleted\nReturn Issued\nCancelled", "ro,lv"],
      ["set_warehouse", "Source Warehouse", "Link", "Warehouse"],
      ["sb_items", "Items", "Section Break"],
      ["items", "Items", "Table", "Delivery Note Item", "reqd"],
      ["custom_tracking_sec", "Courier & Tracking", "Section Break"],
      ["custom_courier_name", "Courier Name", "Data", "", "lv"],
      ["custom_tracking_id", "Tracking ID", "Data", "", "lv"],
      ["custom_tracking_col", "", "Column Break"],
      ["custom_tracking_link", "Tracking Link", "Data"],
      ["custom_import_ref", "Import Reference", "Data", "", "ro"],
      ["sb_ret", "Return", "Section Break"],
      ["is_return", "Is Return", "Check", "", "ro"],
      ["custom_return_reason", "Return Reason", "Data"],
      ["custom_return_note", "Return Note", "Small Text"],
      ["sb_tot", "Totals", "Section Break"],
      ["total_qty", "Total Quantity", "Float", "", "ro"],
      ["grand_total", "Grand Total", "Currency", "", "ro,lv"]
    ],
    actions: [
      { label: "Print Delivery Note", role: ["*"], primary: true },
      { label: "Record a Return", role: ["Dispatch", "Admin"] },
      { label: "Cancel", role: ["Admin"] }
    ]
  },
  "Delivery Note Item": {
    label: "Delivery Row", child: true,
    fields: [
      ["item_code", "Item Code", "Link", "Item", "reqd,lv"],
      ["item_name", "Item Name", "Data", "", "lv"],
      ["qty", "Qty", "Float", "", "reqd,lv"],
      ["uom", "UOM", "Link", "UOM", "lv"],
      ["batch_no", "Batch / Lot No", "Link", "Batch", "lv"],
      ["rate", "Rate", "Currency", "", "lv"],
      ["amount", "Amount", "Currency", "", "ro,lv"]
    ]
  },

  "Item": {
    label: "SKU / Product", plural: "SKUs & Products", icon: "▣",
    naming: "name", blurb: "The SKU master. Reorder level drives the low-stock warning on every stock screen; units per package drives the batch QR label.",
    listColumns: ["item_code", "item_name", "item_group", "stock_uom", "custom_sku_variant", "reorder_level", "on_hand", "disabled"],
    filters: [["item_group", "Category"], ["disabled", "Disabled"]],
    fields: [
      ["sb_top", "", "Section Break"],
      ["item_code", "SKU Code", "Data", "", "reqd,lv"],
      ["item_name", "Product Name", "Data", "", "reqd,lv"],
      ["custom_sku_variant", "Variant", "Data", "", "lv"],
      ["col_1", "", "Column Break"],
      ["item_group", "Category", "Link", "Item Group", "reqd,lv"],
      ["stock_uom", "Unit", "Link", "UOM", "reqd,lv"],
      ["disabled", "Disabled", "Check", "", "lv"],
      ["sb_stock", "Stock & Reorder", "Section Break"],
      ["reorder_level", "Reorder Level", "Float", "", "lv"],
      ["custom_units_per_package", "Units per Package (for QR label)", "Int"],
      ["col_2", "", "Column Break"],
      ["has_batch_no", "Has Batch No", "Check"],
      ["gst_hsn_code", "HSN Code", "Link", "GST HSN Code"],
      ["sb_rate", "Default Rates", "Section Break"],
      ["valuation_rate", "Valuation Rate", "Currency"],
      ["standard_rate", "Standard Selling Rate", "Currency"],
      ["tb_mv", "Stock Movement", "Tab Break"],
      ["tdf_stock_movement_html", "Stock Movement", "HTML"]
    ],
    actions: [
      { label: "Save", role: ["Dispatch", "Admin"], primary: true },
      { label: "Print Batch QR Labels", role: ["Dispatch", "Admin"] },
      { label: "Stock Ledger", role: ["Dispatch", "Accounts", "Admin"] }
    ]
  },

  "Batch": {
    label: "Batch / Lot", plural: "Batches", icon: "⌸",
    naming: "name", blurb: "A lot of stock from one supplier shipment. The batch is the only thing that ties stock on the shelf back to the vendor it came from.",
    listColumns: ["name", "item", "supplier", "manufacturing_date", "batch_qty", "on_hand"],
    filters: [["item", "SKU"], ["supplier", "Supplier"]],
    fields: [
      ["batch_id", "Batch / Lot No", "Data", "", "reqd,lv"],
      ["item", "SKU", "Link", "Item", "reqd,lv"],
      ["supplier", "Supplier", "Link", "Supplier", "lv"],
      ["col_1", "", "Column Break"],
      ["manufacturing_date", "Received On", "Date", "", "lv"],
      ["batch_qty", "Batch Quantity", "Float", "", "ro,lv"],
      ["reference_doctype", "Received Through", "Data", "", "ro"]
    ],
    actions: [{ label: "Print QR Label", role: ["Dispatch", "Admin"], primary: true }]
  },

  "Stock Entry": {
    label: "Stock Entry", plural: "Stock Entries", icon: "⇅",
    naming: "STE-2026-####", submittable: true,
    blurb: "Opening stock and adjustments. Inward from a supplier goes through a Purchase Receipt instead, so the batch keeps its vendor.",
    listColumns: ["name", "stock_entry_type", "posting_date", "to_warehouse", "total_amount", "docstatus"],
    filters: [["stock_entry_type", "Entry Type"]],
    fields: [
      ["stock_entry_type", "Entry Type", "Select",
        "Material Receipt\nMaterial Issue\nMaterial Transfer\nRepack", "reqd,lv"],
      ["posting_date", "Posting Date", "Date", "", "reqd,lv"],
      ["col_1", "", "Column Break"],
      ["to_warehouse", "Target Warehouse", "Link", "Warehouse", "lv"],
      ["from_warehouse", "Source Warehouse", "Link", "Warehouse"],
      ["sb_items", "Items", "Section Break"],
      ["items", "Items", "Table", "Stock Entry Detail", "reqd"],
      ["sb_tot", "Totals", "Section Break"],
      ["total_amount", "Total Value", "Currency", "", "ro,lv"],
      ["remarks", "Remarks", "Small Text"]
    ],
    actions: [{ label: "Submit", role: ["Dispatch", "Admin"], primary: true }]
  },
  "Stock Entry Detail": {
    label: "Stock Row", child: true,
    fields: [
      ["item_code", "SKU", "Link", "Item", "reqd,lv"],
      ["qty", "Qty", "Float", "", "reqd,lv"],
      ["uom", "Unit", "Link", "UOM", "lv"],
      ["batch_no", "Batch / Lot No", "Link", "Batch", "lv"],
      ["basic_rate", "Rate", "Currency", "", "lv"],
      ["amount", "Amount", "Currency", "", "ro,lv"]
    ]
  },

  "Transporter": {
    label: "Courier / Transport", plural: "Couriers & Transport", icon: "⛟",
    naming: "name", blurb: "A courier with its own rate card: zone or city rates, docket charges, out-of-area rules, state surcharge, and what the customer pays at delivery.",
    listColumns: ["transporter_name", "contact_person", "mobile_no", "city", "rates", "last_used", "disabled"],
    filters: [["city", "City / Hub"], ["disabled", "Disabled"]],
    fields: [
      ["transporter_name", "Courier / Transport Name", "Data", "", "reqd,lv"],
      ["contact_person", "Contact Person", "Data", "", "lv"],
      ["mobile_no", "Mobile", "Data", "", "lv"],
      ["col_1", "", "Column Break"],
      ["city", "City / Hub", "Data", "", "lv"],
      ["tracking_url", "Tracking URL", "Data"],
      ["disabled", "Disabled", "Check", "", "lv"],
      ["sb_rates", "Rate Card", "Section Break"],
      ["rate_rows", "Delivery Rates", "Table", "Delivery Rate"]
    ],
    actions: [
      { label: "Add a rate", role: ["Dispatch", "Admin"], primary: true },
      { label: "Mark verified today", role: ["Dispatch", "Admin"] }
    ]
  },
  "Delivery Rate": {
    label: "Delivery Rate", child: true,
    fields: [
      ["destination_kind", "Destination Is A", "Select", "Zone\nState\nCity", "reqd,lv"],
      ["destination", "Destination", "Data", "", "reqd,lv"],
      ["service", "Service", "Select", "Economy\nStandard\nExpress", "lv"],
      ["rate_basis", "Rate Basis", "Select", "Per Kg\nPer Box\nFlat", "reqd,lv"],
      ["rate", "Rate", "Currency", "", "lv"],
      ["min_weight", "Min Chargeable Weight", "Float"],
      ["min_freight", "Min Freight", "Currency"],
      ["docket_charge", "Docket Charge", "Currency"],
      ["other_charges_label", "Other Charge For", "Data"],
      ["other_charges", "Other Charges", "Currency"],
      ["transit_min", "Transit Days (from)", "Int"],
      ["transit_max", "Transit Days (to)", "Int"],
      ["pickup_available", "Pickup Available", "Check"],
      ["delivery_type", "Delivery Type", "Select", "Door\nTerminal"],
      ["loading_amount", "Loading / Handling", "Currency"],
      ["loading_basis", "...charged", "Select", "\nPer Box\nPer Kg\nFlat"],
      ["loading_condition", "...only when", "Select", "Always\nA single box is over 100 kg"],
      ["oda_rate", "ODA per kg", "Currency"],
      ["oda_min", "ODA minimum", "Currency"],
      ["surcharge_amount", "State surcharge per kg", "Currency"],
      ["surcharge_states", "...for these states", "Small Text"],
      ["gst_on_freight_pct", "GST on their freight (%)", "Float"],
      ["topay_basis", "To-pay", "Select", "None\nPer Docket\nEntire Freight"],
      ["topay_amount", "To-pay amount", "Currency"],
      ["verified_on", "Rate Verified On", "Date", "", "lv"],
      ["active", "Active", "Check", "", "lv"]
    ]
  },
  "Delivery Zone": {
    label: "Delivery Zone", plural: "Delivery Zones", icon: "◎",
    naming: "name", blurb: "A named group of states a courier prices together. The zone sets the base rate; the contract sets the surcharge, so moving a state between zones does not move its surcharge.",
    listColumns: ["zone_name", "states", "notes"],
    fields: [
      ["zone_name", "Zone", "Data", "", "reqd,lv"],
      ["states", "States in this zone", "Small Text", "", "lv"],
      ["notes", "Notes", "Small Text"]
    ]
  },

  /* ======================= PURCHASE & IMPORT ======================= */
  "Purchase Receipt": {
    label: "Purchase Receipt", plural: "Purchase Receipts", icon: "⬇",
    naming: "PR-2026-####", submittable: true,
    blurb: "One shipment in: supplier, their invoice number, the lot number and the quantities. The lot is what carries the vendor on to the shelf.",
    listColumns: ["name", "supplier", "posting_date", "supplier_invoice_no", "total_qty", "grand_total", "docstatus"],
    filters: [["supplier", "Supplier"]],
    fields: [
      ["supplier", "Supplier", "Link", "Supplier", "reqd,lv"],
      ["posting_date", "Date received", "Date", "", "reqd,lv"],
      ["col_1", "", "Column Break"],
      ["supplier_invoice_no", "Supplier Invoice / Challan No", "Data", "", "lv"],
      ["set_warehouse", "Material Receipt into", "Link", "Warehouse"],
      ["sb_items", "What came in", "Section Break"],
      ["items", "Items", "Table", "Purchase Receipt Item", "reqd"],
      ["sb_tot", "Totals", "Section Break"],
      ["total_qty", "Total Quantity", "Float", "", "ro,lv"],
      ["grand_total", "Shipment value", "Currency", "", "ro,lv"],
      ["remarks", "Remarks", "Small Text"]
    ],
    actions: [
      { label: "Save Inward", role: ["Dispatch", "Admin"], primary: true },
      { label: "Print Batch QR Labels", role: ["Dispatch", "Admin"] },
      { label: "Landed Cost Voucher", role: ["Admin"] }
    ]
  },
  "Purchase Receipt Item": {
    label: "Inward Row", child: true,
    fields: [
      ["item_code", "SKU", "Link", "Item", "reqd,lv"],
      ["item_name", "Product", "Data", "", "lv"],
      ["qty", "Qty", "Float", "", "reqd,lv"],
      ["uom", "Unit", "Link", "UOM", "lv"],
      ["batch_no", "Batch / Lot No", "Data", "", "lv"],
      ["rate", "Rate", "Currency", "", "reqd,lv"],
      ["amount", "Line value", "Currency", "", "ro,lv"]
    ]
  },
  "Purchase Order": {
    label: "Purchase Order", plural: "Purchase Orders", icon: "▦",
    naming: "PO-2026-####", submittable: true,
    blurb: "Raised against a supplier before an import shipment leaves.",
    listColumns: ["name", "supplier", "transaction_date", "schedule_date", "status", "grand_total"],
    filters: [["status", "Status"], ["supplier", "Supplier"]],
    fields: [
      ["supplier", "Supplier", "Link", "Supplier", "reqd,lv"],
      ["transaction_date", "Date", "Date", "", "reqd,lv"],
      ["col_1", "", "Column Break"],
      ["schedule_date", "Required By", "Date", "", "lv"],
      ["status", "Status", "Select", "Draft\nTo Receive and Bill\nTo Receive\nTo Bill\nCompleted\nClosed", "ro,lv"],
      ["sb_items", "Items", "Section Break"],
      ["items", "Items", "Table", "Purchase Receipt Item", "reqd"],
      ["sb_tot", "Totals", "Section Break"],
      ["grand_total", "Grand Total", "Currency", "", "ro,lv"]
    ],
    actions: [{ label: "Create Purchase Receipt", role: ["Admin"], primary: true }]
  },
  "Supplier": {
    label: "Supplier / Vendor", plural: "Suppliers & Vendors", icon: "⬚",
    naming: "name", blurb: "Who stock comes from. Every lot we receive names one, which is how stock on the shelf can be attributed back to a vendor.",
    listColumns: ["supplier_name", "contact_person", "mobile_no", "city", "shipments", "last_inward", "disabled"],
    filters: [["city", "City"], ["disabled", "Disabled"]],
    fields: [
      ["supplier_name", "Vendor name", "Data", "", "reqd,lv"],
      ["contact_person", "Contact person", "Data", "", "lv"],
      ["mobile_no", "Mobile", "Data", "", "lv"],
      ["col_1", "", "Column Break"],
      ["city", "City", "Data", "", "lv"],
      ["supplier_group", "Supplier Group", "Link", "Supplier Group"],
      ["gstin", "GSTIN / UIN", "Data"],
      ["disabled", "Disabled", "Check", "", "lv"]
    ],
    actions: [{ label: "Add vendor", role: ["Dispatch", "Admin"], primary: true }]
  },

  /* ======================= ACCOUNTS ======================= */
  "Payment Entry": {
    label: "Payment Entry", plural: "Payment Entries", icon: "₹",
    naming: "PE-2026-####", submittable: true,
    blurb: "Read-only for the sales team by decision: sales records money on the order itself, accounts verify it here.",
    listColumns: ["name", "party", "posting_date", "payment_type", "mode_of_payment", "paid_amount", "docstatus"],
    filters: [["payment_type", "Payment Type"], ["mode_of_payment", "Mode of Payment"]],
    fields: [
      ["payment_type", "Payment Type", "Select", "Receive\nPay\nInternal Transfer", "reqd,lv"],
      ["posting_date", "Posting Date", "Date", "", "reqd,lv"],
      ["col_1", "", "Column Break"],
      ["party_type", "Party Type", "Select", "Customer\nSupplier\nEmployee", "reqd"],
      ["party", "Party", "Link", "Customer", "reqd,lv"],
      ["sb_amt", "Amount", "Section Break"],
      ["paid_amount", "Paid Amount", "Currency", "", "reqd,lv"],
      ["mode_of_payment", "Mode of Payment", "Link", "Mode of Payment", "lv"],
      ["col_2", "", "Column Break"],
      ["reference_no", "Reference / UTR / Cheque No", "Data"],
      ["reference_date", "Reference Date", "Date"],
      ["sb_rem", "Remarks", "Section Break"],
      ["remarks", "Remarks", "Small Text"]
    ],
    actions: [{ label: "Submit", role: ["Accounts", "Admin"], primary: true }]
  },
  "Sales Invoice": {
    label: "Sales Invoice", plural: "Sales Invoices", icon: "▥",
    naming: "SI-2026-####", submittable: true,
    blurb: "Kept for compliance reporting only. Day-to-day billing happens outside this system and is attached to the order, which is why the order book and the invoice register can differ.",
    listColumns: ["name", "customer", "posting_date", "due_date", "status", "grand_total", "outstanding_amount"],
    filters: [["status", "Status"]],
    fields: [
      ["customer", "Customer", "Link", "Customer", "reqd,lv"],
      ["posting_date", "Date", "Date", "", "reqd,lv"],
      ["due_date", "Due Date", "Date", "", "lv"],
      ["col_1", "", "Column Break"],
      ["status", "Status", "Select", "Draft\nUnpaid\nPaid\nOverdue\nCancelled", "ro,lv"],
      ["company_gstin", "Company GSTIN", "Data", "", "ro"],
      ["sb_items", "Items", "Section Break"],
      ["items", "Items", "Table", "Sales Order Item", "reqd"],
      ["sb_tot", "Totals", "Section Break"],
      ["grand_total", "Grand Total", "Currency", "", "ro,lv"],
      ["outstanding_amount", "Outstanding Amount", "Currency", "", "ro,lv"]
    ],
    actions: [{ label: "Submit", role: ["Accounts", "Admin"], primary: true }]
  },

  /* ======================= TASKS & CHAT ======================= */
  "Task": {
    label: "Task", plural: "Tasks", icon: "✓",
    naming: "TASK-2026-####", stageField: "custom_stage",
    blurb: "Work assigned to a person, with sub-tasks, attachments and its own discussion thread on the form.",
    listColumns: ["name", "subject", "custom_stage", "priority", "custom_due_date", "progress", "assigned_to"],
    filters: [["custom_stage", "Stage"], ["priority", "Priority"], ["project", "Project"]],
    fields: [
      ["subject", "Subject", "Data", "", "reqd,lv"],
      ["custom_stage", "Stage", "Select", "To Do\nIn Progress\nUnder Review\nDone\nOn Hold\nCancelled", "lv"],
      ["col_1", "", "Column Break"],
      ["priority", "Priority", "Select", "Low\nMedium\nHigh\nUrgent", "lv"],
      ["custom_due_date", "Due Date", "Date", "", "lv"],
      ["assigned_to", "Assigned To", "Link", "User", "lv"],
      ["sb_prog", "Progress", "Section Break"],
      ["progress", "Progress (%)", "Percent", "", "ro,lv"],
      ["custom_progress_bar", "Progress", "HTML"],
      ["custom_completed_on", "Completed On", "Date", "", "ro"],
      ["sb_desc", "Description", "Section Break"],
      ["description", "Description", "Text Editor"],
      ["sb_sub", "Sub-tasks", "Section Break"],
      ["custom_subtasks", "Sub-tasks", "Table", "Subtask"],
      ["custom_attach_sec", "Files & Photos", "Section Break"],
      ["custom_attachments_html", "Attachments", "HTML"],
      ["custom_chat_sec", "Discussion", "Section Break"],
      ["custom_chat_html", "Task Chat", "HTML"]
    ],
    actions: [
      { label: "Save", role: ["*"], primary: true },
      { label: "Mark Done", role: ["*"] },
      { label: "Add Sub-task", role: ["*"] }
    ]
  },
  "Subtask": {
    label: "Sub-task", child: true,
    fields: [
      ["done", "Done", "Check", "", "lv"],
      ["subtask", "Sub-task", "Data", "", "reqd,lv"],
      ["assigned_to", "Owner", "Link", "User", "lv"]
    ]
  },

  "Team Issue": {
    label: "Chat", plural: "Chats", icon: "✉",
    naming: "ISS-#####",
    blurb: "An internal chat raised at a department or a person. Built on the native comment store, so it gets realtime updates, mentions and private attachments for free.",
    listColumns: ["name", "title", "target_label", "raised_by_name", "priority", "status", "last_activity_on"],
    filters: [["status", "Status"], ["priority", "Priority"], ["is_escalated", "Escalated"]],
    fields: [
      ["title", "Subject", "Data", "", "reqd,lv"],
      ["target_type", "Send To", "Select", "Department\nPerson", "reqd"],
      ["target_label", "To", "Data", "", "ro,lv"],
      ["col_1", "", "Column Break"],
      ["priority", "Priority", "Select", "Low\nMedium\nHigh", "reqd,lv"],
      ["status", "Status", "Select", "Created\nUnder Process\nResolved\nClosed", "reqd,lv"],
      ["sb_desc", "Description", "Section Break"],
      ["description", "Description", "Text Editor", "", "reqd"],
      ["sb_chat", "Chat", "Section Break"],
      ["chat", "", "HTML"],
      ["sb_people", "Participants", "Section Break"],
      ["participants", "Participants", "Table", "Issue Participant"],
      ["sb_res", "Resolution", "Section Break"],
      ["resolution", "Resolution Note", "Text Editor"],
      ["sb_track", "Status & History", "Section Break"],
      ["raised_by_name", "Started By", "Data", "", "ro,lv"],
      ["from_department", "From Department", "Link", "Department", "ro"],
      ["is_escalated", "Escalated", "Check", "", "lv"],
      ["col_2", "", "Column Break"],
      ["opened_on", "Started On", "Datetime", "", "ro"],
      ["resolved_on", "Resolved On", "Datetime", "", "ro"],
      ["last_activity_on", "Last Activity", "Datetime", "", "ro,lv"],
      ["reopen_count", "Reopen Count", "Int", "", "ro"]
    ],
    actions: [
      { label: "Send", role: ["*"], primary: true },
      { label: "Mark Resolved", role: ["*"] },
      { label: "Escalate", role: ["Admin"] },
      { label: "Add Participant", role: ["*"] }
    ]
  },
  "Issue Participant": {
    label: "Participant", child: true,
    fields: [
      ["user", "User", "Link", "User", "reqd,lv"],
      ["full_name", "Name", "Data", "", "lv"],
      ["added_by", "Added By", "Link", "User", "lv"],
      ["added_on", "Added On", "Datetime"]
    ]
  },

  /* ======================= HR ======================= */
  "Employee": {
    label: "Employee", plural: "Employees", icon: "☺",
    naming: "EMP-###",
    blurb: "Employee codes are the company's own staff codes, not the stock series. Excluding one from attendance also takes it out of payroll.",
    listColumns: ["name", "employee_name", "designation", "department", "date_of_joining", "status", "reports_to"],
    filters: [["status", "Status"], ["department", "Department"], ["designation", "Designation"]],
    fields: [
      ["employee_name", "Employee Name", "Data", "", "reqd,lv"],
      ["employee_code", "Employee Code", "Data", "", "ro,lv"],
      ["col_1", "", "Column Break"],
      ["status", "Status", "Select", "Active\nInactive\nSuspended\nLeft", "reqd,lv"],
      ["user_id", "User ID", "Link", "User"],
      ["sb_job", "Company Details", "Section Break"],
      ["designation", "Designation", "Link", "Designation", "lv"],
      ["department", "Department", "Link", "Department", "lv"],
      ["reports_to", "Reporting Manager", "Link", "Employee", "lv"],
      ["col_2", "", "Column Break"],
      ["date_of_joining", "Date of Joining", "Date", "", "reqd,lv"],
      ["default_shift", "Default Shift", "Link", "Shift Type"],
      ["holiday_list", "Holiday List", "Link", "Holiday List"],
      ["sb_personal", "Personal", "Section Break"],
      ["gender", "Gender", "Select", "\nMale\nFemale\nOther"],
      ["date_of_birth", "Date of Birth", "Date"],
      ["col_3", "", "Column Break"],
      ["cell_number", "Mobile Number", "Data"],
      ["personal_email", "Personal Email", "Data"],
      ["sb_att", "Attendance & Payroll", "Section Break"],
      ["custom_exclude_from_attendance", "Exclude from Attendance & Payroll", "Check"],
      ["sb_exit", "Exit", "Section Break"],
      ["relieving_date", "Relieving Date", "Date"],
      ["custom_exit_type", "Exit Type", "Select", "\nResigned\nTerminated\nAbsconded\nRetired\nContract Ended"],
      ["col_4", "", "Column Break"],
      ["reason_for_leaving", "Reason for Leaving", "Small Text"],
      ["custom_exit_interview_done", "Exit Interview Done?", "Select", "\nNo\nYes"],
      ["custom_exit_interview_details", "Exit Interview Details", "Text"]
    ],
    actions: [
      { label: "Save", role: ["HR", "Admin"], primary: true },
      { label: "Leave Allocation", role: ["HR", "Admin"] },
      { label: "Salary Structure Assignment", role: ["HR", "Admin"] }
    ]
  },

  "Attendance": {
    label: "Attendance", plural: "Attendance", icon: "☑",
    naming: "ATT-2026-#####", submittable: true,
    blurb: "A weekly off or a holiday is the absence of a row, not a status. Rows are cancelled, never deleted, so the register keeps its audit trail.",
    listColumns: ["name", "employee_name", "attendance_date", "status", "in_time", "out_time", "working_hours"],
    filters: [["status", "Status"], ["employee_name", "Employee"]],
    fields: [
      ["employee", "Employee", "Link", "Employee", "reqd"],
      ["employee_name", "Employee Name", "Data", "", "ro,lv"],
      ["attendance_date", "Date", "Date", "", "reqd,lv"],
      ["col_1", "", "Column Break"],
      ["status", "Status", "Select", "Present\nAbsent\nHalf Day\nOn Leave\nWork From Home", "reqd,lv"],
      ["half_day_status", "Half Day counts as", "Select", "\nAbsent\nPresent"],
      ["shift", "Shift", "Link", "Shift Type"],
      ["sb_times", "Times", "Section Break"],
      ["in_time", "In Time", "Datetime", "", "lv"],
      ["out_time", "Out Time", "Datetime", "", "lv"],
      ["col_2", "", "Column Break"],
      ["working_hours", "Working Hours", "Float", "", "ro,lv"],
      ["late_entry", "Late Entry", "Check"],
      ["early_exit", "Early Exit", "Check"],
      ["sb_link", "Linked Corrections", "Section Break"],
      ["custom_attendance_correction", "Attendance Correction", "Link", "Attendance Correction", "ro"],
      ["custom_early_closure", "Early Closure", "Link", "Early Closure", "ro"],
      ["custom_same_day_marked", "Marked Live From Punch", "Check", "", "ro"]
    ],
    actions: [{ label: "Save", role: ["HR", "Admin"], primary: true }, { label: "Cancel", role: ["HR", "Admin"] }]
  },

  "Attendance Correction": {
    label: "Attendance Correction", plural: "Attendance Corrections", icon: "✎",
    naming: "ATT-COR-####",
    blurb: "An employee's own request to fix a missed punch. Stock attendance has no route for this, which is why it is a doctype of its own.",
    listColumns: ["name", "employee_name", "from_date", "to_date", "status", "decided_on"],
    filters: [["status", "Status"]],
    fields: [
      ["sb_who", "Request", "Section Break"],
      ["employee", "Employee", "Link", "Employee", "reqd"],
      ["employee_name", "Employee Name", "Data", "", "ro,lv"],
      ["cb_who", "", "Column Break"],
      ["from_date", "From Date", "Date", "", "reqd,lv"],
      ["to_date", "To Date", "Date", "", "reqd"],
      ["sb_times", "Correct times", "Section Break"],
      ["proposed_in_time", "Proposed In Time", "Datetime"],
      ["cb_times", "", "Column Break"],
      ["proposed_out_time", "Proposed Out Time", "Datetime"],
      ["sb_reason", "Reason", "Section Break"],
      ["reason", "Reason", "Small Text", "", "reqd"],
      ["sb_decision", "Decision", "Section Break"],
      ["status", "Status", "Select", "Pending\nApproved\nRejected", "reqd,lv"],
      ["approver", "Approver", "Link", "User"],
      ["cb_decision", "", "Column Break"],
      ["decided_by", "Decided By", "Link", "User", "ro"],
      ["decided_on", "Decided On", "Datetime", "", "ro,lv"],
      ["applied_on", "Applied On", "Datetime", "", "ro"],
      ["sb_log", "What changed", "Section Break"],
      ["application_log", "Applied Changes", "Small Text", "", "ro"]
    ],
    actions: [
      { label: "Approve", role: ["HR", "Admin"], primary: true },
      { label: "Reject", role: ["HR", "Admin"] }
    ]
  },

  "Leave Application": {
    label: "Leave Application", plural: "Leave Applications", icon: "⚐",
    naming: "LAP-2026-####", submittable: true,
    blurb: "The approver is the one who submits, so anything still awaiting a decision is a draft, not a submitted document.",
    listColumns: ["name", "employee_name", "leave_type", "from_date", "to_date", "total_leave_days", "status"],
    filters: [["status", "Status"], ["leave_type", "Leave Type"]],
    fields: [
      ["employee", "Employee", "Link", "Employee", "reqd"],
      ["employee_name", "Employee Name", "Data", "", "ro,lv"],
      ["leave_type", "Leave Type", "Link", "Leave Type", "reqd,lv"],
      ["col_1", "", "Column Break"],
      ["from_date", "From Date", "Date", "", "reqd,lv"],
      ["to_date", "To Date", "Date", "", "reqd,lv"],
      ["half_day", "Half Day", "Check"],
      ["sb_det", "Details", "Section Break"],
      ["total_leave_days", "Total Leave Days", "Float", "", "ro,lv"],
      ["leave_balance", "Leave Balance Before Application", "Float", "", "ro"],
      ["col_2", "", "Column Break"],
      ["status", "Status", "Select", "Open\nApproved\nRejected\nCancelled", "reqd,lv"],
      ["leave_approver", "Leave Approver", "Link", "User", "reqd"],
      ["custom_company_leave_ref", "Company Leave Ref", "Data", "", "ro"],
      ["sb_reason", "Reason", "Section Break"],
      ["description", "Reason", "Small Text"]
    ],
    actions: [
      { label: "Approve & Submit", role: ["HR", "Admin"], primary: true },
      { label: "Reject", role: ["HR", "Admin"] }
    ]
  },

  "HR Request": {
    label: "Request to HR", plural: "HR Requests", icon: "✉",
    naming: "HR-REQ-####",
    blurb: "Anything an employee needs from HR that is not leave or attendance.",
    listColumns: ["name", "subject", "employee_name", "status", "hr_contact"],
    filters: [["status", "Status"]],
    fields: [
      ["subject", "Subject", "Data", "", "reqd,lv"],
      ["details", "Details", "Text"],
      ["sb_meta", "Request", "Section Break"],
      ["employee", "Employee", "Link", "Employee", "reqd"],
      ["employee_name", "Employee Name", "Data", "", "ro,lv"],
      ["cb_meta", "", "Column Break"],
      ["status", "Status", "Select", "Open\nIn Progress\nResolved", "reqd,lv"],
      ["hr_contact", "HR Contact", "Link", "User", "lv"]
    ],
    actions: [{ label: "Submit Request", role: ["*"], primary: true }, { label: "Mark Resolved", role: ["HR", "Admin"] }]
  },

  "Employee Document": {
    label: "Employee Document", plural: "Employee Documents", icon: "⛃",
    naming: "EMP-DOC-#####",
    blurb: "Payslips and letters an employee can download. Only the employee and HR can open the file.",
    listColumns: ["name", "employee_name", "document_type", "title", "date", "uploaded_by"],
    filters: [["document_type", "Document Type"]],
    fields: [
      ["employee", "Employee", "Link", "Employee", "reqd"],
      ["employee_name", "Employee Name", "Data", "", "ro,lv"],
      ["document_type", "Document Type", "Select",
        "Salary Slip\nJoining Letter\nProbation Letter\nConfirmation Letter\nOther", "reqd,lv"],
      ["cb_main", "", "Column Break"],
      ["title", "Title", "Data", "", "reqd,lv"],
      ["date", "Date", "Date", "", "reqd,lv"],
      ["sb_file", "File", "Section Break"],
      ["attachment", "Document (PDF)", "Attach", "", "reqd"],
      ["uploaded_by", "Uploaded By", "Link", "User", "ro,lv"]
    ],
    actions: [{ label: "Download", role: ["*"], primary: true }]
  },

  "Early Closure": {
    label: "Early Closure Day", plural: "Early Closure Days", icon: "⏱",
    naming: "EC-{closure_date}",
    blurb: "The office shut early. Anyone who stayed the minimum hours keeps a full Present instead of being docked a half day.",
    listColumns: ["name", "closure_date", "close_time", "reason", "rows_corrected"],
    fields: [
      ["closure_date", "Date", "Date", "", "reqd,lv"],
      ["cb_top", "", "Column Break"],
      ["close_time", "Office Closed At", "Time", "", "reqd,lv"],
      ["sb_reason", "", "Section Break"],
      ["reason", "Reason", "Small Text", "", "reqd,lv"],
      ["sb_adv", "Advanced", "Section Break"],
      ["minimum_hours", "Minimum Hours To Stay Present", "Float"],
      ["cb_adv", "", "Column Break"],
      ["company", "Company", "Link", "Company"],
      ["sb_log", "What This Changed", "Section Break"],
      ["last_applied_on", "Last Applied On", "Datetime", "", "ro"],
      ["cb_log", "", "Column Break"],
      ["rows_corrected", "Attendance Rows Corrected", "Int", "", "ro,lv"],
      ["apply_log", "Log", "Small Text", "", "ro"]
    ],
    actions: [{ label: "Apply to attendance", role: ["HR", "Admin"], primary: true }]
  },

  "Expense Claim": {
    label: "Expense Claim", plural: "Expense Claims", icon: "⌸",
    naming: "EXP-2026-####", submittable: true,
    listColumns: ["name", "employee_name", "posting_date", "total_claimed_amount", "approval_status", "status"],
    filters: [["approval_status", "Approval Status"], ["status", "Status"]],
    fields: [
      ["employee", "Employee", "Link", "Employee", "reqd"],
      ["employee_name", "Employee Name", "Data", "", "ro,lv"],
      ["posting_date", "Date", "Date", "", "reqd,lv"],
      ["col_1", "", "Column Break"],
      ["approval_status", "Approval Status", "Select", "Draft\nApproved\nRejected", "lv"],
      ["status", "Status", "Select", "Draft\nUnpaid\nPaid\nRejected", "ro,lv"],
      ["expense_approver", "Expense Approver", "Link", "User", "reqd"],
      ["sb_exp", "Expenses", "Section Break"],
      ["expenses", "Expenses", "Table", "Expense Row", "reqd"],
      ["sb_tot", "Totals", "Section Break"],
      ["total_claimed_amount", "Total Claimed Amount", "Currency", "", "ro,lv"],
      ["total_sanctioned_amount", "Total Sanctioned Amount", "Currency", "", "ro"]
    ],
    actions: [{ label: "Approve", role: ["HR", "Admin"], primary: true }, { label: "Reject", role: ["HR", "Admin"] }]
  },
  "Expense Row": {
    label: "Expense", child: true,
    fields: [
      ["expense_date", "Date", "Date", "", "reqd,lv"],
      ["expense_type", "Expense Claim Type", "Link", "Expense Claim Type", "reqd,lv"],
      ["description", "Description", "Small Text", "", "lv"],
      ["amount", "Amount", "Currency", "", "reqd,lv"],
      ["sanctioned_amount", "Sanctioned Amount", "Currency", "", "lv"]
    ]
  },

  "Salary Slip": {
    label: "Salary Slip", plural: "Salary Slips", icon: "□",
    naming: "SAL-2026-####", submittable: true,
    blurb: "Payment days are what make a slip equal the attendance sheet: unmarked days are not paid, and half days are counted at half.",
    listColumns: ["name", "employee_name", "start_date", "payment_days", "gross_pay", "net_pay", "docstatus"],
    filters: [["docstatus", "Status"]],
    fields: [
      ["employee", "Employee", "Link", "Employee", "reqd"],
      ["employee_name", "Employee Name", "Data", "", "ro,lv"],
      ["col_1", "", "Column Break"],
      ["start_date", "From Date", "Date", "", "reqd,lv"],
      ["end_date", "To Date", "Date", "", "reqd"],
      ["sb_days", "Attendance", "Section Break"],
      ["total_working_days", "Working Days", "Float", "", "ro"],
      ["leave_without_pay", "Leave Without Pay", "Float", "", "ro"],
      ["absent_days", "Absent Days", "Float", "", "ro"],
      ["col_2", "", "Column Break"],
      ["payment_days", "Payment Days", "Float", "", "ro,lv"],
      ["sb_earn", "Earnings & Deductions", "Section Break"],
      ["earnings", "Earnings", "Table", "Salary Detail"],
      ["deductions", "Deductions", "Table", "Salary Detail"],
      ["sb_tot", "Totals", "Section Break"],
      ["gross_pay", "Gross Pay", "Currency", "", "ro,lv"],
      ["total_deduction", "Total Deduction", "Currency", "", "ro"],
      ["col_3", "", "Column Break"],
      ["net_pay", "Net Pay", "Currency", "", "ro,lv"]
    ],
    actions: [{ label: "Submit", role: ["HR", "Admin"], primary: true }, { label: "Email Slip", role: ["HR", "Admin"] }]
  },
  "Salary Detail": {
    label: "Salary Component", child: true,
    fields: [
      ["salary_component", "Salary Component", "Link", "Salary Component", "reqd,lv"],
      ["amount", "Amount", "Currency", "", "reqd,lv"]
    ]
  },

  "Employee Checkin": {
    label: "Check-in / Check-out", plural: "Employee Check-ins", icon: "⏲",
    naming: "CHK-#####",
    blurb: "Raw punches from the geofenced punch widget. The geofence lives on the shift assignment, not on the shift type.",
    listColumns: ["name", "employee_name", "time", "log_type", "device_id", "shift"],
    filters: [["log_type", "Log Type"]],
    fields: [
      ["employee", "Employee", "Link", "Employee", "reqd"],
      ["employee_name", "Employee Name", "Data", "", "ro,lv"],
      ["time", "Time", "Datetime", "", "reqd,lv"],
      ["col_1", "", "Column Break"],
      ["log_type", "Log Type", "Select", "IN\nOUT", "lv"],
      ["device_id", "Device", "Data", "", "lv"],
      ["shift", "Shift", "Link", "Shift Type", "lv"]
    ]
  },

  "Shift Assignment": {
    label: "Shift Assignment", plural: "Shift Assignments", icon: "◔",
    naming: "SHA-2026-####", submittable: true,
    blurb: "Where the geofence for the punch widget is configured - per person, per period.",
    listColumns: ["name", "employee_name", "shift_type", "start_date", "end_date", "status"],
    filters: [["shift_type", "Shift Type"], ["status", "Status"]],
    fields: [
      ["employee", "Employee", "Link", "Employee", "reqd"],
      ["employee_name", "Employee Name", "Data", "", "ro,lv"],
      ["shift_type", "Shift Type", "Link", "Shift Type", "reqd,lv"],
      ["col_1", "", "Column Break"],
      ["start_date", "From Date", "Date", "", "reqd,lv"],
      ["end_date", "To Date", "Date", "", "lv"],
      ["status", "Status", "Select", "Active\nInactive", "lv"],
      ["sb_geo", "Geofence", "Section Break"],
      ["geofence_lat", "Latitude", "Data"],
      ["geofence_lon", "Longitude", "Data"],
      ["col_2", "", "Column Break"],
      ["geofence_radius", "Allowed Radius (m)", "Int"]
    ]
  }
  };

  /* Indicator colour per status value, used by list, kanban and form. */
  D.indicators = {
    "Order Placed": "grey", "With Accounts": "amber", "Ready to Dispatch": "blue",
    "Dispatched": "purple", "Delivered": "green", "Closed": "grey",
    "Order Received": "grey", "Packing": "amber", "Shipped": "blue",
    "In Transit": "purple", "Delivery": "cyan", "Completed": "green",
    "Lead Received": "grey", "Catalog Sent": "blue", "Follow Up": "amber",
    "Sample Sent": "purple", "Not Reachable": "cyan", "Future Customer": "amber",
    "Not Interested": "red", "1st Order": "green", "2nd Order": "green",
    "3rd Order": "green", "Regular Customer": "pink", "Irrelevant": "grey",
    "To Do": "grey", "In Progress": "amber", "Under Review": "purple",
    "Done": "green", "On Hold": "amber", "Cancelled": "red",
    "Created": "blue", "Under Process": "amber", "Resolved": "green",
    "Draft": "grey", "Open": "amber", "Ordered": "green", "Expired": "grey", "Lost": "red",
    "Pending": "amber", "Approved": "green", "Rejected": "red",
    "Present": "green", "Absent": "red", "Half Day": "amber",
    "On Leave": "blue", "Work From Home": "purple",
    "Active": "green", "Inactive": "grey", "Suspended": "amber", "Left": "grey",
    "Paid": "green", "Unpaid": "amber", "Overdue": "red",
    "To Bill": "amber", "To Receive": "amber", "To Receive and Bill": "amber",
    "Return Issued": "purple", "Economy": "grey", "Standard": "blue", "Express": "purple",
    "Low": "grey", "Medium": "blue", "High": "amber", "Urgent": "red",
    "India": "blue", "International": "purple", "Hot": "red", "Warm": "amber", "Cold": "cyan",
    "Receive": "green", "Pay": "amber", "Material Receipt": "green", "Material Issue": "amber",
    "Material Transfer": "blue", "IN": "green", "OUT": "amber", "Yes": "green", "No": "grey"
  };
})(window.DEMO = window.DEMO || {});
