import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from "react";
import "./App.css";
import Header from "./components/Header/Header";
import { AuthContextProvider } from "./context/auth.context";

import WelcomeModal from "./components/Modals/WelcomeModal";
import Loading from "./components/Utils/Loading";

const TownGrid = lazy(() => import("./Pages/Town/TownComponent"));
const Marketplace = lazy(() => import("./Pages/Marketplace/Marketplace"));
const MyAssets = lazy(() => import("./Pages/MyAssets/MyAssets"));
const Editor = lazy(() => import("./Pages/Editor/Editor"));
const About = lazy(() => import("./Pages/About/About"));

function App() {
  return (
    <div className="app">
      <AuthContextProvider>
          <BrowserRouter>
            <Header />
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<Navigate replace to="/town" />} />
                <Route path="/town" element={<TownGrid />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/my-assets" element={<MyAssets />} />
                <Route path="/editor" element={<Editor />} />
                <Route path="/about" element={<About />} />
              </Routes>
            </Suspense>
            <WelcomeModal />
          </BrowserRouter>
      </AuthContextProvider>
    </div>
  );
}

export default App;
