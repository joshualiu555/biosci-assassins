import { Request, Response } from "express";
import { GameModel } from "../models/Game";
import { v4 as uuidv4 } from "uuid";
import { redisClient } from "../index";
import { removeGame } from "./games";

const getPlayer = async (req: Request, res: Response) => {
  try {
    const playerID = await redisClient.get(req.cookies["sessionID"]);
    const game = await GameModel.findOne({ "players.playerID": playerID });
    if (!game) {
      res.json({ error: "Game not found" });
      return;
    }
    const player = game.players.find(searchPlayer => searchPlayer.playerID === playerID);
    res.json({ player: player });
  } catch (error) {
    res.json(error);
  }
}

const addPlayer = async (req: Request, res: Response) => {
  const { gameCode, player } = req.body;

  player.playerID = uuidv4();

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

    await redisClient.set(sessionID, player.playerID);

    res.json({ player: player });
  } catch (error) {
    res.json({ error: "Failed to add player" });
  }
}

const removePlayer = async (req: Request, res: Response) => {
  try {
    const playerID = await redisClient.get(req.cookies["sessionID"]);
    const game = await GameModel.findOne({ "players.playerID": playerID });
    if (!game) {
      res.json({ error: "Game not found" });
      return;
    }
    const gameCode = game.gameCode;

    game.players.pull({ playerID: playerID });
    await game.save();

    const updatedGame = await GameModel.findOne({ gameCode: gameCode });
    if (!updatedGame) {
      res.json({ error: "Game not found" });
      return;
    }

    const index = updatedGame.players.findIndex(player => player.position === "admin");
    const switchAdmin = index === -1;
    if (updatedGame.players.length === 0) {
      await removeGame(updatedGame.gameCode as string);
    } else if (switchAdmin) {
      updatedGame.players[0].position = "admin";
      await updatedGame.save();
    }

    await redisClient.del(req.cookies["sessionID"]);
    res.clearCookie("sessionID");
    res.json({ switchAdmin: switchAdmin, updatedPlayers: updatedGame.players });
  } catch (error) {
    res.json(error);
  }
}

const removeRedisAndCookie = async (req: Request, res: Response) => {
  await redisClient.del(req.cookies["sessionID"]);
  res.clearCookie("sessionID");

  res.json();
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

const markDead = async (req: Request, res: Response) => {
  const { gameCode, playerID } = req.body;

  const game = await GameModel.findOne({ gameCode: gameCode });
  if (!game) {
    res.json({ error: "Game not found" });
    return;
  }
  const player = game.players.find(searchPlayer => searchPlayer.playerID === playerID);
  if (!player) {
    res.json({ error: "Player not found" });
    return;
  }

  player.status = "dead";
  await game.save();

  let assassinsLeft = 0, crewmatesLeft = 0;
  for (const player of game.players) {
    if (player.status === "alive") {
      if (player.role === "assassin") assassinsLeft++;
      else crewmatesLeft++;
    }
  }

  if (assassinsLeft === 0 || assassinsLeft >= crewmatesLeft) {
    await removeGame(gameCode);
    res.json({
      result: assassinsLeft === 0 ? "Crewmates win" : "Assassins win",
      players: game.players
    });
  } else {
    res.json({
      result: "Continue",
      players: game.players
    });
  }
}

const castVote = async (req: Request, res: Response) => {
  const { vote } = req.body;

  const playerID = await redisClient.get(req.cookies["sessionID"]);
  const game = await GameModel.findOne({ "players.playerID": playerID });
  if (!game) {
    res.json({ error: "Game not found" });
    return;
  }

  const player = game.players.find((searchPlayer) => searchPlayer.playerID === playerID);
  if (!player) {
    res.json({ error: "Player not found" });
    return;
  }

  player.vote = vote;
  await game.save();

  const updatedGame = await GameModel.findOne({ "players.playerID": playerID });
  if (!updatedGame) {
    res.json({ error: "Game not found" });
    return;
  }

  let allVoted = true;
  for (const player of updatedGame.players) {
    if (player.vote === "") {
      allVoted = false;
      break;
    }
  }

  if (!allVoted) {
    res.json({ allVoted: false, isAssassin: null, voteOut: null, players: updatedGame.players });
    return;
  }

  let votes = new Map();
  if (allVoted) {
    for (const player of updatedGame.players) {
      votes.set(player.vote, (votes.get(player.id) || 0) + 1);
    }
  }

  for (const [key, value] of votes) {
    if (value > updatedGame.players.length / 2) {
      const player = updatedGame.players.find(searchPlayer => searchPlayer.playerID === key);
      if (!player) {
        res.json("Player not found");
        return;
      }
      res.json({ allVoted: true, isAssassin: player.role === "assassin", voteOut: player, players: updatedGame.players });
      return;
    }
  }

  res.json({ allVoted: true, isAssassin: null, voteOut: null, players: updatedGame.players });
}

export {
  getPlayer,
  addPlayer,
  removePlayer,
  removeRedisAndCookie,
  checkPlayerExists,
  markDead,
  castVote
}
