import React, { useState } from 'react';
import "../../common/InputPassword.scss";
import { useUserStore } from '@Components/store/user';

interface CallOrderProps {
  title: string;
  errorMsg: string;
  onClose: () => void;
  onCorrect: (orderNoC: string) => void;
}

const CallOrderDialog: React.FC<CallOrderProps> = ({ title, errorMsg, onClose, onCorrect }) => {
  const [inputValue, setInputValue] = useState('');
  const [isCorrect, setIsCorrect] = useState(true);
  const getPassword = useUserStore((state) => state.getPassword);
  const keyArray = [
    { value: '1' },
    { value: '2' },
    { value: '3' },
    { value: '4' },
    { value: '5' },
    { value: '6' },
    { value: '7' },
    { value: '8' },
    { value: '9' },
    { value: '' },
    { value: '0' },
    { value: 'C' },
  ];

  const onKeypadPress = (value: string) => {
    if (value === 'C') {
      setInputValue('');
      setIsCorrect(true);
    } else {
      if (inputValue.length === 7) return; // 주문번호 길이에 맞춰 수정
      setInputValue((prev) => prev + value);
    }
  };

  const onPasswordCheck = () => {
    if (inputValue!=='') {
      console.log('비밀번호 일치');
      onClose();
      onCorrect(inputValue);
    } else {
      console.log('입력 필요');
      setIsCorrect(false);
      setInputValue('');
    }
  };

  const onCallOrder = (value: string) => {
    // params:{cmpCd, salesOrgCd, storCd, cornerCd, saleDt, orderNo}
    // kdsState 대기,호출,완료
    // onCallOrder -> 호출
  };

  return (
    <div className="password-overlay">
      <div className="password-container">
        <div className="password-header">
          <div className="spacer" />
          <h2>{title}</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
        <div className="password-content">
          {!isCorrect && <div className="error-message">{errorMsg}</div>}

          <div className="order-no-box">{inputValue}</div>

          <div className="keypad">
            {keyArray.map((item, idx) => (
              <button
                key={item.value}
                className="key"
                onClick={() => onKeypadPress(item.value)}
                disabled={item.value === ''}
              >
                {item.value}
              </button>
            ))}
          </div>
        </div>
        <div className="password-footer">
          <button className="confirm-button" onClick={onPasswordCheck}>호출</button>
        </div>
      </div>
    </div>
  );
};

export default CallOrderDialog;
