import { Request, Response } from "express";
import { GameModel } from "../models/Game";
import { redisClient } from "../index";

const getGame = async (req: Request, res: Response) => {
  try {
    const playerID = await redisClient.get(req.cookies["sessionID"]);
    const game = await GameModel.findOne({ "players.playerID": playerID });
    res.json(game);
  } catch (error) {
    res.json(error);
  }
}

const createGame = async (req: Request, res: Response) => {
  const game = new GameModel(req.body);

  const response = await game.save();
  res.json(response);
}

const removeGame = async (gameCode: string) => {
  await GameModel.deleteOne({ gameCode: gameCode });
}

const gameExists = async (req: Request, res: Response) => {
  const { gameCode } = req.query;
  const game = await GameModel.findOne({ gameCode: gameCode });
  if (game) {
    res.json({ result: true });
  } else {
    res.json({ result: false });
  }
}

const validCode = async (req: Request, res: Response) => {
  const { gameCode } = req.query;

  const game = await GameModel.findOne({ gameCode: gameCode });
  if (game && game.status == "waiting") {
    res.json({ result: "Valid code" });
  } else {
    res.json({ result: "Invalid code" });
  }
}

const assignRoles = async (req: Request, res: Response) => {
  const playerID = await redisClient.get(req.cookies["sessionID"]);
  const game = await GameModel.findOne({ "players.playerID": playerID });
  if (!game) {
    res.json({ error: "Game not found" });
    return;
  }

  const { numberAssassins } = req.body;
  let set = new Set<number>();
  while (set.size < numberAssassins) {
    const randomNumber = Math.floor(Math.random() * game.players.length);
    set.add(randomNumber);
  }
  for (const index of set) {
    game.players[index].role = "assassin";
  }
  await game.save();

  res.json({ game: game });
}

export {
  getGame,
  createGame,
  removeGame,
  gameExists,
  validCode,
  assignRoles,
}
