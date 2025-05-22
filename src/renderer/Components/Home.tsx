import { useState } from 'react';

// import electronLogo from '@Assets/electron.png';
// import reactLogo from '@Assets/react.svg';
// import viteLogo from '@Assets/vite.svg';
import './Home.scss';
import './Api';

function Home() {
  const [state, setState] = useState(0);

  return (
    <div>
      <header className="App-Header">
      </header>
      <section className="Content">
        <h1>Welcome to</h1>
        <h2>Vite Electron React Boilerplate!</h2>
        <div className="state">
          <button type="button" className="btn" onClick={() => setState((count) => count + 1)}>
            Count is {state}
          </button>
          <p>
            Edit <code>src/renderer/App.tsx</code> and save to test HMR🔥
          </p>
        </div>
        <div className="Link">
          <a
            href="https://github.com/stackoutput-com/vite-electron-react-boilerplate#readme"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button type="button" className="White-Button">
              📖 Read our docs
            </button>
          </a>
          <a href="https://www.buymeacoffee.com/ajaykanniyappan" target="_blank" rel="noreferrer">
            {/*<button type="button" className="Bmc-Button">*/}
            {/*  <img className="Bmc-Logo" src={bmc} alt="Buy me a coffee" /> Buy me a coffee*/}
            {/*</button>*/}
          </a>
        </div>
      </section>
    </div>
  );
}

export default Home;
