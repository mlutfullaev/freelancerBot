const UserController = require("../controller/user.controller");
const ProjectController = require("../controller/project.controller");
const moment = require('moment-timezone');
const {Markup} = require("telegraf");
const axios = require("axios");
const {headers} = require("./data");
const postingText = require("./postingText");
let page = 4

const scrapping = async () => {
  const id = Number(await ProjectController.getId())
  console.log(`saved id: ${id}`)
  let gettingOld = false;
  let works = [];

  let gettingIndex = 1;
  for (gettingIndex; gettingIndex < page; gettingIndex++) {
    await axios.post(`https://kwork.ru/projects?c=all&page=${page}`, {}, headers)
      .then(res => {
        console.log('first project', res.data.data.wants[0].id)
        res.data.data.wants.forEach((work, i) => {
          if (gettingOld) return;
          if (work.id <= id) {
            console.log(`stopped at ${work.id}`);
            gettingIndex = page;
            gettingOld = true;
          } else {
            works.push(work);
          }
        })
        console.log("end id: ", res.data.data.wants[0].id)
        ProjectController.updateId(res.data.data.wants[0].id)
      })
      .catch(err => {
        console.log(`error while scrapping ${err}`)
      })
  }
  gettingOld = false;
  return works
}

function isReady(schedule, timezoneOffset) {
  // Текущее время в UTC
  const nowUtc = moment.utc();

  // Преобразование UTC времени в локальное время пользователя
  const userLocalTime = nowUtc.clone().add(timezoneOffset, 'hours');

  // Получаем часы и минуты в локальном времени пользователя
  const userLocalTimeHours = userLocalTime.hour();
  const userLocalTimeMinutes = userLocalTime.minute();

  // Разбиение строки расписания на начало и конец
  const [startTime, endTime] = schedule.split(' - ');
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);

  // Преобразование начала и конца интервала в минуты с начала дня
  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  // Преобразование текущего времени пользователя в минуты с начала дня
  const userLocalTimeTotalMinutes = userLocalTimeHours * 60 + userLocalTimeMinutes;

  // Проверка, находится ли текущее время пользователя внутри заданного интервала
  return userLocalTimeTotalMinutes >= startTotalMinutes && userLocalTimeTotalMinutes <= endTotalMinutes;
}

const posting = async (bot) => {
  let users = await UserController.getReadyUsers()
  if (!users.length) return
  users = users.filter(user => isReady(user.schedule, user.timezone))
  if (!users.length) return

  const projects = await scrapping()
  if (!projects.length) return

  users.forEach(user => {
    const filteredProjects = projects.filter(project => user.categories.includes(project.categoryName)).reverse()
    if (!filteredProjects.length) return

    for (let i = 0; i < filteredProjects.length; i++) {
      setTimeout(async () => {
        try {
          if (!filteredProjects[i]) return;

          const text = postingText(filteredProjects[i])
          await bot.telegram.sendMessage(user.id, text, {
            disable_web_page_preview: true,
          })
        } catch (e) {
          console.error(`error at : ${e.message}`)
          await bot.telegram.sendMessage(
            user.id,
            'Что-то пошло не так попробуйте перезапустить',
            Markup.keyboard([[Markup.button.callback('/start', '/start')]])
          )
        }
      }, 4000 * i)
    }
  })
}

module.exports = posting
