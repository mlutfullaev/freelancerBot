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

const helpText = '/start - Чтобы начать или настроить бот.\n/go - Чтобы начать отправку заказов.\n/stop - Чтобы остановить отправку заказов.\n/help - Для вывода этого списка.\n\nЧтобы начать отправку вам надо перейти на настройки и указать категории, часовой пояс, расписание. Затем вы можете получать заказы по команде /go\n\n@mrfreelance_chat - по всем другим вопросам.'

bot.command('help', async (ctx) => {
  ctx.reply(
    helpText,
    Markup.inlineKeyboard([
      Markup.button.callback('Готово', 'done')
    ])
  )
})
bot.action('help', async (ctx) => {
  try {
    await ctx.telegram.editMessageText(
      ctx.callbackQuery.message.chat.id,
      ctx.callbackQuery.message.message_id,
      null,
      helpText,
      Markup.inlineKeyboard([
        Markup.button.callback('Готово', 'done')
      ])
    )
  } catch (e) {
    console.error(`error at delete_msg.action: ${e.message}`)
  }
})
bot.action('delete_msg', async (ctx) => {
  try {
    await ctx.answerCbQuery()
    const info = ctx.update.callback_query.message
    bot.telegram.deleteMessage(info.chat.id, info.message_id - 1)
    bot.telegram.deleteMessage(info.chat.id, info.message_id)
  } catch (e) {
    console.error(`error at delete_msg.action: ${e.message}`)
  }
})

bot.use(require('./composers/start.composer'))
bot.use(require('./composers/admin.composer'))
bot.use(require('./composers/posting.composer'))
bot.use(require('./composers/settings.composer'))

bot.launch();

