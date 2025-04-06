import { Request, Response } from "express";
import { GameModel } from "../models/Game";
import { redisClient } from "../index";

const getGame = async (req: Request, res: Response) => {
  try {
    const playerID = await redisClient.get(req.cookies["sessionID"]);
    const game = await GameModel.findOne({ "players.playerID": playerID });
    res.json({ game: game });
  } catch (error) {
    res.json(error);
  }
}

const createGame = async (req: Request, res: Response) => {
  const game = new GameModel(req.body);
  await game.save();
  res.json();
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
  if (game && game.status == "lobby") {
    res.json({ result: "Valid code" });
  } else {
    res.json({ result: "Invalid code" });
  }
}

const assignRoles = async (req: Request, res: Response) => {
  const { gameCode, numberAssassins } = req.body;
  const game = await GameModel.findOne({ gameCode: gameCode });
  if (!game) {
    res.json({ error: "Game not found" });
    return;
  }

  let set = new Set<number>();
  while (set.size < numberAssassins) {
    const randomNumber = Math.floor(Math.random() * game.players.length);
    set.add(randomNumber);
  }
  for (const index of set) {
    game.players[index].role = "assassin";
  }
  await game.save();

  res.json({ players: game.players });
}

const changeStatus = async (req: Request, res: Response) => {
  const { gameCode, status } = req.body;
  const game = await GameModel.findOne({ gameCode: gameCode });
  if (!game) {
    res.json({ error: "Game not found" });
    return;
  }

  game.status = status;
  await game.save();
  res.json();
}

const completeTask = async (req: Request, res: Response) => {
  const { gameCode, role } = req.body;
  const game = await GameModel.findOne({ gameCode: gameCode });
  if (!game) {
    res.json({ error: "Game not found" });
    return;
  }

  console.log(role);
  if (role === "crewmate") game.tasksRemaining--;
  await game.save();

  const result = game.tasksRemaining === 0 ? "Crewmates win" : "Continue";
  if (game.tasksRemaining === 0) await removeGame(gameCode);
  res.json({
    result,
    tasksRemaining: game.tasksRemaining,
    players: game.players
  });
}

export {
  getGame,
  createGame,
  removeGame,
  gameExists,
  validCode,
  assignRoles,
  changeStatus,
  completeTask
}
