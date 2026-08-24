# Bridge to Japan

Bridge to Japan은 한국 기업과 창업자의 일본 진출 문의를 받고 일본 현지 상담으로 연결하는 한국어 마케팅·고객 연결 브랜드입니다. 별도의 법인, 지점 또는 계약 주체가 아닙니다.

일본 현지의 실제 계약과 서비스 제공 주체는 **deep zone inc**입니다. 회사 설립, 비자, 세무·회계, 법인 은행 계좌, 사업 라이선스와 그 밖의 일본 진출 업무는 고객과 deep zone inc가 합의한 계약 범위에 따라 제공됩니다.

사이트는 프레임워크 없는 HTML, CSS, JavaScript로 구성하고 GitHub Pages에서 정적으로 제공합니다. 상담 접수는 독립형(standalone) Google Apps Script 웹 앱, 비공개 Google Sheets, MailApp, Google reCAPTCHA를 사용합니다. Sheet에 바인드된 별도 관리 helper는 상담 종료와 재개만 담당합니다.

## 브랜드와 담당 역할

| 구분 | 역할 | 책임 범위 |
|---|---|---|
| Bridge to Japan | 한국 고객용 마케팅·상담 연결 브랜드 | 한국어 정보 제공, 문의 유입과 일본 현지 상담 연결 |
| Dana Yoon | Korea Outreach / Referral Partner | 한국 고객 대상 사이트 안내 및 유입 지원 |
| Victor Alex Holden Jean | Business Development Representative – Europe | 유럽 사업개발 담당자 |
| deep zone inc | 일본 현지 계약·서비스 제공 주체 | 계약 체결, 업무 범위 확정, 일본 현지 서비스 제공 |
| T.Yoon | Japan Operations / Founder & CEO, deep zone inc | 일본 현지 법인 설립과 사업 진출 업무 총괄 |

고객 흐름은 다음과 같습니다.

~~~text
Dana Yoon의 한국 대상 안내·유입
  → 한국 고객이 Bridge to Japan 사이트 방문
      → 상담 폼으로 문의 접수
          → T.Yoon / deep zone inc의 일본 현지 검토
              → deep zone inc와 계약 및 서비스 진행
~~~

About Us의 각 인물 카드에 공개하는 승인 연락처는 다음과 같습니다. Dana Yoon 카드에는 연락 수단을 표시하지 않습니다. 이 공개 프로필 연락처는 상담 폼의 비공개 운영 수신 설정인 <code>CONTACT_TO</code>·<code>CONTACT_CC</code>와 별개입니다.

