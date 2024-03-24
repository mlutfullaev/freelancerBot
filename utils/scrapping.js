const UserController = require("../controller/user.controller");
const moment = require('moment-timezone');
const axios = require("axios");
const {headers} = require("./data");
const postingText = require("./postingText");
const fs = require('fs');
const path = require("path");
const infoPath = path.resolve(__dirname, '../', 'info.json')

const scrapping = async () => {
  const file = JSON.parse(fs.readFileSync(infoPath, "utf8"))
  const id = file.projectId || 0
  let gettingOld = false;
  let works = [];

  console.log(`saved id: ${id}`)

  await axios.post(`https://kwork.ru/projects?c=all`, {}, headers)
    .then(res => {
      const wants = res.data.data.wants
      const firstId = wants[0].id

      console.log('first project', firstId)

      fs.writeFileSync(infoPath, JSON.stringify({...file, projectId: firstId}))

      wants.forEach(work => {
        if (gettingOld) return;

        if (work.id <= id) {
          console.log(`stopped at ${work.id}`);
          gettingOld = true;
        } else {
          works.push(work);
        }
      })
    })
    .catch(err => {
      console.log(`error while scrapping ${err}`)
    })
  gettingOld = false;
  return works
}

function isReady({schedule, timezoneOffset, weekdays}) {
  // Текущее время в UTC
  const nowUtc = moment.utc();

  let day = nowUtc.day()
  if (day === 0) day = 7
  if (!weekdays.includes(day)) return false

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
  try {
    let users = await UserController.getReadyUsers()
    if (!users.length) return
    users = users.filter(user => isReady(user))
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
              parse_mode: 'html',
              disable_web_page_preview: true,
            })
          } catch (e) {
            if (e.code === 403) {
              await UserController.updateUser({going: false}, user.id)
            }
            console.error(`error at posting(): ${e.message}`)
          }
        }, 4000 * i)
      }
    })
  } catch (e) {
    console.log(e)
  }
}

module.exports = posting

function isReadyTest() {
  const isReadyTests = [
    {
      timezone: 0,
      weekdays: [1, 2, 3, 4, 5, 7],
      schedule: '8:00 - 12:00',
      expected: false
    },
    {
      timezone: 0,
      weekdays: [1, 2, 3, 4, 5, 6, 7],
      schedule: '11:00 - 23:00',
      expected: false
    },
    {
      timezone: -12,
      weekdays: [1, 2, 3, 4, 5, 6, 7],
      schedule: '8:00 - 12:00',
      expected: false
    },
    {
      timezone: -5,
      schedule: '15:00 - 23:00',
      weekdays: [1, 2, 3, 4, 5, 6, 7],
      expected: true
    },
    {
      timezone: 5,
      schedule: '08:00 - 23:00',
      weekdays: [1, 2, 3, 4, 5, 6, 7],
      expected: true
    },
    {
      timezone: 0,
      schedule: '4:00 - 23:00',
      weekdays: [1, 2, 3, 4, 5, 6, 7],
      expected: false
    },
    {
      timezone: 8,
      schedule: '11:00 - 12:00',
      weekdays: [1, 2, 3, 4, 5, 6, 7],
      expected: true
    },
    {
      timezone: 12,
      schedule: '19:00 - 23:30',
      weekdays: [1, 2, 3, 4, 5, 6, 7],
      expected: false
    },
  ]

  isReadyTests.forEach((test, i) => {
    console.log(`result: ${isReady(test)}, expected: ${test.expected}, index: ${i}`)
  })
}

// isReadyTest()
