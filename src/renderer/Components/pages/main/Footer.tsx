import React, { useEffect, useState } from 'react';
import './Footer.scss';
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
    <footer className="footer">
      <button type="button" className="footer__button">Light</button>

      <div className="footer__date">
        {getFormattedDate(date)}
      </div>

      <div className="footer__time">
        {getFormattedTime(date)}
      </div>

      <div className="footer__pagination">
        <svg className="footer__arrow" viewBox="0 0 8 14" fill="none">
          <path d="M7 1 1.3 6.326a.91.91 0 0 0 0 1.348L7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="footer__page">1/1</div>
        <svg className="footer__arrow" viewBox="0 0 8 14" fill="none">
          <path d="m1 13 5.7-5.326a.909.909 0 0 0 0-1.348L1 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <ul className="footer__menu">
        <li><div className="footer__menu-item">전체완료</div></li>
        <li><div className="footer__menu-item">직전복원</div></li>
        <li><div className="footer__menu-item">조회복원</div></li>
        <li><div className="footer__menu-item">프로그램 종료 X</div></li>
      </ul>
    </footer>

  );
}

export default Footer;
