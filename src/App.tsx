import { BrowserRouter } from 'react-router-dom';

import './App.css';
import Header from './components/Header/Header';
import { AuthContextProvider } from './context/auth.context';



function App() {
  return (
    <div className="app">
      <AuthContextProvider>
          <BrowserRouter>
              <Header />
          </BrowserRouter>

      </AuthContextProvider>
    </div>
  );
}

export default App;
