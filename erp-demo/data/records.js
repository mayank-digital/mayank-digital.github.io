/* Demo ERP - sample records.
 * EVERY value below is invented for this demo: people, companies, phone
 * numbers, e-mail addresses, GST references, amounts, dates and messages.
 * Nothing here is copied from any live system. Document numbers use a neutral
 * series (SO-2026-0001, DN-2026-0001, EMP-001).
 */
(function (D) {
  D.TODAY = "2026-06-18";
  /* The demo company. Invented, and marked (Demo) so it can never be mistaken
   * for a real firm. The app itself is called "Demo ERP". */
  D.COMPANY = "Saptarang Prints Pvt Ltd (Demo)";
  D.COMPANY_GSTIN = "DEMO-GSTIN-07A";
  D.CURRENCY = "INR";
  /* Phone numbers are Indian in shape but MASKED: the middle five digits are
   * literal X. No string in this demo contains a ten-digit run, so nothing
   * here can ever be dialled. */
  /* A GST state code plus a letter. Deliberately NOT a 15-character GSTIN:
   * the real format is checksummed, and a demo should not carry anything that
   * could pass a format check. */
  D.gstTail = function (i) {
    var codes = ["07", "24", "27", "29", "33", "36", "06", "09", "19", "21", "23", "32",
                 "08", "05", "03", "10", "18", "22", "20", "28", "02", "04", "12", "13"];
    return codes[i % codes.length] + "ABCDEFGHJKLMNPQRSTUVWXY".charAt(i % 23);
  };
  /* Round money to paise. Without this, binary floating point leaves tails
   * like 68439.99999999999 in the data - harmless on screen, because the
   * formatter rounds, but it puts an eleven-digit run into the file and that
   * is exactly the shape the leak checks look for. */
  D.r2 = function (v) { return Math.round((Number(v) || 0) * 100) / 100; };
  D.phone = function (n, alt) { return "+91 " + (alt ? "97" : "98") + "XXX XX" + String(n).padStart(3, "0"); };

  /* ---------------- people (invented) ---------------- */
  D.people = [
    { id: "aniket.bhardwaj@example.com",     name: "Aniket Bhardwaj",      emp: "EMP-001", desig: "Director",            dept: "Management", role: "Admin",    joined: "2021-04-01" },
    { id: "anirudh.balasubramanian@example.com",     name: "Anirudh Balasubramanian",      emp: "EMP-002", desig: "Sales Manager",       dept: "Sales",      role: "Sales",    joined: "2022-06-15" },
    { id: "chinmay.bhagwat@example.com",    name: "Chinmay Bhagwat",     emp: "EMP-003", desig: "Sales Executive",     dept: "Sales",      role: "Sales",    joined: "2023-02-01" },
    { id: "abhijit.bandyopadhyay@example.com",  name: "Abhijit Bandyopadhyay",   emp: "EMP-004", desig: "Sales Executive",     dept: "Sales",      role: "Sales",    joined: "2024-09-09" },
    { id: "devansh.chaturvedi@example.com",    name: "Devansh Chaturvedi",     emp: "EMP-005", desig: "Accounts Manager",    dept: "Accounts",   role: "Accounts", joined: "2022-01-10" },
    { id: "karthikeyan.chandrasekhar@example.com",      name: "Karthikeyan Chandrasekhar",       emp: "EMP-006", desig: "Accounts Assistant",  dept: "Accounts",   role: "Accounts", joined: "2024-03-18" },
    { id: "jayesh.chitnis@example.com",  name: "Jayesh Chitnis",   emp: "EMP-007", desig: "Dispatch Manager",    dept: "Dispatch",   role: "Dispatch", joined: "2022-08-22" },
    { id: "debashish.chakraborty@example.com",   name: "Debashish Chakraborty",    emp: "EMP-008", desig: "Store Assistant",     dept: "Dispatch",   role: "Dispatch", joined: "2025-01-06" },
    { id: "ishaan.dhingra@example.com",    name: "Ishaan Dhingra",     emp: "EMP-009", desig: "HR Manager",          dept: "Human Resources", role: "HR",  joined: "2023-05-02" },
    { id: "narayanan.doraiswamy@example.com",   name: "Narayanan Doraiswamy",    emp: "EMP-010", desig: "HR Executive",        dept: "Human Resources", role: "HR",  joined: "2025-07-14" }
  ];
  D.personByName = function (n) { for (var i = 0; i < D.people.length; i++) if (D.people[i].name === n) return D.people[i]; return null; };

  /* ---------------- roles the switcher offers ---------------- */
  D.roles = [
    { key: "Sales",    label: "Sales",             as: "Chinmay Bhagwat",   erp: ["Sales User", "Employee", "Desk User"],
      note: "Sees the sales console, their own leads and the whole order book. Cannot open Payables, Receivables or the GST screens." },
    { key: "SalesMgr", label: "Sales Manager",     as: "Anirudh Balasubramanian",    erp: ["Sales Manager", "Sales User", "Employee"],
      note: "Everything a sales user sees, plus everybody's numbers in Insights instead of only their own." },
    { key: "Accounts", label: "Accounts",          as: "Devansh Chaturvedi",   erp: ["Accounts Manager", "Accounts User", "Employee"],
      note: "Billing desk, payments desk and statistics. Payment Entry is read-only for sales by decision, so money is recorded here." },
    { key: "Dispatch", label: "Dispatch / Stock",  as: "Jayesh Chitnis", erp: ["Stock Manager", "Stock User", "Dispatch Viewer", "Employee"],
      note: "The dispatch console, stock in and out, returns and the courier rate cards." },
    { key: "HR",       label: "HR",                as: "Ishaan Dhingra",   erp: ["HR Manager", "HR User", "Employee"],
      note: "The attendance register, leave approvals, corrections, expense claims and payroll." },
    { key: "Employee", label: "Employee (self-service)", as: "Debashish Chakraborty", erp: ["Employee", "Desk User"],
      note: "Only the self-service pages: punch in and out, my attendance, my leave, my documents and the chat desk." },
    { key: "Admin",    label: "Administrator",     as: "Aniket Bhardwaj",    erp: ["System Manager"],
      note: "Every page, including Purchase & Import, Payables, Receivables, Financial Reports, GST and the settings workspaces." }
  ];

  /* ---------------- masters ---------------- */
  D.suppliers = [
    { supplier_name: "Lavanika Overseas Pvt Ltd",  contact_person: "Lavanya Ramaswamy", mobile_no: D.phone(401), city: "Mumbai",    supplier_group: "Importer",  gstin: "DEMO-GSTIN-27B", disabled: 0, shipments: 14, last_inward: "2026-06-11" },
    { supplier_name: "Mrudula Inks & Chemicals",        contact_person: "Madhura Ranade",   mobile_no: D.phone(402), city: "Ahmedabad", supplier_group: "Local",     gstin: "DEMO-GSTIN-24C", disabled: 0, shipments: 23, last_inward: "2026-06-16" },
    { supplier_name: "Neelkamal Polymers Pvt Ltd",    contact_person: "Indrani Talukdar",       mobile_no: D.phone(403), city: "Chennai",   supplier_group: "Importer",  gstin: "DEMO-GSTIN-33D", disabled: 0, shipments: 9,  last_inward: "2026-05-29" },
    { supplier_name: "Oorjita Packaging Industries",  contact_person: "Diksha Talwar",     mobile_no: D.phone(404), city: "Vadodara",  supplier_group: "Local",     gstin: "DEMO-GSTIN-24E", disabled: 0, shipments: 7,  last_inward: "2026-06-02" },
    { supplier_name: "Prabhavati Chemicals Pvt Ltd",       contact_person: "Meenakshi Seshadri",      mobile_no: D.phone(405), city: "Pune",      supplier_group: "Local",     gstin: "DEMO-GSTIN-27F", disabled: 1, shipments: 2,  last_inward: "2025-11-20" }
  ];

  D.transporters = [
    { transporter_name: "Rohinee Roadlines Pvt Ltd",   contact_person: "Pallavi Sabnis",  mobile_no: D.phone(501), city: "Pune",      disabled: 0, rates: 18, last_used: "2026-06-17", tracking_url: "tracking page (demo)" },
    { transporter_name: "Shubhankar Cargo Movers",         contact_person: "Madhumita Bhattacharjee",  mobile_no: D.phone(502), city: "Sonipat",     disabled: 0, rates: 24, last_used: "2026-06-16", tracking_url: "tracking page (demo)" },
    { transporter_name: "Tulsivan Parcel Express", contact_person: "Garima Uppal", mobile_no: D.phone(503), city: "Bengaluru", disabled: 0, rates: 11, last_used: "2026-06-12", tracking_url: "tracking page (demo)" },
    { transporter_name: "Umarang Logistics Pvt Ltd",      contact_person: "Revathi Thyagarajan", mobile_no: D.phone(504), city: "Erode",     disabled: 0, rates: 6,  last_used: "2026-06-09", tracking_url: "" },
    { transporter_name: "Vrindavan Transport Co",      contact_person: "Shubhangi Talpade",   mobile_no: D.phone(505), city: "Guwahati",  disabled: 1, rates: 4,  last_used: "2026-02-14", tracking_url: "" }
  ];

  D.zones = [
    { zone_name: "Zone A - West",   states: "Maharashtra, Gujarat, Goa", notes: "Base zone. Door delivery on all three." },
    { zone_name: "Zone B - North",  states: "Sonipat, Haryana, Punjab, Uttar Pradesh, Rajasthan, Uttarakhand", notes: "Terminal delivery outside the metros." },
    { zone_name: "Zone C - South",  states: "Karnataka, Tamil Nadu, Kerala, Telangana, Andhra Pradesh", notes: "" },
    { zone_name: "Zone D - East",   states: "West Bengal, Odisha, Bihar", notes: "" },
    { zone_name: "Zone NE",         states: "Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, Tripura",
      notes: "One sheet cell covered eight states. Carried as an explicit override so a reader can see what was decided. Jammu & Kashmir is still unpriced." }
  ];

  D.items = [
    { item_code: "PGI-CYAN-1L", item_name: "Pigment Ink - Cyan",    custom_sku_variant: "1 litre bottle",  item_group: "Inks",      stock_uom: "Litre", reorder_level: 40, on_hand: 128, valuation_rate: 1850, standard_rate: 2400, custom_units_per_package: 6,  has_batch_no: 1, gst_hsn_code: "32151900", disabled: 0 },
    { item_code: "PGI-MGTA-1L", item_name: "Pigment Ink - Magenta", custom_sku_variant: "1 litre bottle",  item_group: "Inks",      stock_uom: "Litre", reorder_level: 40, on_hand: 96,  valuation_rate: 1850, standard_rate: 2400, custom_units_per_package: 6,  has_batch_no: 1, gst_hsn_code: "32151900", disabled: 0 },
    { item_code: "PGI-YLLW-1L", item_name: "Pigment Ink - Yellow",  custom_sku_variant: "1 litre bottle",  item_group: "Inks",      stock_uom: "Litre", reorder_level: 40, on_hand: 31,  valuation_rate: 1850, standard_rate: 2400, custom_units_per_package: 6,  has_batch_no: 1, gst_hsn_code: "32151900", disabled: 0 },
    { item_code: "PGI-BLCK-1L", item_name: "Pigment Ink - Black",   custom_sku_variant: "1 litre bottle",  item_group: "Inks",      stock_uom: "Litre", reorder_level: 50, on_hand: 164, valuation_rate: 1790, standard_rate: 2300, custom_units_per_package: 6,  has_batch_no: 1, gst_hsn_code: "32151900", disabled: 0 },
    { item_code: "PGI-WHTE-5L", item_name: "Pigment Ink - White",   custom_sku_variant: "5 litre can",     item_group: "Inks",      stock_uom: "Litre", reorder_level: 60, on_hand: 58,  valuation_rate: 2100, standard_rate: 2750, custom_units_per_package: 2,  has_batch_no: 1, gst_hsn_code: "32151900", disabled: 0 },
    { item_code: "TFR-24-MATT", item_name: "Transfer Film Roll 24in", custom_sku_variant: "Double matte, 100 m", item_group: "Films", stock_uom: "Roll",  reorder_level: 25, on_hand: 72,  valuation_rate: 3100, standard_rate: 3950, custom_units_per_package: 1,  has_batch_no: 1, gst_hsn_code: "39209999", disabled: 0 },
    { item_code: "TFR-30-MATT", item_name: "Transfer Film Roll 30in", custom_sku_variant: "Double matte, 100 m", item_group: "Films", stock_uom: "Roll",  reorder_level: 20, on_hand: 18,  valuation_rate: 3700, standard_rate: 4600, custom_units_per_package: 1,  has_batch_no: 1, gst_hsn_code: "39209999", disabled: 0 },
    { item_code: "TFR-60-GLSS", item_name: "Transfer Film Roll 60in", custom_sku_variant: "Gloss, 100 m",        item_group: "Films", stock_uom: "Roll",  reorder_level: 10, on_hand: 24,  valuation_rate: 6400, standard_rate: 7900, custom_units_per_package: 1,  has_batch_no: 1, gst_hsn_code: "39209999", disabled: 0 },
    { item_code: "AHP-MELT-25",  item_name: "Adhesive Powder - Hot Melt", custom_sku_variant: "25 kg sack",      item_group: "Powders", stock_uom: "Kg",   reorder_level: 200, on_hand: 625, valuation_rate: 210,  standard_rate: 290,  custom_units_per_package: 1,  has_batch_no: 1, gst_hsn_code: "35069190", disabled: 0 },
    { item_code: "AHP-MELT-05",  item_name: "Adhesive Powder - Hot Melt", custom_sku_variant: "5 kg pouch",      item_group: "Powders", stock_uom: "Kg",   reorder_level: 100, on_hand: 85,  valuation_rate: 225,  standard_rate: 320,  custom_units_per_package: 5,  has_batch_no: 1, gst_hsn_code: "35069190", disabled: 0 },
    { item_code: "CSN-WASH-5L", item_name: "Cleaning Solution",     custom_sku_variant: "5 litre can",     item_group: "Consumables", stock_uom: "Litre", reorder_level: 30, on_hand: 44,  valuation_rate: 480,  standard_rate: 690,  custom_units_per_package: 4, has_batch_no: 0, gst_hsn_code: "34029099", disabled: 0 },
    { item_code: "CSN-WASH-1L", item_name: "Cleaning Solution",     custom_sku_variant: "1 litre bottle",  item_group: "Consumables", stock_uom: "Litre", reorder_level: 50, on_hand: 12,  valuation_rate: 520,  standard_rate: 760,  custom_units_per_package: 12, has_batch_no: 0, gst_hsn_code: "34029099", disabled: 0 },
    { item_code: "ACC-BLADE-10", item_name: "Squeegee Blade",        custom_sku_variant: "Pack of 10",      item_group: "Accessories", stock_uom: "Nos",  reorder_level: 0,  on_hand: 140, valuation_rate: 95,   standard_rate: 180,  custom_units_per_package: 10, has_batch_no: 0, gst_hsn_code: "82089000", disabled: 0 },
    { item_code: "TFR-16-MATT", item_name: "Transfer Film Roll 16in", custom_sku_variant: "Double matte, 50 m", item_group: "Films", stock_uom: "Roll",   reorder_level: 0,  on_hand: 0,   valuation_rate: 1900, standard_rate: 2450, custom_units_per_package: 1, has_batch_no: 1, gst_hsn_code: "39209999", disabled: 1 }
  ];

  /* ---------------- customers (invented businesses) ---------------- */
  var CUST = [
    ["Suvarna Prints Pvt Ltd",   "Kaustubh Deshpande",     "Pune",       "Maharashtra",   "411038", "Printing Machine Owner",   "Anirudh Balasubramanian",     1],
    ["Nandanvan Traders",  "Himadri Dasgupta",   "Erode",      "Gujarat",       "395003", "Distributor & Wholesaler", "Chinmay Bhagwat",    1],
    ["Trishula Garments",   "Lakshay Grewal",     "Sonipat",      "Sonipat",         "110015", "Machine Owner & Supplier", "Anirudh Balasubramanian",     1],
    ["Kalanjali Enterprises",       "Prasanth Ganapathy",  "Kanpur",     "Uttar Pradesh", "208012", "Printing Machine Owner",   "Abhijit Bandyopadhyay",  1],
    ["Vaitarna Printers",        "Omkar Gokhale",   "Kochi",      "Kerala",        "682025", "Printing Machine Owner",   "Chinmay Bhagwat",    1],
    ["Girimitra Apparels",      "Joydeep Gangopadhyay",   "Ahmedabad",  "Gujarat",       "380009", "Distributor & Wholesaler", "Anirudh Balasubramanian",     1],
    ["Shilaroop Fabrics",   "Naman Juneja",     "Mumbai",     "Maharashtra",   "400058", "Importer",                 "Abhijit Bandyopadhyay",  1],
    ["Tamravarna Graphics Pvt Ltd",      "Raghavan Iyengar",    "Bengaluru",  "Karnataka",     "560043", "Printing Machine Owner",   "Chinmay Bhagwat",    1],
    ["Chitrakala Textiles Pvt Ltd",      "Sarvesh Jadhav",      "Hubballi",   "Karnataka",     "580029", "Middleman",                "Abhijit Bandyopadhyay",  0],
    ["Rangavalli Prints",    "Kaustav Hazarika",   "Haldia",    "West Bengal",   "700019", "Distributor & Wholesaler", "Anirudh Balasubramanian",     1],
    ["Panchvati Industries",  "Rudra Khurana",  "Bhubaneswar","Odisha",        "751010", "Printing Machine Owner",   "Chinmay Bhagwat",    1],
    ["Madhuvan Agencies",     "Sathish Krishnamurthy",  "Panipat",   "Punjab",        "141002", "Machine Owner & Supplier", "Abhijit Bandyopadhyay",  1],
    ["Nilambari Textiles",      "Tushar Kelkar",   "Nagpur",     "Maharashtra",   "440010", "Printing Machine Owner",   "Anirudh Balasubramanian",     0],
    ["Hemadri Apparels",   "Nabarun Mazumdar",    "Jaipur",     "Rajasthan",     "302017", "Middleman",                "Chinmay Bhagwat",    1]
  ];
  D.customers = CUST.map(function (c, i) {
    return {
      name: c[0], customer_name: c[0], custom_contact_name: c[1],
      custom_mobile_no: D.phone(101 + i),
      custom_call_number: i % 3 === 0 ? D.phone(151 + i, true) : "",
      custom_city: c[2], custom_state: c[3], custom_pincode: c[4],
      custom_address: "Unit " + (3 + i) + ", Demo Industrial Area Phase II, " + c[2],
      gstin: "DEMO-GSTIN-" + D.gstTail(i), customer_group: "Commercial", territory: "India",
      owner_name: c[6], custom_customer_type: c[5], custom_lead_category: "India",
      custom_product_interest: ["Pigment Ink", "Transfer Film Roll", "Ink + Roll + Powder", "Adhesive Powder", "Cleaning Solution"][i % 5],
      custom_ink_rate: 2300 + (i % 4) * 50, custom_roll_rate: 3850 + (i % 3) * 100, custom_powder_rate: 280 + (i % 5) * 5,
      disabled: c[7] ? 0 : 1
    };
  });

  /* ---------------- leads ---------------- */
  var LEADS = [
    ["Suvarna Prints Pvt Ltd",  "Kaustubh Deshpande",    "Pune",       "Maharashtra",   "Regular Customer", "Anirudh Balasubramanian",    "Hot",  "Printing Machine Owner",   "Ink + Roll + Powder", "Referral"],
    ["Nandanvan Traders", "Himadri Dasgupta",  "Erode",      "Gujarat",       "3rd Order",        "Chinmay Bhagwat",   "Hot",  "Distributor & Wholesaler", "Transfer Film Roll",  "Exhibition"],
    ["Trishula Garments",  "Lakshay Grewal",    "Sonipat",      "Sonipat",         "2nd Order",        "Anirudh Balasubramanian",    "Warm", "Machine Owner & Supplier", "Pigment Ink",         "Website"],
    ["Kalanjali Enterprises",      "Prasanth Ganapathy", "Kanpur",     "Uttar Pradesh", "1st Order",        "Abhijit Bandyopadhyay", "Warm", "Printing Machine Owner",   "Ink + Roll",          "Walk In"],
    ["Vaitarna Printers",       "Omkar Gokhale",  "Kochi",      "Kerala",        "1st Order",        "Chinmay Bhagwat",   "Warm", "Printing Machine Owner",   "Adhesive Powder",     "Referral"],
    ["Varnika Apparels",  "Shaurya Lamba",   "Nashik",     "Maharashtra",   "Sample Sent",      "Abhijit Bandyopadhyay", "Hot",  "Printing Machine Owner",   "Ink + Roll + Powder", "Website"],
    ["Kanchanrekha Fabrics",       "Vignesh Lakshmanan", "Gurugram",   "Haryana",       "Follow Up",        "Chinmay Bhagwat",   "Warm", "Distributor & Wholesaler", "Transfer Film Roll",  "Cold Call"],
    ["Ujjwalam Graphics Pvt Ltd",    "Bhakti Limaye",  "Indore",     "Madhya Pradesh","Follow Up",        "Anirudh Balasubramanian",    "Hot",  "Printing Machine Owner",   "Pigment Ink",         "Exhibition"],
    ["Tarangini Textiles Pvt Ltd",    "Pritam Nandy",    "Guwahati",   "Assam",         "Catalog Sent",     "Abhijit Bandyopadhyay", "Cold", "Middleman",               "Cleaning Solution",   "Website"],
    ["Pushpagiri Prints",   "Tanmay Nagpal",   "Siliguri",   "West Bengal",   "Catalog Sent",     "Chinmay Bhagwat",   "Warm", "Printing Machine Owner",   "Ink + Roll",          "Referral"],
    ["Himvanta Industries",    "Deepthi Mahadevan","Rajkot",   "Gujarat",       "Lead Received",    "Abhijit Bandyopadhyay", "Warm", "Distributor & Wholesaler", "Ink + Roll + Powder", "Website"],
    ["Vasundhara Agencies",       "Chaitali Marathe",    "Chandigarh", "Punjab",        "Lead Received",    "Anirudh Balasubramanian",    "Cold", "Printing Machine Owner",   "Pigment Ink",         "Cold Call"],
    ["Anantara Textiles","Subhasis Palit",    "Hyderabad",  "Telangana",     "Lead Received",    "Chinmay Bhagwat",   "Hot",  "Importer",                "Transfer Film Roll",  "Exhibition"],
    ["Megharanjan Apparels",  "Yashvardhan Phogat",  "Mangaluru",  "Karnataka",     "Not Reachable",    "Abhijit Bandyopadhyay", "Cold", "Middleman",               "Adhesive Powder",     "Cold Call"],
    ["Sindhuja Prints Pvt Ltd", "Gayathri Natarajan",     "Dehradun",   "Uttarakhand",   "Not Reachable",    "Chinmay Bhagwat",   "Cold", "Printing Machine Owner",   "Cleaning Solution",   "Website"],
    ["Dharitri Traders",       "Dhanashree Nimkar",  "Thrissur",   "Kerala",        "Future Customer",  "Anirudh Balasubramanian",    "Warm", "Printing Machine Owner",   "Ink + Roll",          "Referral"],
    ["Suryanshi Garments",    "Bipasha Roychowdhury",  "Jodhpur",    "Rajasthan",     "Future Customer",  "Abhijit Bandyopadhyay", "Cold", "Distributor & Wholesaler", "Pigment Ink",         "Walk In"],
    ["Amrapali Enterprises",  "Bhavika Rawat",   "Vadodara",   "Gujarat",       "Not Interested",   "Chinmay Bhagwat",   "Cold", "Middleman",               "Transfer Film Roll",  "Cold Call"],
    ["Chandanvan Printers",             "Kalyani Padmanabhan",  "Kolhapur",   "Maharashtra",   "Not Interested",   "Anirudh Balasubramanian",    "Cold", "Printing Machine Owner",   "Adhesive Powder",     "Website"],
    ["Girimitra Apparels",     "Joydeep Gangopadhyay",  "Ahmedabad",  "Gujarat",       "Regular Customer", "Anirudh Balasubramanian",    "Hot",  "Distributor & Wholesaler", "Ink + Roll + Powder", "Referral"],
    ["Shilaroop Fabrics",  "Naman Juneja",    "Mumbai",     "Maharashtra",   "2nd Order",        "Abhijit Bandyopadhyay", "Hot",  "Importer",                "Pigment Ink",         "Exhibition"],
    ["Tamravarna Graphics Pvt Ltd",     "Raghavan Iyengar",   "Bengaluru",  "Karnataka",     "3rd Order",        "Chinmay Bhagwat",   "Hot",  "Printing Machine Owner",   "Ink + Roll",          "Website"],
    ["Rangavalli Prints",   "Kaustav Hazarika",  "Haldia",    "West Bengal",   "Regular Customer", "Anirudh Balasubramanian",    "Warm", "Distributor & Wholesaler", "Transfer Film Roll",  "Referral"],
    ["Indrayani Apparels",     "Ketaki Pardeshi",    "Lucknow",    "Uttar Pradesh", "Irrelevant",       "Chinmay Bhagwat",   "Cold", "Middleman",               "Cleaning Solution",   "Cold Call"],
    ["Jalaneel Fabrics",   "Chandrima Sengupta",     "Dubai",      "",              "Sample Sent",      "Anirudh Balasubramanian",    "Hot",  "Importer",                "Ink + Roll + Powder", "Website"],
    ["Kamalini Graphics Pvt Ltd", "Charvi Sachdeva",   "Sharjah",    "",              "Catalog Sent",     "Abhijit Bandyopadhyay", "Warm", "Importer",                "Transfer Film Roll",  "Exhibition"]
  ];
  D.leads = LEADS.map(function (l, i) {
    var intl = l[3] === "";
    var ink = [0, 20, 40, 60, 80][i % 5], roll = [0, 5, 10, 15, 25][i % 5], pwd = [0, 50, 100, 150, 200][i % 5];
    return {
      name: "LEAD-2026-" + String(1001 + i),
      lead_name: l[1], company_name: l[0],
      custom_city: l[2], custom_state: l[3],
      custom_stage: l[4], lead_owner: l[5], custom_lead_temperature: l[6],
      custom_customer_type: l[7], custom_product_interest: l[8], source: l[9],
      custom_lead_category: intl ? "International" : "India",
      mobile_no: D.phone(201 + i), email_id: "contact" + (i + 1) + "@example.com",
      custom_website: "", custom_gstin: intl ? "" : "DEMO-GSTIN-" + D.gstTail(i + 14),
      custom_address: intl ? "PO Box " + (1200 + i) + ", Demo Free Trade Zone" : "Shop " + (2 + i) + ", Demo Market Complex, " + l[2],
      custom_pincode: intl ? "" : "4" + (10000 + i * 37),
      custom_country: intl ? "United Arab Emirates" : "India",
      custom_intl_state: intl ? "Demo Emirate" : "",
      custom_next_followup: ["2026-06-19 11:00:00", "2026-06-20 16:30:00", "2026-06-23 10:00:00", "", "2026-06-25 15:00:00"][i % 5],
      custom_ink_qty: ink, custom_ink_rate: ink ? 2350 : 0,
      custom_roll_qty: roll, custom_roll_rate: roll ? 3900 : 0,
      custom_powder_qty: pwd, custom_powder_rate: pwd ? 285 : 0,
      custom_est_value: ink * 2350 + roll * 3900 + pwd * 285,
      custom_reason: l[4] === "Not Interested" ? "Buying from a local supplier at a lower landed rate." :
        (l[4] === "Irrelevant" ? "Not in this trade - reached us by mistake." : ""),
      custom_convert_to_customer: 0,
      custom_customer_created: ["1st Order", "2nd Order", "3rd Order", "Regular Customer"].indexOf(l[4]) >= 0 ? 1 : 0
    };
  });

  /* ---------------- sales orders ---------------- */
  var ORD = [
    /* cust idx, date, stage, dispatch, terms, person, lines [[item, qty, rate]] */
    [0,  "2026-06-17", "Order Placed",       "Order Received", "Advance",      "Anirudh Balasubramanian",    [["PGI-CYAN-1L", 12, 2350], ["PGI-MGTA-1L", 12, 2350]], 1, 0],
    [1,  "2026-06-17", "Order Placed",       "Order Received", "Part Advance", "Chinmay Bhagwat",   [["TFR-24-MATT", 8, 3900]], 1, 0],
    [2,  "2026-06-16", "With Accounts",      "Order Received", "Credit",       "Anirudh Balasubramanian",    [["PGI-BLCK-1L", 24, 2280], ["AHP-MELT-25", 150, 285]], 1, 0],
    [3,  "2026-06-16", "With Accounts",      "Order Received", "Advance",      "Abhijit Bandyopadhyay", [["TFR-30-MATT", 6, 4550], ["CSN-WASH-5L", 4, 690]], 1, 0],
    [4,  "2026-06-15", "With Accounts",      "Order Received", "COD",          "Chinmay Bhagwat",   [["AHP-MELT-05", 60, 320]], 0, 0],
    [5,  "2026-06-15", "Ready to Dispatch",  "Packing",        "Advance",      "Anirudh Balasubramanian",    [["PGI-WHTE-5L", 20, 2700], ["TFR-60-GLSS", 3, 7900]], 1, 1],
    [6,  "2026-06-14", "Ready to Dispatch",  "Packing",        "Part Advance", "Abhijit Bandyopadhyay", [["PGI-YLLW-1L", 18, 2350]], 1, 1],
    [7,  "2026-06-13", "Dispatched",         "In Transit",     "Advance",      "Chinmay Bhagwat",   [["TFR-24-MATT", 14, 3900], ["AHP-MELT-25", 200, 280]], 1, 1],
    [9,  "2026-06-12", "Dispatched",         "Shipped",        "Credit",       "Anirudh Balasubramanian",    [["PGI-CYAN-1L", 10, 2400], ["PGI-MGTA-1L", 10, 2400], ["PGI-YLLW-1L", 10, 2400]], 1, 1],
    [10, "2026-06-11", "Dispatched",         "Delivery",       "COD",          "Chinmay Bhagwat",   [["CSN-WASH-1L", 24, 760]], 0, 1],
    [11, "2026-06-10", "Delivered",          "Completed",      "Advance",      "Abhijit Bandyopadhyay", [["TFR-30-MATT", 10, 4600], ["ACC-BLADE-10", 5, 180]], 1, 1],
    [0,  "2026-06-09", "Delivered",          "Completed",      "Advance",      "Anirudh Balasubramanian",    [["AHP-MELT-25", 300, 275]], 1, 1],
    [1,  "2026-06-06", "Delivered",          "Completed",      "Part Advance", "Chinmay Bhagwat",   [["PGI-BLCK-1L", 30, 2280]], 1, 1],
    [4,  "2026-06-05", "Delivered",          "Completed",      "Credit",       "Chinmay Bhagwat",   [["TFR-24-MATT", 20, 3850]], 1, 1],
    [6,  "2026-06-03", "Delivered",          "Completed",      "Advance",      "Abhijit Bandyopadhyay", [["PGI-WHTE-5L", 25, 2750], ["CSN-WASH-5L", 6, 690]], 1, 1],
    [2,  "2026-05-29", "Delivered",          "Completed",      "COD",          "Anirudh Balasubramanian",    [["TFR-60-GLSS", 4, 7900]], 0, 1],
    [13, "2026-05-27", "Delivered",          "Completed",      "Advance",      "Chinmay Bhagwat",   [["AHP-MELT-05", 80, 320], ["ACC-BLADE-10", 10, 180]], 1, 1],
    [9,  "2026-05-22", "Delivered",          "Completed",      "Credit",       "Anirudh Balasubramanian",    [["PGI-CYAN-1L", 20, 2350], ["TFR-24-MATT", 10, 3900]], 1, 1],
    [7,  "2026-05-18", "Delivered",          "Completed",      "Advance",      "Chinmay Bhagwat",   [["AHP-MELT-25", 250, 285]], 1, 1],
    [3,  "2026-05-14", "Closed",             "Order Received", "Credit",       "Abhijit Bandyopadhyay", [["TFR-30-MATT", 4, 4600]], 1, 0],
    [12, "2026-04-28", "Delivered",          "Completed",      "Advance",      "Anirudh Balasubramanian",    [["PGI-MGTA-1L", 16, 2350], ["PGI-YLLW-1L", 16, 2350]], 1, 1],
    [5,  "2026-04-21", "Delivered",          "Completed",      "Part Advance", "Abhijit Bandyopadhyay", [["TFR-24-MATT", 12, 3900]], 1, 1]
  ];
  var itemByCode = {};
  D.items.forEach(function (it) { itemByCode[it.item_code] = it; });

  D.orders = ORD.map(function (o, i) {
    var cust = D.customers[o[0]];
    var lines = o[6].map(function (L, k) {
      var it = itemByCode[L[0]];
      return { idx: k + 1, item_code: L[0], item_name: it.item_name + (it.custom_sku_variant ? " (" + it.custom_sku_variant + ")" : ""),
        qty: L[1], uom: it.stock_uom, rate: L[2], amount: L[1] * L[2],
        item_tax_template: o[7] ? "GST 18%" : "No GST" };
    });
    var total = lines.reduce(function (s, L) { return s + L.amount; }, 0);
    var gstPct = o[7] ? 18 : 0;
    var freight = [0, 1250, 2400, 860, 3100, 0, 1480][i % 7];
    var tax = D.r2(Math.round((total + freight) * gstPct) / 100);
    var grand = D.r2(total + freight + tax);
    var stage = o[2];
    var pays = [];
    var paidFrac = { "Order Placed": [0, 0.3][i % 2], "With Accounts": 0.5, "Ready to Dispatch": 1,
      "Dispatched": [1, 0.6][i % 2], "Delivered": 1, "Closed": 0 }[stage];
    if (o[4] === "COD") paidFrac = stage === "Delivered" ? 1 : 0;
    if (paidFrac > 0) {
      var amt = Math.round(grand * paidFrac);
      var meth = ["UPI", "Bank Transfer", "Cash", "Cheque"][i % 4];
      pays.push({ idx: 1, payment_date: o[1], amount: amt, method: meth,
        reference_no: meth === "Cash" ? "" : "DEMOREF" + (9000 + i),
        charge_amount: meth === "UPI" ? Math.round(amt * 0.0025) : 0,
        charge_label: meth === "UPI" ? "UPI handling" : "",
        proof: meth === "Cash" ? "" : "payment-slip-" + (i + 1) + ".jpg",
        remarks: "", recorded_by: o[5] === "Anirudh Balasubramanian" ? "Devansh Chaturvedi" : "Karthikeyan Chandrasekhar",
        recorded_on: o[1] + " 17:20:00",
        verified: stage === "Delivered" || i % 3 !== 0 ? 1 : 0 });
    }
    var received = pays.reduce(function (s, p) { return s + p.amount; }, 0);
    var verified = pays.reduce(function (s, p) { return s + (p.verified ? p.amount : 0); }, 0);
    var tr = D.transporters[i % 4];
    var dispatched = ["Dispatched", "Delivered"].indexOf(stage) >= 0;
    return {
      name: "SO-2026-" + String(1001 + i).slice(-4).padStart(4, "0"),
      customer: cust.name, transaction_date: o[1],
      delivery_date: o[1], custom_sales_person: o[5],
      custom_order_stage: stage, custom_dispatch_status: o[3],
      custom_payment_terms: o[4],
      items: lines, total: total,
      custom_gst_type: o[7] ? "GST 18%" : "No GST",
      custom_gst_charged_rate: gstPct,
      total_taxes_and_charges: tax, grand_total: grand,
      custom_transport_charge: freight,
      custom_payments_received: pays,
      custom_total_received: received, custom_verified_received: verified,
      custom_balance_remaining: D.r2(grand - received),
      custom_show_payment_qr: received < grand ? "Yes" : "No",
      custom_payment_qr: "Primary QR",
      custom_bill_book: o[7] ? "Book A" : "Book B",
      custom_tally_invoice_no: ["Ready to Dispatch", "Dispatched", "Delivered"].indexOf(stage) >= 0 ? "INV/26-27/" + (300 + i) : "",
      custom_tally_invoice: ["Ready to Dispatch", "Dispatched", "Delivered"].indexOf(stage) >= 0 ? "invoice-" + (300 + i) + ".pdf" : "",
      custom_billed_by: ["Ready to Dispatch", "Dispatched", "Delivered"].indexOf(stage) >= 0 ? (i % 2 ? "Devansh Chaturvedi" : "Karthikeyan Chandrasekhar") : "",
      custom_billed_on: ["Ready to Dispatch", "Dispatched", "Delivered"].indexOf(stage) >= 0 ? o[1] + " 12:40:00" : "",
      po_no: i % 4 === 0 ? "PO/DEMO/" + (70 + i) : "", po_date: i % 4 === 0 ? o[1] : "",
      custom_import_ref: "",
      custom_delivery_mode: o[4] === "COD" ? "Delivery" : (i % 5 === 0 ? "Self Pickup" : "Delivery"),
      custom_delivery_by: i % 5 === 0 ? "Self Pickup" : ["Transport", "Delivery Partner", "Train"][i % 3],
      custom_delivery_partner: i % 5 === 0 ? "" : tr.transporter_name,
      custom_delivery_dest_city: cust.custom_city, custom_delivery_dest_state: cust.custom_state,
      custom_delivery_weight: 15 + (i % 9) * 7, custom_delivery_boxes: 1 + (i % 4),
      custom_delivery_service: ["Standard", "Express", "Economy"][i % 3],
      custom_delivery_transit: ["2-3 days", "1-2 days", "4-6 days"][i % 3],
      custom_delivery_charge: freight,
      custom_delivery_first_mile: i % 6 === 0 ? "Local pickup to the hub" : "",
      custom_delivery_first_mile_charge: i % 6 === 0 ? 350 : 0,
      custom_delivery_topay: o[4] === "COD" ? Math.round(freight) : 0,
      custom_actual_freight: dispatched ? D.r2(freight + [0, 60, -40, 120][i % 4]) : 0,
      custom_delivery_oda: i % 7 === 3 ? 1 : 0,
      custom_delivery_big_box: 0, custom_delivery_is_approx: i % 5 === 2 ? 1 : 0,
      custom_delivery_rate_note: freight ? (tr.transporter_name + ", " + ["Standard", "Express", "Economy"][i % 3] +
        ": " + (15 + (i % 9) * 7) + " kg chargeable at the zone rate, plus the docket charge." +
        (i % 7 === 3 ? " Out-of-area surcharge applied." : "")) : "Self pickup - no freight.",
      custom_delivery_breakdown: freight ? "Freight " + freight + " = base + docket" + (i % 7 === 3 ? " + ODA" : "") : "",
      custom_dispatch_transporter: dispatched ? tr.transporter_name : "",
      custom_courier_name: dispatched ? tr.transporter_name : "",
      custom_tracking_id: dispatched ? "DKT" + (480000 + i * 137) : "",
      custom_tracking_link: "", custom_actual_delivery_date: stage === "Delivered" ? o[1] : "",
      custom_dispatch_change_reason: i === 9 ? "Transporter unavailable" : "",
      custom_dispatch_change_note: i === 9 ? "First choice had no pickup that day; moved to the second option at the same fare." : "",
      custom_order_documents: o[7] ? [{ idx: 1, title: "Customer purchase order", document: "po-" + (70 + i) + ".pdf",
        uploaded_by: o[5], uploaded_on: o[1] + " 10:05:00" }] : []
    };
  });
  D.orderByName = function (n) { for (var i = 0; i < D.orders.length; i++) if (D.orders[i].name === n) return D.orders[i]; return null; };

  /* ---------------- quotations ---------------- */
  D.quotations = [
    { name: "QTN-2026-0007", quotation_to: "Lead", party_name: "Varnika Apparels", transaction_date: "2026-06-17", valid_till: "2026-06-20", status: "Open",
      items: [{ idx: 1, item_code: "PGI-CYAN-1L", item_name: "Pigment Ink - Cyan (1 litre bottle)", qty: 10, uom: "Litre", rate: 2400, amount: 24000, item_tax_template: "GST 18%" }],
      total: 24000, custom_gst_type: "GST 18%", total_taxes_and_charges: 4320, grand_total: 28320,
      custom_delivery_dest_city: "Nashik", custom_delivery_dest_state: "Maharashtra", custom_delivery_weight: 12, custom_transport_charge: 0 },
    { name: "QTN-2026-0006", quotation_to: "Lead", party_name: "Ujjwalam Graphics Pvt Ltd", transaction_date: "2026-06-16", valid_till: "2026-06-19", status: "Open",
      items: [{ idx: 1, item_code: "TFR-24-MATT", item_name: "Transfer Film Roll 24in (Double matte, 100 m)", qty: 15, uom: "Roll", rate: 3950, amount: 59250, item_tax_template: "GST 18%" }],
      total: 59250, custom_gst_type: "GST 18%", total_taxes_and_charges: 10665, grand_total: 69915,
      custom_delivery_dest_city: "Indore", custom_delivery_dest_state: "Madhya Pradesh", custom_delivery_weight: 48, custom_transport_charge: 1850 },
    { name: "QTN-2026-0005", quotation_to: "Customer", party_name: "Tamravarna Graphics Pvt Ltd", transaction_date: "2026-06-12", valid_till: "2026-06-15", status: "Ordered",
      items: [{ idx: 1, item_code: "AHP-MELT-25", item_name: "Adhesive Powder - Hot Melt (25 kg sack)", qty: 200, uom: "Kg", rate: 290, amount: 58000, item_tax_template: "GST 18%" }],
      total: 58000, custom_gst_type: "GST 18%", total_taxes_and_charges: 10440, grand_total: 68440,
      custom_delivery_dest_city: "Bengaluru", custom_delivery_dest_state: "Karnataka", custom_delivery_weight: 200, custom_transport_charge: 2400 },
    { name: "QTN-2026-0004", quotation_to: "Lead", party_name: "Jalaneel Fabrics", transaction_date: "2026-06-08", valid_till: "2026-06-11", status: "Expired",
      items: [{ idx: 1, item_code: "TFR-60-GLSS", item_name: "Transfer Film Roll 60in (Gloss, 100 m)", qty: 6, uom: "Roll", rate: 7900, amount: 47400, item_tax_template: "No GST" }],
      total: 47400, custom_gst_type: "No GST", total_taxes_and_charges: 0, grand_total: 47400,
      custom_delivery_dest_city: "Dubai", custom_delivery_dest_state: "", custom_delivery_weight: 60, custom_transport_charge: 0 },
    { name: "QTN-2026-0003", quotation_to: "Customer", party_name: "Kalanjali Enterprises", transaction_date: "2026-06-02", valid_till: "2026-06-05", status: "Lost",
      items: [{ idx: 1, item_code: "PGI-WHTE-5L", item_name: "Pigment Ink - White (5 litre can)", qty: 20, uom: "Litre", rate: 2750, amount: 55000, item_tax_template: "GST 18%" }],
      total: 55000, custom_gst_type: "GST 18%", total_taxes_and_charges: 9900, grand_total: 64900,
      custom_delivery_dest_city: "Kanpur", custom_delivery_dest_state: "Uttar Pradesh", custom_delivery_weight: 100, custom_transport_charge: 2900 }
  ];

  /* ---------------- delivery notes ---------------- */
  D.deliveryNotes = (function () {
    var out = [], n = 0;
    D.orders.forEach(function (o, i) {
      if (["Dispatched", "Delivered"].indexOf(o.custom_order_stage) < 0) return;
      n++;
      out.push({
        name: "DN-2026-" + String(1000 + n).slice(-4),
        customer: o.customer, against_sales_order: o.name,
        posting_date: o.transaction_date,
        status: o.custom_order_stage === "Delivered" ? "Completed" : "To Bill",
        set_warehouse: "Main Store",
        items: o.items.map(function (L, k) {
          return { idx: k + 1, item_code: L.item_code, item_name: L.item_name, qty: L.qty,
            uom: L.uom, batch_no: "LOT-2026-" + String(100 + ((i + k) % 24)), rate: L.rate, amount: L.amount };
        }),
        custom_courier_name: o.custom_courier_name, custom_tracking_id: o.custom_tracking_id,
        custom_tracking_link: "", custom_import_ref: "",
        is_return: 0, custom_return_reason: "", custom_return_note: "",
        total_qty: o.items.reduce(function (s, L) { return s + L.qty; }, 0),
        grand_total: o.total
      });
    });
    out.push({
      name: "DN-2026-9001", customer: "Vaitarna Printers", against_sales_order: "SO-2026-1005",
      posting_date: "2026-06-14", status: "Return Issued", set_warehouse: "Main Store",
      items: [{ idx: 1, item_code: "AHP-MELT-05", item_name: "Adhesive Powder - Hot Melt (5 kg pouch)", qty: -10, uom: "Kg", batch_no: "LOT-2026-108", rate: 320, amount: -3200 }],
      custom_courier_name: "Umarang Logistics Pvt Ltd", custom_tracking_id: "DKT481410", custom_tracking_link: "",
      is_return: 1, custom_return_reason: "Damaged in transit",
      custom_return_note: "Two pouches split. Eight back to the shelf, two to the defective bin.",
      total_qty: -10, grand_total: -3200, custom_import_ref: ""
    });
    return out;
  })();

  /* ---------------- purchase receipts / batches ---------------- */
  var PR = [
    [0, "2026-06-16", "EIA/26/1184", [["PGI-CYAN-1L", 60, 1850], ["PGI-MGTA-1L", 60, 1850], ["PGI-YLLW-1L", 40, 1850]]],
    [1, "2026-06-11", "ORB/4420",    [["PGI-BLCK-1L", 90, 1790], ["PGI-WHTE-5L", 50, 2100]]],
    [2, "2026-06-02", "RFW/9912",    [["TFR-24-MATT", 40, 3100], ["TFR-30-MATT", 20, 3700]]],
    [3, "2026-05-29", "PLC/2208",    [["AHP-MELT-25", 500, 210], ["AHP-MELT-05", 120, 225]]],
    [1, "2026-05-21", "ORB/4388",    [["CSN-WASH-5L", 40, 480], ["CSN-WASH-1L", 60, 520]]],
    [2, "2026-05-08", "RFW/9870",    [["TFR-60-GLSS", 25, 6400]]]
  ];
  D.purchaseReceipts = PR.map(function (p, i) {
    var lines = p[3].map(function (L, k) {
      var it = itemByCode[L[0]];
      return { idx: k + 1, item_code: L[0], item_name: it.item_name + " (" + it.custom_sku_variant + ")",
        qty: L[1], uom: it.stock_uom, batch_no: "LOT-2026-" + String(100 + i * 4 + k), rate: L[2], amount: L[1] * L[2] };
    });
    return {
      name: "PR-2026-" + String(1001 + i).slice(-4),
      supplier: D.suppliers[p[0]].supplier_name, posting_date: p[1],
      supplier_invoice_no: p[2], set_warehouse: "Main Store",
      items: lines,
      total_qty: lines.reduce(function (s, L) { return s + L.qty; }, 0),
      grand_total: lines.reduce(function (s, L) { return s + L.amount; }, 0),
      remarks: i === 2 ? "Import shipment - landed cost added separately." : "", docstatus: 1
    };
  });

  D.batches = (function () {
    var out = [];
    D.purchaseReceipts.forEach(function (pr) {
      pr.items.forEach(function (L) {
        out.push({ name: L.batch_no, batch_id: L.batch_no, item: L.item_code, supplier: pr.supplier,
          manufacturing_date: pr.posting_date, batch_qty: L.qty,
          on_hand: Math.max(0, Math.round(L.qty * [0.2, 0.55, 0.8, 1][out.length % 4])),
          reference_doctype: "Purchase Receipt " + pr.name });
      });
    });
    return out;
  })();

  D.purchaseOrders = [
    { name: "PO-2026-1003", supplier: "Lavanika Overseas Pvt Ltd", transaction_date: "2026-06-14", schedule_date: "2026-07-10",
      status: "To Receive", grand_total: 742000,
      items: [{ idx: 1, item_code: "PGI-CYAN-1L", item_name: "Pigment Ink - Cyan", qty: 200, uom: "Litre", batch_no: "", rate: 1830, amount: 366000 },
              { idx: 2, item_code: "PGI-MGTA-1L", item_name: "Pigment Ink - Magenta", qty: 200, uom: "Litre", batch_no: "", rate: 1880, amount: 376000 }] },
    { name: "PO-2026-1002", supplier: "Neelkamal Polymers Pvt Ltd", transaction_date: "2026-05-30", schedule_date: "2026-06-25",
      status: "To Receive and Bill", grand_total: 320000,
      items: [{ idx: 1, item_code: "TFR-60-GLSS", item_name: "Transfer Film Roll 60in", qty: 50, uom: "Roll", batch_no: "", rate: 6400, amount: 320000 }] },
    { name: "PO-2026-1001", supplier: "Oorjita Packaging Industries", transaction_date: "2026-05-12", schedule_date: "2026-05-28",
      status: "Completed", grand_total: 105000,
      items: [{ idx: 1, item_code: "AHP-MELT-25", item_name: "Adhesive Powder - Hot Melt", qty: 500, uom: "Kg", batch_no: "", rate: 210, amount: 105000 }] }
  ];

  D.stockEntries = [
    { name: "STE-2026-1002", stock_entry_type: "Material Receipt", posting_date: "2026-04-01", to_warehouse: "Main Store", from_warehouse: "",
      total_amount: 1482500, remarks: "Opening stock on go-live. Posted to Temporary Opening, one zero row per old lot.", docstatus: 1,
      items: [{ idx: 1, item_code: "PGI-BLCK-1L", qty: 120, uom: "Litre", batch_no: "LOT-2026-100", basic_rate: 1790, amount: 214800 },
              { idx: 2, item_code: "TFR-24-MATT", qty: 60, uom: "Roll", batch_no: "LOT-2026-101", basic_rate: 3100, amount: 186000 },
              { idx: 3, item_code: "AHP-MELT-25", qty: 400, uom: "Kg", batch_no: "LOT-2026-102", basic_rate: 210, amount: 84000 }] },
    { name: "STE-2026-1001", stock_entry_type: "Material Issue", posting_date: "2026-06-14", to_warehouse: "", from_warehouse: "Defective Bin",
      total_amount: 3200, remarks: "Write-off of two split powder pouches from the return on DN-2026-9001.", docstatus: 1,
      items: [{ idx: 1, item_code: "AHP-MELT-05", qty: 10, uom: "Kg", batch_no: "LOT-2026-108", basic_rate: 225, amount: 2250 }] }
  ];

  /* ---------------- payment entries / invoices ---------------- */
  D.paymentEntries = D.orders.filter(function (o) { return o.custom_payments_received.length; })
    .slice(0, 12).map(function (o, i) {
      var p = o.custom_payments_received[0];
      return { name: "PE-2026-" + String(1001 + i).slice(-4), payment_type: "Receive", posting_date: p.payment_date,
        party_type: "Customer", party: o.customer, paid_amount: p.amount,
        mode_of_payment: p.method, reference_no: p.reference_no, reference_date: p.payment_date,
        remarks: "Against " + o.name + ". Recorded on the order, verified on the payments desk.", docstatus: 1 };
    });

  D.salesInvoices = D.orders.filter(function (o) { return o.custom_tally_invoice_no; }).slice(0, 8).map(function (o, i) {
    var paid = o.custom_balance_remaining <= 0;
    return { name: "SI-2026-" + String(1001 + i).slice(-4), customer: o.customer, posting_date: o.transaction_date,
      due_date: o.transaction_date, status: paid ? "Paid" : "Unpaid",
      company_gstin: D.COMPANY_GSTIN, items: o.items, grand_total: o.grand_total,
      outstanding_amount: paid ? 0 : D.r2(o.custom_balance_remaining) };
  });

  /* ---------------- tasks ---------------- */
  var TASKS = [
    ["Re-price the north zone courier card", "In Progress", "High",   "2026-06-20", 60, "Jayesh Chitnis", "One courier raised its per-kilo rate. Update the card, mark it verified, and spot-check three recent orders against the new fare.", [["Collect the new sheet", 1], ["Enter the zone rows", 1], ["Mark verified today", 0], ["Spot-check three orders", 0]]],
    ["Chase the overdue credit orders",      "In Progress", "Urgent", "2026-06-19", 40, "Devansh Chaturvedi",   "Four credit orders are past 30 days. Ring each, note what was said, and flag anything that needs the director.", [["Pull the ageing list", 1], ["Call all four", 0], ["Write the notes on each order", 0]]],
    ["Photograph the new film variants",     "To Do",       "Medium", "2026-06-24", 0,  "Debashish Chakraborty",  "Three new roll widths arrived. Shoot them for the catalogue and attach to the SKU records.", [["Shoot the 16in roll", 0], ["Shoot the 30in roll", 0], ["Attach to each SKU", 0]]],
    ["Draft the half-yearly stock count plan","To Do",      "Medium", "2026-06-30", 0,  "Jayesh Chitnis", "Decide the cut-off, who counts what, and how the defective bin is treated.", [["Pick the cut-off date", 0], ["Split the SKUs by counter", 0]]],
    ["Fix the two leads with no city",       "Under Review","Low",    "2026-06-18", 90, "Chinmay Bhagwat",   "Two leads came in from the website with a blank city, so they fall out of the zone pricing.", [["Ring both", 1], ["Set city and state", 1], ["Confirm the fare recalculates", 0]]],
    ["Onboard the new store assistant",      "Under Review","High",   "2026-06-21", 75, "Ishaan Dhingra",   "Shift assignment with the geofence, leave allocation and the documents folder.", [["Create the employee record", 1], ["Assign the shift with geofence", 1], ["Allocate leave", 1], ["Upload the joining letter", 0]]],
    ["Close the April order book",            "Done",       "Medium", "2026-06-05", 100,"Karthikeyan Chandrasekhar",     "Everything from April is either delivered or closed, with the invoice attached.", [["Match every order", 1], ["Attach the missing invoices", 1]]],
    ["Write the dispatch handover note",     "Done",        "Low",    "2026-06-02", 100,"Jayesh Chitnis", "A one-page note for whoever covers dispatch next week.", [["Draft it", 1], ["Have it read by someone", 1]]],
    ["Trial a second UPI handle",            "On Hold",     "Low",    "",           20, "Devansh Chaturvedi",   "Parked until the bank confirms the settlement cycle.", [["Ask the bank", 1], ["Compare the fee", 0]]],
    ["Import the old courier rate sheets",   "Cancelled",   "Low",    "",           0,  "Jayesh Chitnis", "Dropped - the sheets are two price revisions out of date.", []]
  ];
  D.tasks = TASKS.map(function (t, i) {
    var subs = t[7].map(function (s, k) { return { idx: k + 1, done: s[1], subtask: s[0], assigned_to: t[5] }; });
    return { name: "TASK-2026-" + String(1001 + i).slice(-4), subject: t[0], custom_stage: t[1],
      priority: t[2], custom_due_date: t[3], progress: t[4], assigned_to: t[5],
      description: t[6], custom_subtasks: subs,
      custom_completed_on: t[1] === "Done" ? t[3] : "", project: ["", "Courier review", "Catalogue refresh", "", ""][i % 5] };
  });

  /* ---------------- chats (Team Issue) ---------------- */
  D.chats = [
    { name: "ISS-00018", title: "Courier refused a 110 kg box", target_type: "Department", target_label: "Dispatch",
      priority: "High", status: "Under Process", raised_by_name: "Chinmay Bhagwat", from_department: "Sales",
      is_escalated: 0, opened_on: "2026-06-17 10:12:00", resolved_on: "", last_activity_on: "2026-06-17 15:48:00", reopen_count: 0,
      description: "A customer wants 110 kg in one box. The courier card says loading is only charged when a single box is over 100 kg - does that mean they will still take it?",
      participants: [{ idx: 1, user: "Jayesh Chitnis", full_name: "Jayesh Chitnis", added_by: "Chinmay Bhagwat", added_on: "2026-06-17 10:12:00" },
                     { idx: 2, user: "Debashish Chakraborty", full_name: "Debashish Chakraborty", added_by: "Jayesh Chitnis", added_on: "2026-06-17 11:02:00" }],
      resolution: "",
      messages: [
        { who: "Chinmay Bhagwat", at: "17-06-2026, 10:12 am", text: "A customer wants 110 kg in one box. Will the courier take it, and does the loading charge apply?" },
        { who: "Jayesh Chitnis", at: "17-06-2026, 11:02 am", text: "They will take it but the handling charge kicks in per box, not per kilo. It is on the rate card as the over-100 kg condition." },
        { who: "Debashish Chakraborty", at: "17-06-2026, 11:40 am", text: "Adding a photo of the sheet row so nobody has to guess." },
        { who: "Chinmay Bhagwat", at: "17-06-2026, 3:48 pm", text: "Understood. I will quote it with the handling charge included and mark the charge as approximate." }
      ] },
    { name: "ISS-00017", title: "Two payments for the same reference", target_type: "Person", target_label: "Devansh Chaturvedi",
      priority: "High", status: "Created", raised_by_name: "Karthikeyan Chandrasekhar", from_department: "Accounts",
      is_escalated: 1, opened_on: "2026-06-17 09:05:00", resolved_on: "", last_activity_on: "2026-06-17 09:31:00", reopen_count: 0,
      description: "The desk flagged a duplicate: the same reference number appears on two orders for the same customer. One of them has to be wrong.",
      participants: [{ idx: 1, user: "Devansh Chaturvedi", full_name: "Devansh Chaturvedi", added_by: "Karthikeyan Chandrasekhar", added_on: "2026-06-17 09:05:00" }],
      resolution: "",
      messages: [
        { who: "Karthikeyan Chandrasekhar", at: "17-06-2026, 9:05 am", text: "Duplicate warning on the payments desk - same reference on two orders. I have not verified either." },
        { who: "system", at: "17-06-2026, 9:06 am", text: "Escalated automatically: a high-priority chat with no reply in four working hours." },
        { who: "Devansh Chaturvedi", at: "17-06-2026, 9:31 am", text: "Leave both unverified. I will pull the bank statement this afternoon." }
      ] },
    { name: "ISS-00016", title: "Leave request clashes with the stock count", target_type: "Department", target_label: "Human Resources",
      priority: "Medium", status: "Resolved", raised_by_name: "Jayesh Chitnis", from_department: "Dispatch",
      is_escalated: 0, opened_on: "2026-06-15 14:20:00", resolved_on: "2026-06-16 10:05:00", last_activity_on: "2026-06-16 10:05:00", reopen_count: 0,
      description: "Both store staff have applied for the same two days, which are the days pencilled in for the count.",
      participants: [{ idx: 1, user: "Ishaan Dhingra", full_name: "Ishaan Dhingra", added_by: "Jayesh Chitnis", added_on: "2026-06-15 14:20:00" }],
      resolution: "One of the two moved their leave by three days. Count stays where it was.",
      messages: [
        { who: "Jayesh Chitnis", at: "15-06-2026, 2:20 pm", text: "Both store staff want the same two days off and that is the count window." },
        { who: "Ishaan Dhingra", at: "15-06-2026, 4:02 pm", text: "I will ask one of them to shift. Neither application is approved yet, so nothing to undo." },
        { who: "Ishaan Dhingra", at: "16-06-2026, 10:05 am", text: "Sorted - one moved to the following week. Marking this resolved." }
      ] },
    { name: "ISS-00015", title: "A SKU has no HSN code", target_type: "Person", target_label: "Aniket Bhardwaj",
      priority: "Low", status: "Closed", raised_by_name: "Devansh Chaturvedi", from_department: "Accounts",
      is_escalated: 0, opened_on: "2026-06-09 11:00:00", resolved_on: "2026-06-10 09:14:00", last_activity_on: "2026-06-11 08:30:00", reopen_count: 1,
      description: "One accessory SKU has a blank HSN code, so it cannot be invoiced with GST until somebody fills it in.",
      participants: [{ idx: 1, user: "Aniket Bhardwaj", full_name: "Aniket Bhardwaj", added_by: "Devansh Chaturvedi", added_on: "2026-06-09 11:00:00" }],
      resolution: "HSN filled in on the SKU master. The SKU screen now shows a warning banner on any product without one.",
      messages: [
        { who: "Devansh Chaturvedi", at: "09-06-2026, 11:00 am", text: "The squeegee pack has no HSN. It will block the next invoice that includes it." },
        { who: "Aniket Bhardwaj", at: "10-06-2026, 9:14 am", text: "Filled in. The SKU screen warns on a blank HSN now, so this should not recur." },
        { who: "Devansh Chaturvedi", at: "11-06-2026, 8:30 am", text: "Reopened briefly to check the warning actually shows. It does. Closing." }
      ] },
    { name: "ISS-00014", title: "Can sales see the courier's cost?", target_type: "Department", target_label: "Management",
      priority: "Low", status: "Closed", raised_by_name: "Anirudh Balasubramanian", from_department: "Sales",
      is_escalated: 0, opened_on: "2026-06-04 13:10:00", resolved_on: "2026-06-05 10:00:00", last_activity_on: "2026-06-05 10:00:00", reopen_count: 0,
      description: "Sales can see the calculated delivery charge but not what we actually paid. Is that deliberate?",
      participants: [{ idx: 1, user: "Aniket Bhardwaj", full_name: "Aniket Bhardwaj", added_by: "Anirudh Balasubramanian", added_on: "2026-06-04 13:10:00" }],
      resolution: "Deliberate. The quoted fare is what sales needs; the actual freight paid stays with dispatch and accounts.",
      messages: [
        { who: "Anirudh Balasubramanian", at: "04-06-2026, 1:10 pm", text: "Should sales be able to see Actual Freight Paid, or only the calculated charge?" },
        { who: "Aniket Bhardwaj", at: "05-06-2026, 10:00 am", text: "Only the calculated charge. Keep the actual with dispatch and accounts." }
      ] }
  ];

  /* ---------------- HR records ---------------- */
  D.employees = D.people.map(function (p, i) {
    var left = p.name === "Narayanan Doraiswamy" ? 0 : 0;
    return { name: p.emp, employee_name: p.name, employee_code: p.emp, status: left ? "Left" : "Active",
      user_id: p.id, designation: p.desig, department: p.dept,
      reports_to: i === 0 ? "" : (p.role === "Sales" && p.name !== "Anirudh Balasubramanian" ? "EMP-002" :
        (p.role === "Accounts" && p.name !== "Devansh Chaturvedi" ? "EMP-005" :
          (p.role === "Dispatch" && p.name !== "Jayesh Chitnis" ? "EMP-007" :
            (p.role === "HR" && p.name !== "Ishaan Dhingra" ? "EMP-009" : "EMP-001")))),
      date_of_joining: p.joined, default_shift: "General Shift", holiday_list: "Saptarang Holidays 2026 (Demo)",
      gender: ["Male", "Female", "Male", "Female", "Male", "Female", "Male", "Female", "Female", "Male"][i],
      date_of_birth: "199" + (i % 9) + "-0" + (1 + i % 9) + "-1" + (i % 9),
      cell_number: D.phone(301 + i), personal_email: "personal" + (i + 1) + "@example.com",
      custom_exclude_from_attendance: 0,
      relieving_date: "", custom_exit_type: "", reason_for_leaving: "",
      custom_exit_interview_done: "", custom_exit_interview_details: "" };
  });

  /* Attendance register: 10 employees x June 2026, deterministic. */
  D.attendanceMonth = { year: 2026, month: 6, label: "June 2026", days: 30 };
  D.attendanceGrid = (function () {
    var g = {}, codes = ["P", "P", "P", "P", "P", "P", "HD", "A", "L", "WFH"];
    D.employees.forEach(function (e, ei) {
      var row = [];
      for (var d = 1; d <= 30; d++) {
        var dow = new Date(2026, 5, d).getDay();           /* 0 = Sunday */
        if (dow === 0) { row.push({ c: "WO" }); continue; }
        if (d === 15) { row.push({ c: "H", note: "Declared holiday" }); continue; }
        if (d > 18) { row.push({ c: "" }); continue; }      /* future days: nothing recorded */
        var pick = codes[(ei * 3 + d * 7) % codes.length];
        if (d === 11 && ei % 4 === 0) pick = "A";
        var inT = "09:" + String((ei * 7 + d) % 50).padStart(2, "0");
        var outT = pick === "HD" ? "13:4" + (d % 9) : "18:" + String((ei * 5 + d) % 55).padStart(2, "0");
        row.push({ c: pick, in: pick === "A" || pick === "L" ? "" : inT, out: pick === "A" || pick === "L" ? "" : outT,
          extra: (dow === 6 && pick === "P") ? 1 : 0 });
      }
      g[e.name] = row;
    });
    return g;
  })();
  D.ATT_LEGEND = [["P", "Present"], ["A", "Absent"], ["HD", "Half day"], ["L", "On leave"],
    ["WFH", "Work from home"], ["WO", "Weekly off"], ["H", "Holiday"], ["none", "Nothing recorded"]];

  D.attendance = (function () {
    var out = [], n = 0, map = { P: "Present", A: "Absent", HD: "Half Day", L: "On Leave", WFH: "Work From Home" };
    D.employees.forEach(function (e) {
      D.attendanceGrid[e.name].forEach(function (cell, i) {
        if (!map[cell.c]) return;
        n++;
        if (n > 60) return;
        var date = "2026-06-" + String(i + 1).padStart(2, "0");
        out.push({ name: "ATT-2026-" + String(10000 + n).slice(-5), employee: e.name, employee_name: e.employee_name,
          attendance_date: date, status: map[cell.c],
          half_day_status: cell.c === "HD" ? "Absent" : "",
          shift: "General Shift",
          in_time: cell.in ? date + " " + cell.in + ":00" : "", out_time: cell.out ? date + " " + cell.out + ":00" : "",
          working_hours: cell.in && cell.out ? (cell.c === "HD" ? 4.5 : 8.5) : 0,
          late_entry: cell.in && cell.in > "09:30" ? 1 : 0, early_exit: 0,
          custom_attendance_correction: "", custom_early_closure: i + 1 === 12 ? "EC-2026-06-12" : "",
          custom_same_day_marked: i + 1 >= 16 ? 1 : 0 });
      });
    });
    return out;
  })();

  D.corrections = [
    { name: "ATT-COR-0042", employee: "EMP-008", employee_name: "Debashish Chakraborty", from_date: "2026-06-16", to_date: "2026-06-16",
      proposed_in_time: "2026-06-16 09:10:00", proposed_out_time: "2026-06-16 18:25:00",
      reason: "Phone was out of battery at the gate, so the punch never registered.",
      status: "Pending", approver: "Ishaan Dhingra", decided_by: "", decided_on: "", applied_on: "", application_log: "" },
    { name: "ATT-COR-0041", employee: "EMP-003", employee_name: "Chinmay Bhagwat", from_date: "2026-06-12", to_date: "2026-06-12",
      proposed_in_time: "2026-06-12 09:05:00", proposed_out_time: "2026-06-12 17:50:00",
      reason: "Punched in from outside the geofence while on a customer visit.",
      status: "Approved", approver: "Ishaan Dhingra", decided_by: "Ishaan Dhingra", decided_on: "2026-06-13 10:20:00",
      applied_on: "2026-06-13 10:20:00", application_log: "Absent -> Present. In 09:05, out 17:50. Working hours 8.75." },
    { name: "ATT-COR-0040", employee: "EMP-006", employee_name: "Karthikeyan Chandrasekhar", from_date: "2026-06-08", to_date: "2026-06-09",
      proposed_in_time: "", proposed_out_time: "",
      reason: "Two days marked absent while I was on approved leave.",
      status: "Rejected", approver: "Ishaan Dhingra", decided_by: "Ishaan Dhingra", decided_on: "2026-06-10 09:00:00",
      applied_on: "", application_log: "Rejected: the leave application for those dates was never submitted, so the register is right. Apply for the leave first." }
  ];

  D.leaveApplications = [
    { name: "LAP-2026-0031", employee: "EMP-004", employee_name: "Abhijit Bandyopadhyay", leave_type: "Casual Leave",
      from_date: "2026-06-22", to_date: "2026-06-23", half_day: 0, total_leave_days: 2, leave_balance: 6,
      status: "Open", leave_approver: "Ishaan Dhingra", custom_company_leave_ref: "", description: "Family function out of town." },
    { name: "LAP-2026-0030", employee: "EMP-008", employee_name: "Debashish Chakraborty", leave_type: "Sick Leave",
      from_date: "2026-06-19", to_date: "2026-06-19", half_day: 0, total_leave_days: 1, leave_balance: 4,
      status: "Open", leave_approver: "Ishaan Dhingra", custom_company_leave_ref: "", description: "Fever." },
    { name: "LAP-2026-0029", employee: "EMP-003", employee_name: "Chinmay Bhagwat", leave_type: "Casual Leave",
      from_date: "2026-06-10", to_date: "2026-06-10", half_day: 1, total_leave_days: 0.5, leave_balance: 7,
      status: "Approved", leave_approver: "Ishaan Dhingra", custom_company_leave_ref: "LV-2026-0112", description: "Bank work in the morning." },
    { name: "LAP-2026-0028", employee: "EMP-006", employee_name: "Karthikeyan Chandrasekhar", leave_type: "Earned Leave",
      from_date: "2026-06-02", to_date: "2026-06-04", half_day: 0, total_leave_days: 3, leave_balance: 9,
      status: "Approved", leave_approver: "Ishaan Dhingra", custom_company_leave_ref: "LV-2026-0109", description: "Pre-booked trip." },
    { name: "LAP-2026-0027", employee: "EMP-007", employee_name: "Jayesh Chitnis", leave_type: "Casual Leave",
      from_date: "2026-05-28", to_date: "2026-05-28", half_day: 0, total_leave_days: 1, leave_balance: 5,
      status: "Rejected", leave_approver: "Aniket Bhardwaj", custom_company_leave_ref: "", description: "Clashed with the month-end dispatch run." }
  ];

  D.leaveBalances = [
    { leave_type: "Casual Leave", allocated: 12, used: 5, open: 1 },
    { leave_type: "Sick Leave", allocated: 6, used: 2, open: 1 },
    { leave_type: "Earned Leave", allocated: 15, used: 6, open: 0 }
  ];

  D.hrRequests = [
    { name: "HR-REQ-0019", subject: "Salary slip for May", employee: "EMP-008", employee_name: "Debashish Chakraborty",
      status: "Open", hr_contact: "Narayanan Doraiswamy", details: "Need May's slip for a loan application." },
    { name: "HR-REQ-0018", subject: "Correction to my reporting manager", employee: "EMP-004", employee_name: "Abhijit Bandyopadhyay",
      status: "In Progress", hr_contact: "Ishaan Dhingra", details: "My profile still shows the old reporting manager." },
    { name: "HR-REQ-0017", subject: "Address change", employee: "EMP-003", employee_name: "Chinmay Bhagwat",
      status: "Resolved", hr_contact: "Narayanan Doraiswamy", details: "Moved within the same city." }
  ];

  D.employeeDocuments = [
    { name: "EMP-DOC-00041", employee: "EMP-008", employee_name: "Debashish Chakraborty", document_type: "Salary Slip",
      title: "Salary slip - May 2026", date: "2026-06-01", attachment: "salary-slip-may-2026.pdf", uploaded_by: "Narayanan Doraiswamy" },
    { name: "EMP-DOC-00040", employee: "EMP-008", employee_name: "Debashish Chakraborty", document_type: "Joining Letter",
      title: "Joining letter", date: "2025-01-06", attachment: "joining-letter.pdf", uploaded_by: "Ishaan Dhingra" },
    { name: "EMP-DOC-00039", employee: "EMP-004", employee_name: "Abhijit Bandyopadhyay", document_type: "Confirmation Letter",
      title: "Confirmation letter", date: "2025-03-10", attachment: "confirmation-letter.pdf", uploaded_by: "Ishaan Dhingra" },
    { name: "EMP-DOC-00038", employee: "EMP-010", employee_name: "Narayanan Doraiswamy", document_type: "Probation Letter",
      title: "Probation letter", date: "2025-07-14", attachment: "probation-letter.pdf", uploaded_by: "Ishaan Dhingra" }
  ];

  D.earlyClosures = [
    { name: "EC-2026-06-12", closure_date: "2026-06-12", close_time: "15:30:00",
      reason: "Power cut across the estate; the office was shut at half past three.",
      minimum_hours: 5, company: D.COMPANY, last_applied_on: "2026-06-12 20:05:00",
      rows_corrected: 8, apply_log: "8 rows moved from Half Day to Present. 2 rows left alone - under the 5 hour minimum." },
    { name: "EC-2026-04-18", closure_date: "2026-04-18", close_time: "14:00:00",
      reason: "Civic strike; staff sent home at two.", minimum_hours: 4.5, company: D.COMPANY,
      last_applied_on: "2026-04-18 19:40:00", rows_corrected: 9, apply_log: "9 rows moved from Half Day to Present." }
  ];

  D.expenseClaims = [
    { name: "EXP-2026-0022", employee: "EMP-003", employee_name: "Chinmay Bhagwat", posting_date: "2026-06-16",
      approval_status: "Draft", status: "Draft", expense_approver: "Anirudh Balasubramanian",
      expenses: [{ idx: 1, expense_date: "2026-06-14", expense_type: "Travel", description: "Customer visit, two cities", amount: 4200, sanctioned_amount: 0 },
                 { idx: 2, expense_date: "2026-06-15", expense_type: "Food", description: "Meals on the road", amount: 680, sanctioned_amount: 0 }],
      total_claimed_amount: 4880, total_sanctioned_amount: 0 },
    { name: "EXP-2026-0021", employee: "EMP-007", employee_name: "Jayesh Chitnis", posting_date: "2026-06-10",
      approval_status: "Approved", status: "Paid", expense_approver: "Aniket Bhardwaj",
      expenses: [{ idx: 1, expense_date: "2026-06-09", expense_type: "Freight", description: "Urgent local pickup paid in cash", amount: 1500, sanctioned_amount: 1500 }],
      total_claimed_amount: 1500, total_sanctioned_amount: 1500 },
    { name: "EXP-2026-0020", employee: "EMP-006", employee_name: "Karthikeyan Chandrasekhar", posting_date: "2026-05-30",
      approval_status: "Rejected", status: "Rejected", expense_approver: "Devansh Chaturvedi",
      expenses: [{ idx: 1, expense_date: "2026-05-28", expense_type: "Travel", description: "Taxi, no receipt attached", amount: 900, sanctioned_amount: 0 }],
      total_claimed_amount: 900, total_sanctioned_amount: 0 }
  ];

  D.salarySlips = D.employees.slice(0, 6).map(function (e, i) {
    var gross = [95000, 78000, 52000, 46000, 68000, 41000][i];
    var ded = Math.round(gross * 0.12);
    var pd = [30, 29.5, 28, 30, 27, 30][i];
    return { name: "SAL-2026-" + String(1001 + i).slice(-4), employee: e.name, employee_name: e.employee_name,
      start_date: "2026-05-01", end_date: "2026-05-31",
      total_working_days: 26, leave_without_pay: i === 4 ? 2 : 0, absent_days: i === 2 ? 1 : 0,
      payment_days: pd,
      earnings: [{ idx: 1, salary_component: "Basic", amount: Math.round(gross * 0.6) },
                 { idx: 2, salary_component: "House Rent Allowance", amount: Math.round(gross * 0.25) },
                 { idx: 3, salary_component: "Special Allowance", amount: gross - Math.round(gross * 0.6) - Math.round(gross * 0.25) }],
      deductions: [{ idx: 1, salary_component: "Provident Fund", amount: ded }],
      gross_pay: gross, total_deduction: ded, net_pay: gross - ded, docstatus: i < 4 ? 1 : 0 };
  });

  D.checkins = (function () {
    var out = [];
    D.employees.forEach(function (e, i) {
      ["2026-06-18 09:0" + (i % 9) + ":00", "2026-06-17 18:1" + (i % 9) + ":00", "2026-06-17 09:1" + (i % 9) + ":00"]
        .forEach(function (t, k) {
          out.push({ name: "CHK-" + String(50000 + i * 3 + k).slice(-5), employee: e.name, employee_name: e.employee_name,
            time: t, log_type: k === 1 ? "OUT" : "IN", device_id: "Punch widget (geofenced)", shift: "General Shift" });
        });
    });
    return out;
  })();

  D.shiftAssignments = D.employees.map(function (e, i) {
    return { name: "SHA-2026-" + String(1001 + i).slice(-4), employee: e.name, employee_name: e.employee_name,
      shift_type: "General Shift", start_date: "2026-04-01", end_date: "", status: "Active",
      geofence_lat: "00.0000", geofence_lon: "00.0000", geofence_radius: 150 };
  });

  /* ---------------- stock movement by day ---------------- */
  D.dailyStock = (function () {
    var out = [];
    for (var d = 18; d >= 8; d--) {
      var dt = "2026-06-" + String(d).padStart(2, "0");
      var inQ = [0, 160, 0, 0, 60, 0, 0, 620, 0, 0, 90][18 - d];
      var outQ = [48, 36, 0, 92, 24, 0, 210, 30, 64, 18, 0][18 - d];
      out.push({ date: dt, skus: inQ && outQ ? 6 : (inQ || outQ ? 3 : 0), in_qty: inQ, out_qty: outQ,
        docs: (inQ ? 1 : 0) + (outQ ? 2 : 0),
        closing: 1420 + (18 - d) * 23 });
    }
    return out;
  })();

  /* ---------------- holidays ---------------- */
  D.holidays = [
    { date: "2026-01-26", description: "Republic Day" },
    { date: "2026-03-06", description: "Festival holiday" },
    { date: "2026-06-15", description: "Declared holiday" },
    { date: "2026-08-15", description: "Independence Day" },
    { date: "2026-10-02", description: "Gandhi Jayanti" },
    { date: "2026-11-09", description: "Festival holiday" },
    { date: "2026-12-25", description: "Christmas" }
  ];

  /* One pass at the end, over everything built above: round every stored
   * number to two decimals. Binary floating point leaves tails like
   * 58923.600000000006 inside sums. They are invisible on screen, because the
   * formatter rounds, but they put an eleven-digit run into the file - and a
   * long digit run is exactly the shape the leak checks hunt for. Doing it
   * once here means no individual sum has to remember. */
  (function round(v, depth) {
    if (!v || typeof v !== "object" || depth > 8) return;
    Object.keys(v).forEach(function (k) {
      var x = v[k];
      if (typeof x === "number") {
        if (isFinite(x) && x % 1 !== 0) v[k] = D.r2(x);
      } else if (x && typeof x === "object") {
        round(x, depth + 1);
      }
    });
  })(D, 0);
})(window.DEMO = window.DEMO || {});
