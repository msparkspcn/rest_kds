import React, { useEffect, useState } from 'react';

const getFormattedDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
  const day = String(date.getDate()).padStart(2, '0');

  const weekdayOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long', // 또는 "short", "narrow"
  };
  const weekday = date.toLocaleDateString('ko-KR', weekdayOptions);

  return (
    <>
      {year}.{month}.{day}
      <br />
      {weekday}
    </>
  );
};

const getFormattedTime = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, '0'); // 시간을 두 자릿수로 맞추기
  const minutes = String(date.getMinutes()).padStart(2, '0'); // 분을 두 자릿수로 맞추기

  // 원하는 형식: "11:11"
  return `${hours} : ${minutes}`;
};

function Footer(): JSX.Element {
  // console.log(getFormattedDate())
  // const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  // const totalPages = 5;
  const [date, setDate] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      if (now.getMinutes() !== date.getMinutes()) {
        setDate(now);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [date]);
  return (
    <footer className="flex w-full flex-row flex-wrap items-center justify-center gap-y-6 border-t bg-black border-blue-gray-50 py-1 text-center md:justify-between">
      <button
        type="button"
        className="bg-gray-500 ml-2 hover:bg-blue-700 gap-x-5 text-white py-2 px-4 rounded"
      >
        Light
      </button>
      <div className="font-normal transition-colors hover:text-blue-500 focus:text-blue-500 text-white text-left">
        {getFormattedDate(date)}
      </div>
      <div className="font-normal transition-colors hover:text-blue-500 focus:text-blue-500 text-white text-left text-2xl">
        {getFormattedTime(date)}
      </div>
      <div className="flex items-center justify-center">
        <svg
          className="w-15 h-6 text-white dark:text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 8 14"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 1 1.3 6.326a.91.91 0 0 0 0 1.348L7 13"
          />
        </svg>
        <div className="font-normal transition-colors hover:text-blue-500 focus:text-blue-500 text-white text-left text-3xl">
          {/* "현재 페이지 / 전체 페이지" 형식으로 표시 */}
          {/* {currentPage}/{totalPages} */}
          1/1
        </div>
        <svg
          className="w-15 h-6 text-white dark:text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 8 14"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 13 5.7-5.326a.909.909 0 0 0 0-1.348L1 1"
          />
        </svg>
      </div>
      <ul className="flex flex-wrap items-center gap-y-2 gap-x-8 px-7">
        <li>
          <div className="font-normal transition-colors hover:text-blue-500 focus:text-blue-500 text-white">
            전체완료
          </div>
        </li>
        <li>
          <div className="font-normal transition-colors hover:text-blue-500 focus:text-blue-500 text-white">
            직전복원
          </div>
        </li>
        <li>
          <div className="font-normal transition-colors hover:text-blue-500 focus:text-blue-500 text-white">
            조회복원
          </div>
        </li>
        <li>
          <div className="font-normal transition-colors hover:text-blue-500 focus:text-blue-500 text-white">
            프로그램 종료 X
          </div>
        </li>
      </ul>
    </footer>
  );
}

export default Footer;
