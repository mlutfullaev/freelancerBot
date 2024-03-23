require('dotenv').config()
const {Telegraf, Markup} = require('telegraf');
const mongoose = require("mongoose");
const posting = require('./utils/scrapping');
const bot = new Telegraf(process.env.BOT_TOKEN);

const uri = `mongodb+srv://${process.env.MG_USER}:${process.env.MG_PASS}@cluster0.pirjxhw.mongodb.net/${process.env.MODE}?retryWrites=true&w=majority`;

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    posting(bot)
    setInterval(() => {
      posting(bot)
    }, 1000 * 20)
  })
  .catch((err) => {
    console.log(err);
  });

bot.command('help', async (ctx) => {
  ctx.reply('/start - Чтобы начать или настроить бот.\n/go - Чтобы начать отправку заказов.\n/stop - Чтобы остановить отправку заказов.\n/delete - Чтобы удалить данные о вас.\n\nЧтобы начать отправку вам надо перейти на настройки и указать категории, часовой пояс, расписание. Затем вы можете получать заказы по команде /go\n\n@mlutfullaev - по всем другим вопросам.')
})
bot.action('help', async (ctx) => {
  await ctx.telegram.editMessageText(
    ctx.callbackQuery.message.chat.id,
    ctx.callbackQuery.message.message_id,
    null,
    '/start - Чтобы начать или настроить бот.\n/go - Чтобы начать отправку заказов.\n/stop - Чтобы остановить отправку заказов.\n/help - Для вывода этого списка.\n\nЧтобы начать отправку вам надо перейти на настройки и указать категории, часовой пояс, расписание. Затем вы можете получать заказы по команде /go\n\n@mrfreelance_chat - по всем другим вопросам.'
  )
})

bot.use(require('./composers/start.composer'))
bot.use(require('./composers/admin.composer'))
bot.use(require('./composers/posting.composer'))
bot.use(require('./composers/settings.composer'))

bot.launch();

