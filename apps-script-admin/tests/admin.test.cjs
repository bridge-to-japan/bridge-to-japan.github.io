const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const projectRoot = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(projectRoot, "Code.gs"), "utf8");
const manifest = JSON.parse(fs.readFileSync(path.join(projectRoot, "appsscript.json"), "utf8"));

class FakeRange {
  constructor(sheet, row, column, rowCount = 1, columnCount = 1) {
    this.sheet = sheet;
    this.row = row;
    this.column = column;
    this.rowCount = rowCount;
    this.columnCount = columnCount;
  }

  getRow() { return this.row; }
  getLastRow() { return this.row + this.rowCount - 1; }
  getValues() {
    return Array.from({ length: this.rowCount }, (_, rowOffset) =>
      Array.from({ length: this.columnCount }, (_, columnOffset) =>
        this.sheet.cell(this.row + rowOffset, this.column + columnOffset)
      )
    );
  }
  getDisplayValues() {
    return this.getValues().map((row) => row.map((value) => String(value ?? "")));
  }
  setValues(values) {
    values.forEach((row, rowOffset) => row.forEach((value, columnOffset) => {
      this.sheet.setCell(this.row + rowOffset, this.column + columnOffset, value);
    }));
    return this;
  }
}

class FakeSheet {
  constructor(name, headers) {
    this.name = name;
    this.rows = [Array.from(headers)];
    this.activeRange = new FakeRange(this, 1, 1);
  }
  getName() { return this.name; }
  getLastRow() { return this.rows.length; }
  getLastColumn() { return this.rows[0].length; }
  getActiveRange() { return this.activeRange; }
  getRange(row, column, rowCount = 1, columnCount = 1) {
    return new FakeRange(this, row, column, rowCount, columnCount);
  }
  cell(row, column) { return (this.rows[row - 1] || [])[column - 1] ?? ""; }
  setCell(row, column, value) {
    while (this.rows.length < row) this.rows.push([]);
    while (this.rows[row - 1].length < column) this.rows[row - 1].push("");
    this.rows[row - 1][column - 1] = value;
  }
}

function makeContext(options = {}) {
  const menuItems = [];
  const toasts = [];
  const context = { console, Date, Error, String, RegExp };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: "Code.gs" });
  const headers = vm.runInContext("ADMIN_SHEET_HEADERS_.slice()", context);
  const sheet = new FakeSheet(options.sheetName || "CustomerList", headers);
  const spreadsheet = {
    getActiveSheet: () => sheet,
    toast: (message) => toasts.push(message)
  };
  context.SpreadsheetApp = {
    getActive: () => spreadsheet,
    getUi: () => ({
      createMenu: (name) => ({
        addItem(label, handler) { menuItems.push({ name, label, handler }); return this; },
        addToUi() { return this; }
      })
    })
  };
  return { context, sheet, menuItems, toasts, headers };
}

function consultationRow(headers, requestId) {
  const row = Array(headers.length).fill("");
  row[3] = requestId;
  return row;
}

test("uses only current-Sheet UI scopes and contains no backend capabilities", () => {
  assert.deepEqual(manifest.oauthScopes, [
    "https://www.googleapis.com/auth/spreadsheets.currentonly",
    "https://www.googleapis.com/auth/script.container.ui"
  ]);
  assert.doesNotMatch(source, /PropertiesService|MailApp|UrlFetchApp|ScriptApp|doPost|RECAPTCHA|CONTACT_TO|SPREADSHEET_ID/);
});

test("adds only close and reopen actions to the bound Sheet menu", () => {
  const { context, menuItems } = makeContext();
  vm.runInContext("onOpen()", context);
  assert.deepEqual(menuItems.map(({ label, handler }) => ({ label, handler })), [
    { label: "선택한 상담 종료 처리", handler: "markSelectedConsultationsClosed" },
    { label: "선택한 상담 종료 취소", handler: "reopenSelectedConsultations" }
  ]);
});

test("closes and reopens only selected rows with valid request IDs", () => {
  const { context, sheet, toasts, headers } = makeContext();
  sheet.rows.push(
    consultationRow(headers, "123e4567-e89b-42d3-a456-426614174000"),
    consultationRow(headers, "223e4567-e89b-42d3-a456-426614174000"),
    consultationRow(headers, "not-a-request-id")
  );
  sheet.activeRange = new FakeRange(sheet, 1, 1, 4, headers.length);

  assert.equal(vm.runInContext("markSelectedConsultationsClosed()", context), 2);
  assert.match(String(sheet.cell(2, 2)), /^\d{4}-\d{2}-\d{2}T/);
  assert.match(String(sheet.cell(2, 3)), /^\d{4}-\d{2}-\d{2}T/);
  assert.equal(sheet.cell(4, 2), "");
  assert.match(toasts[0], /^2건/);

  const closedAt = new Date(sheet.cell(2, 2));
  const deleteAt = new Date(sheet.cell(2, 3));
  const expected = new Date(closedAt.getTime());
  expected.setUTCFullYear(expected.getUTCFullYear() + 1);
  assert.equal(deleteAt.toISOString(), expected.toISOString());

  sheet.activeRange = new FakeRange(sheet, 2, 1, 1, headers.length);
  assert.equal(vm.runInContext("reopenSelectedConsultations()", context), 1);
  assert.equal(sheet.cell(2, 2), "");
  assert.equal(sheet.cell(2, 3), "");
  assert.notEqual(sheet.cell(3, 2), "");
});

test("fails closed on the wrong Sheet or header contract", () => {
  const wrongSheet = makeContext({ sheetName: "Other" });
  assert.throws(
    () => vm.runInContext("markSelectedConsultationsClosed()", wrongSheet.context),
    /ADMIN_SHEET_CONFIGURATION_ERROR/
  );

  const wrongHeader = makeContext();
  wrongHeader.sheet.rows[0][1] = "changed_header";
  assert.throws(
    () => vm.runInContext("markSelectedConsultationsClosed()", wrongHeader.context),
    /ADMIN_SHEET_CONFIGURATION_ERROR/
  );
});
