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

    // 시트에 데이터 추가 (F열 피드백은 비워둠)
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:F',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          data.timestamp,
          data.name,
          data.phone,
          `${data.accountNumber} (${data.bank})`,
          data.imageUrl,
          '', // 피드백 열 (비워둠)
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

export async function saveFeedbackToGoogleSheets(data: {
  phone: string;
  feedback: string;
}) {
  try {
    // 환경 변수 확인
    const cleanEnvVar = (value: string | undefined) => {
      if (!value) return value;
      return value.replace(/^"|"$/g, '');
    };

    const serviceAccountEmail = cleanEnvVar(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
    const projectId = cleanEnvVar(process.env.GOOGLE_PROJECT_ID);
    const spreadsheetId = cleanEnvVar(process.env.GOOGLE_SHEET_ID);

    if (!serviceAccountEmail || !projectId || !spreadsheetId) {
      throw new Error('Google Sheets 설정이 완료되지 않았습니다.');
    }

    // Private Key 처리
    let privateKey: string;
    
    if (process.env.GOOGLE_PRIVATE_KEY_BASE64) {
      const base64Key = cleanEnvVar(process.env.GOOGLE_PRIVATE_KEY_BASE64);
      if (!base64Key) {
        throw new Error('GOOGLE_PRIVATE_KEY_BASE64가 설정되지 않았습니다.');
      }
      privateKey = Buffer.from(base64Key, 'base64').toString('utf-8');
    } else {
      const privateKeyRaw = cleanEnvVar(process.env.GOOGLE_PRIVATE_KEY);
      if (!privateKeyRaw) {
        throw new Error('GOOGLE_PRIVATE_KEY 또는 GOOGLE_PRIVATE_KEY_BASE64가 설정되지 않았습니다.');
      }
      privateKey = privateKeyRaw
        .replace(/\\n/g, '\n')
        .replace(/\\\\n/g, '\n')
        .replace(/\\r\\n/g, '\n')
        .replace(/"/g, '');
    }

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

    console.log('피드백 Google Sheets에 저장 시도...');
    console.log('전화번호:', data.phone);
    console.log('저장할 피드백:', data.feedback);

    // 모든 데이터 가져오기
    const allData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:F',
    });

    const rows = allData.data.values || [];
    
    // 전화번호로 가장 최근 행 찾기 (위에서 아래로 검색, 가장 마지막 매칭된 행)
    let targetRowIndex = -1;
    for (let i = rows.length - 1; i >= 0; i--) {
      // C열이 전화번호 (인덱스 2)
      if (rows[i][2] === data.phone) {
        targetRowIndex = i + 1; // Google Sheets는 1부터 시작
        break;
      }
    }

    if (targetRowIndex === -1) {
      throw new Error('해당 전화번호로 제출된 내역을 찾을 수 없습니다.');
    }

    // F열 업데이트 (피드백 열)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Sheet1!F${targetRowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[data.feedback]],
      },
    });

    console.log(`피드백 Google Sheets 저장 성공! (행 ${targetRowIndex})`);
    return { success: true };
  } catch (error: any) {
    console.error('피드백 Google Sheets 저장 오류:', error.message);
    throw error;
  }
}

export async function saveFeedbackWithoutPhone(data: {
  feedback: string;
}) {
  try {
    // 환경 변수 확인
    const cleanEnvVar = (value: string | undefined) => {
      if (!value) return value;
      return value.replace(/^"|"$/g, '');
    };

    const serviceAccountEmail = cleanEnvVar(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
    const projectId = cleanEnvVar(process.env.GOOGLE_PROJECT_ID);
    const spreadsheetId = cleanEnvVar(process.env.GOOGLE_SHEET_ID);

    if (!serviceAccountEmail || !projectId || !spreadsheetId) {
      throw new Error('Google Sheets 설정이 완료되지 않았습니다.');
    }

    // Private Key 처리
    let privateKey: string;
    
    if (process.env.GOOGLE_PRIVATE_KEY_BASE64) {
      const base64Key = cleanEnvVar(process.env.GOOGLE_PRIVATE_KEY_BASE64);
      if (!base64Key) {
        throw new Error('GOOGLE_PRIVATE_KEY_BASE64가 설정되지 않았습니다.');
      }
      privateKey = Buffer.from(base64Key, 'base64').toString('utf-8');
    } else {
      const privateKeyRaw = cleanEnvVar(process.env.GOOGLE_PRIVATE_KEY);
      if (!privateKeyRaw) {
        throw new Error('GOOGLE_PRIVATE_KEY 또는 GOOGLE_PRIVATE_KEY_BASE64가 설정되지 않았습니다.');
      }
      privateKey = privateKeyRaw
        .replace(/\\n/g, '\n')
        .replace(/\\\\n/g, '\n')
        .replace(/\\r\\n/g, '\n')
        .replace(/"/g, '');
    }

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

    console.log('피드백 Google Sheets에 저장 시도... (전화번호 없음)');
    console.log('저장할 피드백:', data.feedback);

    // G열(중간피드백) 데이터 가져오기
    const gColumnData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!G:G',
    });

    const gRows = gColumnData.data.values || [];
    
    // G열에서 마지막 비어있지 않은 행 찾기 (헤더 제외)
    let targetRowIndex = 2; // 기본값: 헤더 다음 행 (2행)
    
    // 마지막부터 역순으로 비어있지 않은 행 찾기
    for (let i = gRows.length - 1; i >= 1; i--) { // i=1부터 시작 (헤더 제외)
      if (gRows[i] && gRows[i][0] && gRows[i][0].trim() !== '') {
        targetRowIndex = i + 2; // 다음 빈 행에 추가 (배열 인덱스는 0부터, 행 번호는 1부터)
        break;
      }
    }
    
    // 데이터가 없거나 모두 비어있으면 2행에 추가
    if (gRows.length <= 1) {
      targetRowIndex = 2;
    }

    // G열에 피드백 추가
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Sheet1!G${targetRowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[data.feedback]],
      },
    });

    console.log(`중간피드백 Google Sheets 저장 성공! (G열 ${targetRowIndex}행)`);
    return { success: true };
  } catch (error: any) {
    console.error('피드백 Google Sheets 저장 오류:', error.message);
    throw error;
  }
}
