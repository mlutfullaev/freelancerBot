require('dotenv').config()
const {Telegraf, Markup} = require('telegraf');
const mongoose = require("mongoose");
const posting = require('./utils/scrapping');
const bot = new Telegraf("6382734800:AAEewotpAHg7vJtzMZ_Q6XEVCIF6WvBLXgo");

const uri = `mongodb+srv://mhoja9494:ftVbU1Gqm7casRq4@cluster0.pirjxhw.mongodb.net/freelancer?retryWrites=true&w=majority`;

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    posting(bot)
    setInterval(() => {
      console.log('interval')
      posting(bot)
    }, 1000 * 20)
  })
  .catch((err) => {
    console.log(err);
  });

bot.use(require('./composers/start.composer'))
bot.use(require('./composers/posting.composer'))
bot.use(require('./composers/time.composer'))
bot.use(require('./composers/categories.composer'))


bot.launch();

