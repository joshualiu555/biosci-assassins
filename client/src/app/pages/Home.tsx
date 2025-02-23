import React, { useState } from "react";
import usePlayerStore from "../zustand/playerStore.ts";
import useGameStore from "../zustand/gameStore.ts";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import socket from "../socket-io.ts";

function Home() {
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

  const navigate = useNavigate();

  const handleJoinGame = async (gameCode: string) => {
    if (nameInput === "") {
      alert("Name cannot be empty");
      return;
    }
    const playerExists = await axios.get(`http://localhost:3000/players/checkPlayerExists?gameCode=${gameCode}&playerName=${nameInput}`);// TODO - Check for player name duplicates
    if (playerExists.data.result === true) {
      alert("Name already exists")
      return;
    }

    const gameExists = await axios.get(`http://localhost:3000/games/validCode?gameCode=${gameCode}`);
    if (gameExists.data.result === "Valid code") {
      const player = {
        // id will be generated on the backend
        id: "",
        name: nameInput,
        position: "admin",
        role: "unassigned",
        status: "alive"
      };

      await axios.post("http://localhost:3000/players/addPlayer",
        {
          gameCode: gameCode,
          player: player
        },
        {
          withCredentials: true
        }
      )

      socket.emit("addPlayer", {
        gameCode: gameCode,
        player: player
      })

      // TODO - Use persist or use socket connection and disconnection
      setPlayerName(nameInput);
      setGameCode(gameCode);

      navigate("/lobby");
    } else {
      alert("Game not found / Already started")
    }
  };

  const handleCreateGame = async () => {
    let generatedGameCode;
    let isDuplicate = true;
    while (isDuplicate) {
      generatedGameCode = Math.floor(1000 + Math.random() * 9000).toString();
      const response = await axios.get(`http://localhost:3000/games/gameExists?gameCode=${generatedGameCode}`);
      isDuplicate = response.data.result === true;
    }

    const game = {
      gameCode: generatedGameCode,
      status: "waiting",
      players: [],
      numberAssassins: numberAssassins,
      numberTasks: numberTasks,
      timeBetweenTasks: timeBetweenTasks,
      townhallTime: townhallTime,
      tasksRemaining: numberTasks
    };
    await axios.post("http://localhost:3000/games/createGame", game);

    await handleJoinGame(generatedGameCode as string);
  };

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

      <button onClick={() => handleJoinGame(gameCodeInput)}>
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

export default Home;
