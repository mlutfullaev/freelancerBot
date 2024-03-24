const UserController = require("../controller/user.controller");
const {Composer} = require("telegraf");
const fs = require('fs')
const path = require('path');
const composer = new Composer();
const infoPath = path.resolve(__dirname, '../', 'info.json')

composer.command('msg', async (ctx) => {
  try {
    const user = await UserController.getOne(+ctx.from.id)
    if (!user || !user.admin) return

    const message = ctx.update.message.text
    const file = JSON.parse(fs.readFileSync(infoPath, "utf8"))

    if (message === '/msg') {
      return await ctx.reply(file.message || 'Пусто.')
    }

    const text = ctx.update.message.text.replace('/msg ', '')
    fs.writeFileSync(infoPath, JSON.stringify({...file, message: text}))
    await ctx.reply(text)
  } catch (e) {
    console.error(`error at msg.command.admin: ${e.message}`)
  }
})
composer.command('send_msg', async (ctx) => {
  try {
    const messagedUser = await UserController.getOne(+ctx.from.id)
    if (!messagedUser || !messagedUser.admin) return

    const users = await UserController.getAll()
    const file = JSON.parse(fs.readFileSync(infoPath, "utf8"))

    if (!file.message) {
      return ctx.reply('Нету сообщении!')
    }
    users.forEach((user) => {
      ctx.telegram.sendMessage(user.id, file.message)
    })

    fs.writeFileSync(infoPath, JSON.stringify({...file, message: ''}))
  } catch (e) {
    console.error(`error at send_msg.command: ${e.message}`)
  }
})
composer.command('statics', async (ctx) => {
  try {
    const user = await UserController.getOne(+ctx.from.id)
    if (!user || !user.admin) return

    const users = await UserController.getAll()
    const readyUsers = users.filter(user => user.going)

    ctx.reply(`Всего ${users.length} пользователей\nГотовы ${readyUsers.length}`)
  } catch (e) {
    console.error(`error at statics.command: ${e.message}`)
  }
})

module.exports = composer