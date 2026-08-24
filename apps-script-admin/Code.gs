/**
 * Bridge to Japan CustomerList admin helper.
 *
 * This project must be bound to the private consultation spreadsheet. It is
 * intentionally limited to the active spreadsheet and contains no endpoint,
 * recipient, reCAPTCHA, Script Properties, mail, fetch, deployment or trigger
 * logic. Every action runs as the editor who clicks the menu item.
 */

const ADMIN_SHEET_NAME_ = "CustomerList";
const ADMIN_RETENTION_YEARS_ = 1;
const ADMIN_SHEET_HEADERS_ = [
  "received_at",
  "consultation_closed_at",
  "delete_after",
  "request_id",
  "payload_sha256",
  "last_name",
  "first_name",
  "company",
  "email",
  "services",
  "referral_sources",
  "message",
  "privacy_consent",
  "privacy_policy_version",
  "mail_state",
  "mail_attempts",
  "mail_sent_at",
  "mail_lease_until",
  "mail_last_error"
];

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Bridge to Japan 상담 관리")
    .addItem("선택한 상담 종료 처리", "markSelectedConsultationsClosed")
    .addItem("선택한 상담 종료 취소", "reopenSelectedConsultations")
    .addToUi();
}

function markSelectedConsultationsClosed() {
  return updateSelectedClosure_(true);
}

function reopenSelectedConsultations() {
  return updateSelectedClosure_(false);
}

function updateSelectedClosure_(closed) {
  const spreadsheet = SpreadsheetApp.getActive();
  const sheet = spreadsheet && spreadsheet.getActiveSheet();
  if (!sheet || sheet.getName() !== ADMIN_SHEET_NAME_) {
    throw new Error("ADMIN_SHEET_CONFIGURATION_ERROR");
  }
  verifyAdminSheetHeaders_(sheet);

  const activeRange = sheet.getActiveRange();
  if (!activeRange) return 0;
  const firstRow = Math.max(2, activeRange.getRow());
  const lastRow = Math.min(sheet.getLastRow(), activeRange.getLastRow());
  if (lastRow < firstRow) return 0;

  const rowCount = lastRow - firstRow + 1;
  const requestIds = sheet
    .getRange(firstRow, adminHeaderColumn_("request_id"), rowCount, 1)
    .getDisplayValues();
  const closureRange = sheet.getRange(
    firstRow,
    adminHeaderColumn_("consultation_closed_at"),
    rowCount,
    2
  );
  const closureValues = closureRange.getValues();
  const now = new Date();
  const deleteAt = addAdminCalendarYears_(now, ADMIN_RETENTION_YEARS_);
  let updated = 0;

  requestIds.forEach(function (values, index) {
    if (!isAdminUuid_(values[0])) return;
    closureValues[index][0] = closed ? now.toISOString() : "";
    closureValues[index][1] = closed ? deleteAt.toISOString() : "";
    updated += 1;
  });

  if (updated > 0) closureRange.setValues(closureValues);
  spreadsheet.toast(
    closed
      ? updated + "건을 상담 종료로 표시했습니다."
      : updated + "건의 상담 종료 표시를 취소했습니다."
  );
  return updated;
}

function verifyAdminSheetHeaders_(sheet) {
  if (sheet.getLastRow() < 1 || sheet.getLastColumn() !== ADMIN_SHEET_HEADERS_.length) {
    throw new Error("ADMIN_SHEET_CONFIGURATION_ERROR");
  }
  const headers = sheet
    .getRange(1, 1, 1, ADMIN_SHEET_HEADERS_.length)
    .getDisplayValues()[0];
  if (headers.some(function (header, index) {
    return header !== ADMIN_SHEET_HEADERS_[index];
  })) {
    throw new Error("ADMIN_SHEET_CONFIGURATION_ERROR");
  }
}

function adminHeaderColumn_(header) {
  const index = ADMIN_SHEET_HEADERS_.indexOf(header);
  if (index < 0) throw new Error("ADMIN_SHEET_CONFIGURATION_ERROR");
  return index + 1;
}

function isAdminUuid_(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    .test(String(value || ""));
}

function addAdminCalendarYears_(value, years) {
  const date = new Date(value.getTime());
  date.setUTCFullYear(date.getUTCFullYear() + years);
  return date;
}
