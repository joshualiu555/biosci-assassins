import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Lobby from "./pages/Lobby";

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;