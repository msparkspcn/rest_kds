import React, { useState, useEffect } from 'react';
import Loading from '../../common/Loading';
import * as api from '../../data/api/api';
import { useNavigate } from 'react-router-dom';
import { STRINGS } from '../../../constants/strings';
import { useUserStore } from '../../store/user';
import { setAuthToken } from '../../data/api/api';
import './Login.scss';
import Alert from '@Components/common/Alert';
const Login: React.FC = () => {
  const [userId, setUserId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [dialogMessage, setDialogMessage] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);

  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);
  const getUser = useUserStore((state) => state.getUser);
  const getUserId = useUserStore((state) => state.userId);
  const getStorePassword = useUserStore((state) => state.getPassword);
  const setStoreUserId = useUserStore((state) => state.setUserId);
  const setStorePassword = useUserStore((state) => state.setPassword);

  useEffect(() => {
    console.log("Login getUserId:"+getUserId)
    if(getUserId && getStorePassword) {
      setUserId(getUserId);
      setPassword(getStorePassword);
      setIsChecked(true);
    }
  },[])
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked); // Update the state based on checkbox value
  };
  const handleLoginClick = () => {
    if (userId.length === 0) {
      return;
    }
    if (password.length === 0) {
      return;
    }
    const params = {
      userId: userId,
      password: password,
    };
    api
      .login(params)
      .then((result) => {
        const { responseCode, responseMessage, responseBody } = result.data;
        if (responseCode === '200') {
          console.log('11성공 responseBody:' + JSON.stringify(responseBody));
          setUser(responseBody);
          const user = getUser();
          if (user && 'apiKey' in user) {
            setAuthToken(user.apiKey); // 이제 user 가 null 이 아닐 경우에만 실행
          }
          if(isChecked) {
            setStoreUserId(userId)
            setStorePassword(password);
          }
          else {
            setStoreUserId(userId)
            setStorePassword('')
          }
          navigate('/setting');
        } else {
          console.log("로그인 실패"+responseCode)
          setDialogMessage(responseMessage)
        }
      })
      .catch((ex) => {
        setDialogMessage('서버에 문제가 있습니다.\n관리자에게 문의해주세요.\n(' + ex.message + ')')
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getStoreSaleOpen = () => {
    const params = {
      cmpCd: '90000001',
      brandCd: '9999',
      storeCd: '000281'
    };
    api.getStoreSaleOpen(params)
      .then((result) => {
        const { responseBody, responseCode, responseMessage } = result.data;
        if (responseCode === '200') {
          console.log(`### 개점정보 res:${responseBody.saleDt}`);
        }
        else {
          setDialogMessage(responseMessage);
          console.log('### 개점정보 수신 실패');
        }
      })
  }

  return (
    <div className="login-container">
      {loading && <Loading />}

      <h1 className="project-name">{STRINGS.project_name}</h1>
      <h2 className="member-login">{STRINGS.member_login}</h2>

      <div className="form-wrapper">
        <form onSubmit={(e) => {
          e.preventDefault();
          handleLoginClick();
        }} className="login-form">
          <div className="input-box">
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder={STRINGS.id}
              className="input"
            />
          </div>
          <div className="input-box">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={STRINGS.password}
              className="input"
            />
          </div>
          <div className="checkbox-wrapper">
            <label className="checkbox-label" htmlFor="check-2">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={handleCheckboxChange}
                className="checkbox"
                id="check-2"
              />
              <span className="checkbox-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="check-svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414
                  0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0
                  011.414 0z"
                  />
                </svg>
              </span>
            </label>
            <label htmlFor="check-2" className="checkbox-text">자동 로그인</label>
          </div>
          <div className="login-button-wrapper">
            <button
              type="submit"
              className={`login-button ${userId && password ? 'active' : 'inactive'}`}
              disabled={!userId || !password}
            >
              {STRINGS.login}
            </button>
          </div>
        </form>
      </div>
      {dialogMessage && (
        <Alert
          title="알림"
          message={dialogMessage}
          onClose={()=>{setDialogMessage(null)}}
        />
      )}
    </div>
  );
};

export default Login;
