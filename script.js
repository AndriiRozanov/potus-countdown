// =========================================================
// 1. НАЛАШТУВАННЯ ТА ПЕРЕКЛАДИ (МОВНІ ВЕРСІЇ)
// =========================================================

const translations = {
    'uk': {
        title: "Зворотний відлік: Завершення повноважень Дональда Трампа",
        meta_description: "Точний зворотний відлік до кінця повноважень Дональда Трампа як 47-го Президента США: 20 січня 2029 року.",
        og_title: "Скільки часу залишилося? Таймер Трампа 2029",
        logo_text: "Таймер Трампа 2029",
        toggle_text: "Включити Нічну Тему",
        main_headline: "Зворотний відлік до кінця повноважень Дональда Трампа",
        nav_info: "Інформація",
        nav_presidents: "Президенти",
        label_days: "ДНІВ",
        label_hours: "ГОДИН",
        label_minutes: "ХВИЛИН",
        label_seconds: "СЕКУНД",
        ad_placeholder: "МІСЦЕ ДЛЯ РЕКЛАМНОГО БЛОКУ 1",
        info1_title: "🗓️ Корисна Інформація: Дата та 20-та Поправка",
        info1_body: "Згідно з **20-ю поправкою до Конституції США**, термін повноважень Президента завершується опівдні 20 січня, через чотири роки після його інавгурації. Якщо Дональд Трамп стане 47-м Президентом США, його термін закінчиться **20 січня 2029 року о 12:00:00 (EST)**. Саме цю дату використовує наш лічильник.",
        info2_title: "🗳️ Про Президентські Вибори",
        info2_body: "Наш сайт присвячений історичній даті, незалежно від політичних уподобань. Наявність точної та перевіреної інформації є ключовою для будь-якого громадського ресурсу. Ми будемо регулярно оновлювати розділ FAQ з відповідями на найпопулярніші запитання, пов'язані з виборами та інавгурацією.",
        tools_title: "Поділіться та Вбудуйте",
        social_title: "Поділитися в Соцмережах:",
        widget_title: "Вставити Віджет на Ваш Сайт:",
        widget_instr: "Скопіюйте цей код, щоб додати мінімалістичний годинник на свій сайт (HTML-блог):",
        footer_policy: "Політика Конфіденційності",
        footer_terms: "Умови Використання",
        footer_contact: "Контакти",
        footer_copyright: "&copy; 2025 Таймер Трампа. Усі права захищено."
    },
    'en': {
        title: "Countdown: End of Donald Trump's Term",
        meta_description: "Accurate countdown to the end of Donald Trump's term as the 47th President of the United States: January 20, 2029.",
        og_title: "How Much Time is Left? Trump Timer 2029",
        logo_text: "Trump Timer 2029",
        toggle_text: "Switch to Night Theme",
        main_headline: "Countdown to the end of Donald Trump's term",
        nav_info: "Information",
        nav_presidents: "Presidents",
        label_days: "DAYS",
        label_hours: "HOURS",
        label_minutes: "MINUTES",
        label_seconds: "SECONDS",
        ad_placeholder: "AD SENSE BLOCK 1 LOCATION",
        info1_title: "🗓️ Useful Information: Date and 20th Amendment",
        info1_body: "According to the **20th Amendment to the US Constitution**, the President's term ends at noon on January 20th, four years after their inauguration. If Donald Trump becomes the 47th US President, his term will end on **January 20, 2029, at 12:00:00 (EST)**. This is the date used by our counter.",
        info2_title: "🗳️ About Presidential Elections",
        info2_body: "Our website is dedicated to this historical date, regardless of political preference. Having accurate and verified information is key for any public resource. We will regularly update the FAQ section with answers to the most popular questions related to the elections and inauguration.",
        tools_title: "Share and Embed",
        social_title: "Share on Social Media:",
        widget_title: "Embed Widget on Your Site:",
        widget_instr: "Copy this code to add a minimalist clock to your website (HTML blog):",
        footer_policy: "Privacy Policy",
        footer_terms: "Terms of Use",
        footer_contact: "Contact",
        footer_copyright: "&copy; 2025 Trump Timer. All rights reserved."
    },
    // ... (ТУТ БУДУТЬ ПЕРЕКЛАДИ ДЛЯ PORTUGUESE, FRANÇAIS, ESPAÑOL)
    // Я можу надати їх пізніше, щоб не перевантажувати цей крок. 
    // Наразі для порівняння є UK та EN.
};

