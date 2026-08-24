/**
 * Bridge to Japan consultation receiver.
 *
 * Runtime: standalone Google Apps Script V8, deployed as a web app that
 * executes as the deployer. Do not log request bodies, visitor data,
 * reCAPTCHA tokens or secrets.
 */

const CONTACT_CHANNEL_ = "bridge-to-japan-contact-v1";
const PRIVACY_POLICY_VERSION_ = "2026-08-24";
const DEFAULT_SHEET_NAME_ = "CustomerList";
const DEFAULT_ALLOWED_ORIGINS_ = [
  "https://bridge-to-japan.github.io"
];
const DEFAULT_RECAPTCHA_HOSTNAMES_ = [
  "bridge-to-japan.github.io"
];

const SHEET_HEADERS_ = [
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

const SERVICE_CODES_ = [
  "incorporation_or_branch",
  "business_manager_visa",
  "tax_and_accounting",
  "corporate_bank_account",
  "business_licenses",
  "office_and_real_estate",
  "subsidies_and_loans",
  "other_japan_entry_support"
];

const REFERRAL_CODES_ = [
  "facebook",
  "google_search",
  "linkedin",
  "others",
  "friend_referral",
  "other_websites",
  "youtube",
  "ai_search_or_gpt"
];

const SERVICE_LABELS_ = {
  incorporation_or_branch: "일본 법인 설립 / 지점 등록",
  business_manager_visa: "경영·관리 비자",
  tax_and_accounting: "세무 / 회계",
  corporate_bank_account: "법인 은행 계좌",
  business_licenses: "사업 라이선스 / 인허가",
  office_and_real_estate: "사무실 / 사업용 부동산",
  subsidies_and_loans: "보조금 / 대출",
  other_japan_entry_support: "기타 일본 진출 상담"
};

const REFERRAL_LABELS_ = {
  facebook: "Facebook",
  google_search: "Google 검색",
  linkedin: "LinkedIn",
  others: "기타",
  friend_referral: "지인 추천",
  other_websites: "다른 웹사이트",
  youtube: "YouTube",
  ai_search_or_gpt: "AI 검색 / GPT"
};

const PUBLIC_ERROR_CODES_ = [
  "VALIDATION_ERROR",
  "BOT_REJECTED",
  "PAGE_NOT_ALLOWED",
  "RATE_LIMITED",
  "DUPLICATE_CONFLICT",
  "VERIFICATION_UNAVAILABLE",
  "CONFIGURATION_ERROR",
  "SERVICE_UNAVAILABLE"
];

class ContactError extends Error {
  constructor(code) {
    super(code);
    this.name = "ContactError";
    this.code = code;
  }
}

function doGet() {
  return HtmlService.createHtmlOutput(
    "<!doctype html><html lang=\"ko\"><meta charset=\"utf-8\"><title>Bridge to Japan 상담 접수</title><body><p>Bridge to Japan 상담 접수 서비스가 실행 중입니다.</p></body></html>"
  );
}

function doPost(e) {
  const parameters = e && e.parameter ? e.parameter : {};
  const requestId = trimTransportValue_(parameters.requestId, 80);
  const responseNonce = trimTransportValue_(parameters.responseNonce, 80);
  const pageOrigin = normalizeOrigin_(trimTransportValue_(parameters.pageOrigin, 200));
  const allowedOrigins = getAllowedOrigins_();
  const targetOrigin = allowedOrigins.indexOf(pageOrigin) >= 0 ? pageOrigin : allowedOrigins[0];
  let result;

  try {
    if (!pageOrigin || allowedOrigins.indexOf(pageOrigin) < 0) {
      throw new ContactError("PAGE_NOT_ALLOWED");
    }
    if (!isUuid_(requestId) || !isUuid_(responseNonce)) {
      throw new ContactError("VALIDATION_ERROR");
    }
    result = acceptSubmission_(parameters.payload, requestId);
  } catch (error) {
    result = {
      ok: false,
      code: publicErrorCode_(error),
      requestId: requestId
    };
  }

  return bridgeResponse_(result, requestId, responseNonce, targetOrigin);
}

function acceptSubmission_(rawPayload, transportRequestId) {
  const config = getRuntimeConfig_();
  const payload = parseAndValidatePayload_(rawPayload, config);
  if (payload.requestId !== transportRequestId) {
    throw new ContactError("VALIDATION_ERROR");
  }

  // A filled honeypot receives a non-revealing success response but is not stored.
  if (payload.website) {
    return { ok: true, requestId: payload.requestId, duplicate: false };
  }

  const sheet = getConfiguredSheet_(config);
  const payloadHash = payloadHash_(payload);
  const preexisting = withScriptLock_(function () {
    return findSubmissionByRequestId_(sheet, payload.requestId);
  });
  if (preexisting) {
    return duplicateResult_(preexisting, payloadHash, payload.requestId);
  }

  verifyRecaptcha_(payload.recaptchaToken, config);

  const accepted = withScriptLock_(function () {
    const existing = findSubmissionByRequestId_(sheet, payload.requestId);
    if (existing) return { duplicate: true, existing: existing };

    enforceGlobalRateLimits_(sheet, config);
    enforceEmailRateLimit_(sheet, payload.email, config);
    appendSubmission_(sheet, payload, payloadHash);
    return { duplicate: false };
  });

  if (accepted.duplicate) {
    return duplicateResult_(accepted.existing, payloadHash, payload.requestId);
  }

  // The row is the source of truth. A temporary MailApp failure leaves it queued.
  let notificationQueued = false;
  try {
    sendQueuedNotification_(sheet, payload.requestId, config);
    notificationQueued = getMailStateByRequestId_(sheet, payload.requestId) !== "SENT";
  } catch (ignored) {
    notificationQueued = true;
  }

  return {
    ok: true,
    requestId: payload.requestId,
    duplicate: false,
    notificationQueued: notificationQueued
  };
}

function parseAndValidatePayload_(rawPayload, config) {
  if (typeof rawPayload !== "string" || !rawPayload || byteLength_(rawPayload) > 32768) {
    throw new ContactError("VALIDATION_ERROR");
  }

  let input;
  try {
    input = JSON.parse(rawPayload);
  } catch (ignored) {
    throw new ContactError("VALIDATION_ERROR");
  }
  if (!input || Object.prototype.toString.call(input) !== "[object Object]") {
    throw new ContactError("VALIDATION_ERROR");
  }

  const allowedKeys = [
    "requestId", "firstName", "lastName", "company", "email", "services",
    "referralSources", "message", "privacyConsent", "privacyPolicyVersion",
    "recaptchaToken", "website"
  ];
  const inputKeys = Object.keys(input);
  if (inputKeys.length !== allowedKeys.length || inputKeys.some(function (key) { return allowedKeys.indexOf(key) < 0; })) {
    throw new ContactError("VALIDATION_ERROR");
  }

  const payload = {
    requestId: requiredString_(input.requestId, 80, false),
    firstName: requiredString_(input.firstName, 80, false),
    lastName: requiredString_(input.lastName, 80, false),
    company: optionalString_(input.company, 120, false),
    email: requiredString_(input.email, 254, false).toLowerCase(),
    services: validateEnumArray_(input.services, SERVICE_CODES_),
    referralSources: validateEnumArray_(input.referralSources, REFERRAL_CODES_),
    message: optionalString_(input.message, 2000, true),
    privacyConsent: input.privacyConsent,
    privacyPolicyVersion: requiredString_(input.privacyPolicyVersion, 40, false),
    recaptchaToken: requiredString_(input.recaptchaToken, 4096, false),
    website: optionalString_(input.website, 200, false)
  };

  if (!isUuid_(payload.requestId) || !isEmail_(payload.email)) {
    throw new ContactError("VALIDATION_ERROR");
  }
  if (payload.privacyConsent !== true || payload.privacyPolicyVersion !== config.privacyPolicyVersion) {
    throw new ContactError("VALIDATION_ERROR");
  }
  return payload;
}

function requiredString_(value, maximumLength, preserveNewlines) {
  const normalized = optionalString_(value, maximumLength, preserveNewlines);
  if (!normalized) throw new ContactError("VALIDATION_ERROR");
  return normalized;
}

function optionalString_(value, maximumLength, preserveNewlines) {
  if (typeof value !== "string") throw new ContactError("VALIDATION_ERROR");
  let normalized = value.replace(/\r\n?/g, "\n").trim();
  if (!preserveNewlines) normalized = normalized.replace(/\s+/g, " ");
  if (normalized.length > maximumLength || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(normalized)) {
    throw new ContactError("VALIDATION_ERROR");
  }
  return normalized;
}

function validateEnumArray_(value, allowed) {
  if (!Array.isArray(value) || value.length < 1 || value.length > allowed.length) {
    throw new ContactError("VALIDATION_ERROR");
  }
  const unique = [];
  value.forEach(function (item) {
    if (typeof item !== "string" || allowed.indexOf(item) < 0 || unique.indexOf(item) >= 0) {
      throw new ContactError("VALIDATION_ERROR");
    }
    unique.push(item);
  });
  return unique;
}

function getRuntimeConfig_() {
  const properties = PropertiesService.getScriptProperties();
  const spreadsheetId = (properties.getProperty("SPREADSHEET_ID") || "").trim();
  const sheetName = (properties.getProperty("SHEET_NAME") || DEFAULT_SHEET_NAME_).trim();
  const contactTo = (properties.getProperty("CONTACT_TO") || "").trim().toLowerCase();
  const contactCc = (properties.getProperty("CONTACT_CC") || "").trim().toLowerCase();
  const recaptchaSecret = (properties.getProperty("RECAPTCHA_SECRET_KEY") || "").trim();
  const emailRateLimitPerHour = parseBoundedInteger_(properties.getProperty("EMAIL_RATE_LIMIT_PER_HOUR"), 3, 1, 20);
  const globalSubmissionLimitPerHour = parseBoundedInteger_(properties.getProperty("GLOBAL_SUBMISSION_LIMIT_PER_HOUR"), 10, 1, 1000);
  const globalSubmissionLimitPerDay = parseBoundedInteger_(properties.getProperty("GLOBAL_SUBMISSION_LIMIT_PER_DAY"), 40, 1, 10000);
  const privacyVersion = (properties.getProperty("PRIVACY_POLICY_VERSION") || PRIVACY_POLICY_VERSION_).trim();
  const expectedHostnames = getExpectedRecaptchaHostnames_();

  if (
    !spreadsheetId || !sheetName || !isSingleEmailAddress_(contactTo) || !isSingleEmailAddress_(contactCc)
    || contactTo === contactCc || !recaptchaSecret || !expectedHostnames.length
  ) {
    throw new ContactError("CONFIGURATION_ERROR");
  }
  return {
    spreadsheetId: spreadsheetId,
    sheetName: sheetName,
    contactTo: contactTo,
    contactCc: contactCc,
    recaptchaSecret: recaptchaSecret,
    emailRateLimitPerHour: emailRateLimitPerHour,
    globalSubmissionLimitPerHour: globalSubmissionLimitPerHour,
    globalSubmissionLimitPerDay: globalSubmissionLimitPerDay,
    privacyPolicyVersion: privacyVersion,
    expectedHostnames: expectedHostnames
  };
}

function getAllowedOrigins_() {
  let configured = "";
  try {
    configured = PropertiesService.getScriptProperties().getProperty("ALLOWED_PARENT_ORIGINS") || "";
  } catch (ignored) {
    configured = "";
  }
  const values = configured ? configured.split(",") : DEFAULT_ALLOWED_ORIGINS_;
  const origins = values.map(function (value) { return normalizeOrigin_(String(value).trim()); }).filter(Boolean);
  return origins.length ? Array.from(new Set(origins)) : DEFAULT_ALLOWED_ORIGINS_.slice();
}

function getExpectedRecaptchaHostnames_() {
  const properties = PropertiesService.getScriptProperties();
  const configured = properties.getProperty("RECAPTCHA_EXPECTED_HOSTNAMES")
    || properties.getProperty("RECAPTCHA_EXPECTED_HOSTNAME")
    || "";
  const values = configured ? configured.split(",") : DEFAULT_RECAPTCHA_HOSTNAMES_;
  return Array.from(new Set(values.map(function (value) {
    return normalizeHostname_(String(value));
  }).filter(Boolean)));
}

function getConfiguredSheet_(config) {
  let spreadsheet;
  try {
    spreadsheet = SpreadsheetApp.openById(config.spreadsheetId);
  } catch (ignored) {
    throw new ContactError("CONFIGURATION_ERROR");
  }
  const sheet = spreadsheet.getSheetByName(config.sheetName);
  if (!sheet) throw new ContactError("CONFIGURATION_ERROR");
  verifySheetHeaders_(sheet);
  return sheet;
}

function verifySheetHeaders_(sheet) {
  if (sheet.getLastColumn() !== SHEET_HEADERS_.length || sheet.getLastRow() < 1) {
    throw new ContactError("CONFIGURATION_ERROR");
  }
  const headers = sheet.getRange(1, 1, 1, SHEET_HEADERS_.length).getDisplayValues()[0];
  if (headers.some(function (header, index) { return header !== SHEET_HEADERS_[index]; })) {
    throw new ContactError("CONFIGURATION_ERROR");
  }
}

function verifyRecaptcha_(token, config) {
  let response;
  try {
    response = UrlFetchApp.fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "post",
      payload: { secret: config.recaptchaSecret, response: token },
      muteHttpExceptions: true
    });
  } catch (ignored) {
    throw new ContactError("VERIFICATION_UNAVAILABLE");
  }
  if (response.getResponseCode() !== 200) {
    throw new ContactError("VERIFICATION_UNAVAILABLE");
  }

  let result;
  try {
    result = JSON.parse(response.getContentText());
  } catch (ignored) {
    throw new ContactError("VERIFICATION_UNAVAILABLE");
  }
  const hostname = normalizeHostname_(result && result.hostname ? result.hostname : "");
  if (!result || result.success !== true || config.expectedHostnames.indexOf(hostname) < 0) {
    throw new ContactError("BOT_REJECTED");
  }
}

