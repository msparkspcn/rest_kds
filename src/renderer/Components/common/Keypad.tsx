import React, { useState } from 'react';
import './Keypad.scss';

type KeypadProps = {
  onClick: (key: string) => void;
};

const KEYPAD_BS = '⌫';
const KEYPAD_CLR = 'Clear';

const leftLabels = ['123', 'abc', 'ABC'] as const;

const rightKeys = {
  '123': ['1','2','3','4','5','6','7','8','9','0',
  '00', KEYPAD_BS, KEYPAD_CLR],
  'abc': ['a','b','c','d','e','f','g','h','i','j',
    'k','l','m','n','o','p','q','r','s','t',
    'u','v','w','x','y','z', KEYPAD_BS, KEYPAD_CLR],
  'ABC': ['A','B','C','D','E','F','G','H','I','J',
    'K','L','M','N','O','P','Q','R','S','T',
    'U','V','W','X','Y','Z', KEYPAD_BS, KEYPAD_CLR]
};


const NUM_COLUMNS = 10; // 왼쪽 레이블 제외 오른쪽 칸 개수 맞춤

function chunkArray(arr: string[], chunkSize: number): string[][] {
  const result = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize));
  }
  return result;
}

// 빈칸 채우기
function padArray(arr: string[], length: number) {
  return [...arr, ...Array(length - arr.length).fill('')];
}

const Keypad: React.FC<KeypadProps> = ({ onClick }) => {
  const [layout, setLayout] = useState<'123' | 'abc' | 'ABC'>('123');

  const keys = rightKeys[layout];
  const chunked = chunkArray(keys, NUM_COLUMNS);

  // 3줄로 고정 (없으면 빈 배열로 채움)
  while (chunked.length < 3) {
    chunked.push([]);
  }

  // 각 줄을 빈칸으로 패딩
  const rowsRight = chunked.map(row => padArray(row, NUM_COLUMNS));

  return (
    <div className="keypad-container">
      <div className="keypad-left">
        {leftLabels.map(label => (
          <div
            key={label}
            className={`type-button ${layout === label ? 'selected' : ''}`}
            onMouseDown={(e) => {
              e.preventDefault(); // Prevent input from losing focus
              setLayout(label);
            }}
            role="button"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="keypad-right">
        {rowsRight.map((rowKeys, rowIndex) => (
          <div key={rowIndex} className="keypad-row">
            {rowKeys.map((key, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="keypad-key"
                onMouseDown={(e) => {
                  e.preventDefault(); // input 포커스 유지
                  key && onClick(key);
                }}
                role="button"
              >
                {key}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Keypad;
