export interface Player {
  playerID: string,
  name: string,
  position: "admin" | "non-admin",
  role: "assassin" | "crewmate",
  status: "alive" | "dead"
}
