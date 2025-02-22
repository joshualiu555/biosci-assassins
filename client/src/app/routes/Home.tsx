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

  const handleJoinGame = async () => {
    // TODO - Check player name input isn't empty
    // TODO - Check for player name duplicates
    // check if the game code exists and the game is "waiting"
    const response = await axios.get(`http://localhost:3000/games/validCode?gameCode=${gameCodeInput}`);
    if (response.data.result === "Valid code") {
      // TODO - Move duplicated code into a function
      // if it is:
      // create a session id in a cookie, store session id in redis
      const player = {
        // id will be generated on the backend
        id: "",
        name: nameInput,
        position: "admin",
        role: "unassigned",
        status: "alive"
      };

      // add session id to a cookie and store session id - player id in redis
      await axios.post("http://localhost:3000/players/addPlayer",
        {
          gameCode: gameCodeInput,
          player: player
        },
        {
          withCredentials: true
        }
      )

      socket.emit("addPlayer", {
        gameCode: gameCodeInput,
        player: player
      })

      // TODO - Use persist
      // store player name and game code in zustand
      setPlayerName(nameInput);
      setGameCode(gameCodeInput);

      navigate("/lobby");
    } else {
      // otherwise:
      // alert
      alert("Game not found / Already started")
    }
  };

  const handleCreateGame = async () => {
    // TODO - Check player name input isn't empty
    // TODO - Check for game code duplicates
    try {
      const generatedGameCode = Math.floor(1000 + Math.random() * 9000).toString();
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

      const player = {
        // id will be generated on the backend
        id: "",
        name: nameInput,
        position: "admin",
        role: "unassigned",
        status: "alive"
      };

      // add session id to a cookie and store session id - player id in redis
      await axios.post("http://localhost:3000/players/addPlayer",
        {
          gameCode: generatedGameCode,
          player: player
        },
        {
          withCredentials: true
        }
      )

      socket.emit("addPlayer", {
        gameCode: generatedGameCode,
        player: player
      })

      // TODO - Use persist
      setPlayerName(nameInput);
      setGameCode(generatedGameCode);

      navigate("/lobby");
    } catch (error) {
      console.log(error);
    }
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

export default Home;