function appendSubmission_(sheet, payload, payloadHash) {
  const rowNumber = sheet.getLastRow() + 1;
  const row = [
    isoNow_(), "", "", payload.requestId, payloadHash,
    safeSheetText_(payload.lastName), safeSheetText_(payload.firstName),
    safeSheetText_(payload.company), safeSheetText_(payload.email),
    safeSheetText_(payload.services.join(" | ")),
    safeSheetText_(payload.referralSources.join(" | ")),
    safeSheetText_(payload.message), "TRUE", payload.privacyPolicyVersion,
    "PENDING", "0", "", "", ""
  ];
  const range = sheet.getRange(rowNumber, 1, 1, SHEET_HEADERS_.length);
  range.setNumberFormat("@");
  range.setValues([row]);
  return rowNumber;
}

function findSubmissionByRequestId_(sheet, requestId) {
  if (sheet.getLastRow() < 2) return null;
  const column = headerColumn_("request_id");
  const match = sheet.getRange(2, column, sheet.getLastRow() - 1, 1)
    .createTextFinder(requestId)
    .matchEntireCell(true)
    .findNext();
  if (!match) return null;
  const rowNumber = match.getRow();
  return {
    rowNumber: rowNumber,
    payloadHash: String(sheet.getRange(rowNumber, headerColumn_("payload_sha256")).getDisplayValue())
  };
}

