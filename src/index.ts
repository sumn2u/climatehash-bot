import express from "express";
import { ClimateHashBot } from "./lib/bot.js";
import { bskyService } from "./lib/config.js";

// Initialize bot
const bot = new ClimateHashBot(bskyService);
bot.listenForMentions(); // Start listening for mentions

// Create a basic Express server
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("ClimateHashBot is running!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
