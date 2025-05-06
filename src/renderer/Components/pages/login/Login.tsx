import React, { useState } from 'react';
import Loading from '../../common/Loading';
import * as api from '../../api/api';
import { useNavigate } from 'react-router-dom';
import { STRINGS } from '../../../constants/strings';
import { useUserStore } from '../../store/user';
import { setAuthToken } from '../../api/api';
import './Login.scss';
const Login: React.FC = () => {
  // const [userId, setUserId] = useState<string>("");
  const [userId, setUserId] = useState<string>('5000511001');
  const [password, setPassword] = useState<string>('1234');
  const [loading, setLoading] = useState<boolean>(false);
  // const [error, setError] = useState<{ visible: boolean, message: string }>({ visible: false, message: "" });
  const [dialogMessage, setDialogMessage] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);

  const navigate = useNavigate();
  // const {search} = useLocation();
  // const user = useUserStore((state) =>7 7 state.user);
  const setUser = useUserStore((state) => state.setUser);
  const getUser = useUserStore((state) => state.getUser);
  const setStorePassword = useUserStore((state) => state.setPassword);
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked); // Update the state based on checkbox value
  };
  const handleLoginClick = () => {
    // onLogin();
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
          console.log('성공 responseBody:' + JSON.stringify(responseBody));
          setStorePassword(password);
          setUser(responseBody);
          const user = getUser();
          if (user && 'apiKey' in user) {
            setAuthToken(user.apiKey); // 이제 user가 null이 아닐 경우에만 실행
          }

          // setDialogMessage("로그인 성공 userId:"+userId+", password:"+password);
          navigate('/setting');
        } else {
          window.alert(responseMessage);
        }
      })
      .catch((ex) => {
        window.alert('서버에 문제가 있습니다.\n관리자에게 문의해주세요.\n(' + ex.message + ')');
      })
      .finally(() => {
        setLoading(false);
      });
  };

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
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3 className="dialog-title">{STRINGS.notification}</h3>
            <p className="dialog-message">{dialogMessage}</p>
            <button
              className="dialog-confirm"
              onClick={() => setDialogMessage(null)}
            >
              {STRINGS.confirm}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