function duplicateResult_(existing, expectedHash, requestId) {
  if (existing.payloadHash !== expectedHash) {
    throw new ContactError("DUPLICATE_CONFLICT");
  }
  return { ok: true, requestId: requestId, duplicate: true, notificationQueued: false };
}

function enforceGlobalRateLimits_(sheet, config) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const receivedValues = sheet.getRange(2, headerColumn_("received_at"), lastRow - 1, 1).getDisplayValues();
  const now = Date.now();
  const hourCutoff = now - 60 * 60 * 1000;
  const dayCutoff = now - 24 * 60 * 60 * 1000;
  let hourlyCount = 0;
  let dailyCount = 0;
  receivedValues.forEach(function (value) {
    const receivedAt = Date.parse(value[0]);
    if (!Number.isFinite(receivedAt)) return;
    if (receivedAt >= dayCutoff) dailyCount += 1;
    if (receivedAt >= hourCutoff) hourlyCount += 1;
  });
  if (
    hourlyCount >= config.globalSubmissionLimitPerHour
    || dailyCount >= config.globalSubmissionLimitPerDay
  ) {
    throw new ContactError("RATE_LIMITED");
  }
}

function enforceEmailRateLimit_(sheet, email, config) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const receivedValues = sheet.getRange(2, headerColumn_("received_at"), lastRow - 1, 1).getDisplayValues();
  const emailValues = sheet.getRange(2, headerColumn_("email"), lastRow - 1, 1).getDisplayValues();
  const cutoff = Date.now() - 60 * 60 * 1000;
  let matches = 0;
  for (let index = 0; index < receivedValues.length; index += 1) {
    if (String(emailValues[index][0]).replace(/^'/, "").toLowerCase() !== email.toLowerCase()) continue;
    const receivedAt = Date.parse(receivedValues[index][0]);
    if (Number.isFinite(receivedAt) && receivedAt >= cutoff) matches += 1;
  }
  if (matches >= config.emailRateLimitPerHour) throw new ContactError("RATE_LIMITED");
}

function payloadHash_(payload) {
  const canonical = JSON.stringify({
    requestId: payload.requestId,
    firstName: payload.firstName,
    lastName: payload.lastName,
    company: payload.company,
    email: payload.email,
    services: payload.services,
    referralSources: payload.referralSources,
    message: payload.message,
    privacyConsent: payload.privacyConsent,
    privacyPolicyVersion: payload.privacyPolicyVersion
  });
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, canonical, Utilities.Charset.UTF_8);
  return digest.map(function (value) { return (value < 0 ? value + 256 : value).toString(16).padStart(2, "0"); }).join("");
}

