const {Composer, Markup} = require('telegraf')
const UserController = require('../controller/user.controller')
const composer = new Composer()
const moment = require('moment');

composer.action('time', async (ctx) => {
  try {
    await ctx.answerCbQuery()
    const user = await UserController.getOne(+ctx.from.id)
    if (!user) {
      return await ctx.reply('Пользователь не найден, чтобы начать нажмите на /start')
    }
    const buttons = [
      [Markup.button.callback(`Часовой пояс ${user.timezone ? '✅' : ''}`, 'timezone')],
      [Markup.button.callback(`Расписание ${user.schedule ? '✅' : ''}`, 'schedule')]
    ]

    if (user.timezone && user.schedule) {
      buttons.push([Markup.button.callback('Готово', 'done')])
    }

    await ctx.telegram.editMessageText(
      ctx.callbackQuery.message.chat.id,
      ctx.callbackQuery.message.message_id,
      null,
      'Вам нужно указать часовой пояс и расписание',
      Markup.inlineKeyboard(buttons)
    )
  }
  catch (e) {
    console.error(`error at categories action: ${e.message}`)
    await ctx.reply('Что-то пошло не так попробуйте перезапустить', Markup.keyboard([
      ['/start']
    ]).resize().oneTime())
  }
})

composer.action('timezone',  async(ctx) => {
  await ctx.answerCbQuery()
  await ctx.deleteMessage()
  await ctx.reply(
    'Выберите свой часовой пояс или напишите сами, пример: +3 или -12',
    Markup.keyboard([
      ['+3', '+5'], ['-2', '-4']
    ]).resize().oneTime()
  )
})

composer.action('schedule',  async(ctx) => {
  await ctx.answerCbQuery()
  await ctx.deleteMessage()
  await ctx.reply(
    'В какое время начинать и останавливать отправку заказов?\nВыберите вариант или напиши в таком формате: 8:00 - 9:00',
    Markup.keyboard([
      ['8:00 - 17:00', '10:00 - 18:00'], ['12:00 - 20:00', '6:00 - 16:00']
    ]).resize().oneTime()
  )
})

composer.on('text', async (ctx) => {
  const txt = ctx.message.text
  const user = await UserController.getOne(+ctx.from.id)
  if (!user) {
    return await ctx.reply('Пользователь не найден, чтобы начать нажмите на /start')
  }
  if (validateTZ(txt)) {
    const user = await UserController.getOne(+ctx.from.id)
    if (!user) {
      return await ctx.reply('Пользователь не найден, чтобы начать нажмите на /start')
    }
    const tz = validateTZ(txt)
    await UserController.updateUser({timezone: tz}, user.id)
      .then(async () => {
        return await ctx.reply(`Вы успешно установили часовой пояс: ${tz}`, Markup.inlineKeyboard([[Markup.button.callback('Готово', 'time')]]))
      })
  }

  if (validateTime(txt)) {
    const user = await UserController.getOne(+ctx.from.id)
    if (!user) {
      return await ctx.reply('Пользователь не найден, чтобы начать нажмите на /start')
    }
    const time = validateTime(txt)
    await UserController.updateUser({schedule: time}, user.id)
      .then(async () => {
        return await ctx.reply(`Вы успешно установили время: ${time}`, Markup.inlineKeyboard([[Markup.button.callback('Готово', 'time')]]))
      })
  }
})

function validateTZ(text) {
  const regex = /^[+-]\d{1,2}$/;
  if (regex.test(text)) {
    const number = parseInt(text, 10); // Преобразовать текст в число
    if (number >= -12 && number <= 12) { // Проверить, что число находится в допустимом диапазоне
      return number; // Вернуть числовое значение
    }
  }
  return false;
}
function validateTime(text) {
  const regex = /(\d{1,2}):(\d{2}) - (\d{1,2}):(\d{2})$/;
  const match = text.match(regex);

  if (match) {
    const startTime = moment(`${match[1]}:${match[2]}`, 'HH:mm');
    const endTime = moment(`${match[3]}:${match[4]}`, 'HH:mm');

    if (startTime.isBefore(endTime)) {
      return `${match[1]}:${match[2]} - ${match[3]}:${match[4]}`;
    } else {
      return null;
    }
  } else {
    return null;
  }
}

module.exports = composer;
