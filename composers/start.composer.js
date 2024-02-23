const {Composer, Markup} = require('telegraf')
const UserController = require('../controller/user.controller')
const composer = new Composer()

const buttons = (user) => {
  const keyboard = [
    [Markup.button.callback(`Категории ${user.categories.length ? '✅' : ''}`, 'categories')],
    [Markup.button.callback(`Время ${user.timezone && user.schedule ? '✅' : ''}`, 'time')]
  ]
  if (user.timezone && user.schedule && user.categories.length) {
    if (!user.going) {
      keyboard.push([Markup.button.callback(`Начать отправку`, 'go')])
    } else {
      keyboard.push([Markup.button.callback(`Остановить отправку`, 'stop')])
    }
  }
  return keyboard
}

composer.start(async (ctx) => {
  try {
    const user = await UserController.getOne(Number(ctx.from.id))
    const name = `${ctx.from.first_name}${ctx.from.last_name ? ` ${ctx.from.last_name}` : ''}`
    if (!user) {
      await UserController.create({name, id: ctx.from.id})
      const text = `Привет ${ctx.message.from.first_name}, я Mr.Freelance помогаю фрилансерам с заказами, настройте меня для отправки заказов`
      await ctx.reply(text, Markup.inlineKeyboard([
        [Markup.button.callback('Категории', 'categories')],
        [Markup.button.callback('Время', 'time')]
      ]))
      return
    }

    await ctx.reply(`Настройки:`, Markup.inlineKeyboard(buttons(user)))
  }
  catch (e) {
    console.error(`error at start.composer: ${e.message}`)
    await ctx.reply('Что-то пошло не так попробуйте перезапустить', Markup.keyboard([
      ['/start']
    ]).resize().oneTime())
  }
});

composer.action('done', async (ctx) => {
  try {
    const user = await UserController.getOne(+ctx.from.id)
    if (!user) {
      return await ctx.reply('Пользователь не найден, чтобы начать нажмите на /start')
    }
    return await ctx.telegram.editMessageText(
      ctx.callbackQuery.message.chat.id,
      ctx.callbackQuery.message.message_id,
      null,
      `Настройки:`,
      Markup.inlineKeyboard(buttons(user))
    )
  } catch (e) {
    console.error(`error at categories action: ${e.message}`)
    await ctx.reply('Что-то пошло не так попробуйте перезапустить', Markup.keyboard([
      ['/start']
    ]).resize().oneTime())
  }
})

composer.command('delete', async (ctx) => {
  try {
    await UserController.deleteUser(Number(ctx.from.id))
      .then(() => ctx.reply('Пользователь был успешно удален!'))
  }
  catch (e) {
    console.error(`error at start.composer: ${e.message}`)
    await ctx.reply('Что-то пошло не так попробуйте перезапустить', Markup.keyboard([
      ['/start']
    ]).resize().oneTime())
  }
})

module.exports = composer
