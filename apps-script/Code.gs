/**
 * Marland Continental — Google Sheets backend for the website forms
 *
 * Saves every submission to the spreadsheet named "Marland Continental
 * Quotes" (found by name in your Drive, or pinned with MC_SPREADSHEET_ID),
 * no matter which Apps Script project this file lives in.
 *
 * SETUP — use its OWN Apps Script project. A project can only have one
 * doPost/doGet, so don't add this file to the survey's project.
 *   1. Go to script.google.com → New project (or open the Marland sheet →
 *      Extensions → Apps Script). Paste this file in as the only code. Save.
 *   2. Select mcSetup in the function dropdown → Run → approve permissions.
 *      The log prints the sheet URL; the three tabs are created there.
 *   3. Deploy → New deployment → Web app (Execute as: Me, Who has access:
 *      Anyone) → copy the /exec URL into js/main.js (MC_CONFIG.sheetsEndpoint).
 *
 * Each submission writes one row to the tab for its form:
 *   • "Quote Requests"         ← the order form on every product page (buy/<product>/)
 *   • "Contact Messages"       ← the contact page
 *   • "Consultation Requests"  ← the "free facility consultation" bar
 *
 * Rows are written by column NAME. Any field the site sends that the tab
 * doesn't have a column for yet is added on the right automatically.
 */

const MC_SPREADSHEET_NAME = "Marland Continental Quotes";
// Optional: paste the sheet's ID (the long part of its URL between /d/ and /edit)
// to pin it, e.g. if you ever have two files with the same name.
const MC_SPREADSHEET_ID = "";
// Optional: an address to email for every new row, e.g. "bill@stadiaip.com".
const MC_NOTIFY_EMAIL = "";

const MC_TABS = {
  order: {
    name: "Quote Requests",
    headers: [
      "Request ID", "Submitted At", "Status", "Product", "Tier", "Purchase", "Options", "Price Shown",
      "First name", "Last name", "Organization", "Role", "Email", "Phone", "Delivery state", "Timeline", "Notes",
      "Product Page", "User Agent",
    ],
  },
  contact: {
    name: "Contact Messages",
    headers: [
      "Request ID", "Submitted At", "Status", "Inquiry", "Name", "Email", "Organization", "Phone", "Message",
      "Product", "Send updates", "Page", "User Agent",
    ],
  },
  consult: {
    name: "Consultation Requests",
    headers: ["Request ID", "Submitted At", "Status", "Name", "Email", "School or organization", "Page", "User Agent"],
  },
};

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const data = JSON.parse(e.postData.contents);
    const tab = MC_TABS[data.form];
    if (!tab) return mcJson_({ ok: false, error: "Unknown form: " + data.form });

    const book = mcBook_();
    const sheet = mcSheet_(book, tab.name, tab.headers);
    const values = Object.assign({}, data.fields || {}, {
      "Request ID": data.id || "",
      "Submitted At": data.submittedAt ? new Date(data.submittedAt) : new Date(),
      "Status": "New",
      "User Agent": data.userAgent || "",
    });
    values[data.form === "order" ? "Product Page" : "Page"] = data.page || "";
    mcAppend_(sheet, tab.headers, values);

    mcNotify_(book, tab.name, values);
    return mcJson_({ ok: true, id: data.id, sheet: book.getName(), tab: tab.name });
  } catch (err) {
    return mcJson_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Visiting the /exec URL in a browser confirms the deployment is live and
// shows which spreadsheet it writes to.
function doGet() {
  let where = "";
  try { const b = mcBook_(); where = ` Writing to "${b.getName()}": ${b.getUrl()}`; } catch (err) { where = " Could not open the sheet: " + err; }
  return ContentService.createTextOutput("Marland Continental forms endpoint is running." + where).setMimeType(ContentService.MimeType.TEXT);
}

/**
 * The "Marland Continental Quotes" spreadsheet: pinned ID if set, else the
 * one remembered from last time, else this project's own sheet if it has that
 * name, else the first Drive file with that name, else a new one.
 */
function mcBook_() {
  if (MC_SPREADSHEET_ID) return SpreadsheetApp.openById(MC_SPREADSHEET_ID);
  const props = PropertiesService.getScriptProperties();
  const saved = props.getProperty("MC_SHEET_ID");
  if (saved) {
    try { return SpreadsheetApp.openById(saved); } catch (err) { props.deleteProperty("MC_SHEET_ID"); }
  }
  let book = null;
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active && active.getName() === MC_SPREADSHEET_NAME) book = active;
  if (!book) {
    const files = DriveApp.getFilesByName(MC_SPREADSHEET_NAME);
    while (!book && files.hasNext()) {
      const f = files.next();
      if (f.getMimeType() === MimeType.GOOGLE_SHEETS && !f.isTrashed()) book = SpreadsheetApp.openById(f.getId());
    }
  }
  if (!book) book = SpreadsheetApp.create(MC_SPREADSHEET_NAME);
  props.setProperty("MC_SHEET_ID", book.getId());
  return book;
}

