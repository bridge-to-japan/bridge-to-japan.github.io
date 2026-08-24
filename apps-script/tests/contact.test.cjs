const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "..", "Code.gs"), "utf8");
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "appsscript.json"), "utf8"));

function makeContext() {
  const context = {
    console,
    Date,
    JSON,
    Number,
    Object,
    Array,
    Set,
    String,
    RegExp,
    Error,
    Math,
    Utilities: {
      DigestAlgorithm: { SHA_256: "SHA_256" },
      Charset: { UTF_8: "UTF_8" },
      newBlob(value) {
        return { getBytes: () => Array.from(Buffer.from(String(value), "utf8")) };
      },
      computeDigest(_algorithm, value) {
        return Array.from(crypto.createHash("sha256").update(String(value), "utf8").digest());
      }
    },
    HtmlService: {
      XFrameOptionsMode: { ALLOWALL: "ALLOWALL" },
      createHtmlOutput(content) {
        return {
          content,
          mode: null,
          setXFrameOptionsMode(mode) { this.mode = mode; return this; },
          getContent() { return this.content; }
        };
      }
    }
  };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: "Code.gs" });
  return context;
}

function validPayload() {
  return {
    requestId: "123e4567-e89b-42d3-a456-426614174000",
    firstName: "길동",
    lastName: "홍",
    company: "Bridge Test",
    email: "qa@example.com",
    services: ["incorporation_or_branch", "business_manager_visa"],
    referralSources: ["google_search", "ai_search_or_gpt"],
    message: "일본 법인 설립 일정이 궁금합니다.",
    privacyConsent: true,
    privacyPolicyVersion: "2026-08-24",
    recaptchaToken: "test-token",
    website: ""
  };
}

class FakeRange {
  constructor(sheet, row, column, rowCount = 1, columnCount = 1) {
    this.sheet = sheet;
    this.row = row;
    this.column = column;
    this.rowCount = rowCount;
    this.columnCount = columnCount;
  }

  getDisplayValues() {
    return Array.from({ length: this.rowCount }, (_, rowOffset) =>
      Array.from({ length: this.columnCount }, (_, columnOffset) =>
        String(this.sheet.cell(this.row + rowOffset, this.column + columnOffset) ?? "")
      )
    );
  }

  getDisplayValue() { return this.getDisplayValues()[0][0]; }

  setValues(values) {
    values.forEach((row, rowOffset) => row.forEach((value, columnOffset) => {
      this.sheet.setCell(this.row + rowOffset, this.column + columnOffset, value);
    }));
    return this;
  }

  setValue(value) { this.sheet.setCell(this.row, this.column, value); return this; }
  setNumberFormat() { return this; }

  createTextFinder(search) {
    const range = this;
    return {
      matchEntireCell() { return this; },
      findNext() {
        for (let offset = 0; offset < range.rowCount; offset += 1) {
          if (String(range.sheet.cell(range.row + offset, range.column) ?? "") === search) {
            return { getRow: () => range.row + offset };
          }
        }
        return null;
      }
    };
  }
}

class FakeSheet {
  constructor(headers) { this.rows = [Array.from(headers)]; }
  cell(row, column) { return (this.rows[row - 1] || [])[column - 1] ?? ""; }
  setCell(row, column, value) {
    while (this.rows.length < row) this.rows.push([]);
    while (this.rows[row - 1].length < column) this.rows[row - 1].push("");
    this.rows[row - 1][column - 1] = value;
  }
  getLastRow() { return this.rows.length; }
  getLastColumn() { return this.rows[0].length; }
  getRange(row, column, rowCount = 1, columnCount = 1) { return new FakeRange(this, row, column, rowCount, columnCount); }
  deleteRow(row) { this.rows.splice(row - 1, 1); }
}