function sendQueuedNotification_(sheet, requestId, config) {
  let snapshot;
  let claimAttempts = 0;
  let claimLeaseUntil = "";
  const leaseAcquired = withScriptLock_(function () {
    const submission = findSubmissionByRequestId_(sheet, requestId);
    if (!submission) return false;
    const rowNumber = submission.rowNumber;
    const values = sheet.getRange(rowNumber, 1, 1, SHEET_HEADERS_.length).getDisplayValues()[0];
    const state = values[headerColumn_("mail_state") - 1];
    const leaseUntil = Date.parse(values[headerColumn_("mail_lease_until") - 1] || "");
    const attempts = Number(values[headerColumn_("mail_attempts") - 1] || 0);
    if (state === "SENT" || state === "FAILED") return false;
    if (state === "SENDING" && Number.isFinite(leaseUntil) && leaseUntil > Date.now()) return false;
    if (attempts >= 5) {
      setMailCells_(sheet, rowNumber, "FAILED", attempts, "", "", "MAIL_RETRY_LIMIT");
      return false;
    }
    if (MailApp.getRemainingDailyQuota() < 2) {
      // Quota windows can take up to 24 hours to reset. Keep the notification
      // queued without spending a delivery attempt so the clock trigger can
      // resume automatically after quota becomes available again.
      setMailCells_(sheet, rowNumber, "PENDING", attempts, "", "", "MAIL_QUOTA_LOW");
      return false;
    }
    snapshot = rowObject_(values);
    claimAttempts = attempts + 1;
    claimLeaseUntil = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    setMailCells_(sheet, rowNumber, "SENDING", claimAttempts, "", claimLeaseUntil, "");
    SpreadsheetApp.flush();
    return true;
  });
  if (!leaseAcquired) return false;

  try {
    const email = notificationEmail_(snapshot, config);
    MailApp.sendEmail(email);
    withScriptLock_(function () {
      const submission = findSubmissionByRequestId_(sheet, requestId);
      if (!submission || !mailClaimIsCurrent_(sheet, submission.rowNumber, claimLeaseUntil)) return;
      setMailCells_(sheet, submission.rowNumber, "SENT", claimAttempts, isoNow_(), "", "");
    });
    return true;
  } catch (ignored) {
    withScriptLock_(function () {
      const submission = findSubmissionByRequestId_(sheet, requestId);
      if (!submission || !mailClaimIsCurrent_(sheet, submission.rowNumber, claimLeaseUntil)) return;
      const attempts = Number(getCellByHeader_(sheet, submission.rowNumber, "mail_attempts") || 0);
      setMailCells_(sheet, submission.rowNumber, attempts >= 5 ? "FAILED" : "PENDING", attempts, "", "", "MAIL_SEND_FAILED");
    });
    throw new ContactError("SERVICE_UNAVAILABLE");
  }
}

