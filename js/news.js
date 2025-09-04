const news = [
  { title: 'Трамп зробив заяву', summary: 'Нова промова про економіку', link: '#' },
  { title: 'Політичні дебати', summary: 'Обговорення майбутнього США', link: '#' }
];
const newsDiv = document.getElementById('news');
news.forEach(n => {
  const div = document.createElement('div');
  div.innerHTML = `<h3><a href="${n.link}">${n.title}</a></h3><p>${n.summary}</p>`;
  newsDiv.appendChild(div);
});
