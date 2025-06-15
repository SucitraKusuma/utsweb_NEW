import { Routes, Route } from "react-router-dom";

import "antd/dist/reset.css";
import "./assets/styles/main.css";
import "./assets/styles/responsive.css";
import "./assets/styles/adaptive.css";

import LoginPage from "./pages/Login";

import PrivateRoute from "./components/layout/PrivateRoute";
import AturPlaylist from "./pages/AturPlaylist";
import GaleryPlaylist from "./pages/GaleryPlaylist";
import StatistikPlaylist from "./pages/StatistikPlaylist";
import Beranda from "./pages/Beranda";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route exact path="/" element={<LoginPage />} />
        <Route exact path="/login" element={<LoginPage />} />

        <Route
          exact
          path="/playlist"
          element={<PrivateRoute component={<AturPlaylist />} />}
        />
        <Route
          exact
          path="/playlist-view"
          element={<PrivateRoute component={<GaleryPlaylist />} />}
        />
        <Route
          exact
          path="/playlist-stats"
          element={<PrivateRoute component={<StatistikPlaylist />} />}
        />
        <Route
          exact
          path="/beranda"
          element={<PrivateRoute component={<Beranda />} />}
        />
      </Routes>
    </div>
  );
}

export default App;