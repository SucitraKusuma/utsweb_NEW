import { Routes, Route } from "react-router-dom";

import "antd/dist/reset.css";
import "./assets/styles/main.css";
import "./assets/styles/responsive.css";
import "./assets/styles/adaptive.css";

import LoginPage from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/layout/PrivateRoute";
import Playlist from "./pages/Playlist";
import PlaylistView from "./pages/PlaylistView";
import PlaylistStats from "./pages/PlaylistStats";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route exact path="/" element={<LoginPage />} />
        <Route exact path="/login" element={<LoginPage />} />
        <Route
          exact
          path="/dashboard"
          element={<PrivateRoute component={<Dashboard />} />}
        />
        <Route
          exact
          path="/playlist"
          element={<PrivateRoute component={<Playlist />} />}
        />
        <Route
          exact
          path="/playlist-view"
          element={<PrivateRoute component={<PlaylistView />} />}
        />
        <Route
          exact
          path="/playlist-stats"
          element={<PrivateRoute component={<PlaylistStats />} />}
        />
      </Routes>
    </div>
  );
}

export default App;