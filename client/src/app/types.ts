export interface Player {
  playerID: string,
  name: string,
  position: "admin" | "non-admin",
  role: "unassigned" | "assassin" | "crewmate",
  status: "alive" | "dead"
}
