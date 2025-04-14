import React, { useState } from 'react';
import Loading from '../../common/Loading';
import * as api from '../../../api/api';
import { useNavigate } from 'react-router-dom';
import { STRINGS } from '../../../constants/strings';
import { useUserStore } from '/src/api/user';
import { setAuthToken } from '../../../api/api';
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
          setUser(responseBody);
          const user = getUser();
          if (user && 'apiKey' in user) {
            setAuthToken(user.apiKey); // 이제 user가 null이 아닐 경우에만 실행
          }

          // setDialogMessage("로그인 성공 userId:"+userId+", password:"+password);
          navigate('/setting');
        } else {
          window.alert('ErrorCode :: ' + responseCode + '\n' + responseMessage);
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
    <div className="flex h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      {loading ? <Loading /> : null}

      <h1 className="mt-10 text-center text-5xl/9 font-bold tracking-tight text-gray-900">
        {STRINGS.project_name}
      </h1>
      <h2 className="mt-3 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
        {STRINGS.member_login}
      </h2>

      <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault(); // 기본 동작(새로고침) 방지
            handleLoginClick(); // 로그인 로직 실행
          }}
          className="space-y-2"
        >
          <div className="mt-2">
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder={STRINGS.id}
              className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6"
            />
          </div>
          <div className="mt-1">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={STRINGS.password}
              className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6"
            />
          </div>
          <div className="mt-2 inline-flex items-center">
            <label className="flex items-center cursor-pointer relative" htmlFor="check-2">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={handleCheckboxChange}
                className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-300 checked:bg-slate-800 checked:border-slate-800"
                id="check-2"
              />
              <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="1"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </label>
            <label className="cursor-pointer ml-2 text-slate-600 text-sm" htmlFor="check-2">
              자동 로그인
            </label>
          </div>

          <div className="mt-2">
            <button
              type="submit"
              className={`flex w-full justify-center rounded-md px-3 py-4 text-xl font-semibold
                            text-white shadow-xs hover: focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600
                            ${userId && password ? 'bg-blue-500' : 'bg-gray-300'}`}
              disabled={!userId || !password}
            >
              {STRINGS.login}
            </button>
          </div>
        </form>
      </div>

      {dialogMessage && (
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-5 rounded-lg text-center">
            <h3 className="text-2xl">{STRINGS.notification}</h3>
            <p className="text-lg mt-5">{dialogMessage}</p>
            <button
              className="w-full h-12 mt-5 bg-blue-500 text-white rounded-lg"
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
