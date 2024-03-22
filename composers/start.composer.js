const {Composer, Markup} = require('telegraf')
const UserController = require('../controller/user.controller')
const composer = new Composer()

composer.start(async (ctx) => {
  try {
    const name = `${ctx.from.first_name}${ctx.from.last_name ? ` ${ctx.from.last_name}` : ''}`
    let user = await UserController.getOne(Number(ctx.from.id))
    if (!user) {
      user = await UserController.create({name, id: ctx.from.id})
    }

    if (!user.categories.length) {
      const text = `Привет ${name}.\nЯ помогаю фрилансерам быстро получать заказы.\nНастройте меня чтобы получать заказы каждую минуту.`
      return await ctx.reply(text, Markup.inlineKeyboard([
        [Markup.button.callback('Начать настройку', 'categories')],
      ]))
    }

    if (!Number.isInteger(user.timezone) || !user.schedule) {
      return await ctx.reply(
        `Настройте время по которому я буду отправлять вам заказы.`,
        Markup.inlineKeyboard([
          [Markup.button.callback('Настроить время', 'time')],
        ])
      )
    }

    await ctx.reply(`Настройки:`, Markup.inlineKeyboard([
      [Markup.button.callback(`Категории ${user.categories.length ? '✅' : ''}`, 'categories')],
      [Markup.button.callback(`Время ${Number.isInteger(user.timezone) && user.schedule ? '✅' : ''}`, 'time')]
    ]))
  }
  catch (e) {
    console.error(`error at start.command: ${e.message}`)
    await ctx.reply('Что-то пошло не так попробуйте перезапустить - /start')
  }
});

composer.action('done_cat', async (ctx) => {
  try {
    const user = await UserController.getOne(+ctx.from.id)
    if (!user) {
      return await ctx.reply('Пользователь не найден, чтобы начать нажмите на /start')
    }
    if (!Number.isInteger(user.timezone) || !user.schedule) {
      return await ctx.telegram.editMessageText(
        ctx.callbackQuery.message.chat.id,
        ctx.callbackQuery.message.message_id,
        null,
        `Теперь настройте время по которому я буду отправлять вам заказы.`,
        Markup.inlineKeyboard([
          [Markup.button.callback('Настроить время', 'time')],
        ])
      )
    }

    await ctx.telegram.editMessageText(
      ctx.callbackQuery.message.chat.id,
      ctx.callbackQuery.message.message_id,
      null,
      `Настройки:`, Markup.inlineKeyboard([
      [Markup.button.callback(`Категории ${user.categories.length ? '✅' : ''}`, 'categories')],
      [Markup.button.callback(`Время ${Number.isInteger(user.timezone) && user.schedule ? '✅' : ''}`, 'time')]
    ]))
  } catch (e) {
    console.error(`error at done_cat.action: ${e.message}`)
    await ctx.reply('Что-то пошло не так попробуйте перезапустить - /start')
  }
})

composer.action('done_time', async (ctx) => {
  try {
    await ctx.telegram.editMessageText(
      ctx.callbackQuery.message.chat.id,
      ctx.callbackQuery.message.message_id,
      null,
      `Вы настроили бота!\nДля получение заказов нажмите на /go.\nДля остановки нажмите на /stop.\nДля настройки нажмите на /start.\nПодробнее: /help.`,
    )
  } catch (e) {
    console.error(`error at done_time.action: ${e.message}`)
    await ctx.reply('Что-то пошло не так попробуйте перезапустить - /start')
  }
})

composer.command('delete', async (ctx) => {
  try {
    await UserController.deleteUser(Number(ctx.from.id))
      .then(() => ctx.reply('Пользователь был успешно удален!'))
  }
  catch (e) {
    console.error(`error at delete.command: ${e.message}`)
    await ctx.reply('Что-то пошло не так попробуйте перезапустить - /start')
  }
})

module.exports = composer
