# CustomerList admin helper

이 폴더는 비공개 `CustomerList` Sheet에 바인드하는 최소 권한 관리 helper입니다. 공개 상담 웹 앱인 `apps-script/`와 별도 프로젝트이며 웹 앱으로 배포하지 않습니다.

## 설치

1. 비공개 상담 Sheet에서 **확장 프로그램 → Apps Script**를 엽니다.
2. 프로젝트 설정에서 `appsscript.json` 표시를 켭니다.
3. 이 폴더의 `Code.gs`와 `appsscript.json`을 적용하고 저장합니다.
4. Sheet를 새로고침해 **Bridge to Japan 상담 관리** 메뉴를 확인합니다.
5. 각 편집자는 처음 메뉴를 실행할 때 현재 Sheet에 한정된 권한을 자신의 계정으로 승인합니다.

Script Properties, reCAPTCHA secret, 수신 주소, Spreadsheet ID, MailApp, 외부 요청, 설치형 trigger와 웹 앱 deployment를 이 프로젝트에 추가하지 않습니다. Sheet 편집자는 bound code도 편집할 수 있으므로 이 helper에는 Teh Jin 계정 권한으로 실행되는 기능이나 비밀값을 두지 않습니다.

## 기능

- **선택한 상담 종료 처리**: 유효한 상담 행의 `consultation_closed_at`을 현재 시각, `delete_after`를 달력상 1년 뒤로 설정합니다.
- **선택한 상담 종료 취소**: 두 값을 비웁니다.
- 정확한 `CustomerList` 이름과 19개 header 순서가 다르면 아무 행도 변경하지 않습니다.

로컬 계약 테스트:

~~~powershell
Set-Location apps-script-admin
npm test
~~~
