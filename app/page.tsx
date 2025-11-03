'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('010-');
  const [accountNumber, setAccountNumber] = useState('');
  const [bank, setBank] = useState('');
  const [isBankCustom, setIsBankCustom] = useState(false);
  const [customBank, setCustomBank] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [fileError, setFileError] = useState('');

  const banks = [
    'KB국민은행',
    '신한은행',
    '우리은행',
    '하나은행',
    'NH농협은행',
    'IBK기업은행',
    '카카오뱅크',
    '토스뱅크',
    '새마을금고',
    '신협',
    '직접 입력'
  ];

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, ''); // 숫자만 추출
    
    // 010으로 시작하도록 보장
    if (value.length === 0) {
      setPhone('010-');
      return;
    }
    
    if (!value.startsWith('010')) {
      value = '010' + value.replace(/^010/, '');
    }
    
    // 최대 11자리 (010 + 8자리)
    if (value.length > 11) {
      value = value.slice(0, 11);
    }
    
    // 자동 하이픈 추가: 010-XXXX-XXXX 형식
    let formatted = value.slice(0, 3); // 010
    if (value.length > 3) {
      formatted += '-' + value.slice(3, 7); // 010-XXXX
    }
    if (value.length > 7) {
      formatted += '-' + value.slice(7, 11); // 010-XXXX-XXXX
    }
    
    setPhone(formatted);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError('');
    
    if (!file) {
      setReceipt(null);
      setPreview(null);
      return;
    }

    // 파일 크기 체크
    if (file.size > MAX_FILE_SIZE) {
      setFileError(`파일 크기는 5MB 이하여야 합니다. (현재: ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      setReceipt(null);
      setPreview(null);
      e.target.value = ''; // 파일 선택 초기화
      return;
    }

    // 이미지 파일인지 확인
    if (!file.type.startsWith('image/')) {
      setFileError('이미지 파일만 업로드 가능합니다.');
      setReceipt(null);
      setPreview(null);
      e.target.value = '';
      return;
    }

    setReceipt(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalBank = isBankCustom ? customBank : bank;
    
    if (!name || !phone || !accountNumber || !finalBank || !receipt) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    if (!privacyConsent) {
      alert('개인정보 수집 동의에 체크해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('phone', phone);
      formData.append('accountNumber', accountNumber);
      formData.append('bank', finalBank);
      formData.append('receipt', receipt);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('업로드에 실패했습니다.');
      }

      setIsSuccess(true);
      setName('');
      setPhone('010-');
      setAccountNumber('');
      setBank('');
      setIsBankCustom(false);
      setCustomBank('');
      setReceipt(null);
      setPreview(null);
      setPrivacyConsent(false);
      setFileError('');
    } catch (error) {
      alert('제출 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 랜딩 페이지
  if (!showForm && !isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4 py-8 sm:py-12">
        <main className="w-full max-w-lg">
          <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8">
            {/* 로고 */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 relative">
              <Image
                src="/images/mealpass_logo.png"
                alt="Mealpass 로고"
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* 서비스 이름 */}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Mealpass</h1>

            {/* 헤드라인 */}
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight px-4">
              매일 가던 그 식당,<br />
              똑똑하게 할인받으세요.
            </h2>

            {/* 서브 헤드라인 */}
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed px-4 max-w-md">
              Mealpass는 소비자의 식비 고민을 덜어주면서 지역 경제에 활력을 더해줍니다. 우리의 동네를 위한 똑똑한 식사 생활을 지금 바로 시작하세요!
            </p>

            {/* 할인 받기 버튼 */}
            <button
              onClick={() => setShowForm(true)}
              className="w-full max-w-sm py-4 px-6 bg-red-600 hover:bg-red-700 text-white text-lg font-semibold rounded-lg transition-colors shadow-lg"
            >
              할인 받기
            </button>
          </div>
        </main>
      </div>
    );
  }

  // 성공 화면
  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
        <main className="w-full max-w-lg">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm">
            <div className="text-center py-8">
              <div className="mb-4 text-green-600 text-xl sm:text-2xl font-semibold">
                제출되었습니다.
              </div>
              <p className="text-gray-600 mb-6 text-base sm:text-lg">
                확인 후 연락드리겠습니다.
              </p>
              <button
                onClick={() => {
                  setIsSuccess(false);
                  setShowForm(false);
                }}
                className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-base sm:text-lg"
              >
                다시 제출하기
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 폼 화면
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8 sm:py-12">
      <main className="w-full max-w-lg">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm">
          {/* 헤더 */}
          <div className="mb-6 flex items-center">
            <button
              onClick={() => setShowForm(false)}
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              할인 신청
            </h1>
          </div>

          {/* 안내 문구 */}
          <div className="mb-6 sm:mb-8 p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm sm:text-base text-red-900">
              사근동 소재의 식당에서 식사를 하고 영수증을 찍어서 업로드해주시면 10% 환급을 해드립니다.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* 이름 */}
            <div>
              <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700">
                이름
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 text-base text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent focus:outline-none"
                placeholder="이름을 입력해주세요"
                required
              />
            </div>

            {/* 전화번호 */}
            <div>
              <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-700">
                전화번호
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                className="w-full px-4 py-3 text-base text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent focus:outline-none"
                placeholder="010-0000-0000"
                required
                maxLength={13}
              />
            </div>

            {/* 계좌번호 */}
            <div>
              <label htmlFor="accountNumber" className="block mb-2 text-sm font-medium text-gray-700">
                계좌번호
              </label>
              <input
                id="accountNumber"
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full px-4 py-3 text-base text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent focus:outline-none"
                placeholder="계좌번호를 입력해주세요"
                required
              />
              <p className="mt-1 text-xs text-gray-500">- 없이 숫자만 입력해주세요</p>
            </div>

            {/* 은행 */}
            <div>
              <label htmlFor="bank" className="block mb-2 text-sm font-medium text-gray-700">
                은행
              </label>
              {!isBankCustom ? (
                <div className="relative">
                  <select
                    id="bank"
                    value={bank}
                    onChange={(e) => {
                      if (e.target.value === '직접 입력') {
                        setIsBankCustom(true);
                        setBank('');
                      } else {
                        setBank(e.target.value);
                      }
                    }}
                    className="w-full px-4 py-3 text-base text-black bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none appearance-none cursor-pointer hover:border-gray-400 transition-colors"
                    required={!isBankCustom}
                  >
                    <option value="" className="text-gray-400">은행을 선택해주세요</option>
                    {banks.map((bankOption) => (
                      <option key={bankOption} value={bankOption} className="text-black">
                        {bankOption}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customBank}
                      onChange={(e) => setCustomBank(e.target.value)}
                      className="flex-1 px-4 py-3 text-base text-black border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none"
                      placeholder="은행명을 입력해주세요"
                      required={isBankCustom}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsBankCustom(false);
                        setCustomBank('');
                        setBank('');
                      }}
                      className="px-4 py-3 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                    >
                      선택으로
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 영수증 이미지 */}
            <div>
              <label htmlFor="receipt" className="block mb-2 text-sm font-medium text-gray-700">
                영수증 이미지
              </label>
              <input
                id="receipt"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                required
              />
              <p className="mt-1 text-xs text-gray-500">한 장만 업로드 가능 (최대 5MB)</p>
              
              {fileError && (
                <p className="mt-2 text-sm text-red-600">{fileError}</p>
              )}
              
              {preview && (
                <div className="mt-4">
                  <p className="mb-2 text-sm text-gray-600">미리보기:</p>
                  <div className="relative w-full max-w-md mx-auto aspect-video rounded-lg overflow-hidden border border-gray-300">
                    <Image
                      src={preview}
                      alt="영수증 미리보기"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 개인정보 수집 동의 */}
            <div className="pt-2">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={privacyConsent}
                  onChange={(e) => setPrivacyConsent(e.target.checked)}
                  className="mt-1 mr-3 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  required
                />
                <span className="text-sm text-gray-700">
                  개인정보 수집 및 이용에 동의합니다. (필수)<br />
                  <span className="text-xs text-gray-500 mt-1 block leading-relaxed">
                    <strong>수집 항목:</strong> 이름, 전화번호, 계좌번호(은행 포함), 영수증 이미지<br />
                    <strong>수집 목적:</strong> 환급 신청 및 처리, 서비스 제공<br />
                    <strong>보유 및 이용 기간:</strong> 서비스 종료 시까지 또는 탈퇴 시까지<br />
                    <strong>제3자 제공:</strong> 없음 (단, 서비스 제공을 위해 Google Sheets 및 Cloudinary에 위탁)<br />
                    <strong>개인정보 처리 위탁:</strong> Google Sheets(데이터 저장), Cloudinary(이미지 저장)<br />
                    <strong>정보주체의 권리:</strong> 언제든지 개인정보 열람, 정정, 삭제를 요청할 수 있으며, 동의 거부 시 서비스 이용이 제한될 수 있습니다.
                  </span>
                </span>
              </label>
            </div>

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-red-600 text-white text-lg font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg"
            >
              {isSubmitting ? '제출 중...' : '제출하기'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
