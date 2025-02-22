import { Request, Response } from "express";
import { GameModel } from "../models/Game";

const createGame = async (req: Request, res: Response) => {
  const game = new GameModel(req.body);

  try {
    const response = await game.save();
    res.json(response);
  } catch (error) {
    res.json(error);
  }
}

const getPlayers = async (req: Request, res: Response) => {
  const { gameCode } = req.query;

  const game = await GameModel.findOne({ gameCode: gameCode });
  if (!game) {
    res.json({ error: "Game not found" });
    return;
  }

  res.json(game.players);
};

export {
  createGame,
  getPlayers
}