function mailClaimIsCurrent_(sheet, rowNumber, leaseUntil) {
  return getCellByHeader_(sheet, rowNumber, "mail_state") === "SENDING"
    && getCellByHeader_(sheet, rowNumber, "mail_lease_until") === leaseUntil;
}

function getMailStateByRequestId_(sheet, requestId) {
  return withScriptLock_(function () {
    const submission = findSubmissionByRequestId_(sheet, requestId);
    return submission ? getCellByHeader_(sheet, submission.rowNumber, "mail_state") : "";
  });
}

function notificationEmail_(row, config) {
  const serviceCodes = splitCodes_(row.services);
  const referralCodes = splitCodes_(row.referral_sources);
  const services = serviceCodes.map(function (code) { return SERVICE_LABELS_[code] || code; });
  const referrals = referralCodes.map(function (code) { return REFERRAL_LABELS_[code] || code; });
  const fullName = (row.last_name + " " + row.first_name).trim();
  const shortId = String(row.request_id).slice(0, 8);
  const subject = "[Bridge to Japan 상담] " + fullName + " · " + (services[0] || "문의") + " · " + shortId;
  const plainLines = [
    "Bridge to Japan 상담 요청이 접수되었습니다.",
    "사이트 운영 담당자의 초기 확인 후 필요한 경우 T.Yoon / deep zone inc.로 일본 현지 상담을 연결합니다.", "",
    "접수 ID: " + row.request_id,
    "접수 시각: " + row.received_at,
    "성함: " + fullName,
    "회사명: " + (row.company || "입력하지 않음"),
    "이메일: " + row.email,
    "관심 서비스: " + services.join(", "),
    "유입 경로: " + referrals.join(", "),
    "개인정보 안내 버전: " + row.privacy_policy_version,
    "", "상담 메시지", row.message || "입력하지 않음", "",
    "이 메일에 답장하면 방문자가 입력한 이메일로 회신됩니다.",
    "상담이 끝나면 Google Sheets에서 해당 행을 선택하고 ‘상담 종료 처리’를 실행해 주세요."
  ];
  const htmlBody = [
    "<div style=\"font-family:Arial,'Noto Sans KR',sans-serif;line-height:1.65;color:#17171a\">",
    "<h2 style=\"margin:0 0 20px\">Bridge to Japan 상담 요청</h2>",
    "<p style=\"margin:0 0 20px;color:#666\">사이트 운영 담당자의 초기 확인 후 필요한 경우 T.Yoon / deep zone inc.로 일본 현지 상담을 연결합니다.</p>",
    mailRow_("접수 ID", row.request_id),
    mailRow_("접수 시각", row.received_at),
    mailRow_("성함", fullName),
    mailRow_("회사명", row.company || "입력하지 않음"),
    mailRow_("이메일", row.email),
    mailRow_("관심 서비스", services.join(", ")),
    mailRow_("유입 경로", referrals.join(", ")),
    "<h3 style=\"margin:24px 0 8px\">상담 메시지</h3>",
    "<div style=\"padding:16px;border-radius:12px;background:#f5f5f5;white-space:pre-wrap\">" + escapeHtml_(row.message || "입력하지 않음") + "</div>",
    "<p style=\"margin-top:24px;color:#666\">이 메일에 답장하면 방문자가 입력한 이메일로 회신됩니다.</p>",
    "</div>"
  ].join("");
  return {
    to: config.contactTo,
    cc: config.contactCc,
    replyTo: row.email,
    name: "Bridge to Japan 상담 접수",
    subject: subject,
    body: plainLines.join("\n"),
    htmlBody: htmlBody
  };
}

