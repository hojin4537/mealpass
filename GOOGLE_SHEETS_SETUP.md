# Google Sheets API 설정 가이드

## 1. Google Cloud Console에서 프로젝트 생성

1. https://console.cloud.google.com/ 접속
2. 프로젝트 선택 또는 새 프로젝트 생성
3. 프로젝트 이름 입력 (예: "mealpass-fake-door")

## 2. Google Sheets API 활성화

1. 왼쪽 메뉴에서 "API 및 서비스" > "라이브러리" 클릭
2. "Google Sheets API" 검색 후 선택
3. "사용" 버튼 클릭

## 3. 서비스 계정 생성

1. 왼쪽 메뉴에서 "API 및 서비스" > "사용자 인증 정보" 클릭
2. 상단 "+ 사용자 인증 정보 만들기" > "서비스 계정" 선택
3. 서비스 계정 이름 입력 (예: "mealpass-sheets")
4. "만들기" 클릭
5. 역할은 선택하지 않고 "완료" 클릭

## 4. 서비스 계정 키 생성

1. 생성된 서비스 계정 클릭
2. "키" 탭 클릭
3. "키 추가" > "새 키 만들기" 선택
4. "JSON" 선택 후 "만들기" 클릭
5. JSON 파일이 다운로드됨

## 5. Google Sheets 문서 생성 및 공유

1. 새 Google Sheets 문서 생성 (https://sheets.google.com)
2. 첫 번째 행에 헤더 추가:
   - A1: 시간
   - B1: 이름
   - C1: 전화번호
   - D1: 계좌번호
   - E1: 이미지 URL
3. 문서 URL에서 Sheet ID 복사:
   - URL 예시: `https://docs.google.com/spreadsheets/d/여기가_Sheet_ID/edit`
   - `여기가_Sheet_ID` 부분을 복사
4. 다운로드한 JSON 파일에서 다음 정보 확인:
   - `client_email` (서비스 계정 이메일)
   - `private_key` (비공개 키)
   - `project_id` (프로젝트 ID)
5. Google Sheets 문서 공유:
   - 우측 상단 "공유" 버튼 클릭
   - 서비스 계정 이메일(`client_email` 값)을 입력하고 "편집자" 권한 부여
   - "알림 보내기" 체크 해제 후 "공유" 클릭

## 6. 환경 변수 설정

`.env.local` 파일에 다음 내용 추가:

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=서비스계정이메일@프로젝트ID.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_PROJECT_ID=프로젝트ID
GOOGLE_SHEET_ID=Sheet_ID
```

**주의사항:**
- `GOOGLE_PRIVATE_KEY`는 JSON 파일의 `private_key` 값을 그대로 복사하되, 줄바꿈 문자(`\n`)를 그대로 유지해야 합니다.
- 따옴표로 감싸야 합니다.

## 7. 서버 재시작

환경 변수 설정 후 개발 서버를 재시작하세요:
```bash
npm run dev
```

## 테스트

폼을 제출하면 Google Sheets에 자동으로 데이터가 추가됩니다!

