import React, { useState } from 'react';
import './InputPassword.scss';
import { useUserStore } from '@Components/store/user';
import { log } from '@Components/utils/logUtil';

interface InputPasswordProps {
  onClose: () => void;
  onCorrect: () => void;
}

const InputPassword: React.FC<InputPasswordProps> = ({ onClose, onCorrect }) => {
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
      // if (inputValue.length === 4) return;
      setInputValue((prev) => prev + value);
    }
  };

  const onPasswordCheck = () => {
    if (getPassword() === inputValue) {
      console.log('비밀번호 일치');
      onClose();
      onCorrect();
    } else {
      console.log('비밀번호 불일치');
      setIsCorrect(false);
      setInputValue('');
    }
  };

  return (
    <div className="password-overlay">
      <div className="password-container">
        <div className="password-header">
          <div className="spacer" />
          <h2>비밀번호 입력</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
        <div className="password-content">
          {!isCorrect && (<div className="error-message">비밀번호를 다시 확인해주세요.</div>)}

          <div className="order-no-box">
            {inputValue.length > 0 ? '•'.repeat(inputValue.length) : ''}
          </div>

          <div className="keypad">
            {keyArray.map((item, idx) => (
              <button
                key={idx}
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
          <button className="confirm-button" onClick={onPasswordCheck}>확인</button>
        </div>
      </div>
    </div>
  );
};

export default InputPassword;
