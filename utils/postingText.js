const reduceText = (text) => {
  if (text.length <= 100) return text;

  return text.slice(0, 200) + '...';
}

module.exports = (work) => {
  return `
    ${work.name.replace('\n', '')}.\n\nОписание: ${reduceText(work.description)}\nЦена: ${work.priceLimit.replace('\n', '')}₽ \nДата выхода: ${work.dateCreate.replace('\n', '')} \nКатегория: ${work.categoryName.replace('\n', '')} \nID: ${work.id} \n\nСсылка: https://kwork.ru${work.url}`
}