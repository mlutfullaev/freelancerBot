const {Composer, Markup} = require('telegraf')
const UserController = require('../controller/user.controller')
const composer = new Composer()
const moment = require('moment');
const {categories, weekdays} = require("../utils/data");

composer.action('categories', async (ctx) => {
  try {
    await ctx.answerCbQuery()
    const user = await UserController.getOne(+ctx.from.id)
    if (!user) {
      return await ctx.reply('Пользователь не найден, чтобы начать нажмите на /start')
    }
    const buttons = []

    categories.forEach(category => {
      buttons.push([Markup.button.callback(category.value, category.name)])
    })

    if (user.categories.length) {
      buttons.push([Markup.button.callback('Готово', 'done')])
      return await ctx.telegram.editMessageText(
        ctx.callbackQuery.message.chat.id,
        ctx.callbackQuery.message.message_id,
        null,
        'Нажмите на кнопку "Готово" когда закончите.',
        Markup.inlineKeyboard(buttons)
      )
    }

    await ctx.telegram.editMessageText(ctx.callbackQuery.message.chat.id, ctx.callbackQuery.message.message_id, null, 'Какие сферы вас интересуют?', Markup.inlineKeyboard(buttons))
  }
  catch (e) {
    console.error(`error at categories.action: ${e.message}`)
    await ctx.reply('Что-то пошло не так попробуйте перезапустить - /start')
  }
})
categories.forEach(category => {
  composer.action(category.name, async ctx => {
    try {
      await ctx.answerCbQuery();
      const {categories} = await UserController.getOne(ctx.from.id)

      const keyboard = Markup.inlineKeyboard(
        [
          ...category.categories.map((item) => [Markup.button.callback(`${categories.includes(item) ? '✅' : ''} ${item}`, `${category.name}_${item}`)]),
          [Markup.button.callback('Назад', 'categories')]
        ]
      );

      await ctx.telegram.editMessageText(
        ctx.callbackQuery.message.chat.id,
        ctx.callbackQuery.message.message_id,
        null,
        'Выберите нужные категории.',
        keyboard)
    }
    catch (e) {
      console.error(`error at category.action: ${e.message}`)
      await ctx.reply('Что-то пошло не так попробуйте перезапустить', Markup.keyboard([
        ['/start']
      ]).resize().oneTime())
    }
  })

  category.categories.forEach(subCategory => {
    composer.action(`${category.name}_${subCategory}`, async (ctx) => {
      try {
        const { categories } = await UserController.getOne(ctx.from.id)
        await ctx.answerCbQuery();

        if (categories.includes(subCategory)) {
          const index = categories.indexOf(subCategory);
          categories.splice(index, 1);
        } else {
          categories.push(subCategory)
        }
        await UserController.updateUser({categories}, ctx.from.id)

        const keyboard = Markup.inlineKeyboard([
          ...category.categories.map((item) => [Markup.button.callback(`${categories.includes(item) ? '✅' : ''} ${item}`, `${category.name}_${item}`)]),
          [Markup.button.callback('Назад', 'categories')]
        ]);

        await ctx.telegram.editMessageText(
          ctx.callbackQuery.message.chat.id,
          ctx.callbackQuery.message.message_id,
          null,
          'Выберите нужные категории.',
          keyboard)
      }
      catch (e) {
        console.error(`error at subCategory.action: ${e.message}`)
        await ctx.reply('Что-то пошло не так попробуйте перезапустить', Markup.keyboard([
          ['/start']
        ]).resize().oneTime())
      }
    });
  })
})

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
      buttons.push([Markup.button.callback('Готово', 'done')])
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

const weekdaysKeyboard = (weekdays) => {
  return [
    [
      Markup.button.callback(`Пн${weekdays?.includes(1) ? ' ✅' : ''}`, 'weekday_1'),
      Markup.button.callback(`Вт${weekdays?.includes(2) ? ' ✅' : ''}`, 'weekday_2'),
      Markup.button.callback(`Ср${weekdays?.includes(3) ? ' ✅' : ''}`, 'weekday_3'),
    ],
    [
      Markup.button.callback(`Чт${weekdays?.includes(4) ? ' ✅' : ''}`, 'weekday_4'),
      Markup.button.callback(`Пт${weekdays?.includes(5) ? ' ✅' : ''}`, 'weekday_5')
    ],
    [
      Markup.button.callback(`Сб${weekdays?.includes(6) ? ' ✅' : ''}`, 'weekday_6'),
      Markup.button.callback(`Вс${weekdays?.includes(7) ? ' ✅' : ''}`, 'weekday_7'),
    ],
    [
      Markup.button.callback('Готово', 'done'),
    ],
  ]
}
composer.action('weekdays', async (ctx) => {
  try {
    const user = await UserController.getOne(+ctx.from.id)
    if (!user) {
      return await ctx.reply('Пользователь не найден, чтобы начать нажмите на /start')
    }

    await ctx.telegram.editMessageText(
      ctx.callbackQuery.message.chat.id,
      ctx.callbackQuery.message.message_id,
      null,
      `В какие дни отправлять заказы?`,
      Markup.inlineKeyboard(weekdaysKeyboard(user.weekdays))
    )
  } catch (e) {
    console.error(`error at weekdays.action: ${e.message}`)
    await ctx.reply('Что-то пошло не так попробуйте перезапустить - /start')
  }
})
weekdays.forEach((weekday, i) => {
  const index = i + 1
  composer.action(`weekday_${index}`, async (ctx) => {
    try {
      const {weekdays} = await UserController.getOne(ctx.from.id)
      await ctx.answerCbQuery();

      if (weekdays.includes(index)) {
        const indexOf = weekdays.indexOf(index);
        weekdays.splice(indexOf, 1);
      } else {
        weekdays.push(index)
      }

      await UserController.updateUser({weekdays}, ctx.from.id)

      await ctx.telegram.editMessageText(
        ctx.callbackQuery.message.chat.id,
        ctx.callbackQuery.message.message_id,
        null,
        'Выберите нужные категории.',
        Markup.inlineKeyboard(weekdaysKeyboard(weekdays))
      )
    } catch (e) {
      console.error(`error at weekdays.action: ${e.message}`)
      await ctx.reply('Что-то пошло не так попробуйте перезапустить - /start')
    }
  })
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