function makeIntegrationContext(options = {}) {
  const context = makeContext();
  const headers = vm.runInContext("SHEET_HEADERS_.slice()", context);
  const sheet = new FakeSheet(headers);
  const mails = [];
  const properties = {
    SPREADSHEET_ID: "spreadsheet-id-123456789",
    SHEET_NAME: "CustomerList",
    CONTACT_TO: options.contactTo === undefined ? "operator@example.com" : options.contactTo,
    CONTACT_CC: options.contactCc === undefined ? "manager@example.com" : options.contactCc,
    ALLOWED_PARENT_ORIGINS: "https://bridge-to-japan.github.io",
    RECAPTCHA_SECRET_KEY: "test-secret",
    RECAPTCHA_EXPECTED_HOSTNAMES: "bridge-to-japan.github.io",
    EMAIL_RATE_LIMIT_PER_HOUR: "3",
    GLOBAL_SUBMISSION_LIMIT_PER_HOUR: options.globalHourLimit === undefined ? "10" : String(options.globalHourLimit),
    GLOBAL_SUBMISSION_LIMIT_PER_DAY: options.globalDayLimit === undefined ? "40" : String(options.globalDayLimit),
    PRIVACY_POLICY_VERSION: "2026-08-24"
  };
  context.PropertiesService = { getScriptProperties: () => ({ getProperty: (key) => properties[key] || "" }) };
  context.SpreadsheetApp = {
    openById: () => ({ getSheetByName: (name) => name === "CustomerList" ? sheet : null }),
    flush: () => {}
  };
  context.LockService = { getScriptLock: () => ({ waitLock: () => {}, releaseLock: () => {} }) };
  context.UrlFetchApp = {
    fetch: () => ({
      getResponseCode: () => 200,
      getContentText: () => JSON.stringify({ success: options.recaptchaSuccess !== false, hostname: options.hostname || "bridge-to-japan.github.io" })
    })
  };
  context.MailApp = {
    getRemainingDailyQuota: () => typeof options.mailQuota === "function" ? options.mailQuota() : (options.mailQuota ?? 100),
    sendEmail: (message) => {
      if (typeof options.mailFailure === "function" ? options.mailFailure() : options.mailFailure) {
        throw new Error("provider details must stay private");
      }
      mails.push(message);
      if (options.onSend) options.onSend({ sheet, message });
    }
  };
  return { context, sheet, mails, headers };
}

function postEvent(payload, origin = "https://bridge-to-japan.github.io", nonce = "223e4567-e89b-42d3-a456-426614174000") {
  return {
    parameter: {
      payload: JSON.stringify(payload),
      requestId: payload.requestId,
      responseNonce: nonce,
      pageOrigin: origin
    }
  };
}