function mcSheet_(book, name, headers) {
  let sheet = book.getSheetByName(name);
  if (!sheet) sheet = book.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Write a row by column NAME. The sheet's own header row decides where each
// value lands, so reordering columns in the sheet is safe. Any header the
// sheet doesn't have yet is added on the right.
function mcAppend_(sheet, headers, values) {
  const cols = sheet.getLastColumn();
  let have = cols ? sheet.getRange(1, 1, 1, cols).getValues()[0].map(String) : [];
  const wanted = headers.concat(Object.keys(values).filter((k) => headers.indexOf(k) === -1));
  const missing = wanted.filter((h) => have.indexOf(h) === -1);
  if (missing.length) {
    sheet.getRange(1, have.length + 1, 1, missing.length).setValues([missing]).setFontWeight("bold");
    have = have.concat(missing);
  }
  sheet.appendRow(have.map((h) => (h in values ? values[h] : "")));
}

function mcNotify_(book, tabName, values) {
  if (!MC_NOTIFY_EMAIL) return;
  const who = values["Name"] || [values["First name"], values["Last name"]].filter(Boolean).join(" ") || values["Email"] || "Someone";
  const what = values["Product"] ? ` — ${values["Product"]}` : "";
  const body = Object.keys(values)
    .filter((k) => values[k] !== "" && k !== "User Agent")
    .map((k) => `${k}: ${values[k] instanceof Date ? values[k].toLocaleString() : values[k]}`)
    .join("\n");
  MailApp.sendEmail({
    to: MC_NOTIFY_EMAIL,
    subject: `New ${tabName.replace(/s$/, "").toLowerCase()}: ${who}${what}`,
    body: body + "\n\nOpen the sheet: " + book.getUrl(),
    replyTo: values["Email"] || undefined,
  });
}

function mcJson_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Run once from the editor: approves permissions, finds the sheet, creates the three tabs and logs the sheet's URL. */
function mcSetup() {
  const book = mcBook_();
  Object.keys(MC_TABS).forEach((k) => mcSheet_(book, MC_TABS[k].name, MC_TABS[k].headers));
  const blank = book.getSheetByName("Sheet1");
  if (blank && blank.getLastRow() === 0 && book.getSheets().length > 1) book.deleteSheet(blank);
  Logger.log(`Ready. Submissions go to "${book.getName()}": ${book.getUrl()}`);
}

/** Optional: adds a test row to each tab (delete them afterwards). */
function mcTestInsert() {
  const now = new Date().toISOString();
  const send = (payload) => Logger.log(doPost({ postData: { contents: JSON.stringify(payload) } }).getContent());
  send({
    form: "order", id: "test-Q", submittedAt: now, page: "https://example.org/buy/20-foot-press-box/?tier=standard", userAgent: "apps-script-test",
    fields: {
      "Product": "Press Box", "Tier": "Standard", "Purchase": "Purchase", "Options": "Stadia IP funding", "Price Shown": "$37,349",
      "First name": "Test", "Last name": "Row", "Organization": "Test High School", "Role": "Athletic Director",
      "Email": "test@example.org", "Phone": "", "Delivery state": "Virginia", "Timeline": "Next season", "Notes": "test row — delete me",
    },
  });
  send({
    form: "contact", id: "test-C", submittedAt: now, page: "https://example.org/contact/", userAgent: "apps-script-test",
    fields: { "Inquiry": "Buying a facility", "Name": "Test Row", "Email": "test@example.org", "Organization": "Test HS", "Message": "test row — delete me", "Send updates": "Yes" },
  });
  send({
    form: "consult", id: "test-F", submittedAt: now, page: "https://example.org/", userAgent: "apps-script-test",
    fields: { "Name": "Test Row", "Email": "test@example.org", "School or organization": "Test HS" },
  });
}
