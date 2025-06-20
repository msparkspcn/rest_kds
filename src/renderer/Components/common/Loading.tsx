import React from 'react';
import './Loading.scss';

const Loading: React.FC = () => {
  return (
    <div className="loading-overlay">
      <div className="spinner" />
      <p className="loading-text">처리중입니다...</p>
    </div>
  );
};

export default Loading;