function bridgeData(output) {
  const match = output.content.match(/window\.top\.postMessage\((\{.*\}),("https:[^"]+")\);/);
  assert.ok(match, "postMessage bridge missing");
  return { data: JSON.parse(match[1]), targetOrigin: JSON.parse(match[2]) };
}

test("accepts the documented payload and normalizes email", () => {
  const context = makeContext();
  const payload = validPayload();
  payload.email = "QA@Example.com";
  context.__raw = JSON.stringify(payload);
  const result = vm.runInContext("parseAndValidatePayload_(__raw, { privacyPolicyVersion: '2026-08-24' })", context);
  assert.equal(result.email, "qa@example.com");
  assert.deepEqual(Array.from(result.services), payload.services);
});

test("uses the production sheet and privacy policy defaults", () => {
  const context = makeContext();
  assert.equal(vm.runInContext("DEFAULT_SHEET_NAME_", context), "CustomerList");
  assert.equal(vm.runInContext("PRIVACY_POLICY_VERSION_", context), "2026-08-24");
  assert.deepEqual(Array.from(vm.runInContext("DEFAULT_ALLOWED_ORIGINS_.slice()", context)), ["https://bridge-to-japan.github.io"]);
  assert.deepEqual(Array.from(vm.runInContext("DEFAULT_RECAPTCHA_HOSTNAMES_.slice()", context)), ["bridge-to-japan.github.io"]);
});

test("keeps the production backend standalone and free of bound Sheet UI access", () => {
  assert.doesNotMatch(source, /getActiveSpreadsheet|getActiveSheet|function onOpen|markSelectedConsultationsClosed|reopenSelectedConsultations/);
  assert.doesNotMatch(manifest.oauthScopes.join("\n"), /script\.container\.ui|spreadsheets\.currentonly/);
  assert.match(source, /getProperty\("SPREADSHEET_ID"\)/);
  assert.match(source, /SpreadsheetApp\.openById\(spreadsheetId\)/);
});

test("uses only the approved Bridge to Japan service codes", () => {
  const context = makeContext();
  assert.deepEqual(Array.from(vm.runInContext("SERVICE_CODES_.slice()", context)), [
    "incorporation_or_branch",
    "business_manager_visa",
    "tax_and_accounting",
    "corporate_bank_account",
    "business_licenses",
    "office_and_real_estate",
    "subsidies_and_loans",
    "other_japan_entry_support"
  ]);
});

test("rejects unknown enums, duplicate selections and extra fields", () => {
  for (const mutate of [
    (payload) => { payload.services = ["unknown"]; },
    (payload) => { payload.referralSources = ["youtube", "youtube"]; },
    (payload) => { payload.unexpected = true; }
  ]) {
    const context = makeContext();
    const payload = validPayload();
    mutate(payload);
    context.__raw = JSON.stringify(payload);
    assert.throws(
      () => vm.runInContext("parseAndValidatePayload_(__raw, { privacyPolicyVersion: '2026-08-24' })", context),
      (error) => error && error.code === "VALIDATION_ERROR"
    );
  }
});

test("requires consent, current policy version and UUID v4", () => {
  for (const mutate of [
    (payload) => { payload.privacyConsent = false; },
    (payload) => { payload.privacyPolicyVersion = "old"; },
    (payload) => { payload.requestId = "not-a-uuid"; }
  ]) {
    const context = makeContext();
    const payload = validPayload();
    mutate(payload);
    context.__raw = JSON.stringify(payload);
    assert.throws(
      () => vm.runInContext("parseAndValidatePayload_(__raw, { privacyPolicyVersion: '2026-08-24' })", context),
      (error) => error && error.code === "VALIDATION_ERROR"
    );
  }
});

test("neutralizes spreadsheet formulas after optional whitespace", () => {
  const context = makeContext();
  for (const dangerous of ["=IMPORTXML('x')", "+1+1", " -2+2", "@SUM(A:A)"]) {
    context.__value = dangerous;
    assert.equal(vm.runInContext("safeSheetText_(__value)", context), `'${dangerous}`);
  }
  context.__value = "ordinary text";
  assert.equal(vm.runInContext("safeSheetText_(__value)", context), "ordinary text");
  context.__value = "'ordinary apostrophe";
  assert.equal(vm.runInContext("fromSheetText_(__value)", context), "'ordinary apostrophe");
});

test("payload hash excludes the one-time reCAPTCHA token", () => {
  const context = makeContext();
  context.__one = validPayload();
  context.__two = { ...validPayload(), recaptchaToken: "another-token" };
  const hashes = vm.runInContext("[payloadHash_(__one), payloadHash_(__two)]", context);
  assert.equal(hashes[0], hashes[1]);
  assert.equal(hashes[0].length, 64);
});

test("bridge response pins channel, nonce and target origin without script injection", () => {
  const context = makeContext();
  context.__result = { ok: false, code: "VALIDATION_ERROR" };
  const output = vm.runInContext(
    "bridgeResponse_(__result, '123e4567-e89b-42d3-a456-426614174000', '223e4567-e89b-42d3-a456-426614174000', 'https://bridge-to-japan.github.io')",
    context
  );
  assert.equal(output.mode, "ALLOWALL");
  assert.match(output.content, /bridge-to-japan-contact-v1/);
  assert.match(output.content, /https:\/\/bridge-to-japan\.github\.io/);
  assert.match(output.content, /223e4567-e89b-42d3-a456-426614174000/);
  assert.doesNotMatch(output.content, /<\/script><script>/i);
});

test("origin and hostname normalizers reject paths and insecure origins", () => {
  const context = makeContext();
  context.__good = "https://BRIDGE-TO-JAPAN.GITHUB.IO/";
  context.__badPath = "https://bridge-to-japan.github.io/path";
  context.__badScheme = "http://bridge-to-japan.github.io";
  assert.equal(vm.runInContext("normalizeOrigin_(__good)", context), "https://bridge-to-japan.github.io");
  assert.equal(vm.runInContext("normalizeOrigin_(__badPath)", context), "");
  assert.equal(vm.runInContext("normalizeOrigin_(__badScheme)", context), "");
});

test("doPost stores one row, mails both operators and replies to the visitor", () => {
  const { context, sheet, mails } = makeIntegrationContext();
  context.__event = postEvent(validPayload());
  const response = bridgeData(vm.runInContext("doPost(__event)", context));
  assert.equal(response.data.ok, true);
  assert.equal(response.targetOrigin, "https://bridge-to-japan.github.io");
  assert.equal(sheet.getLastRow(), 2);
  assert.equal(mails.length, 1);
  assert.equal(mails[0].to, "operator@example.com");
  assert.equal(mails[0].cc, "manager@example.com");
  assert.equal(mails[0].replyTo, "qa@example.com");
  assert.equal(mails[0].name, "Bridge to Japan 상담 접수");
  assert.match(mails[0].subject, /Bridge to Japan/);
  assert.match(JSON.stringify(mails[0]), /사이트 운영 담당자/);
  assert.doesNotMatch(JSON.stringify(mails[0]), /Dana Yoon/);
  assert.equal(sheet.cell(2, 15), "SENT");
});

test("requires valid, distinct CONTACT_TO and CONTACT_CC Script Properties", () => {
  for (const options of [
    { contactTo: "" },
    { contactTo: "not-an-email" },
    { contactTo: "first@example.com,second@example.com" },
    { contactCc: "" },
    { contactCc: "not-an-email" },
    { contactCc: "first@example.com;second@example.com" },
    { contactTo: "Same@Example.com", contactCc: " same@example.com " }
  ]) {
    const { context, sheet, mails } = makeIntegrationContext(options);
    context.__event = postEvent(validPayload());
    const response = bridgeData(vm.runInContext("doPost(__event)", context));
    assert.equal(response.data.ok, false);
    assert.equal(response.data.code, "CONFIGURATION_ERROR");
    assert.equal(sheet.getLastRow(), 1);
    assert.equal(mails.length, 0);
  }
});

test("same request and payload are idempotent, changed payload conflicts", () => {
  const { context, sheet, mails } = makeIntegrationContext();
  const payload = validPayload();
  context.__first = postEvent(payload);
  context.__same = postEvent(payload, "https://bridge-to-japan.github.io", "323e4567-e89b-42d3-a456-426614174000");
  context.__changed = postEvent({ ...payload, message: "변경된 내용" }, "https://bridge-to-japan.github.io", "423e4567-e89b-42d3-a456-426614174000");
  assert.equal(bridgeData(vm.runInContext("doPost(__first)", context)).data.ok, true);
  const duplicate = bridgeData(vm.runInContext("doPost(__same)", context)).data;
  const conflict = bridgeData(vm.runInContext("doPost(__changed)", context)).data;
  assert.equal(duplicate.ok, true);
  assert.equal(duplicate.duplicate, true);
  assert.equal(conflict.ok, false);
  assert.equal(conflict.code, "DUPLICATE_CONFLICT");
  assert.equal(sheet.getLastRow(), 2);
  assert.equal(mails.length, 1);
});

test("mail finalization follows request id when an earlier row is removed", () => {
  const holder = {};
  const integration = makeIntegrationContext({
    onSend: ({ sheet }) => {
      if (!holder.removed) {
        sheet.deleteRow(2);
        holder.removed = true;
      }
    }
  });
  const old = Array(integration.headers.length).fill("");
  old[3] = "323e4567-e89b-42d3-a456-426614174000";
  old[14] = "SENT";
  integration.sheet.rows.push(old);
  integration.context.__event = postEvent(validPayload());

  const result = bridgeData(vm.runInContext("doPost(__event)", integration.context)).data;
  assert.equal(result.ok, true);
  assert.equal(integration.sheet.getLastRow(), 2);
  assert.equal(integration.sheet.cell(2, 4), validPayload().requestId);
  assert.equal(integration.sheet.cell(2, 15), "SENT");
});

test("exact origin and reCAPTCHA hostname allowlists fail closed", () => {
  const originCase = makeIntegrationContext();
  originCase.context.__event = postEvent(validPayload(), "https://evil.example");
  const originResult = bridgeData(vm.runInContext("doPost(__event)", originCase.context));
  assert.equal(originResult.data.code, "PAGE_NOT_ALLOWED");
  assert.notEqual(originResult.targetOrigin, "https://evil.example");
  assert.equal(originCase.sheet.getLastRow(), 1);

  const captchaCase = makeIntegrationContext({ hostname: "evil.example" });
  captchaCase.context.__event = postEvent(validPayload());
  const captchaResult = bridgeData(vm.runInContext("doPost(__event)", captchaCase.context));
  assert.equal(captchaResult.data.code, "BOT_REJECTED");
  assert.equal(captchaCase.sheet.getLastRow(), 1);
});

test("formula-like visitor text is stored as text and failed mail stays queued", () => {
  const { context, sheet, mails } = makeIntegrationContext({ mailFailure: true });
  const payload = { ...validPayload(), firstName: "=IMPORTXML('x')", message: "  @SUM(A:A)" };
  context.__event = postEvent(payload);
  const result = bridgeData(vm.runInContext("doPost(__event)", context)).data;
  assert.equal(result.ok, true);
  assert.equal(result.notificationQueued, true);
  assert.match(String(sheet.cell(2, 7)), /^'=/);
  assert.match(String(sheet.cell(2, 12)), /^'\s*@/);
  assert.equal(sheet.cell(2, 15), "PENDING");
  assert.equal(mails.length, 0);
});

test("requires quota for both recipients and sends the queued mail after quota recovers", () => {
  let quota = 1;
  const { context, sheet, mails } = makeIntegrationContext({ mailQuota: () => quota });
  context.__event = postEvent(validPayload());
  const accepted = bridgeData(vm.runInContext("doPost(__event)", context)).data;
  assert.equal(accepted.ok, true);
  assert.equal(accepted.notificationQueued, true);
  assert.equal(sheet.cell(2, 15), "PENDING");
  assert.equal(sheet.cell(2, 16), "0");
  assert.equal(sheet.cell(2, 19), "MAIL_QUOTA_LOW");
  assert.equal(mails.length, 0);

  quota = 2;
  assert.equal(vm.runInContext("processPendingMailQueue()", context), 1);
  assert.equal(sheet.cell(2, 15), "SENT");
  assert.equal(sheet.cell(2, 16), "1");
  assert.equal(mails.length, 1);
  assert.equal(mails[0].cc, "manager@example.com");
});

test("keeps quota-limited mail pending until a later quota window recovers", () => {
  let quota = 1;
  const { context, sheet, mails } = makeIntegrationContext({ mailQuota: () => quota });
  context.__event = postEvent(validPayload());
  const accepted = bridgeData(vm.runInContext("doPost(__event)", context)).data;
  assert.equal(accepted.ok, true);
  assert.equal(sheet.cell(2, 15), "PENDING");
  assert.equal(sheet.cell(2, 16), "0");

  // More than one day of ten-minute checks must not spend delivery attempts.
  for (let check = 0; check < 150; check += 1) {
    vm.runInContext("processPendingMailQueue()", context);
  }
  assert.equal(sheet.cell(2, 15), "PENDING");
  assert.equal(sheet.cell(2, 16), "0");
  assert.equal(sheet.cell(2, 19), "MAIL_QUOTA_LOW");
  assert.equal(mails.length, 0);

  quota = 2;
  assert.equal(vm.runInContext("processPendingMailQueue()", context), 1);
  assert.equal(sheet.cell(2, 15), "SENT");
  assert.equal(sheet.cell(2, 16), "1");
  assert.equal(mails.length, 1);
});

test("marks a queued notification failed after five actual send failures", () => {
  const { context, sheet, mails } = makeIntegrationContext({ mailFailure: true });
  context.__event = postEvent(validPayload());
  const accepted = bridgeData(vm.runInContext("doPost(__event)", context)).data;
  assert.equal(accepted.ok, true);
  assert.equal(sheet.cell(2, 15), "PENDING");
  assert.equal(sheet.cell(2, 16), "1");

  for (let attempt = 2; attempt <= 5; attempt += 1) {
    vm.runInContext("processPendingMailQueue()", context);
    assert.equal(sheet.cell(2, 16), String(attempt));
  }

  assert.equal(sheet.cell(2, 15), "FAILED");
  assert.equal(sheet.cell(2, 19), "MAIL_SEND_FAILED");
  assert.equal(mails.length, 0);
  assert.equal(vm.runInContext("processPendingMailQueue()", context), 0);
  assert.equal(sheet.cell(2, 16), "5");
});

test("retries a temporary mail failure without duplicating the stored submission", () => {
  let failing = true;
  const { context, sheet, mails } = makeIntegrationContext({ mailFailure: () => failing });
  context.__event = postEvent(validPayload());
  const accepted = bridgeData(vm.runInContext("doPost(__event)", context)).data;
  assert.equal(accepted.ok, true);
  assert.equal(accepted.notificationQueued, true);
  assert.equal(sheet.cell(2, 15), "PENDING");
  assert.equal(sheet.cell(2, 16), "1");

  failing = false;
  assert.equal(vm.runInContext("processPendingMailQueue()", context), 1);
  assert.equal(sheet.getLastRow(), 2);
  assert.equal(sheet.cell(2, 15), "SENT");
  assert.equal(sheet.cell(2, 16), "2");
  assert.equal(mails.length, 1);
});

test("limits repeated submissions by normalized email without storing a new row", () => {
  const { context, sheet, headers } = makeIntegrationContext();
  for (let index = 0; index < 3; index += 1) {
    const row = Array(headers.length).fill("");
    row[0] = new Date().toISOString();
    row[8] = "qa@example.com";
    sheet.rows.push(row);
  }
  context.__event = postEvent(validPayload());
  const result = bridgeData(vm.runInContext("doPost(__event)", context)).data;
  assert.equal(result.ok, false);
  assert.equal(result.code, "RATE_LIMITED");
  assert.equal(sheet.getLastRow(), 4);
});

test("enforces the configurable global hourly limit before storing a row", () => {
  const { context, sheet, headers } = makeIntegrationContext({ globalHourLimit: 2, globalDayLimit: 40 });
  for (let index = 0; index < 2; index += 1) {
    const row = Array(headers.length).fill("");
    row[0] = new Date(Date.now() - index * 60_000).toISOString();
    row[8] = `other-${index}@example.com`;
    sheet.rows.push(row);
  }
  context.__event = postEvent(validPayload());
  const result = bridgeData(vm.runInContext("doPost(__event)", context)).data;
  assert.equal(result.ok, false);
  assert.equal(result.code, "RATE_LIMITED");
  assert.equal(sheet.getLastRow(), 3);
});

test("enforces the configurable global daily limit independently of the hourly window", () => {
  const { context, sheet, headers } = makeIntegrationContext({ globalHourLimit: 10, globalDayLimit: 3 });
  for (let index = 0; index < 3; index += 1) {
    const row = Array(headers.length).fill("");
    row[0] = new Date(Date.now() - 2 * 60 * 60 * 1000 - index * 60_000).toISOString();
    row[8] = `other-${index}@example.com`;
    sheet.rows.push(row);
  }
  context.__event = postEvent(validPayload());
  const result = bridgeData(vm.runInContext("doPost(__event)", context)).data;
  assert.equal(result.ok, false);
  assert.equal(result.code, "RATE_LIMITED");
  assert.equal(sheet.getLastRow(), 4);
});

test("daily purge removes only rows whose post-closure delete date has passed", () => {
  const { context, sheet, headers } = makeIntegrationContext();
  const expired = Array(headers.length).fill("");
  expired[1] = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000 - 60_000).toISOString();
  expired[2] = new Date(Date.now() - 60_000).toISOString();
  expired[3] = "123e4567-e89b-42d3-a456-426614174000";
  const open = Array(headers.length).fill("");
  open[2] = new Date(Date.now() - 60_000).toISOString();
  open[3] = "223e4567-e89b-42d3-a456-426614174000";
  sheet.rows.push(expired, open);
  assert.equal(vm.runInContext("purgeExpiredSubmissions()", context), 1);
  assert.equal(sheet.getLastRow(), 2);
  assert.equal(sheet.cell(2, 4), "223e4567-e89b-42d3-a456-426614174000");
});
