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
    let text = 'Вам нужно указать часовой пояс и расписание.'
    const buttons = [
      [Markup.button.callback(`Часовой пояс ${Number.isInteger(user.timezone) ? '✅' : ''}`, 'timezone')],
      [Markup.button.callback(`Расписание ${user.schedule ? '✅' : ''}`, 'schedule')]
    ]

    if (Number.isInteger(user.timezone) && user.schedule) {
      text = 'После завершение нажмите на "Готово".'
      buttons.push([Markup.button.callback('Готово', 'done_time')])
    }

    await ctx.telegram.editMessageText(
      ctx.callbackQuery.message.chat.id,
      ctx.callbackQuery.message.message_id,
      null,
      text,
      Markup.inlineKeyboard(buttons)
    )
  }
  catch (e) {
    console.error(`error at time.action: ${e.message}`)
    await ctx.reply('Что-то пошло не так попробуйте перезапустить - /start')
  }
})

composer.action('timezone',  async(ctx) => {
  try {
    await ctx.answerCbQuery()
    await ctx.deleteMessage()
    let text = 'Выберите свой часовой пояс или напишите сами по примеру: "+3", "-12".'
    const user = await UserController.getOne(+ctx.from.id)
    if (!user) {
      return await ctx.reply('Пользователь не найден, чтобы начать нажмите на /start')
    }
    if (user.timezone) text += `\nТекущий часовой пояс: ${user.timezone > 0 ? `+${user.timezone}` : user.timezone}.`
    await ctx.reply(
      text,
      Markup.keyboard([
        ['+3', '+5', '+7'], ['Ноль', '-2', '-4']
      ]).resize().oneTime()
    )
  }
  catch (e) {
    console.error(`error at timezone.action: ${e.message}`)
    await ctx.reply('Что-то пошло не так попробуйте перезапустить - /start')
  }
})

composer.action('schedule',  async(ctx) => {
  try {
    await ctx.answerCbQuery()
    await ctx.deleteMessage()
    let text = 'В какое время начинать и останавливать отправку заказов?\nВыберите вариант или напиши в таком формате: "8:00 - 9:00", "12:00 - 23:00".'
    const user = await UserController.getOne(+ctx.from.id)
    if (!user) {
      return await ctx.reply('Пользователь не найден, чтобы начать нажмите на /start')
    }
    if (user.schedule) text += `\nТекущее расписание: ${user.schedule}.`
    await ctx.reply(
      text,
      Markup.keyboard([
        ['8:00 - 17:00', '10:00 - 18:00'], ['12:00 - 20:00', '6:00 - 16:00']
      ]).resize().oneTime()
    )
  }
  catch (e) {
    console.error(`error at schedule.action: ${e.message}`)
    await ctx.reply('Что-то пошло не так попробуйте перезапустить - /start')
  }
})

composer.on('text', async (ctx) => {
  try {
    const txt = ctx.message.text
    const user = await UserController.getOne(+ctx.from.id)
    if (!user) {
      return await ctx.reply('Пользователь не найден, чтобы начать нажмите на /start')
    }
    if (txt === 'Ноль') {
      await UserController.updateUser({timezone: '0'}, user.id)
        .then(async () => {
          return await ctx.reply('Вы успешно установили часовой пояс: 0', Markup.inlineKeyboard([[Markup.button.callback('Готово', 'time')]]))
        })
    }
    if (validateTZ(txt)) {
      const tz = validateTZ(txt)
      await UserController.updateUser({timezone: tz}, user.id)
        .then(async () => {
          return await ctx.reply(`Вы успешно установили часовой пояс: ${tz}`, Markup.inlineKeyboard([[Markup.button.callback('Готово', 'time')]]))
        })
    }

    if (validateTime(txt)) {
      const time = validateTime(txt)
      await UserController.updateUser({schedule: time}, user.id)
        .then(async () => {
          return await ctx.reply(`Вы успешно установили время: ${time}`, Markup.inlineKeyboard([[Markup.button.callback('Готово', 'time')]]))
        })
    }
  }
  catch (e) {
    console.error(`error at text.on: ${e.message}`)
    await ctx.reply('Что-то пошло не так попробуйте перезапустить - /start')
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
