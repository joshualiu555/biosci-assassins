import React, { useState } from "react";
import usePlayerStore from "./zustand/playerStore.ts";
import useGameStore from "./zustand/gameStore.ts";
import axios from "axios";

function App() {
  const [nameInput, setNameInput] = useState('');
  const [gameCodeInput, setGameCodeInput] = useState('');
  const [numberAssassins, setNumberAssassins] = useState(1);
  const [numberTasks, setNumberTasks] = useState(5);
  const [timeBetweenTasks, setTimeBetweenTasks] = useState(1);
  const [townhallTime, setTownhallTime] = useState(1);

  const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setNameInput(e.target.value);
  const handleGameCodeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setGameCodeInput(e.target.value);
  const handleAssassinsChange = (e: React.ChangeEvent<HTMLInputElement>) => setNumberAssassins(Number(e.target.value));
  const handleTasksChange = (e: React.ChangeEvent<HTMLInputElement>) => setNumberTasks(Number(e.target.value));
  const handleTimeBetweenTasksChange = (e: React.ChangeEvent<HTMLInputElement>) => setTimeBetweenTasks(Number(e.target.value));
  const handleTownhallTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => setTownhallTime(Number(e.target.value));

  const { setPlayerName } = usePlayerStore();
  const { setGameCode } = useGameStore();

  const handleJoinGame = () => {
    // TODO - Check player name input isn't empty
    // TODO - Check for player name duplicates
    // check if the game code exists and the game is "waiting"
    // if it is:
    // create a session id in a cookie, store session id in redis
    // store player name and game code in zustand
    // otherwise:
    // alert
  }

  const handleCreateGame = async () => {
    // TODO - Check player name input isn't empty
    // TODO - Check for game code duplicates
    // generate a code
    const generatedGameCode = Math.floor(1000 + Math.random() * 9000).toString();
    // create the game and add player
    const game = {
      code: generatedGameCode,
      status: "waiting",
      players: [],
      numberAssassins: numberAssassins,
      numberTasks: numberTasks,
      timeBetweenTasks: timeBetweenTasks,
      townhallTime: townhallTime,
      tasksRemaining: numberTasks
    }
    await axios.post("http://localhost:3000/games/createGame", game);
    // create a session id in a cookie, store session id in redis

    // store player name and game code in zustand
    setPlayerName(nameInput);
    setGameCode(generatedGameCode);
  }

  return (
    <div>
      <p>Name:</p>
      <input
        type="text"
        value={nameInput}
        onChange={handleNameInputChange}
        placeholder="Enter name"
      />

      <p>Code:</p>
      <input
        type="text"
        value={gameCodeInput}
        onChange={handleGameCodeInputChange}
        placeholder="Enter code"
      />

      <button onClick={handleJoinGame}>
        Join Game
      </button>

      <p>Number of Assassins:</p>
      <input
        type="number"
        value={numberAssassins}
        onChange={handleAssassinsChange}
        min="1"
        max="5"
      />

      <p>Number of Tasks:</p>
      <input
        type="number"
        value={numberTasks}
        onChange={handleTasksChange}
        min="5"
        max="100"
        step="5"
      />

      <p>Time Between Tasks: {timeBetweenTasks} minutes</p>
      <input
        type="number"
        value={timeBetweenTasks}
        onChange={handleTimeBetweenTasksChange}
        min="1"
        max="5"
      />

      <p>Townhall Time: {townhallTime} minutes</p>
      <input
        type="number"
        value={townhallTime}
        onChange={handleTownhallTimeChange}
        min="1"
        max="5"
      />

      <button onClick={handleCreateGame}>
        Create Game
      </button>
    </div>
  );
}

export default App;