function mailRow_(label, value) {
  return "<p style=\"margin:6px 0\"><strong>" + escapeHtml_(label) + ":</strong> " + escapeHtml_(value) + "</p>";
}

function processPendingMailQueue() {
  const config = getRuntimeConfig_();
  const sheet = getConfiguredSheet_(config);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;
  const requestIds = withScriptLock_(function () {
    return sheet.getRange(2, 1, lastRow - 1, SHEET_HEADERS_.length).getDisplayValues()
      .filter(function (values) {
        const state = values[headerColumn_("mail_state") - 1];
        const leaseUntil = Date.parse(values[headerColumn_("mail_lease_until") - 1] || "");
        return state === "PENDING"
          || (state === "SENDING" && (!Number.isFinite(leaseUntil) || leaseUntil <= Date.now()));
      })
      .map(function (values) { return values[headerColumn_("request_id") - 1]; })
      .filter(isUuid_)
      .slice(0, 20);
  });
  let processed = 0;
  for (let index = 0; index < requestIds.length; index += 1) {
    try {
      if (sendQueuedNotification_(sheet, requestIds[index], config)) processed += 1;
    } catch (ignored) {
      // The row records a safe error code; no visitor data is logged.
    }
  }
  return processed;
}

function setup() {
  const properties = PropertiesService.getScriptProperties();
  setDefaultProperty_(properties, "SHEET_NAME", DEFAULT_SHEET_NAME_);
  setDefaultProperty_(properties, "ALLOWED_PARENT_ORIGINS", DEFAULT_ALLOWED_ORIGINS_.join(","));
  setDefaultProperty_(properties, "RECAPTCHA_EXPECTED_HOSTNAMES", DEFAULT_RECAPTCHA_HOSTNAMES_.join(","));
  setDefaultProperty_(properties, "EMAIL_RATE_LIMIT_PER_HOUR", "3");
  setDefaultProperty_(properties, "GLOBAL_SUBMISSION_LIMIT_PER_HOUR", "10");
  setDefaultProperty_(properties, "GLOBAL_SUBMISSION_LIMIT_PER_DAY", "40");
  setDefaultProperty_(properties, "PRIVACY_POLICY_VERSION", PRIVACY_POLICY_VERSION_);

  const spreadsheetId = (properties.getProperty("SPREADSHEET_ID") || "").trim();
  if (!spreadsheetId) throw new ContactError("CONFIGURATION_ERROR");
  let spreadsheet;
  try {
    spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  } catch (ignored) {
    throw new ContactError("CONFIGURATION_ERROR");
  }

  const sheetName = properties.getProperty("SHEET_NAME") || DEFAULT_SHEET_NAME_;
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) sheet = spreadsheet.insertSheet(sheetName);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, SHEET_HEADERS_.length).setValues([SHEET_HEADERS_]);
  }
  verifySheetHeaders_(sheet);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, SHEET_HEADERS_.length).setFontWeight("bold").setBackground("#17171a").setFontColor("#ffffff");
  sheet.autoResizeColumns(1, SHEET_HEADERS_.length);
  installTrigger_("processPendingMailQueue", function () { return ScriptApp.newTrigger("processPendingMailQueue").timeBased().everyMinutes(10); });
  installTrigger_("purgeExpiredSubmissions", function () { return ScriptApp.newTrigger("purgeExpiredSubmissions").timeBased().everyDays(1).atHour(3); });
  return { ok: true, spreadsheetId: spreadsheetId, sheetName: sheetName };
}

