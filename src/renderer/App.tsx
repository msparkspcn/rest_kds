import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Main from '@Components/pages/main/Main';
import Login from '@Components/pages/login/Login';
import Setting from '@Components/pages/setting/Setting';
import Home from '@Components/Home';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        {/*<Route path={"/"} element={<Home />}/>*/}
        <Route path={"/"} element={<Login />}/>
        <Route path={"/setting"} element={<Setting />}/>
        <Route path="/main" element={<Main />} />
      </Routes>
    </Router>
  );
}

export default App;
