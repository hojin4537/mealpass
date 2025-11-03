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
    console.log('GOOGLE_PRIVATE_KEY:', process.env.GOOGLE_PRIVATE_KEY ? '설정됨' : '미설정');
    console.log('GOOGLE_PROJECT_ID:', process.env.GOOGLE_PROJECT_ID ? '설정됨' : '미설정');
    console.log('GOOGLE_SHEET_ID:', process.env.GOOGLE_SHEET_ID || '미설정');
    console.log('============================');

    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_EMAIL이 설정되지 않았습니다.');
    }
    if (!process.env.GOOGLE_PRIVATE_KEY) {
      throw new Error('GOOGLE_PRIVATE_KEY가 설정되지 않았습니다.');
    }
    if (!process.env.GOOGLE_PROJECT_ID) {
      throw new Error('GOOGLE_PROJECT_ID가 설정되지 않았습니다.');
    }

    // 서비스 계정 인증
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        project_id: process.env.GOOGLE_PROJECT_ID,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) {
      throw new Error('GOOGLE_SHEET_ID가 설정되지 않았습니다.');
    }

    // Private Key 포맷 확인
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    if (!privateKey || !privateKey.includes('BEGIN PRIVATE KEY')) {
      throw new Error('GOOGLE_PRIVATE_KEY 형식이 올바르지 않습니다. 줄바꿈 문자(\\n)가 포함되어야 합니다.');
    }

    console.log('Google Sheets에 데이터 저장 시도...');
    console.log('Spreadsheet ID:', spreadsheetId);
    console.log('저장할 데이터:', data);

    // 시트에 데이터 추가
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:E', // 시트 이름과 범위
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

