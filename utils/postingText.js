

const posting = (work) => {
  let text = ''
  if (work.name) {
    text += `<b>${work.name.replace('\n', '')}.</b>`
  }
  if (work.description) {
    text += `\n\n<b>Описание</b>: ${work.description}`
  }
  if (work.priceLimit) {
    text += `\n<b>Цена</b>: ${work.priceLimit.replace('\n', '')}₽`
  }
  if (work.dateCreate) {
    text += `\n<b>Дата выхода</b>: ${work.dateCreate.replace('\n', '')}\n`
  }
  if (work.categoryName) {
    text += `\n<b>Категория</b>: ${work.categoryName.replace('\n', '')}`
  }
  if (work.id) {
    text += `\n<b>ID</b>: ${work.id}`
  }
  if (work.url) {
    text += `\n\n<b>Ссылка</b>: https://kwork.ru${work.url}`
  }

  return text
}

function postingTest() {
  const testWork = {
    "id": 2362275,
    "lang": "ru",
    "name": "Отрисовка японских графиков на react.js",
    "description": "Нужно нарисовать график японских свечей BTC/USDT с помощью react.js\nболее подробное ТЗ:\nОтрисовать графики японских свечей, которые будут обновляться в реальном времени(по возможности) для тикера SBER, данные получаются прямиком из архивов MOEX через API",
    "status": "active",
    "url": "/projects/2362275",
    "files": [],
    "isActive": true,
    "isHigherPrice": true,
    "isSymbolRu": true,
    "categoryMinPrice": 500,
    "priceLimit": "3000.00",
    "possiblePriceLimit": 9000,
    "dateView": "2024-02-23 07:11:59",
    "dateExpire": "2024-02-23 17:30:28",
    "dateCreate": "2024-02-22 17:30:14",
    "dateExpireText": "23 февраля 2024",
    "dateCreateText": "22 февраля 2024",
    "kworkCount": "4",
    "projectReviewType": null,
    "getReviewCanChange": false,
    "timeLeft": "10 ч. 18 мин.",
    "turnover": 0,
    "isUserWant": false,
    "userId": 12677308,
    "userName": "kostariqque",
    "userAvatar": "29/12677308-3.jpg",
    "userAvatarSrcSet": "https://cdn-edge.kwork.ru/files/avatar/big/29/12677308-3.jpg 1x, https://cdn-edge.kwork.ru/files/avatar/big_r/29/12677308-3.jpg 2x",
    "userBackground": "#7bc862",
    "userIsOnline": false,
    "userBadges": [],
    "userActiveWants": 1,
    "userWants": "1",
    "userIsOtherActiveWants": false,
    "userWantsHiredPercent": "0",
    "userAlreadyWork": null,
    "currentUserReviewType": null,
    "categoryName": "Доработка и настройка сайта",
    "parentCategoryName": "Разработка и IT",
    "isUserNeedPortfolio": false,
    "isUserNeedPortfolioNotify": false,
    "isUserNeedKworkNotify": false,
    "userNeedPortfolioRubricName": "",
    "categoryId": "38",
    "parentCategoryId": 11,
    "classificationId": 1271
  }

  console.log(posting(testWork))
}

postingTest()

module.exports = posting
