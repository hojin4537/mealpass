import { NextRequest, NextResponse } from 'next/server';
import { saveFeedbackToGoogleSheets } from '@/lib/googleSheets';

export async function POST(request: NextRequest) {
  try {
    const { feedback, phone } = await request.json();
    
    if (!feedback || !feedback.trim()) {
      return NextResponse.json(
        { error: '피드백을 입력해주세요.' },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        { error: '전화번호가 필요합니다.' },
        { status: 400 }
      );
    }

    try {
      await saveFeedbackToGoogleSheets({
        phone: phone.trim(),
        feedback: feedback.trim(),
      });
      console.log('✅ 피드백 Google Sheets 저장 완료');
    } catch (sheetsError: any) {
      console.error('❌ 피드백 Google Sheets 저장 실패:', sheetsError);
      return NextResponse.json(
        { 
          error: '피드백 저장에 실패했습니다. 다시 시도해주세요.',
          details: process.env.NODE_ENV === 'development' ? sheetsError.message : undefined
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '피드백이 전송되었습니다.',
    });
  } catch (error) {
    console.error('피드백 전송 오류:', error);
    return NextResponse.json(
      { error: '피드백 전송 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

