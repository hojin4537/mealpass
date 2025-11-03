import { google } from 'googleapis';

export async function saveToGoogleSheets(data: {
  name: string;
  phone: string;
  accountNumber: string;
  bank: string;
  imageUrl: string;
  timestamp: string;
}) {
  try {
    // 환경 변수 확인
    console.log('=== Google Sheets 설정 확인 ===');
    console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? '설정됨' : '미설정');
    console.log('GOOGLE_PRIVATE_KEY_BASE64:', process.env.GOOGLE_PRIVATE_KEY_BASE64 ? '설정됨' : '미설정');
    console.log('GOOGLE_PRIVATE_KEY:', process.env.GOOGLE_PRIVATE_KEY ? '설정됨 (fallback)' : '미설정');
    console.log('GOOGLE_PROJECT_ID:', process.env.GOOGLE_PROJECT_ID ? '설정됨' : '미설정');
    console.log('GOOGLE_SHEET_ID:', process.env.GOOGLE_SHEET_ID || '미설정');
    console.log('============================');

    // 환경 변수에서 큰따옴표 제거
    const cleanEnvVar = (value: string | undefined) => {
      if (!value) return value;
      return value.replace(/^"|"$/g, '');
    };

    const serviceAccountEmail = cleanEnvVar(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
    const projectId = cleanEnvVar(process.env.GOOGLE_PROJECT_ID);
    const spreadsheetId = cleanEnvVar(process.env.GOOGLE_SHEET_ID);

    if (!serviceAccountEmail) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_EMAIL이 설정되지 않았습니다.');
    }
    if (!projectId) {
      throw new Error('GOOGLE_PROJECT_ID가 설정되지 않았습니다.');
    }
    if (!spreadsheetId) {
      throw new Error('GOOGLE_SHEET_ID가 설정되지 않았습니다.');
    }

    // Private Key 처리
    let privateKey: string;
    
    // Base64 인코딩된 키가 있으면 디코딩 (권장)
    if (process.env.GOOGLE_PRIVATE_KEY_BASE64) {
      const base64Key = cleanEnvVar(process.env.GOOGLE_PRIVATE_KEY_BASE64);
      if (!base64Key) {
        throw new Error('GOOGLE_PRIVATE_KEY_BASE64가 설정되지 않았습니다.');
      }
      try {
        privateKey = Buffer.from(base64Key, 'base64').toString('utf-8');
        console.log('Base64 디코딩 성공');
      } catch (decodeError) {
        throw new Error(`GOOGLE_PRIVATE_KEY_BASE64 디코딩 실패: ${decodeError}`);
      }
    } else {
      // 일반 텍스트 키 처리 (fallback)
      const privateKeyRaw = cleanEnvVar(process.env.GOOGLE_PRIVATE_KEY);
      if (!privateKeyRaw) {
        throw new Error('GOOGLE_PRIVATE_KEY 또는 GOOGLE_PRIVATE_KEY_BASE64가 설정되지 않았습니다.');
      }
      
      // 여러 방법으로 줄바꿈 처리 시도
      privateKey = privateKeyRaw
        .replace(/\\n/g, '\n')           // \n을 실제 줄바꿈으로
        .replace(/\\\\n/g, '\n')        // \\n도 처리
        .replace(/\\r\\n/g, '\n')       // \r\n 처리
        .replace(/"/g, '');             // 남은 따옴표 제거
    }

    // Private Key 형식 확인
    if (!privateKey.includes('BEGIN PRIVATE KEY') && !privateKey.includes('BEGIN RSA PRIVATE KEY')) {
      throw new Error('GOOGLE_PRIVATE_KEY 형식이 올바르지 않습니다. BEGIN PRIVATE KEY 또는 BEGIN RSA PRIVATE KEY가 필요합니다.');
    }

    console.log('Private Key 길이:', privateKey.length);
    console.log('Private Key 시작:', privateKey.substring(0, 50));

    // 서비스 계정 인증
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccountEmail,
        private_key: privateKey,
        project_id: projectId,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    console.log('Google Sheets에 데이터 저장 시도...');
    console.log('Spreadsheet ID:', spreadsheetId);
    console.log('저장할 데이터:', data);

    // 시트에 데이터 추가
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:E',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          data.timestamp,
          data.name,
          data.phone,
          `${data.accountNumber} (${data.bank})`,
          data.imageUrl,
        ]],
      },
    });

    console.log('Google Sheets 저장 성공!');
    console.log('응답:', response.data);

    return { success: true };
  } catch (error: any) {
    console.error('=== Google Sheets 저장 오류 상세 ===');
    console.error('에러 메시지:', error.message);
    console.error('에러 스택:', error.stack);
    if (error.response) {
      console.error('API 응답:', error.response.data);
      console.error('상태 코드:', error.response.status);
    }
    console.error('==================================');
    throw error;
  }
}
