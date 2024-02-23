const { Composer, Markup } = require('telegraf')
const UserController = require('../controller/user.controller')
const categories = require('../utils/data').categories

const composer = new Composer()

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
    }

    await ctx.telegram.editMessageText(ctx.callbackQuery.message.chat.id, ctx.callbackQuery.message.message_id, null, 'Какие сферы вас интересуют?', Markup.inlineKeyboard(buttons))
  }
  catch (e) {
    console.error(`error at categories action: ${e.message}`)
    await ctx.reply('Что-то пошло не так попробуйте перезапустить', Markup.keyboard([
      ['/start']
    ]).resize().oneTime())
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
        'Какие категории вас интересует?',
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
        await UserController.updateUser({categories: categories}, ctx.from.id)

        const keyboard = Markup.inlineKeyboard([
          ...category.categories.map((item) => [Markup.button.callback(`${categories.includes(item) ? '✅' : ''} ${item}`, `it_${item}`)]),
          [Markup.button.callback('Назад', 'categories')]
        ]);

        await ctx.telegram.editMessageText(
          ctx.callbackQuery.message.chat.id,
          ctx.callbackQuery.message.message_id,
          null,
          'Выберите нужные категории',
          keyboard)
      }
      catch (e) {
        console.error(`error at it_num.action: ${e.message}`)
        await ctx.reply('Что-то пошло не так попробуйте перезапустить', Markup.keyboard([
          ['/start']
        ]).resize().oneTime())
      }
    });
  })
})


module.exports = composer;
