import React, { useState } from "react";

function App() {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [numberAssassins, setNumberAssassins] = useState(1);
  const [numberTasks, setNumberTasks] = useState(5);
  const [timeBetweenTasks, setTimeBetweenTasks] = useState(1);
  const [townhallTime, setTownhallTime] = useState(1);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value);
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value);
  const handleAssassinsChange = (e: React.ChangeEvent<HTMLInputElement>) => setNumberAssassins(Number(e.target.value));
  const handleTasksChange = (e: React.ChangeEvent<HTMLInputElement>) => setNumberTasks(Number(e.target.value));
  const handleTimeBetweenTasksChange = (e: React.ChangeEvent<HTMLInputElement>) => setTimeBetweenTasks(Number(e.target.value));
  const handleTownhallTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => setTownhallTime(Number(e.target.value));

  const handleJoinGame = () => {

  }
  const handleCreateGame = () => {

  }

  return (
    <div>
      <p>
        Name:
      </p>
      <input
        type="text"
        value={name}
        onChange={handleNameChange}
        placeholder="Enter name"
      />

      <p>
        Code:
      </p>
      <input
        type="text"
        value={code}
        onChange={handleCodeChange}
        placeholder="Enter code"
      />

      <button onClick={handleJoinGame}>
        Join Game
      </button>

      <p>
        Number of Assassins:
      </p>
      <input
        type="number"
        value={numberAssassins}
        onChange={handleAssassinsChange}
        min="1"
        max="5"
      />

      <p>
        Number of Tasks:
      </p>
      <input
        type="number"
        value={numberTasks}
        onChange={handleTasksChange}
        min="5"
        max="100"
        step="5"
      />

      <p>
        Time Between Tasks: {timeBetweenTasks} minutes
      </p>
      <input
        type="number"
        value={timeBetweenTasks}
        onChange={handleTimeBetweenTasksChange}
        min="1"
        max="5"
      />

      <p>
        Townhall Time: {townhallTime} minutes
      </p>
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
