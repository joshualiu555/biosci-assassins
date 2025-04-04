import { useState, useEffect } from "react";
import useGameStore from "../zustand/gameStore.ts";

const Task = () => {
  const [task, setTask] = useState("");
  const [location, setLocation] = useState("");

  const { locations } = useGameStore();

  useEffect(() => {
    const generateRandomTask = () => {
      const taskList = [
        "5 pushups",
        "20 jumping jacks",
        "10 squats",
        "10 easy count lunges",
        "15 second plank",
        "20 easy count mountain climbers",
        "3 burpees"
      ];

      const randomTask = taskList[Math.floor(Math.random() * taskList.length)];
      const randomLocation = locations[Math.floor(Math.random() * locations.length)];
      setTask(randomTask);
      setLocation(randomLocation);
    };

    generateRandomTask();
  }, []);

  return (
    <div>
      <p>{location}</p>
      <p>{task}</p>
    </div>
  );
};

export default Task;
