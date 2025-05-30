import React from 'react';
import './ConfirmDialog.scss';

interface AlertProps {
  title: string;
  message: string;
  onClose: () => void;
}
const Alert: React.FC<AlertProps> = ({ title, message, onClose }) => {
  return (
    <div className="dialog-layout">
      <div className="dialog-content">
        <div className="dialog-header">
          <h2>{title}</h2>
        </div>
        <div className="dialog-message">
          {typeof message === 'string'
            ? message.split('\n').map((line, idx) => (
                <React.Fragment key={idx}>
                  {line}
                  {idx !== message.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))
            : message}
        </div>
        <div className="dialog-footer">
          <button className="confirm-button" onClick={onClose}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default Alert;
