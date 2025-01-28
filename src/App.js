import logo from './logo.svg';
import './App.css';
import 'tailwindcss/tailwind.css';

function App() {
  return (
    <div className="App">
      <header className="bg-blue-500 text-white p-4">
        <img src={logo} className="App-logo h-16 w-16" alt="logo" />
        <p className="text-xl">
          Hello Loan Book
        </p>
        <a
          className="text-blue-200 hover:text-white"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