// Функція для зміни мови
function setLanguage(lang) {
    const t = translations[lang];
    if (!t) return;

    // Оновлення тексту в елементах за атрибутом data-translate
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (t[key]) {
            // Оновлення вмісту елемента
            element.innerHTML = t[key]; 
            
            // Оновлення атрибутів (для title та мета-тегів)
            if (key === 'title') {
                document.title = t[key];
            } else if (key === 'meta_description') {
                 document.querySelector('meta[name="description"]').setAttribute('content', t[key]);
            } else if (key === 'og_title') {
                 document.querySelector('meta[property="og:title"]').setAttribute('content', t[key]);
            }
        }
    });
    
    // Зберігаємо обрану мову
    localStorage.setItem('language', lang);

    // Додатково: зміна URL для навігації
    // Ми будемо просто перенаправляти на відповідний HTML-файл
    // window.location.href = `${lang}.html`; 
    // Зауваження: Для GitHub Pages найпростіше мати файл index.html та окремі файли en.html, fr.html, тощо.
}

// =========================================================
// 2. ЛОГІКА ВІДЛІКУ ТА ТЕМИ
// =========================================================

// Встановлюємо дату закінчення повноважень (20 січня 2029 року, 12:00:00 EST - UTC-5:00)
const END_DATE = new Date("2029-01-20T17:00:00Z").getTime(); 

function updateCountdown() {
    const now = new Date().getTime(); 
    const distance = END_DATE - now;

    const elements = {
        days: document.getElementById('days'),
        hours: document.getElementById('hours'),
        minutes: document.getElementById('minutes'),
        seconds: document.getElementById('seconds')
    };
    
    if (distance < 0) {
        clearInterval(countdownInterval);
        Object.values(elements).forEach(el => el.innerHTML = "00");
        return;
    }

    // Розрахунки часу
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Відображаємо результати
    elements.days.innerHTML = String(days).padStart(2, '0');
    elements.hours.innerHTML = String(hours).padStart(2, '0');
    elements.minutes.innerHTML = String(minutes).padStart(2, '0');
    elements.seconds.innerHTML = String(seconds).padStart(2, '0');
}

const countdownInterval = setInterval(updateCountdown, 1000);
updateCountdown(); 

// Логіка перемикання теми (Нічна/Денна)
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
        themeToggle.textContent = translations[localStorage.getItem('language') || 'uk'].toggle_text.replace('Нічну', 'Денну');
    }
}

themeToggle.addEventListener('click', () => {
    const currentLang = localStorage.getItem('language') || 'uk';
    const t = translations[currentLang];
    
    if (body.classList.contains('dark-theme')) {
        body.classList.remove('dark-theme');
        themeToggle.textContent = t.toggle_text.replace('Денну', 'Нічну');
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.add('dark-theme');
        themeToggle.textContent = t.toggle_text.replace('Нічну', 'Денну');
        localStorage.setItem('theme', 'dark');
    }
});

// Ініціалізація мови при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('language') || 'uk';
    const langSwitcher = document.getElementById('language-switcher');
    
    // Завантажуємо текст
    setLanguage(savedLang); 
    if (langSwitcher) {
        langSwitcher.value = savedLang;
        
        // Додаємо обробник події для зміни мови
        langSwitcher.addEventListener('change', (event) => {
            const newLang = event.target.value;
            // Перенаправляємо на відповідний файл (для спрощення на GitHub Pages)
            if (newLang === 'uk') {
                window.location.href = 'index.html';
            } else {
                window.location.href = `${newLang}.html`;
            }
        });
    }
    
    // Встановлюємо тему
    initializeTheme();
});
