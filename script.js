// ====== Перемикач теми ======
const themeToggle = document.getElementById("theme-toggle");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// ====== Перемикач мов (поки що тільки виводимо в консоль) ======
const langSelect = document.getElementById("language-select");
langSelect.addEventListener("change", (e) => {
  console.log("Language switched to:", e.target.value);
});

// ====== Таймер (заглушка) ======
function updateCountdown() {
  const endDate = new Date("2029-01-20T12:00:00Z"); // Дата кінця каденції Трампа
  const now = new Date();
  const diff = endDate - now;

  if (diff <= 0) {
    document.getElementById("countdown").textContent = "Term ended";
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  document.getElementById("countdown").textContent =
    `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

setInterval(updateCountdown, 1000);
updateCountdown();
