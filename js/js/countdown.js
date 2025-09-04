function updateCountdown() {
  const endDate = new Date('2029-01-20T12:00:00-05:00');
  const now = new Date();
  const diff = endDate - now;

  if (diff > 0) {
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    document.getElementById('countdown').innerHTML = `${days} днів, ${hours} годин, ${minutes} хвилин, ${seconds} секунд`;
  } else {
    document.getElementById('countdown').innerHTML = 'Термін закінчився!';
  }
}
setInterval(updateCountdown, 1000);
updateCountdown();
