import { Request, Response } from "express";
import { GameModel } from "../models/Game";
import { v4 as uuidv4 } from "uuid";
import { redisClient } from "../index";

const addPlayer = async (req: Request, res: Response) => {
  const { gameCode, player } = req.body;

  player.id = uuidv4();

  try {
    const game = await GameModel.findOne({ gameCode: gameCode });
    if (!game) {
      res.json({ error: "Game not found" });
      return;
    }
    game.players.push(player);
    await game.save();

    const sessionID = uuidv4();
    res.cookie("sessionID", sessionID, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: "strict",
      // TODO - Uncomment in production when you use https
      // secure: true
    });

    await redisClient.set(sessionID, player.id);

    res.json({ message: "Successfully added player" });
  } catch (error) {
    res.json(error);
  }
}

const removePlayer = async (req: Request, res: Response) => {
  const { gameCode } = req.query;
  const playerID = await redisClient.get(req.cookies["sessionID"]);

  const game = await GameModel.findOne({ gameCode: gameCode });
  if (!game) {
    res.json({ error: "Game not found" });
    return;
  }

  if (game.players.length === 1) {
    // remove game
  } else {
    const searchPlayer = game.players.find(player => player.id === playerID);
    if (!searchPlayer) {
      res.json({ error: "Player not found" });
      return;
    }
    if (searchPlayer.position === "admin") {
      // turn the next player into admin
    }
  }

  game.players.pull({ id: playerID });
  await game.save();
  await redisClient.del(req.cookies["sessionID"]);
  res.clearCookie("sessionID");

  res.end();
}

const checkPlayerExists = async (req: Request, res: Response) => {
  const { gameCode, playerName } = req.query;

  const game = await GameModel.findOne({ gameCode: gameCode });
  if (!game) {
    res.json({ error: "Game not found" });
    return;
  }

  const searchPlayer = game.players.find(player => player.name === playerName);
  if (searchPlayer) {
    res.json({ result: true });
  } else {
    res.json({ result: false });
  }
}

export {
  addPlayer,
  removePlayer,
  checkPlayerExists
}
