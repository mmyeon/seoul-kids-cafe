'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'welcome-seen';

export default function WelcomeModal() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setIsVisible(true);
    }
  }, []);

  function handleClose() {
    localStorage.setItem(STORAGE_KEY, '1');
    setIsVisible(false);
  }

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="bg-[#fff9f0] border border-orange-200 rounded-2xl p-7 max-w-sm w-full text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-4xl mb-3">👶🧒👧</div>
        <h2 className="text-base font-bold text-orange-600 mb-4">이모표 서울형 키즈카페</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-5">
          다둥이 조카들과 갈 수 있는 서울형 키즈 카페를 찾다가
          <br />
          이모가 직접 만든 서비스예요 😄
          <br />
          <br />
          아이들 나이를 모두 선택해서
          <br />다 같이 갈 수 있는 키즈 카페를 찾아보세요.
        </p>
        <button
          type="button"
          onClick={handleClose}
          className="w-full bg-orange-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-orange-700 transition-colors cursor-pointer"
        >
          시작하기 →
        </button>
      </div>
    </div>
  );
}
