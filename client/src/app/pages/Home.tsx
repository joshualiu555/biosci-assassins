import React, { useState } from "react";
import usePlayerStore from "../zustand/playerStore.ts";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import socket from "../socket-io.ts";
import "../../styles/Home.css";
import RoundtableLogo from "../../assets/RoundtableLogo.png";

function Home() {
  const [nameInput, setNameInput] = useState("");
  const [gameCodeInput, setGameCodeInput] = useState("");
  const [numberAssassins, setNumberAssassins] = useState(0);
  const [ejectionConfirmation, setEjectionConfirmation] = useState(false);
  const [numberTasks, setNumberTasks] = useState(0);
  const [numberLocations, setNumberLocations] = useState(0);
  const [locationInputs, setLocationInputs] = useState<string[]>([]);

  const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setNameInput(e.target.value);
  const handleGameCodeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setGameCodeInput(e.target.value);
  const handleAssassinsChange = (e: React.ChangeEvent<HTMLInputElement>) => setNumberAssassins(Number(e.target.value));
  const handleEjectionConfirmationChange = () => setEjectionConfirmation(!ejectionConfirmation);
  const handleTasksChange = (e: React.ChangeEvent<HTMLInputElement>) => setNumberTasks(Number(e.target.value));
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

  const { setPlayerState } = usePlayerStore();

  const navigate = useNavigate();

  const handleJoinGame = async (gameCode: string, playerPosition: string) => {
    if (nameInput === "") {
      alert("Name cannot be empty");
      return;
    }
    const playerExists = await axios.get("https://biosci-assassins-f380214977c5.herokuapp.com/checkPlayerExists", {
      params: {
        gameCode: gameCode,
        playerName: nameInput
      }
    });
    if (playerExists.data.result === true) {
      alert("Name already exists")
      return;
    }

    const gameExists = await axios.get("https://biosci-assassins-f380214977c5.herokuapp.com/games/validCode", {
      params: {
        gameCode: gameCode
      }
    });
    if (gameExists.data.result === "Valid code") {
      const player = {
        // id will be generated on the backend
        playerID: "",
        name: nameInput,
        position: playerPosition,
        role: "crewmate",
        status: "alive",
        vote: ""
      };

      const response = await axios.post("https://biosci-assassins-f380214977c5.herokuapp.com/players/addPlayer",
        {
          gameCode: gameCode,
          player: player
        },
        {
          withCredentials: true
        }
      )

      setPlayerState({
        playerID: response.data.playerID,
        name: response.data.name,
      });

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

    if (numberAssassins < 1) {
      alert("Must have at least 1 assassin");
      return;
    }
    if (numberTasks < 1) {
      alert("Must have at least 1 task");
      return;
    }

    let generatedGameCode;
    let isDuplicate = true;
    while (isDuplicate) {
      generatedGameCode = Math.floor(1000 + Math.random() * 9000).toString();
      const response = await axios.get("https://biosci-assassins-f380214977c5.herokuapp.com/games/gameExists", {
        params: {
          gameCode: generatedGameCode
        }
      });
      isDuplicate = response.data.result === true;
    }

    const game = {
      gameCode: generatedGameCode,
      status: "lobby",
      players: [],
      locations: locationInputs,
      numberAssassins: numberAssassins,
      ejectionConfirmation: ejectionConfirmation,
      numberTasks: numberTasks,
      tasksRemaining: numberTasks
    };
    await axios.post("https://biosci-assassins-f380214977c5.herokuapp.com/games/createGame", game);

    await handleJoinGame(generatedGameCode as string, "admin");
  };

  return (
    <div className="homeContainer">
      <h1>Roundtable Bio-Sci Assassins</h1>

      <img src={RoundtableLogo} alt="Roundtable Logo"/>

      <h3>Name:</h3>
      <input
        type="text"
        value={nameInput}
        onChange={handleNameInputChange}
        placeholder="Enter name"
      />

      <h3>Code:</h3>
      <input
        type="text"
        inputMode="numeric"
        value={gameCodeInput}
        onChange={handleGameCodeInputChange}
        placeholder="Enter code"
      />

      <br/>

      <button onClick={() => handleJoinGame(gameCodeInput, "non-admin")}>
        Join Game
      </button>

      <h3>Number of Assassins:</h3>
      <input
        type="text"
        inputMode="numeric"
        value={numberAssassins}
        onChange={handleAssassinsChange}
      />

      <h3>
        <input
          type="checkbox"
          checked={ejectionConfirmation}
          onChange={handleEjectionConfirmationChange}
        />
        Ejection Confirmation
      </h3>

      <h3>Number of Tasks:</h3>
      <input
        type="text"
        inputMode="numeric"
        value={numberTasks}
        onChange={handleTasksChange}
      />

      <h3>Number Locations: {numberLocations}</h3>
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

      <br/>

      <button onClick={handleCreateGame}>
        Create Game
      </button>
    </div>
  );
}

export default Home;
