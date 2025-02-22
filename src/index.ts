import  { ClimateHashBot } from "./lib/bot.js";
import { bskyService } from "./lib/config.js";

const bot = new ClimateHashBot(bskyService);
bot.listenForMentions(); // Start listening for mentions instead of firehose
