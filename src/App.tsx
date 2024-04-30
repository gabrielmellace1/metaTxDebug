import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from "react";
import "./App.css";
import Header from "./components/Header/Header";
import { AuthContextProvider } from "./context/auth.context";

import WelcomeModal from "./components/Modals/WelcomeModal";
import Loading from "./components/Utils/Loading";

const TownGrid = lazy(() => import("./components/Town/TownComponent"));
const Marketplace = lazy(() => import("./components/Grids/MarketplaceGrid/Marketplace"));
const MyAssetsGrid = lazy(() => import("./components/Grids/MyAssetsGrid/MyAssetsGrid"));
const Editor = lazy(() => import("./components/Editor/Editor"));
const About = lazy(() => import("./components/About/About"));

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
                <Route path="/my-assets" element={<MyAssetsGrid />} />
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
