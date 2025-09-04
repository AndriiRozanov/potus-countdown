const presidents = [
  { name: 'Джо Байден', term: '2021-2025' },
  { name: 'Дональд Трамп', term: '2017-2021' }
  // Додай більше
];
const list = document.getElementById('presidents');
presidents.forEach(p => {
  const li = document.createElement('li');
  li.textContent = `${p.name}: ${p.term}`;
  list.appendChild(li);
});