function purgeExpiredSubmissions() {
  const config = getRuntimeConfig_();
  const sheet = getConfiguredSheet_(config);
  let deleted = 0;
  withScriptLock_(function () {
    for (let row = sheet.getLastRow(); row >= 2; row -= 1) {
      const closedAt = Date.parse(getCellByHeader_(sheet, row, "consultation_closed_at") || "");
      const deleteAt = Date.parse(getCellByHeader_(sheet, row, "delete_after") || "");
      if (Number.isFinite(closedAt) && Number.isFinite(deleteAt) && deleteAt <= Date.now()) {
        sheet.deleteRow(row);
        deleted += 1;
      }
    }
  });
  return deleted;
}

function bridgeResponse_(result, requestId, responseNonce, targetOrigin) {
  const message = {
    channel: CONTACT_CHANNEL_,
    ok: result && result.ok === true,
    code: result && result.ok === true ? undefined : (result.code || "SERVICE_UNAVAILABLE"),
    requestId: requestId,
    responseNonce: responseNonce,
    duplicate: Boolean(result && result.duplicate),
    notificationQueued: Boolean(result && result.notificationQueued)
  };
  const safeMessage = scriptSafeJson_(message);
  const safeOrigin = scriptSafeJson_(targetOrigin || DEFAULT_ALLOWED_ORIGINS_[0]);
  const html = "<!doctype html><html lang=\"ko\"><meta charset=\"utf-8\"><title>상담 요청 처리</title><body><script>\"use strict\";window.top.postMessage(" + safeMessage + "," + safeOrigin + ");<\/script></body></html>";
  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function scriptSafeJson_(value) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function safeSheetText_(value) {
  const text = String(value == null ? "" : value);
  return /^\s*[=+\-@]/.test(text) ? "'" + text : text;
}

function escapeHtml_(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function rowObject_(values) {
  const row = {};
  SHEET_HEADERS_.forEach(function (header, index) { row[header] = fromSheetText_(values[index]); });
  return row;
}

function fromSheetText_(value) {
  const text = String(value == null ? "" : value);
  return text.charAt(0) === "'" && /^\s*[=+\-@]/.test(text.slice(1)) ? text.slice(1) : text;
}

function setMailCells_(sheet, row, state, attempts, sentAt, leaseUntil, errorCode) {
  sheet.getRange(row, headerColumn_("mail_state")).setValue(state);
  sheet.getRange(row, headerColumn_("mail_attempts")).setValue(String(attempts));
  sheet.getRange(row, headerColumn_("mail_sent_at")).setValue(sentAt || "");
  sheet.getRange(row, headerColumn_("mail_lease_until")).setValue(leaseUntil || "");
  sheet.getRange(row, headerColumn_("mail_last_error")).setValue(errorCode || "");
}

function getCellByHeader_(sheet, row, header) {
  return String(sheet.getRange(row, headerColumn_(header)).getDisplayValue() || "");
}

function headerColumn_(header) {
  const index = SHEET_HEADERS_.indexOf(header);
  if (index < 0) throw new ContactError("CONFIGURATION_ERROR");
  return index + 1;
}

function splitCodes_(value) {
  return String(value || "").replace(/^'/, "").split(" | ").filter(Boolean);
}

function withScriptLock_(callback) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (ignored) {
    throw new ContactError("SERVICE_UNAVAILABLE");
  }
  try {
    return callback();
  } finally {
    lock.releaseLock();
  }
}

function installTrigger_(handler, builderFactory) {
  const exists = ScriptApp.getProjectTriggers().some(function (trigger) {
    return trigger.getHandlerFunction() === handler;
  });
  if (!exists) builderFactory().create();
}

function setDefaultProperty_(properties, key, value) {
  if (!properties.getProperty(key)) properties.setProperty(key, value);
}

function parseBoundedInteger_(value, fallback, minimum, maximum) {
  if (value == null || String(value).trim() === "") return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new ContactError("CONFIGURATION_ERROR");
  }
  return parsed;
}

function normalizeOrigin_(value) {
  const text = String(value || "").trim().replace(/\/$/, "");
  return /^https:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(text) ? text.toLowerCase() : "";
}

function normalizeHostname_(value) {
  const text = String(value || "").trim().toLowerCase().replace(/\.$/, "");
  return /^[a-z0-9.-]+$/.test(text) ? text : "";
}

function trimTransportValue_(value, maximumLength) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return trimmed.length <= maximumLength ? trimmed : "";
}

function isUuid_(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
}

function isEmail_(value) {
  const text = String(value || "");
  return text.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
}

function isSingleEmailAddress_(value) {
  const text = String(value || "");
  if (!isEmail_(text) || /[,;<>]/.test(text)) return false;
  const parts = text.split("@");
  if (parts.length !== 2 || parts[0].length > 64 || parts[0].charAt(0) === "." || parts[0].slice(-1) === "." || parts[0].indexOf("..") >= 0) {
    return false;
  }
  if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(parts[0])) return false;
  const labels = parts[1].split(".");
  return labels.length >= 2 && labels.every(function (label) {
    return label.length >= 1 && label.length <= 63 && /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label);
  });
}

function byteLength_(value) {
  return Utilities.newBlob(String(value), "text/plain").getBytes().length;
}

function isoNow_() {
  return new Date().toISOString();
}

function publicErrorCode_(error) {
  const code = error && typeof error.code === "string" ? error.code : "SERVICE_UNAVAILABLE";
  return PUBLIC_ERROR_CODES_.indexOf(code) >= 0 ? code : "SERVICE_UNAVAILABLE";
}
