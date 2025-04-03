import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";
import Finished from "./pages/Finished";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={ <Home /> }
        />
        <Route
          path="/lobby"
          element={ <Lobby /> }
        />
        <Route
          path="/game"
          element={ <Game /> }
        />
        <Route
          path="/finished"
          element={ <Finished />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;