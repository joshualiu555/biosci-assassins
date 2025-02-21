import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

const envPath = path.resolve(__dirname, "../../.env");
dotenv.config( { path: envPath } );

const app = express();
app.use(express.json());
app.use(cors());

app.listen(process.env.PORT, () => console.log("Server started"));

mongoose
  .connect(process.env.MONGODB_URL as string)
  .then(() => {
    console.log("Connected to database");
  })
  .catch((error) => {
    console.log(error);
  });
