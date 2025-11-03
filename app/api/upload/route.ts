import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { saveToGoogleSheets } from '@/lib/googleSheets';

// Cloudinary 설정
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const accountNumber = formData.get('accountNumber') as string;
    const bank = formData.get('bank') as string;
    const receiptFile = formData.get('receipt') as File;

    if (!name || !phone || !accountNumber || !bank || !receiptFile) {
      return NextResponse.json(
        { error: '모든 필드를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 파일을 버퍼로 변환
    const bytes = await receiptFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Base64로 변환하여 Cloudinary에 업로드
    const base64 = buffer.toString('base64');
    const dataURI = `data:${receiptFile.type};base64,${base64}`;

    // Cloudinary에 업로드
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        dataURI,
        {
          folder: 'mealpass-receipts',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });

    const uploadResponse = uploadResult as {
      secure_url: string;
      public_id: string;
    };

    // Google Sheets에 저장
    const timestamp = new Date().toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    try {
      await saveToGoogleSheets({
        name,
        phone,
        accountNumber,
        bank,
        imageUrl: uploadResponse.secure_url,
        timestamp,
      });
      console.log('✅ Google Sheets 저장 완료');
    } catch (sheetsError: any) {
      console.error('❌ Google Sheets 저장 실패:', sheetsError);
      console.error('에러 상세:', sheetsError.message);
      console.error('에러 스택:', sheetsError.stack);
      
      // 에러를 클라이언트에도 반환하여 디버깅 가능하게 함
      return NextResponse.json(
        { 
          success: true, // 이미지는 업로드되었으므로 success는 true
          message: '제출되었습니다.',
          imageUrl: uploadResponse.secure_url,
          warning: 'Google Sheets 저장에 실패했습니다. 관리자에게 문의해주세요.',
          error: process.env.NODE_ENV === 'development' ? sheetsError.message : undefined
        },
        { status: 200 }
      );
    }

    // 콘솔에도 출력 (백업)
    console.log('=== 영수증 업로드 완료 ===');
    console.log('이름:', name);
    console.log('전화번호:', phone);
    console.log('계좌번호:', accountNumber);
    console.log('은행:', bank);
    console.log('이미지 URL:', uploadResponse.secure_url);
    console.log('Public ID:', uploadResponse.public_id);
    console.log('시간:', timestamp);
    console.log('========================');

    return NextResponse.json({
      success: true,
      message: '제출되었습니다.',
      imageUrl: uploadResponse.secure_url,
    });
  } catch (error) {
    console.error('업로드 오류:', error);
    return NextResponse.json(
      { error: '이미지 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

