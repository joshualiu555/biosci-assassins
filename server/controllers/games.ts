import { Request, Response } from "express";
import { GameModel } from "../models/Game";
import { redisClient } from "../index";

const getGame = async (req: Request, res: Response) => {
  const playerID = await redisClient.get(req.cookies["sessionID"]);

  const game = await GameModel.findOne({ "players.playerID": playerID });

  res.json(game);
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

export {
  getGame,
  createGame,
  removeGame,
  gameExists,
  validCode
}
