import express from "express";

import {
  getGame,
  createGame,
  removeGame,
  gameExists,
  validCode,
  assignRoles
} from "../controllers/games";

export const gamesRouter = express.Router();

gamesRouter.get("/getGame", getGame);
gamesRouter.post("/createGame", createGame);
gamesRouter.delete("/removeGame", removeGame);
gamesRouter.get("/gameExists", gameExists);
gamesRouter.get("/validCode", validCode);
gamesRouter.put("/assignRoles", assignRoles);
