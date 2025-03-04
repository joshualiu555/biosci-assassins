import React, { useState } from "react";
import usePlayerStore from "../zustand/playerStore.ts";
import useGameStore from "../zustand/gameStore.ts";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import socket from "../socket-io.ts";

function Home() {
  const [nameInput, setNameInput] = useState("");
  const [gameCodeInput, setGameCodeInput] = useState("");
  const [numberAssassins, setNumberAssassins] = useState(0);
  const [numberTasks, setNumberTasks] = useState(0);
  const [timeBetweenTasks, setTimeBetweenTasks] = useState(0);
  const [townhallTime, setTownhallTime] = useState(0);
  const [numberLocations, setNumberLocations] = useState(0);
  const [locationInputs, setLocationInputs] = useState<string[]>([]);

  const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setNameInput(e.target.value);
  const handleGameCodeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setGameCodeInput(e.target.value);
  const handleAssassinsChange = (e: React.ChangeEvent<HTMLInputElement>) => setNumberAssassins(Number(e.target.value));
  const handleTasksChange = (e: React.ChangeEvent<HTMLInputElement>) => setNumberTasks(Number(e.target.value));
  const handleTimeBetweenTasksChange = (e: React.ChangeEvent<HTMLInputElement>) => setTimeBetweenTasks(Number(e.target.value));
  const handleTownhallTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => setTownhallTime(Number(e.target.value));
  const handleLocationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumberLocations = Number(e.target.value);
    setNumberLocations(newNumberLocations);
    if (newNumberLocations > numberLocations) {
      for (let i = 0; i < newNumberLocations - numberLocations; i++) {
        locationInputs.push("");
      }
    } else {
      locationInputs.length = newNumberLocations;
    }
  };
  const handleLocationsInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedLocationInputs = [...locationInputs];
    updatedLocationInputs[index] = e.target.value;
    setLocationInputs(updatedLocationInputs);
  }

  const { setPlayerName } = usePlayerStore();
  const { setGameCode } = useGameStore();

  const navigate = useNavigate();

  const handleJoinGame = async (gameCode: string, position: string) => {
    if (nameInput === "") {
      alert("Name cannot be empty");
      return;
    }
    const playerExists = await axios.get("http://localhost:3000/players/checkPlayerExists", {
      params: {
        gameCode: gameCode,
        playerName: nameInput
      }
    });
    if (playerExists.data.result === true) {
      alert("Name already exists")
      return;
    }

    const gameExists = await axios.get("http://localhost:3000/games/validCode", {
      params: {
        gameCode: gameCode
      }
    });
    if (gameExists.data.result === "Valid code") {
      const player = {
        // id will be generated on the backend
        playerID: "",
        name: nameInput,
        position: position,
        role: "unassigned",
        status: "alive"
      };

      const response = await axios.post("http://localhost:3000/players/addPlayer",
        {
          gameCode: gameCode,
          player: player
        },
        {
          withCredentials: true
        }
      )

      // TODO - Use persist or use socket connection and disconnection
      setPlayerName(nameInput);
      setGameCode(gameCode);

      socket.emit("addPlayer", {
        gameCode: gameCode,
        player: response.data.player
      })

      navigate("/lobby");
    } else {
      alert("Game not found / Already started")
    }
  };

  const handleCreateGame = async () => {
    if (numberLocations < 1) {
      alert("Must have at least 1 location");
      return;
    }

    for (const location of locationInputs) {
      if (location === "") {
        alert("Locations cannot be empty");
        return;
      }
    }

    let generatedGameCode;
    let isDuplicate = true;
    while (isDuplicate) {
      generatedGameCode = Math.floor(1000 + Math.random() * 9000).toString();
      const response = await axios.get("http://localhost:3000/games/gameExists", {
        params: {
          gameCode: generatedGameCode
        }
      });
      isDuplicate = response.data.result === true;
    }

    const game = {
      gameCode: generatedGameCode,
      status: "waiting",
      players: [],
      locations: locationInputs,
      numberAssassins: numberAssassins,
      numberTasks: numberTasks,
      timeBetweenTasks: timeBetweenTasks,
      townhallTime: townhallTime,
      tasksRemaining: numberTasks
    };
    await axios.post("http://localhost:3000/games/createGame", game);

    await handleJoinGame(generatedGameCode as string, "non-admin");
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
        inputMode="numeric"
        value={gameCodeInput}
        onChange={handleGameCodeInputChange}
        placeholder="Enter code"
      />

      <button onClick={() => handleJoinGame(gameCodeInput, "admin")}>
        Join Game
      </button>

      <p>Number of Assassins:</p>
      <input
        type="text"
        inputMode="numeric"
        value={numberAssassins}
        onChange={handleAssassinsChange}
      />

      <p>Number of Tasks:</p>
      <input
        type="text"
        inputMode="numeric"
        value={numberTasks}
        onChange={handleTasksChange}
      />

      <p>Time Between Tasks: {timeBetweenTasks} minutes</p>
      <input
        type="text"
        inputMode="numeric"
        value={timeBetweenTasks}
        onChange={handleTimeBetweenTasksChange}
      />

      <p>Townhall Time: {townhallTime} minutes</p>
      <input
        type="text"
        inputMode="numeric"
        value={townhallTime}
        onChange={handleTownhallTimeChange}
      />

      <p>Number Locations: {numberLocations}</p>
      <input
        type="text"
        inputMode="numeric"
        value={numberLocations}
        onChange={handleLocationsChange}
      />

      {locationInputs.map((input, index) => (
        <div key={index}>
          <input
            type="text"
            value={input}
            onChange={(e) => handleLocationsInputChange(index, e)}
            placeholder={`Location ${index + 1}`}
          />
        </div>
      ))}

      <button onClick={handleCreateGame}>
        Create Game
      </button>
    </div>
  );
}

export default Home;
