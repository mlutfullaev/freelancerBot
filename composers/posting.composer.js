const {Composer, Markup} = require('telegraf')

const composer = new Composer();
const UserController = require("../controller/user.controller");

const go = async (ctx) => {
  try {
    const user = await UserController.getOne(+ctx.from.id)
    if (!user) {
      return await ctx.reply('Пользователь не найден, чтобы начать нажмите на /start.')
    }
    if (!user.categories.length) {
      return await ctx.reply('Вы не добавили хотя бы одну категорию, перейдите на Категории.', Markup.inlineKeyboard([
        [Markup.button.callback('Категории', 'categories')]
      ]))
    }
    if (!user.weekdays.length) {
      return await ctx.reply('Вы не добавили хотя бы один день для отправки, перейдите на /start > Дни недели.', Markup.inlineKeyboard([
        [Markup.button.callback('Категории', 'categories')]
      ]))
    }
    if (!Number.isInteger(user.timezone)) {
      return await ctx.reply('Вы не установили часовой пояс, перейдите на Часовой пояс.', Markup.inlineKeyboard([
        [Markup.button.callback('Часовой пояс', 'timezone')]
      ]))
    }
    if (!user.schedule) {
      return await ctx.reply('Вы не установили временной интервал, перейдите на Расписание.', Markup.inlineKeyboard([
        [Markup.button.callback('Расписание', 'schedule')]
      ]))
    }
    if (user.going) {
      return await ctx.reply('Вы уже подписались на отправку заказов! Ждите отправки заказов в указанное время.\nЧтобы остановить отправку нажмите на /stop.')
    } else {
      return await UserController.updateUser({going: !user.going}, ctx.from.id)
        .then(() => {
          ctx.reply('Вы подписались на отправку заказов! Теперь заказы будут приходить в указанное время.\nЧтобы остановить отправку нажмите на /stop.')
        })
    }
  }
  catch (e) {
    console.error(`error at go.command: ${e.message}`)
    await ctx.reply('Что-то пошло не так попробуйте перезапустить - /start')
  }
}

const stop = async (ctx) => {
  try {
    const user = await UserController.getOne(+ctx.from.id)
    if (!user) {
      return await ctx.reply('Пользователь не найден, чтобы начать нажмите на /start')
    }
    if (!user.going) {
      return await ctx.reply('Вы еще не подписались на отправку заказов!\nЧтобы начать отправку нажмите на /go')
    } else {
      return await UserController.updateUser({going: !user.going}, ctx.from.id)
        .then(() => {
          ctx.reply('Вы отменили подписку на отправку заказов!\nЧтобы получать заказы нажмите на /go.')
        })
    }
  }
  catch (e) {
    console.error(`error at stop.command: ${e.message}`)
    await ctx.reply('Что-то пошло не так попробуйте перезапустить - /start')
  }
}

composer.command('go', go)
composer.action('go', async (ctx) => {
  await ctx.answerCbQuery()
  await go(ctx)
})
composer.command('stop', stop)
composer.action('stop', async (ctx) => {
  await ctx.answerCbQuery()
  await stop(ctx)
})

module.exports = composer;
