import express from "express";

import {
  getGame,
  createGame,
  removeGame,
  gameExists,
  validCode,
  assignRoles,
  changeStatus,
  completeTask,
  castVote
} from "../controllers/games";

export const gamesRouter = express.Router();

gamesRouter.get("/getGame", getGame);
gamesRouter.post("/createGame", createGame);
gamesRouter.delete("/removeGame", removeGame);
gamesRouter.get("/gameExists", gameExists);
gamesRouter.get("/validCode", validCode);
gamesRouter.put("/assignRoles", assignRoles);
gamesRouter.put("/changeStatus", changeStatus);
gamesRouter.put("/completeTask", completeTask);
gamesRouter.post("/castVote", castVote);
