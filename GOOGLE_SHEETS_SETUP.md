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

1. 새 Google Sheets 문서 생성 (  )
2. 첫 번째 행에 헤더 추가:
   - A1: 시간
   - B1: 이름
   - C1: 전화번호
   - D1: 계좌번호
   - E1: 이미지 URL
3. 문서 URL에서 Sheet ID 복사:
   - URL 예시: `https://docs.google.com/spreadsheets/d/https://docs.google.com/spreadsheets/d/1RypeH1LNmuqWnZa9Kn_qXWHiGnoINQhSCvBuKmNcYpE/edit?gid=0#gid=0/edit`
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
GOOGLE_SERVICE_ACCOUNT_EMAIL= "mealpass@gen-lang-client-0851647689.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCpA6POGVQPnIqi\nPbr//Gpx1pa9Gk5NtqHL2HK7OeSXjwKdhkO9t0Xiynw5//b3cuMvjjqla3s7mjMm\nDwkvHW91V7JIUxa7D5JUGyh5hzFvKMCP3n02Wsda8Au45PItieWwrfPoz0xf79x7\n2D8/h9rfP4G52WOA/NAtj4wRRNpjwAWpsPKd1Gx9Nx6gs6Xkni5oz3jp7P/xJJWs\no3LfMECB1DSalb6BO7SyssymhfhyysYXZCAv4mHs/dRuZmyWGepvQ6vUTC0xG1Jc\n4YmYUlyXO8/kHbRHdFu3zml44X3swz542zgEaKD2E6IBNx6fYwD8FX/YZ0Qvt8rl\nN1tJq5lbAgMBAAECggEAE8N0sqN8lGzCO1GLneZ2zgQBUXCTinvaNJuFYwZUiDJ1\nZFUwc61MM0ZpO2EGkI3zKfrwOaq1WNVhuMgWU1eWUnrkQpfQtyQNgN9CHt/jtHNn\n/QrPynzYBfa+8Cp5dUDERqI4vNcMv8UtG6BAWR36RpPHCCP3AjzN3R4Fi3lpLjOz\npBBqJAcPpssKXPWvm4AUobe4UvlHx/+T5CT3D7SkSscMbYCiemMMUsh49FQoIJtZ\nPgSzmCw+aOTMXO79LgPUV/guMGZ9NzziL1bLTeDj9R9/Qumo4Cc3OoJdE62Ha4sm\nB+EwlPcAzkemPlVzmfMruruopoXSdCg7AFNnU48guQKBgQDoTPwYeW7fY215hqxd\n3L16Z+3RTpxJlTGMeJ/i3ROKEZmhUeNAdpqImOuHpR5ig7ceTWymGov248KN1YTH\nEtNJQiOjUiebSgXPb6qHGuR/VYysn4xtJdqtcwua8p2lPeVat6cnqy9PTOyDeHWu\nxS4+01knhilAvysKjkDHB8logwKBgQC6Qcv6cmQPBJ5/PKr7F7San09jmqkPcPdD\n8Eo1G3W4epKw7eZr1cPfhm9wifpJIHNIVpqj7WyDSJgVUSHY7FFkCPJUazRMw2Mq\nBzixIEXEVf72juE5LJZpNnXjfBs4+IoXKgm1HTEtAYLD8Kwgaxd0x4fWCQkvHhVK\nFXE4i35ESQKBgQDV1zBlszs+BoAbU77ONMpzqMJCYBP8pItVHSFJrGs1ORhsaT5B\n9CwzPFnspzI+S7PBAFLY4S0g2+8Xs4sj2o+HK4w05wawq8aHeurGrhnTocP6kHCr\ndSJFctcnDtnR6BV+mfsUyD+nx08dg0EJ3lfA27uBZ74H7TLI58R3sxJT0wKBgHYv\nY/Ah/62r36qa4196dkYaynRIYfgDVVLNuTijmPobBNOx0SEhvi0qj7HYS3F1XtFK\n6ssTz2Qqfx4fohuUMD0KlEHO2JvQ6y5y8J0r/jkL3EG0/eKakUJnpTxYtqlaw7zZ\nFtnOkTKen8wW/hGAAp0+Mso0Z5h3PUkJ/BLGKLPJAoGAEb5U5/xVMNK0LGGxzXxG\nn1m/nN/cSa3rR83JfKbv8+MxWKIvebXJ00EMOqcnuwrrO+rmMraKcdTNMXp7qdU9\ntN4r2CNaT9HXddRwpluHObEI9m0yd7QETw9bRSjxb8jp/tbh8YHn88bZ2ze13mKH\nALHL1abVxOnw6SeDkjDvco8=\n-----END PRIVATE KEY-----\n",
GOOGLE_PROJECT_ID="gen-lang-client-0851647689"
GOOGLE_SHEET_ID=14-LwvpekU_bjNmkYO1I_BIMDjPKbzWT_ilP2OoKJr0U

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