| 담당자 | 공개 연락처 |
|---|---|
| Dana Yoon | — (공개 연락처 없음) |
| Victor Alex Holden Jean | <code>victor.jean@europe2japan.org</code> |
| T.Yoon | <code>tj@smartstartjapan.com</code> · [LinkedIn](https://www.linkedin.com/in/t-y-351301309/) |

Victor와 T.Yoon의 프로필 사진은 고객이 제공한 실제 인물 자료를 사용합니다. Victor 원본 사진은 화면 품질을 유지하면서 <code>site/assets/images/people/victor-jean.webp</code>로 최적화했으며 생성 이미지로 대체하지 않습니다.

사이트와 운영 문서에서는 아래 원칙을 지킵니다.

- Bridge to Japan을 회사, 법인, 지점, 고용주 또는 계약 당사자로 표시하지 않습니다.
- 계약서, 견적서, 청구, 환불, 서비스 제공과 법적 책임의 주체는 deep zone inc로 표시합니다.
- Dana Yoon은 한국 시장 대상 outreach 및 referral 역할로 표시하고, 상담 응대·개인정보 처리·일본 현지 서비스 담당자로 오인하게 표현하지 않습니다.
- Victor Alex Holden Jean은 유럽 사업개발 담당자로만 표시하며 한국어 상담 또는 개인정보 처리 책임자로 표현하지 않습니다.
- 일반 화면에서 T.Yoon은 Japan Operations로 표시하고, 정확한 법인 소속과 계약 주체는 법률·규정 페이지에서만 안내합니다.
- 위에서 승인한 공개 프로필 연락처 외 법인 등록명, 주소, 대표자명, 전화번호, 이메일, 등록번호와 영업시간을 추정해 공개하지 않습니다.
- 검증되지 않은 실적, 보장성 표현, 고객 증언 또는 인물 자료를 추가하지 않습니다.

## 사이트 핵심 문구

메인 히어로의 기준 문구는 다음과 같습니다.

~~~text
BRIDGE TO JAPAN
한국 기업과 창업자의 일본 진출을 연결합니다.

일본 법인 설립 · 비자 · 세무 · 은행 · 라이선스
~~~

일반 마케팅 화면에서는 일본 현지 회사명을 반복 노출하지 않습니다. 히어로에는 승인된 파트너 로고 마크만 장식적으로 사용하고, 정확한 회사명과 계약·청구·서비스 제공 주체는 특정상거래법에 따른 표기, 개인정보 처리 안내와 저작권 정책에서만 안내합니다.

~~~text
Bridge to Japan은 한국 고객의 초기 문의를 받고
일본 현지 상담까지 연결하는 브랜드입니다.
~~~

deep zone 로고는 일본 현지 파트너를 나타내는 마크로만 사용하며, 마케팅 화면에서 회사명 텍스트와 결합하지 않습니다.

## 주소와 환경

- 운영 GitHub 조직: https://github.com/bridge-to-japan
- 운영 저장소: https://github.com/bridge-to-japan/bridge-to-japan.github.io
- 최종 공개 주소: https://bridge-to-japan.github.io/
- 이전 백업 저장소: https://github.com/LukaPee-lab/smartstartjapan-ko

별도 <code>.com</code> 또는 GitHub Pages custom domain을 사용하지 않습니다. <code>bridge-to-japan.github.io</code>가 운영 hostname이자 검색엔진에 공개하는 canonical hostname입니다. 새 사이트의 기능·검색 노출을 확인한 뒤 이전 저장소의 Pages 배포만 비활성화하고, 저장소와 이력은 백업으로 보존합니다.

## 저장소 구조

~~~text
repository/
├─ site/
│  ├─ index.html                 # 랜딩, FAQ, 다단계 상담 폼
│  ├─ resources.html             # 일본 진출 관련 리소스
│  ├─ privacy.html               # 개인정보 처리 안내
│  ├─ commercial-policy.html     # 거래·서비스 제공 주체 관련 안내
│  ├─ copyright-policy.html      # 저작권 정책
│  ├─ 404.html
│  └─ assets/
│     ├─ css/                    # critical CSS와 전체 반응형 스타일
│     ├─ captions/               # 고객 후기 한국어·원어 WebVTT 자막
│     ├─ fonts/                  # 로컬 폰트와 라이선스
│     ├─ images/                 # 승인된 브랜드·에디토리얼 자산
│     ├─ videos/                 # 고객이 제공한 로컬 후기 영상
│     └─ js/main.js              # 내비게이션, 모션, 폼 상태와 전송
├─ apps-script/                  # Teh Jin 계정 소유 standalone 백엔드
│  ├─ Code.gs                    # 검증, Sheets 저장, MailApp, trigger와 파기
│  ├─ appsscript.json            # V8 runtime과 백엔드 OAuth scope
│  ├─ package.json
│  └─ tests/contact.test.cjs     # 백엔드 계약 테스트
├─ apps-script-admin/            # CustomerList에 바인드하는 secret-free helper
│  ├─ Code.gs                    # 선택 행 상담 종료·재개만 제공
│  ├─ appsscript.json            # 현재 Sheet와 메뉴만 허용
│  ├─ README.md
│  ├─ package.json
│  └─ tests/admin.test.cjs       # 최소 권한·행 변경 계약 테스트
├─ tests/static-site.test.cjs    # 정적 문서·링크·폼 계약 테스트
└─ .github/workflows/
   ├─ pages.yml                  # site/ 정적 배포
   └─ verify.yml                 # 프런트 및 Apps Script 검증
~~~

## 고객 후기 영상

메인 페이지의 진행 절차 다음에는 고객이 직접 제공한 후기 영상 2건을 표시합니다. 영상과 포스터를 저장소의 로컬 자산으로 제공하므로 YouTube나 기존 사이트에 의존하지 않습니다.

| 항목 | 영상 | 포스터 | 자막 |
|---|---|---|---|
| 후기 1 | <code>site/assets/videos/customer-review-01.mp4</code> | <code>site/assets/images/reviews/customer-review-01-poster.webp</code> | 한국어·스페인어 WebVTT |
| 후기 2 | <code>site/assets/videos/customer-review-02.mp4</code> | <code>site/assets/images/reviews/customer-review-02-poster.webp</code> | 한국어·영어 WebVTT |

- 자동재생과 반복재생은 사용하지 않으며 <code>preload="metadata"</code>로 초기 데이터 사용량을 줄입니다.
- 한 영상을 재생하면 다른 후기 영상은 일시 정지해 소리가 겹치지 않게 합니다.
- 모바일에서 영상이 화면에 보이는 동안 하단 고정 상담 버튼을 숨겨 재생 컨트롤을 가리지 않습니다.
- 데스크톱은 두 카드를 나란히, 태블릿과 모바일은 한 열로 표시합니다.
- 후기 영상은 원본 프레임 비율을 유지한 채 카드 영역을 가득 채우도록 중앙 크롭하며, 검은 레터박스를 노출하지 않습니다.
- 각 영상 아래 요약문은 영상의 성격을 간단히 안내하는 문장만 사용합니다. 확인되지 않은 이름, 성과, 승인 결과나 직접 인용을 추가하지 않습니다.
- 한국어 자막을 기본으로 제공하고 각 영상의 원어 자막도 선택할 수 있게 합니다. 자동 전사본은 공개 전 실제 발화자 또는 콘텐츠 승인자가 최종 대조합니다.
- 영상·음성·인물의 공개 사용 동의와 개인정보 처리 범위는 운영 공개 전에 고객이 최종 확인합니다.

## 상담 데이터 흐름

~~~text
방문자 브라우저
  → GitHub Pages 정적 사이트
  → 최종 검토 단계의 Google reCAPTCHA
  → 숨은 native form과 iframe
  → standalone Google Apps Script doPost(e)
      ├─ page origin·payload schema·honeypot 검증
      ├─ reCAPTCHA token·hostname 검증
      ├─ requestId 중복 방지와 이메일 기준 요청 제한
      ├─ 비공개 Google Sheet의 CustomerList 탭에 원본 행 저장
      ├─ MailApp으로 CONTACT_TO 주수신·CONTACT_CC 참조 알림
      └─ postMessage bridge로 브라우저에 결과 반환
~~~

- 최종 제출 전 입력값은 현재 탭의 메모리에만 있으며 GitHub 저장소나 브라우저 저장소에 기록하지 않습니다.
- 정상 접수 후 비공개 Google Sheet의 <code>CustomerList</code> 행이 상담 원본 기록입니다.
- 메일 전송에 일시적인 문제가 있어도 저장된 행은 유지되고 대기열에서 재시도합니다.
- reCAPTCHA secret, Spreadsheet ID와 Google 계정 자격 증명은 공개 HTML이나 GitHub Pages artifact에 넣지 않습니다.
- standalone Apps Script 백엔드는 Teh Jin 전용 계정만 편집하고, Dana Yoon에게는 비공개 Sheet와 secret-free bound helper의 편집 권한만 부여합니다.

## 상담 폼

폼은 <code>site/index.html#consultation-form</code>과 <code>site/assets/js/main.js</code>가 제어합니다.

| 단계 | 필드 | 규칙 |
|---:|---|---|
| 1 | <code>firstName</code>, <code>lastName</code> | 각각 필수, 최대 80자 |
| 2 | <code>company</code> | 선택, 최대 120자 |
| 3 | <code>email</code> | 필수, 최대 254자, 이메일 형식 |
| 4 | <code>services[]</code> | 최신 서비스 코드 중 1개 이상, 복수 선택 |
| 5 | <code>referralSources[]</code> | 1개 이상, 복수 선택 |
| 6 | <code>message</code> | 선택, 최대 2,000자 |
| 7 | <code>privacyConsent</code> | 개인정보 안내 확인과 동의 필수 |
| 8 | 검토·reCAPTCHA·제출 | 전체 재검증 후 한 번만 제출 |

서비스나 유입 경로를 선택해도 자동으로 다음 단계로 넘어가지 않습니다. 오류가 있으면 구체적인 메시지를 제공하고 해당 컨트롤로 초점을 이동합니다. 제출 중에는 버튼과 단계 이동을 잠가 중복 실행을 막습니다.

### 서비스 코드

프런트의 input value, JavaScript 리뷰 라벨, Apps Script의 허용 enum과 알림 메일 라벨은 아래 8개를 동일하게 사용해야 합니다.

| 코드 | 화면 라벨 |
|---|---|
| <code>incorporation_or_branch</code> | 일본 법인 설립 / 지점 등록 |
| <code>business_manager_visa</code> | 경영·관리 비자 |
| <code>tax_and_accounting</code> | 세무·회계 |
| <code>corporate_bank_account</code> | 법인 은행 계좌 |
| <code>business_licenses</code> | 사업 라이선스 |
| <code>office_and_real_estate</code> | 사무실·부동산 |
| <code>subsidies_and_loans</code> | 보조금·대출 |
| <code>other_japan_entry_support</code> | 기타 일본 진출 상담 |

한 곳이라도 코드가 다르면 화면 리뷰, 서버 검증 또는 운영 알림이 서로 어긋납니다. 코드 변경은 HTML, <code>main.js</code>, <code>Code.gs</code>와 테스트를 한 커밋에서 함께 처리합니다.

### 유입 경로 코드

| 코드 | 화면 라벨 |
|---|---|
| <code>facebook</code> | Facebook |
| <code>google_search</code> | Google 검색 |
| <code>linkedin</code> | LinkedIn |
| <code>others</code> | 기타 |
| <code>friend_referral</code> | 지인 추천 |
| <code>other_websites</code> | 다른 웹사이트 |
| <code>youtube</code> | YouTube |
| <code>ai_search_or_gpt</code> | AI 검색 / GPT |

### payload 계약

~~~json
{
  "requestId": "123e4567-e89b-42d3-a456-426614174000",
  "firstName": "민준",
  "lastName": "김",
  "company": "예시 회사",
  "email": "founder@example.com",
  "services": [
    "incorporation_or_branch",
    "tax_and_accounting"
  ],
  "referralSources": [
    "google_search"
  ],
  "message": "일본 진출 상담을 받고 싶습니다.",
  "privacyConsent": true,
  "privacyPolicyVersion": "2026-08-24",
  "recaptchaToken": "RECAPTCHA_TOKEN",
  "website": ""
}
~~~

- payload는 UTF-8 기준 32,768바이트 이하입니다.
- 알 수 없는 key, 중복 enum, 허용되지 않은 enum과 제어 문자를 거부합니다.
- <code>requestId</code>는 UUID v4입니다.
- <code>website</code>는 honeypot이며 방문자에게 보이지 않습니다.
- 방문자 문자열은 Sheet 수식으로 실행되지 않도록 저장하고, HTML 메일에서는 escape합니다.
- payload hash에는 일회성 reCAPTCHA token을 포함하지 않습니다.

## 미리보기와 운영 전환

폼의 환경 설정 예시는 다음과 같습니다.

~~~html
<form
  id="consultation-form"
  data-mode="auto"
  data-live-hosts="bridge-to-japan.github.io"
  data-endpoint="YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL"
  data-recaptcha-sitekey="YOUR_GOOGLE_RECAPTCHA_SITE_KEY"
  data-privacy-policy-version="2026-08-24">
~~~

| 모드 | 동작 |
|---|---|
| <code>preview</code> | 실제 저장과 메일 없이 전체 화면 흐름만 확인 |
| <code>auto</code> | endpoint, site key와 현재 hostname이 모두 유효할 때만 운영 전송 |
| <code>live</code> | 프런트의 hostname 판정만 우회하며 서버 허용 목록과 reCAPTCHA 검증은 유지 |

- endpoint는 <code>https://script.google.com/macros/s/DEPLOYMENT_ID/exec</code> 형식이어야 합니다.
- <code>data-live-hosts</code>에는 protocol과 path 없이 hostname만 넣습니다.
- 자리표시자가 남아 있거나 hostname이 허용되지 않으면 <code>auto</code>는 미리보기로 동작합니다.
- <code>live</code>는 보안 검증을 끄는 설정이 아닙니다.
- 운영 hostname은 <code>bridge-to-japan.github.io</code>이며 HTML, Apps Script와 reCAPTCHA의 허용 목록을 같은 배포에서 갱신합니다.

## form·iframe bridge

프런트는 Apps Script의 HTML 응답을 받기 위해 숨은 iframe을 target으로 하는 native POST form을 사용합니다.

1. 프런트가 숨은 iframe과 transport form을 만듭니다.
2. <code>payload</code>, <code>requestId</code>, 일회용 <code>responseNonce</code>, <code>pageOrigin</code>을 전송합니다.
3. Apps Script가 검증된 parent origin으로 작은 HTML bridge를 반환합니다.
4. bridge가 <code>postMessage</code>로 결과를 보냅니다.
5. 부모 문서는 Google Apps Script HTML 서비스의 HTTPS origin, channel, request ID와 nonce가 모두 일치할 때만 응답을 사용합니다.
6. 성공, 실패 또는 timeout 뒤 iframe, form과 event listener를 제거합니다.

bridge channel은 <code>bridge-to-japan-contact-v1</code>입니다. 프런트와 Apps Script가 반드시 같은 값을 사용해야 합니다. 공개 응답에는 상담 메시지, 이메일, token, secret 또는 Sheet ID를 넣지 않습니다.

성공 응답 형태:

~~~json
{
  "channel": "bridge-to-japan-contact-v1",
  "ok": true,
  "requestId": "123e4567-e89b-42d3-a456-426614174000",
  "responseNonce": "223e4567-e89b-42d3-a456-426614174000",
  "duplicate": false,
  "notificationQueued": false
}
~~~

주요 공개 오류 코드는 다음과 같습니다.

| code | 의미 |
|---|---|
| <code>VALIDATION_ERROR</code> | transport, JSON, field, enum, 길이 또는 동의 오류 |
| <code>PAGE_NOT_ALLOWED</code> | parent origin 불일치 |
| <code>BOT_REJECTED</code> | reCAPTCHA 실패, 만료 또는 hostname 불일치 |
| <code>VERIFICATION_UNAVAILABLE</code> | reCAPTCHA 검증 서비스 일시 장애 |
| <code>RATE_LIMITED</code> | 이메일 기준 요청 한도 초과 |
| <code>DUPLICATE_CONFLICT</code> | 동일 request ID에 다른 payload |
| <code>CONFIGURATION_ERROR</code> | Script Property, Sheet 또는 header 설정 오류 |
| <code>SERVICE_UNAVAILABLE</code> | 잠금, Sheets, Mail 또는 내부 일시 장애 |

## Apps Script 설정

standalone 백엔드 Apps Script 편집기의 **프로젝트 설정 → 스크립트 속성**에서 운영 값을 설정합니다. `apps-script-admin/` bound helper에는 Script Properties를 만들지 않습니다.

| 이름 | 운영 규칙 |
|---|---|
| <code>SPREADSHEET_ID</code> | 필수. 비공개 상담 Sheet URL의 정확한 ID를 <code>setup()</code> 전에 직접 설정 |
| <code>SHEET_NAME</code> | 운영값 <code>CustomerList</code> |
| <code>CONTACT_TO</code> | 필수. T.Yoon의 승인된 주수신 주소 |
| <code>CONTACT_CC</code> | 필수. Dana Yoon의 승인된 참조 수신 주소. 공개 프로필 연락처로 사용하지 않음 |
| <code>ALLOWED_PARENT_ORIGINS</code> | 운영 필수. 정확한 HTTPS origin을 쉼표로 구분 |
| <code>RECAPTCHA_SECRET_KEY</code> | 필수. Script Properties에만 저장 |
| <code>RECAPTCHA_EXPECTED_HOSTNAMES</code> | 운영 필수. protocol 없는 hostname을 쉼표로 구분 |
| <code>EMAIL_RATE_LIMIT_PER_HOUR</code> | 운영값 3. 정규화된 이메일별 시간당 제한 |
| <code>GLOBAL_SUBMISSION_LIMIT_PER_HOUR</code> | 운영값 10. 전체 접수의 시간당 제한 |
| <code>GLOBAL_SUBMISSION_LIMIT_PER_DAY</code> | 운영값 40. 전체 접수의 일일 제한 |
| <code>PRIVACY_POLICY_VERSION</code> | 운영 문서와 폼의 버전이 정확히 같아야 함 |

운영값은 다음 공개 범위로 맞춥니다.

~~~text
ALLOWED_PARENT_ORIGINS=https://bridge-to-japan.github.io
RECAPTCHA_EXPECTED_HOSTNAMES=bridge-to-japan.github.io
PRIVACY_POLICY_VERSION=2026-08-24
~~~

### CONTACT_TO·CONTACT_CC 필수 정책

<code>CONTACT_TO</code>와 <code>CONTACT_CC</code>에는 서로 다른 승인 주소를 각각 하나씩 넣습니다.

- 운영 수신 주소는 Script Properties에서만 설정하고 소스 코드, HTML, 테스트 fixture와 README에 하드코딩하지 않습니다. About Us의 승인된 공개 프로필 이메일은 이 제한의 대상이 아닙니다.
- <code>setup()</code>도 이메일 기본값을 생성하지 않아야 합니다.
- 누락, 잘못된 이메일 형식 또는 두 값의 중복은 <code>CONFIGURATION_ERROR</code>로 fail closed해야 합니다.
- T.Yoon은 주수신과 상담 응답, Dana Yoon은 참조 수신과 비공개 Sheet 편집 권한을 담당합니다. Dana의 운영 주소는 공개 연락처로 노출하지 않습니다.
- Google의 bound script는 컨테이너 Sheet의 편집 권한을 그대로 상속합니다. 따라서 reCAPTCHA secret, 수신 주소와 Teh Jin 권한 trigger가 있는 운영 백엔드는 standalone 프로젝트로 유지하고 Dana에게 공유하지 않습니다.
- 수신 주소나 접근 담당자가 바뀌면 Script Property, Sheet 공유 권한과 운영 책임 문서를 함께 갱신하고 실제 접수 시험을 다시 수행합니다.

## Google Sheet 계약

상담 전용 Google Sheet의 <code>CustomerList</code> 탭을 사용하며, 첫 행의 19개 header와 순서를 변경하지 않습니다.

| 순서 | 열 | 설명 |
|---:|---|---|
| 1 | <code>received_at</code> | 접수 UTC ISO 시각 |
| 2 | <code>consultation_closed_at</code> | 상담 종료 처리 시각 |
| 3 | <code>delete_after</code> | 보유 만료 시각 |
| 4 | <code>request_id</code> | UUID v4 |
| 5 | <code>payload_sha256</code> | token 제외 정규 payload hash |
| 6–9 | <code>last_name</code>, <code>first_name</code>, <code>company</code>, <code>email</code> | 연락 정보 |
| 10–12 | <code>services</code>, <code>referral_sources</code>, <code>message</code> | 상담 내용 |
| 13–14 | <code>privacy_consent</code>, <code>privacy_policy_version</code> | 동의 기록 |
| 15–19 | <code>mail_state</code>, <code>mail_attempts</code>, <code>mail_sent_at</code>, <code>mail_lease_until</code>, <code>mail_last_error</code> | 메일 대기열 |

열 이름이나 개수가 다르면 접수를 중단합니다. Sheet 공개 링크 공유는 끄고 승인된 운영 담당자에게만 최소 권한을 부여합니다. Sheet에 바인드하는 `apps-script-admin/`은 같은 19개 header를 확인한 뒤 상담 종료·재개 열만 변경하며, 비밀값·메일·외부 요청·설치형 trigger 또는 웹 앱 배포 기능을 갖지 않습니다.

### 중복 방지와 요청 제한

- 처음 보는 <code>requestId</code>는 새 행으로 저장합니다.
- 같은 ID와 같은 hash는 기존 접수의 멱등 성공으로 처리합니다.
- 같은 ID에 다른 payload가 오면 <code>DUPLICATE_CONFLICT</code>입니다.
- 조회와 추가는 <code>ScriptLock</code> 안에서 실행합니다.
- 원본 IP는 상담 Sheet에 저장하지 않습니다.
- reCAPTCHA, 정규화된 이메일 기준 시간당 3회 제한, 전체 시간당 10회 및 일일 40회 제한을 함께 사용합니다.

## MailApp 알림

Sheet 행을 먼저 저장한 뒤 한 번의 MailApp 호출로 <code>CONTACT_TO</code>를 주수신자, <code>CONTACT_CC</code>를 참조 수신자로 지정해 알림을 보냅니다.

~~~text
PENDING → SENDING(5분 lease) → SENT
   ├─ recipient quota 부족 → PENDING(시도 횟수 유지) → quota 회복 후 자동 재개
   └─ 실제 MailApp 발송 실패 → PENDING → 최대 5회 → FAILED
~~~

- 10분 trigger가 대기 상태와 만료된 lease를 재시도합니다.
- 한 번에 최대 20건을 처리합니다.
- 메일 상태 갱신은 행 번호가 아니라 request ID로 현재 행을 다시 찾습니다.
- MailApp 잔여 수신자 quota가 2명분보다 적으면 발송하지 않고 <code>PENDING</code>을 유지하며 <code>mail_attempts</code>를 증가시키지 않습니다. 10분 trigger가 다음 quota window까지 계속 확인합니다.
- 메일의 <code>replyTo</code>는 방문자가 입력한 이메일입니다.
- 발신 주소는 웹 앱을 소유·배포한 Google 계정이며 HTML이나 Script Property로 임의 변경할 수 없습니다.
- 웹 앱은 승인된 전용 Google 계정이 소유·배포하고, 발신자 표시 이름은 <code>Bridge to Japan 상담 접수</code>로 설정합니다.
- <code>mail_attempts</code>는 실제 <code>MailApp.sendEmail</code> 호출 횟수만 셉니다. 공급자 발송 실패는 10분 주기로 최대 5회 시도한 뒤 <code>FAILED</code>로 전환하지만, quota 부족만으로는 <code>FAILED</code>가 되지 않습니다.
- 메일 전송 실패는 이미 저장된 상담 행을 삭제하거나 접수 성공을 취소하지 않습니다.
- quota, <code>PENDING</code>과 <code>FAILED</code> 상태를 확인할 운영 담당자를 지정합니다.
- quota는 실행 계정 기준으로 다른 Apps Script와 공유되고 수신자 수로 계산됩니다. 이 알림은 주수신과 참조 두 명분을 사용하므로 Teh Jin 계정의 <code>MailApp.getRemainingDailyQuota()</code>와 Apps Script 실행 상태를 함께 모니터링합니다.

## 상담 종료와 보유기간

새 상담 행은 종료 시각과 삭제 예정 시각이 비어 있습니다.

1. 상담과 후속 커뮤니케이션이 끝난 행을 선택합니다.
2. Sheet의 상담 관리 메뉴에서 **선택한 상담 종료 처리**를 실행합니다.
3. <code>consultation_closed_at</code>에 현재 시각, <code>delete_after</code>에 달력상 1년 뒤 시각을 기록합니다.
4. 일일 trigger가 만료된 행을 삭제합니다.
5. 잘못 종료한 경우 **선택한 상담 종료 취소**로 두 값을 비웁니다.

Sheet 행 삭제는 주수신자의 받은 편지함, 참조 수신자의 받은 편지함, 발신 계정의 보낸 메일, 휴지통, 백업 또는 별도 복사본을 자동으로 삭제하지 않습니다. T.Yoon과 Dana Yoon은 같은 request ID와 연결된 승인된 복사본에도 상담 종료 후 1년의 동일한 보유·삭제 기준을 적용해야 합니다.

standalone 백엔드 함수:

| 함수 | 역할 |
|---|---|
| <code>setup()</code> | Spreadsheet, header와 trigger 준비 |
| <code>processPendingMailQueue()</code> | 대기 메일 재시도 |
| <code>purgeExpiredSubmissions()</code> | 보유기간이 끝난 행 삭제 |
| <code>doPost(e)</code> | 공개 상담 접수 |

`apps-script-admin/` bound helper 함수:

| 함수 | 역할 |
|---|---|
| <code>onOpen()</code> | secret-free 상담 관리 메뉴 추가 |
| <code>markSelectedConsultationsClosed()</code> | 선택 행 종료·삭제 예정일 설정 |
| <code>reopenSelectedConsultations()</code> | 종료 표시 취소 |

bound helper의 관리 함수는 메뉴를 클릭한 현재 Sheet 편집자의 권한으로 실행됩니다. Teh Jin 계정의 standalone deployment 또는 설치형 trigger 권한을 사용하지 않습니다.

요청 본문, 방문자 정보, reCAPTCHA token, Sheet 행과 secret을 Logger 또는 console에 출력하지 않습니다.

## Google 설정과 배포

### 1. 소유 계정, Sheet와 standalone 프로젝트

1. 고객이 승인한 Teh Jin 전용 Google 계정을 standalone Apps Script의 장기 소유·배포·trigger 실행·메일 발신 계정으로 사용합니다.
2. 기존 <code>BridgeToJapan_CustomerList</code> Sheet의 공개 링크 공유를 끄고 <code>CustomerList</code> 탭을 사용합니다. Teh Jin 계정에는 편집 권한, Dana Yoon에게는 운영상 필요한 Sheet 편집 권한을 부여합니다.
3. Teh Jin 계정으로 Apps Script 대시보드에서 **새 standalone 프로젝트**를 만듭니다. 운영 백엔드는 Sheet의 **확장 프로그램 → Apps Script**에서 만들지 않습니다.
4. 프로젝트 설정에서 manifest 파일 표시를 켠 뒤 <code>apps-script/Code.gs</code>와 <code>apps-script/appsscript.json</code>을 적용합니다. Dana에게 이 standalone 프로젝트 접근 권한을 부여하지 않습니다.

계정 비밀번호, 복구 코드, OAuth token, Spreadsheet ID와 reCAPTCHA secret은 저장소, README, HTML, 이슈 또는 채팅 기록에 저장하지 않습니다. 작업 과정에서 평문으로 공유된 비밀번호는 운영 전에 변경하고 2단계 인증을 활성화합니다. 접근 권한은 개인 비밀번호 공유가 아니라 Google의 계정별 공유 기능으로 부여하고, 발신 계정의 복구 수단과 소유권은 고객이 관리합니다.

### 2. reCAPTCHA

1. 고객이 관리하는 Google Cloud/reCAPTCHA 프로젝트에서 웹사이트용 **Challenge (v2 checkbox)** key를 만듭니다. 현재 프런트는 명시적 checkbox widget이고 서버는 <code>siteverify</code>를 사용하므로 v3 score key나 assessment-only 통합과 호환되지 않습니다.
2. domain verification을 켠 채 허용 hostname에 <code>bridge-to-japan.github.io</code>를 정확히 등록합니다. staging과 production은 별도 key를 권장합니다.
3. 공개 site key는 <code>site/index.html</code>에 넣습니다.
4. secret은 standalone 백엔드의 <code>RECAPTCHA_SECRET_KEY</code>에만 넣습니다.
5. 만료, 재사용, 잘못된 hostname과 검증 서비스 장애를 시험합니다.
6. 현재 무료 allowance는 조직 전체 월 10,000 assessments이므로 Cloud 사용량과 알림을 모니터링하고, 예상량을 넘기기 전에 billing/fail-closed 정책을 결정합니다.

### 3. Script Properties, setup과 trigger

1. standalone 프로젝트에 <code>SPREADSHEET_ID</code>, <code>CONTACT_TO</code>, <code>CONTACT_CC</code>, <code>RECAPTCHA_SECRET_KEY</code>와 나머지 운영 Script Properties를 설정합니다.
2. Teh Jin 계정으로 <code>setup()</code>을 한 번 실행해 Sheets, 메일, 외부 요청과 trigger 권한을 승인합니다. standalone 프로젝트에서는 활성 Sheet를 추정하지 않으므로 <code>SPREADSHEET_ID</code> 누락 시 즉시 실패합니다.
3. 정확한 19개 header와 Teh Jin 계정 소유의 trigger 두 개를 확인합니다: <code>processPendingMailQueue</code> 10분 주기, <code>purgeExpiredSubmissions</code> 매일 03시대(Asia/Seoul)입니다. 시간 기반 trigger는 정확한 분이 아니라 해당 시간대 안에서 실행될 수 있습니다.
4. <code>setup()</code> 성공만으로 수신 주소와 reCAPTCHA의 실제 동작이 검증되지는 않습니다. 이후 실제 공개 origin에서 end-to-end 접수를 수행합니다.

설치형 trigger는 생성 계정의 권한으로 실행되고 다른 계정이 만든 trigger는 보이지 않을 수 있습니다. <code>setup()</code>은 최종 Teh Jin 계정으로만 실행하고, 이전 테스트 계정이 실행한 적이 있으면 그 계정의 **내 트리거**에서 중복 trigger를 삭제합니다.

### 4. standalone Apps Script 웹 앱

standalone 백엔드에서 **배포 → 새 배포 → 웹 앱**을 열고 다음처럼 설정합니다.

- 실행 사용자: 배포자(Teh Jin 전용 계정)
- 액세스 권한: 로그인하지 않은 방문자도 접근하는 **Anyone / anonymous**
- 프런트 endpoint: 개발용 <code>/dev</code>가 아닌 운영 <code>/exec</code>

시크릿 브라우저에서 Google 로그인 화면 없이 <code>/exec</code>가 열리는지 확인합니다. 로그인 사용자만 허용되거나 조직 내부만 허용되는 설정은 공개 상담 폼과 맞지 않습니다. 코드를 변경하면 저장만 하지 말고 기존 deployment에 새 version을 연결해 endpoint를 유지합니다.

### 5. 프런트 연결과 기존 backend 전환

<code>site/index.html</code>의 자리표시자를 실제 값으로 바꿉니다.

~~~html
data-endpoint="https://script.google.com/macros/s/DEPLOYMENT_ID/exec"
data-recaptcha-sitekey="PUBLIC_SITE_KEY"
~~~

다음 네 목록은 같은 공개 범위를 가져야 합니다.

1. 프런트 <code>data-live-hosts</code>
2. Script Property <code>ALLOWED_PARENT_ORIGINS</code>
3. Script Property <code>RECAPTCHA_EXPECTED_HOSTNAMES</code>
4. reCAPTCHA 관리 화면의 허용 도메인

실제 공개 origin에서 상담 1건을 접수해 Sheet 저장, 주수신·참조, reply-to와 queue를 확인합니다. 기존 bound 프로젝트가 운영 백엔드였다면 새 standalone <code>/exec</code> 검증과 프런트 endpoint 전환을 먼저 완료합니다. 그 다음 기존 웹 앱 deployment를 보관 처리하고, 그 프로젝트를 실행했던 각 계정의 설치형 trigger와 민감 Script Properties를 제거합니다. 이전 bound 프로젝트가 비밀값을 승인되지 않은 편집자에게 노출했다면 reCAPTCHA secret도 회전합니다.

### 6. secret-free bound 관리 helper

1. standalone 백엔드와 프런트 전환이 정상 동작한 뒤 비공개 Sheet의 **확장 프로그램 → Apps Script**에서 bound 프로젝트를 엽니다.
2. <code>apps-script-admin/Code.gs</code>와 <code>apps-script-admin/appsscript.json</code>만 적용합니다.
3. 이 프로젝트에는 Script Properties, 메일·외부 요청 코드, 설치형 trigger 또는 웹 앱 deployment를 만들지 않습니다.
4. Sheet를 새로고침해 **Bridge to Japan 상담 관리** 메뉴를 확인하고, Dana 계정으로 종료·재개를 각각 시험합니다. 각 편집자는 처음 실행할 때 현재 Sheet 범위의 권한을 자신의 계정으로 승인합니다.

## 로컬 실행과 테스트

로컬 서버:

~~~powershell
py -m http.server 4173 --directory site
~~~

localhost는 기본적으로 미리보기로 사용합니다.

프런트 검증:

~~~powershell
node --check site/assets/js/main.js
node --test tests/static-site.test.cjs
~~~

standalone 백엔드 계약 테스트:

~~~powershell
Set-Location apps-script
npm test
npm run check
~~~

bound 관리 helper 계약 테스트:

~~~powershell
Set-Location apps-script-admin
npm test
npm run check
~~~

자동·수동 검증에는 최소한 다음 항목을 포함합니다.

- HTML 문서의 ID 중복, 로컬 파일과 fragment link
- 일반 페이지의 일본 현지 회사명 비노출과 법률·규정 페이지의 계약 주체 표시
- HTML, <code>main.js</code>, <code>Code.gs</code>의 8개 서비스 코드 일치
- bridge channel, request ID, nonce와 정확한 target origin
- payload schema, UUID, enum, 길이, 동의 버전과 honeypot
- Sheet 수식 주입과 메일 HTML 주입 방지
- 정상 접수 시 CustomerList에 한 행 저장, <code>CONTACT_TO</code> 주수신 및 <code>CONTACT_CC</code> 참조 수신
- 방문자 이메일로 향하는 <code>replyTo</code>
- 빠른 중복 제출과 timeout 재시도의 멱등성
- 잘못된 origin과 reCAPTCHA hostname의 fail closed
- 잘못된·누락·중복 수신 주소의 fail closed
- 이메일별·전체 시간당·전체 일일 요청 제한
- 2명분 quota 부족 시 시도 횟수를 소진하지 않고 다음 quota window에 자동 재개
- 실제 MailApp 발송 실패 시 행 유지, 최대 5회 재시도와 <code>FAILED</code> 전환
- secret-free bound helper의 현재 Sheet 한정 권한, 상담 종료·재개와 달력상 1년 뒤 파기
- preview 모드에서 저장과 메일이 발생하지 않음
- 실제 운영 모드의 성공·오류·접근성 안내

화면 검수 권장 크기:

- 360×800
- 390×844
- 412×915
- 768×1024
- 1024×768
- 1440×900

각 화면에서 가로 스크롤, 잘림, 고정 CTA 가림이 없어야 합니다. 키보드만으로 폼을 완료하고 메뉴, FAQ, 오류 초점, reCAPTCHA, reduced-motion, AA 명암과 이미지 대체 텍스트를 확인합니다.

## GitHub Actions와 Pages

<code>pages.yml</code>은 <code>main</code>의 <code>site/**</code>만 GitHub Pages artifact로 배포합니다. Apps Script 소스, Spreadsheet ID와 Google secret은 Pages artifact에 포함하지 않습니다.

<code>verify.yml</code>은 다음을 실행합니다.

- 프런트 JavaScript 구문 검사
- 정적 문서와 로컬 링크 테스트
- standalone Apps Script 백엔드 계약 테스트
- bound 관리 helper 최소 권한·행 변경 계약 테스트

운영 배포는 새 GitHub 조직 <code>bridge-to-japan</code>의 공개 저장소 <code>bridge-to-japan.github.io</code>에서 수행합니다. 조직명 사용 가능 여부를 먼저 확인하고 선점되어 있으면 임의 대체 이름을 만들지 않습니다.

1. 새 조직과 사용자·조직 Pages 규칙에 맞는 저장소를 생성합니다.
2. 기능 브랜치에서 검증을 마친 뒤 <code>main</code>에 병합하고 Pages workflow 성공을 확인합니다.
3. <code>https://bridge-to-japan.github.io/</code>의 HTTPS, 정적 자산, 법률 문서와 상담 폼을 확인합니다.
4. canonical, hreflang, Open Graph, JSON-LD, sitemap, robots와 프런트 live hostname을 운영 주소로 통일합니다.
5. Apps Script origin과 reCAPTCHA hostname도 같은 운영 주소로 통일합니다.
6. 실제 상담 1건을 접수해 CustomerList 저장, 주수신·참조 메일, reply-to와 중복 방지를 확인합니다.
7. 새 사이트 검증 후 이전 <code>LukaPee-lab/smartstartjapan-ko</code> 저장소의 Pages 배포만 비활성화하고 저장소는 백업으로 보존합니다.

별도 <code>.com</code>, DNS 또는 GitHub Pages custom domain은 설정하지 않습니다.

## Google 검색 노출

- 일반 콘텐츠와 법률 문서는 <code>index,follow</code>, 404 문서는 <code>noindex</code>를 사용합니다.
- <code>robots.txt</code>는 전체 크롤링을 허용하고 <code>https://bridge-to-japan.github.io/sitemap.xml</code>을 안내합니다.
- Teh Jin 운영 Google 계정으로 Search Console URL-prefix 속성 <code>https://bridge-to-japan.github.io/</code>을 생성합니다.
- Search Console이 제공한 HTML 인증 파일을 <code>site/</code> 루트에 추가하고 Pages 배포 후 소유권을 확인합니다. 인증 파일은 소유권 유지를 위해 삭제하지 않습니다.
- sitemap을 제출하고 홈과 주요 안내 페이지의 색인을 요청합니다. 검색 반영 시점과 순위는 Google이 결정하므로 즉시 노출을 보장하지 않습니다.

## 개인정보와 법률 확인

현재 상담 흐름에서 다루는 정보:

- 성명
- 회사명(선택)
- 이메일
- 관심 서비스
- 유입 경로
- 상담 메시지(선택)
- 접수 시각
- request ID와 동의 기록

운영 전 다음 사항을 고객과 법률 담당자가 승인해야 합니다.

- deep zone inc의 정확한 법적 법인명, 등록 국가와 등록 정보
- 계약서·견적서·청구서에 사용할 법인명과 주소
- 대표자, 전화번호, 이메일과 영업시간의 공개 여부
- T.Yoon의 주수신·응답 책임과 Dana Yoon의 참조 수신·Sheet 편집 범위
- Bridge to Japan에서 deep zone inc로 상담 정보를 전달하는 목적, 항목과 시점
- 한국에서 일본으로의 국외 이전 또는 처리 고지
- Google Apps Script, Sheets, Mail과 reCAPTCHA의 처리 관계와 보유 범위
- 상담 종료 기준, 1년 보유, 주수신·참조 수신함·발신함·백업·복사본 삭제 절차
- 개인정보 수집·이용 및 국외 처리 동의를 거부할 권리와 거부 시 영향
- 거래 조건, 취소·환불, 제공 시기와 분쟁 처리 기준
- 로고, 이미지, 문구와 기타 콘텐츠의 저작권·상표 사용 권한

승인되지 않은 법인명, 주소, 전화번호 또는 이메일은 placeholder로도 공개 배포하지 않습니다. 법률 문서가 확정되지 않으면 폼을 운영 모드로 전환하지 않습니다.

## 출시 체크리스트

### 브랜드·콘텐츠

- [ ] 모든 페이지가 Bridge to Japan을 비법인 마케팅·상담 연결 브랜드로 설명
- [ ] Dana Yoon의 Korea Outreach / Referral Partner 역할과 공개 연락처 없음 표시
- [ ] Victor Alex Holden Jean의 유럽 사업개발 역할·사진·공개 이메일 표시
- [ ] 일반 화면에서 T.Yoon의 Japan Operations 역할 표시
- [ ] T.Yoon의 승인된 이메일과 LinkedIn 링크가 정확하게 연결됨
- [ ] 일반 화면은 파트너 로고 마크만 사용하고 일본 현지 회사명 텍스트를 노출하지 않음
- [ ] 실제 계약·서비스 제공 주체는 법률·규정 페이지에서 정확히 표시
- [ ] 특정상거래법·개인정보·저작권 정책의 회사명과 책임 범위가 일치
- [ ] 승인되지 않은 실적, 인물, 증언, 연락처 또는 법인 정보 없음

### Google·상담 운영

- [ ] Teh Jin 전용 Google 계정 소유의 standalone 백엔드로 배포·trigger 실행·메일 발신
- [ ] <code>SPREADSHEET_ID</code>를 명시한 비공개 CustomerList, 정확한 19개 header와 <code>setup()</code> 실행
- [ ] 10분 queue·일일 purge trigger가 Teh Jin 계정에 각각 하나뿐이고 다른 계정의 이전 trigger가 없음
- [ ] Dana Yoon의 Sheet 편집자 권한과 secret-free bound 관리 helper 확인
- [ ] bound helper에 Script Properties·MailApp·외부 요청·설치형 trigger·deployment가 없음
- [ ] 승인된 주수신·참조 주소를 <code>CONTACT_TO</code>·<code>CONTACT_CC</code>에 설정
- [ ] 운영 수신 주소가 소스와 HTML에 하드코딩되지 않음
- [ ] Challenge v2 checkbox key, domain verification과 reCAPTCHA 사용량 알림 확인
- [ ] endpoint, site key, origin과 hostname 네 목록 일치
- [ ] 익명 <code>/exec</code> 배포와 시크릿 창 확인
- [ ] 정상·중복·복수 수신·global rate limit·reCAPTCHA·quota 장기 대기·mail failure·purge 시험 통과
- [ ] 메일 상태와 개인정보 삭제를 담당할 운영자 지정
- [ ] 노출된 비밀번호 변경, 2단계 인증과 복구 수단 확인

### 기술·접근성

- [ ] 프런트 구문, 정적 문서와 Apps Script 테스트 통과
- [ ] 8개 서비스 enum과 bridge channel 전 구간 일치
- [ ] Sheet 수식과 메일 HTML 주입 방지
- [ ] 권장 viewport에서 가로 스크롤·잘림 없음
- [ ] 키보드, 오류 초점, AA 명암과 reduced-motion 확인
- [ ] preview에서 실제 저장·메일이 발생하지 않음

### 배포·법률

- [ ] <code>bridge-to-japan</code> 조직과 <code>bridge-to-japan.github.io</code> 저장소 생성
- [ ] <code>https://bridge-to-japan.github.io/</code> 공개와 HTTPS 확인
- [ ] canonical, OG, JSON-LD, sitemap, robots 갱신
- [ ] Search Console HTML 소유권 확인, sitemap 제출과 주요 URL 색인 요청
- [ ] 이전 Pages 비활성화와 이전 저장소 백업 보존
- [ ] deep zone inc의 법적 정보와 거래 조건 승인
- [ ] 개인정보 수집·국외 처리·보유·삭제 고지 승인
- [ ] 실제 상담 1건의 Sheet 저장·주수신·참조·답장·종료·삭제 절차 확인
- [ ] 정상 Git commit과 Apps Script version/deployment ID 기록

## 롤백

정적 사이트 장애:

1. 마지막 정상 commit을 확인합니다.
2. force-push 대신 <code>git revert</code>로 되돌립니다.
3. 상담 기능만 문제가 있으면 <code>data-mode="preview"</code>로 고정해 저장과 메일을 차단합니다.

standalone Apps Script 백엔드 장애:

1. 현재 deployment와 version을 기록합니다.
2. 마지막 정상 version으로 기존 deployment를 다시 연결합니다.
3. endpoint, Sheet header, Script Properties와 trigger를 확인합니다.
4. 정상, 중복, 비허용 origin, reCAPTCHA와 mail queue를 다시 시험합니다.

bound 관리 helper 장애:

1. Sheet의 상담 종료·재개 작업을 중지하고 영향받은 행을 백업합니다.
2. <code>apps-script-admin/</code>의 마지막 정상 code와 manifest를 다시 적용합니다.
3. helper에 Script Properties, 설치형 trigger 또는 deployment가 생기지 않았는지 확인합니다.
4. 테스트 행에서 종료와 재개를 확인한 뒤 운영을 재개합니다.

코드 롤백은 이미 저장된 상담 행이나 계정별 설치형 trigger를 자동으로 삭제하지 않습니다. Sheet schema는 백업과 명시적인 migration 없이 변경하지 않습니다.

## 참고 문서

- [Google Apps Script 웹 앱](https://developers.google.com/apps-script/guides/web)
- [Apps Script standalone·bound 프로젝트](https://developers.google.com/apps-script/guides/bound)
- [Apps Script 공동 편집과 bound ACL](https://developers.google.com/apps-script/guides/collaborating)
- [Apps Script HTML output](https://developers.google.com/apps-script/reference/html/html-output)
- [Google Sheets Apps Script](https://developers.google.com/apps-script/guides/sheets)
- [Apps Script Lock Service](https://developers.google.com/apps-script/reference/lock)
- [Apps Script MailApp](https://developers.google.com/apps-script/reference/mail/mail-app)
- [Apps Script installable triggers](https://developers.google.com/apps-script/guides/triggers/installable)
- [Apps Script quota](https://developers.google.com/apps-script/guides/services/quotas)
- [Google reCAPTCHA 웹 key 생성](https://docs.cloud.google.com/recaptcha/docs/create-key-website)
- [Google reCAPTCHA 서버 검증](https://developers.google.com/recaptcha/docs/verify)
- [Google reCAPTCHA quota와 한도](https://docs.cloud.google.com/recaptcha/quotas)
- [GitHub Pages custom workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-for-github-pages-sites)
- [GitHub Pages 사용자·조직 사이트](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [Google Search Console에 sitemap 제출](https://support.google.com/webmasters/answer/7451001)
