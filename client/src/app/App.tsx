import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./routes/Home";
import Lobby from "./routes/Lobby";

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