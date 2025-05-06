import React from 'react';
import './ConfirmDialog.scss';
interface DialogProps {
  title: string;
  message: string;
  confirmOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmDialog: React.FC<DialogProps> = (
  { title, message, onClose, onConfirm }
) => {
  return (
    <div className="dialog-layout" onClose={onClose}>
      <div className="dialog-content">
        <div className="dialog-header">
          <div className="spacer" />
          <h2>{title}</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
        <div className="dialog-message">
          {message}
        </div>
        <div className="dialog-footer">
          <button className="confirm-button" onClick={onConfirm}>확인</button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog;
