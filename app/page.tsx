'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Restaurant {
  id: number;
  name: string;
  address: string;
  image?: string; // 이미지 경로 (optional)
}

export default function Home() {
  const [showCategorySelection, setShowCategorySelection] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'restaurant' | 'cafe' | null>(null);
  const [showRestaurantList, setShowRestaurantList] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
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

  const cafes: Restaurant[] = [
    { id: 1, name: '히어카페', address: '사근동길 55 1층 1호', image: '/images/restaurants/히어카페.png' },
    { id: 2, name: '더스토리지', address: '사근동8길 6', image: '/images/restaurants/더스토리지.png' },
    { id: 3, name: '카페사근', address: '사근동길 52-1 1층 카페,사근', image: '/images/restaurants/카페사근.png' },
    { id: 4, name: '하냥', address: '사근동길 53카페 하냥', image: '/images/restaurants/하냥.png' },
    { id: 5, name: '오잉키', address: '사근동길 64 1층 Oinky', image: '/images/restaurants/오잉키.png' },
  ];

  const restaurants: Restaurant[] = [
    { id: 6, name: '스타뚝배기', address: '사근동8길 12', image: '/images/restaurants/스타뚝배기.png' },
    { id: 7, name: '미네스키친', address: '사근동8길 3 1F MINEs KITCHEN', image: '/images/restaurants/미네스키친.png' },
    { id: 8, name: '다시올치킨', address: '사근동8길 8', image: '/images/restaurants/다시올치킨.png' },
    { id: 9, name: '한양촌', address: '사근동4길 11', image: '/images/restaurants/한양촌.png' },
    { id: 10, name: '한끼라도잘먹자', address: '사근동8가길 1', image: '/images/restaurants/한끼라도잘먹자.png' },
    { id: 11, name: '타이인플레이트', address: '사근동8길 3 우리빌딩', image: '/images/restaurants/타이인플레이트.png' },
    { id: 12, name: '삼거리식당', address: '사근동10길 2-1', image: '/images/restaurants/삼거리식당.png' },
    { id: 13, name: '종점토스트', address: '사근동9길 1 1층', image: '/images/restaurants/종점토스트.png' },
    { id: 14, name: '고향식당', address: '사근동길 63 1층', image: '/images/restaurants/고향식당.png' },
    { id: 15, name: '할매불백', address: '사근동11길 3', image: '/images/restaurants/할매불백.png' },
  ];

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
      setSelectedRestaurant(null);
      setSelectedCategory(null);
      setShowCategorySelection(false);
    } catch (error) {
      alert('제출 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 카테고리 선택 페이지
  if (showCategorySelection && !showRestaurantList && !showForm && !isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <main className="w-full max-w-lg mx-auto">
          {/* 헤더 */}
          <div className="mb-8 flex items-center">
            <button
              onClick={() => setShowCategorySelection(false)}
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              식당/카페 선택
            </h1>
          </div>

          {/* 환급 방법 안내 */}
          <div className="mb-8 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="mb-4">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                환급 방법
              </h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                아래 제휴 대상 가게들을 확인하고 원하는 가게를 선택합니다. 이벤트 기간 내 매장 식사 후, 영수증을 첨부하면 영수증 금액 기준 최소 10%를 환급해드립니다.
              </p>
            </div>

            <div className="mb-4 pb-4 border-b border-gray-200">
              <p className="text-sm sm:text-base text-gray-700">
                <span className="font-semibold">이벤트 기간:</span> 11월 5일 ~ 11월 19일
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs sm:text-sm font-semibold text-gray-800 mb-2">주의사항:</p>
              <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                <p>• 환급금 지급은 약 14일 정도의 영업일이 걸릴 수 있습니다.</p>
                <p>• 본 이벤트는 사전 고지 없이 조기 마감될 수 있습니다.</p>
              </div>
            </div>
          </div>

          {/* 카테고리 버튼 */}
          <div className="space-y-4">
            <button
              onClick={() => {
                setSelectedCategory('restaurant');
                setShowCategorySelection(false);
                setShowRestaurantList(true);
              }}
              className="w-full py-4 px-6 bg-white hover:bg-gray-50 text-gray-900 text-lg font-semibold rounded-lg transition-colors shadow-sm border border-gray-200"
            >
              식당에서 할인받기
            </button>
            <button
              onClick={() => {
                setSelectedCategory('cafe');
                setShowCategorySelection(false);
                setShowRestaurantList(true);
              }}
              className="w-full py-4 px-6 bg-white hover:bg-gray-50 text-gray-900 text-lg font-semibold rounded-lg transition-colors shadow-sm border border-gray-200"
            >
              카페에서 할인받기
            </button>
          </div>
        </main>
      </div>
    );
  }

  // 식당/카페 선택 페이지
  if (showRestaurantList && !showForm && !isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <main className="w-full max-w-2xl mx-auto">
          {/* 헤더 */}
          <div className="mb-6 flex items-center">
            <button
              onClick={() => {
                setShowRestaurantList(false);
                setShowCategorySelection(true);
              }}
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {selectedCategory === 'restaurant' ? '식당 선택' : '카페 선택'}
            </h1>
          </div>

          {/* 할인 안내 */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm sm:text-base text-blue-900 font-semibold mb-2">
              결제 금액별 할인율
            </p>
            {selectedCategory === 'restaurant' ? (
              <div className="text-xs sm:text-sm text-blue-800 space-y-1">
                <p>• 3만원 미만 결제 시: <span className="font-semibold">10% 할인</span></p>
                <p>• 3만원 이상 ~ 5만원 미만: <span className="font-semibold">15% 할인</span></p>
                <p>• 5만원 이상 결제 시: <span className="font-semibold">20% 할인</span></p>
              </div>
            ) : (
              <div className="text-xs sm:text-sm text-blue-800 space-y-1">
                <p>• 2만원 미만 결제 시: <span className="font-semibold">10% 할인</span></p>
                <p>• 2만원 이상 ~ 3만원 미만: <span className="font-semibold">15% 할인</span></p>
                <p>• 3만원 이상 결제 시: <span className="font-semibold">20% 할인</span></p>
              </div>
            )}
          </div>

          {/* 식당/카페 리스트 */}
          <div className="space-y-3">
            {(selectedCategory === 'restaurant' ? restaurants : cafes).map((restaurant) => (
              <button
                key={restaurant.id}
                onClick={() => {
                  setSelectedRestaurant(restaurant);
                  setShowRestaurantList(false);
                  setShowForm(true);
                }}
                className="w-full bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden"
              >
                <div className="flex items-center p-4">
                  {/* 사진 영역 */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-lg flex-shrink-0 mr-4 relative overflow-hidden">
                    {restaurant.image ? (
                      <Image
                        src={restaurant.image}
                        alt={restaurant.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        이미지 없음
                      </div>
                    )}
                  </div>
                  
                  {/* 텍스트 정보 */}
                  <div className="flex-1 text-left">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                      {restaurant.name}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      {restaurant.address}
                    </p>
                  </div>
                  
                  {/* 화살표 아이콘 */}
                  <div className="ml-4 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // 랜딩 페이지
  if (!showCategorySelection && !showRestaurantList && !showForm && !isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4 py-8 sm:py-12">
        <main className="w-full max-w-lg">
          <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8">
            {/* 로고 */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 relative">
              <Image
                src="/images/dongnaebapnae_logo.png"
                alt="동네밥네 로고"
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* 서비스 이름 */}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">동네밥네</h1>

            {/* 헤드라인 */}
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight px-4">
              매일 가던 그 식당,<br />
              똑똑하게 할인받으세요.
            </h2>

            {/* 서브 헤드라인 */}
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed px-4 max-w-md">
              동네밥네는 소비자의 식비 고민을 덜어주면서 지역 경제에 활력을 더해줍니다. 우리의 동네를 위한 똑똑한 식사 생활을 지금 바로 시작하세요!
            </p>

            {/* 할인 받기 버튼 */}
            <button
              onClick={() => setShowCategorySelection(true)}
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
                  setShowRestaurantList(false);
                  setShowCategorySelection(false);
                  setSelectedRestaurant(null);
                  setSelectedCategory(null);
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
              onClick={() => {
                setShowForm(false);
                setShowRestaurantList(true);
                setShowCategorySelection(false);
              }}
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

          {/* 선택한 식당 정보 */}
          {selectedRestaurant && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm sm:text-base text-blue-900">
                <span className="font-semibold">{selectedRestaurant.name}</span>에서 식사를 하셨나요?
              </p>
            </div>
          )}

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
                placeholder="환급받을 계좌번호를 입력해주세요"
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
