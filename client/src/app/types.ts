export interface Player {
  playerID: string,
  name: string,
  position: "admin" | "non-admin",
  role: "unassigned" | "assassin" | "crewmate",
  status: "alive" | "dead"
}

export interface Game {
  gameCode: string;
  status: "waiting" | "playing" | "townhall" | "finished";
  players: Player[];
  locations: string[],
  numberAssassins: number;
  numberTasks: number;
  timeBetweenTasks: number;
  townhallTime: number;
  tasksRemaining: number;
}
