import React, { useEffect, useState } from 'react';
import './Footer.scss';
import { STRINGS } from '../../../constants/strings';

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

  return `${hours} : ${minutes}`;
};
interface FooterProps {
  onSetting: () => void;
  currentPage: number;
  totalPages: number;
  onNextPage: () => void;
  onPrevPage: () => void;
  onCompleteAll: () => void;
  onRestoreRecent: () => void;
  onRestore: () => void;
  onExitApp: () => void;
}

const Footer: React.FC<FooterProps> = ({
  onSetting,
  currentPage,
  totalPages,
  onNextPage,
  onPrevPage,
  onCompleteAll,
  onRestoreRecent,
  onRestore,
  onExitApp
}) => {
  const [date, setDate] = useState(new Date());
  let clickCnt = 0;

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      if (now.getMinutes() !== date.getMinutes()) {
        setDate(now);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [date]);

  const onHeaderClick = () => {
    clickCnt++;
    if (clickCnt >= 10) {
      onSetting();
      clickCnt = 0;
    }
  };

  return (
    <footer className="footer">
      <div className="footer__date" onClick={onHeaderClick}>
        {getFormattedDate(date)}
      </div>

      <div className="footer__time">{getFormattedTime(date)}</div>

      <div className="footer__pagination">
        <button type="button" className="footer__arrow" onClick={onPrevPage}>
          <svg className="footer__arrow" viewBox="0 0 8 14" fill="none">
            <path
              d="M7 1 1.3 6.326a.91.91 0 0 0 0 1.348L7 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="footer__page">
          {currentPage + 1} / {totalPages}
        </div>
        <button type="button" className="footer__arrow" onClick={onNextPage}>
          <svg className="footer__arrow" viewBox="0 0 8 14" fill="none">
            <path
              d="m1 13 5.7-5.326a.909.909 0 0 0 0-1.348L1 1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="footer__menu">
        <div className="footer__menu-item" onClick={onCompleteAll}>{STRINGS.complete_all}</div>
        <div className="footer__menu-item" onClick={onRestoreRecent}>{STRINGS.restore_recent}</div>
        <div className="footer__menu-item" onClick={onRestore}>{STRINGS.restore_search}</div>
        <div className="footer__menu-item exit" onClick={onExitApp}>{STRINGS.exit_app}</div>
      </div>

    </footer>
  );
};

export default Footer;
