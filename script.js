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
    'pt': {
        title: "Contagem Regressiva: Fim do Mandato de Donald Trump",
        meta_description: "Contagem regressiva exata para o fim do mandato de Donald Trump como o 47º Presidente dos Estados Unidos: 20 de janeiro de 2029.",
        og_title: "Quanto tempo falta? Cronômetro Trump 2029",
        logo_text: "Cronômetro Trump 2029",
        toggle_text: "Mudar para Tema Noturno",
        main_headline: "Contagem regressiva para o fim do mandato de Donald Trump",
        nav_info: "Informações",
        nav_presidents: "Presidentes",
        label_days: "DIAS",
        label_hours: "HORAS",
        label_minutes: "MINUTOS",
        label_seconds: "SEGUNDOS",
        ad_placeholder: "LOCAL DO BLOCO DE ANÚNCIOS 1",
        info1_title: "🗓️ Informação Útil: Data e 20ª Emenda",
        info1_body: "De acordo com a **20ª Emenda da Constituição dos EUA**, o mandato do Presidente termina ao meio-dia de 20 de janeiro, quatro anos após sua posse. Se Donald Trump se tornar o 47º Presidente dos EUA, seu mandato terminará em **20 de janeiro de 2029, às 12:00:00 (EST)**. Esta é a data usada pelo nosso contador.",
        info2_title: "🗳️ Sobre Eleições Presidenciais",
        info2_body: "Nosso site é dedicado a esta data histórica, independentemente da preferência política. Ter informações precisas e verificadas é fundamental para qualquer recurso público. Atualizaremos regularmente a seção de FAQ com respostas às perguntas mais populares relacionadas às eleições e posse.",
        tools_title: "Compartilhe e Incorpore",
        social_title: "Compartilhar nas Redes Sociais:",
        widget_title: "Incorporar Widget no Seu Site:",
        widget_instr: "Copie este código para adicionar um relógio minimalista ao seu site (blog HTML):",
        footer_policy: "Política de Privacidade",
        footer_terms: "Termos de Uso",
        footer_contact: "Contato",
        footer_copyright: "&copy; 2025 Cronômetro Trump. Todos os direitos reservados."
    },
    'fr': {
        title: "Compte à Rebours: Fin du Mandat de Donald Trump",
        meta_description: "Compte à rebours précis jusqu'à la fin du mandat de Donald Trump en tant que 47e président des États-Unis : 20 janvier 2029.",
        og_title: "Combien de temps reste-t-il ? Compteur Trump 2029",
        logo_text: "Compteur Trump 2029",
        toggle_text: "Passer au Thème Nuit",
        main_headline: "Compte à rebours jusqu'à la fin du mandat de Donald Trump",
        nav_info: "Information",
        nav_presidents: "Présidents",
        label_days: "JOURS",
        label_hours: "HEURES",
        label_minutes: "MINUTES",
        label_seconds: "SECONDES",
        ad_placeholder: "EMPLACEMENT DU BLOC D'ANNONCES 1",
        info1_title: "🗓️ Information Utile: Date et 20e Amendement",
        info1_body: "Selon le **20e Amendement de la Constitution américaine**, le mandat du président se termine à midi le 20 janvier, quatre ans après son investiture. Si Donald Trump devient le 47e président des États-Unis, son mandat prendra fin le **20 janvier 2029, à 12:00:00 (EST)**. C'est la date utilisée par notre compteur.",
        info2_title: "🗳️ À Propos des Élections Présidentielles",
        info2_body: "Notre site est dédié à cette date historique, quelle que soit la préférence politique. Disposer d'informations précises et vérifiées est essentiel pour toute ressource publique. Nous mettrons régulièrement à jour la section FAQ avec des réponses aux questions les plus populaires liées aux élections et à l'investiture.",
        tools_title: "Partager et Intégrer",
        social_title: "Partager sur les Médias Sociaux :",
        widget_title: "Intégrer le Widget sur Votre Site :",
        widget_instr: "Copiez ce code pour ajouter une horloge minimaliste à votre site Web (blog HTML) :",
        footer_policy: "Politique de Confidentialité",
        footer_terms: "Conditions d'Utilisation",
        footer_contact: "Contact",
        footer_copyright: "&copy; 2025 Compteur Trump. Tous droits réservés."
    },
    'es': {
        title: "Cuenta Regresiva: Fin del Mandato de Donald Trump",
        meta_description: "Cuenta regresiva precisa para el final del mandato de Donald Trump como el 47º Presidente de los Estados Unidos: 20 de enero de 2029.",
        og_title: "¿Cuánto tiempo queda? Temporizador Trump 2029",
        logo_text: "Temporizador Trump 2029",
        toggle_text: "Cambiar a Tema Nocturno",
        main_headline: "Cuenta regresiva para el fin del mandato de Donald Trump",
        nav_info: "Información",
        nav_presidents: "Presidentes",
        label_days: "DÍAS",
        label_hours: "HORAS",
        label_minutes: "MINUTOS",
        label_seconds: "SEGUNDOS",
        ad_placeholder: "UBICACIÓN DEL BLOQUE DE ANUNCIOS 1",
        info1_title: "🗓️ Información Útil: Fecha y 20ª Enmienda",
        info1_body: "Según la **20ª Enmienda de la Constitución de los EE. UU.**, el mandato del Presidente finaliza al mediodía del 20 de enero, cuatro años después de su toma de posesión. Si Donald Trump se convierte en el 47º Presidente de los EE. UU., su mandato finalizará el **20 de enero de 2029, a las 12:00:00 (EST)**. Esta es la fecha utilizada por nuestro contador.",
        info2_title: "🗳️ Sobre las Elecciones Presidenciales",
        info2_body: "Nuestro sitio web está dedicado a esta fecha histórica, independientemente de la preferencia política. Contar con información precisa y verificada es clave para cualquier recurso público. Actualizaremos regularmente la sección de preguntas frecuentes (FAQ) con respuestas a las preguntas más populares relacionadas con las elecciones y la toma de posesión.",
        tools_title: "Compartir e Incrustar",
        social_title: "Compartir en Redes Sociales:",
        widget_title: "Incrustar Widget en Su Sitio:",
        widget_instr: "Copie este código para agregar un reloj minimalista a su sitio web (blog HTML):",
        footer_policy: "Política de Privacidad",
        footer_terms: "Términos de Uso",
        footer_contact: "Contacto",
        footer_copyright: "&copy; 2025 Temporizador Trump. Todos los derechos reservados."
    }
};

// Функція для зміни мови
function setLanguage(lang) {
    const t = translations[lang];
    if (!t) return;

    // Оновлення тексту в елементах за атрибутом data-translate
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (t[key]) {
            // Оновлення вмісту елемента (використовуємо innerHTML для підтримки тегів, наприклад, <strong>)
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

window.initializeTheme = function() {
    const savedTheme = localStorage.getItem('theme');
    const currentLang = localStorage.getItem('language') || 'uk';
    const t = translations[currentLang];
    
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
        // Оновлюємо текст кнопки, враховуючи мову
        if (themeToggle) themeToggle.textContent = t.toggle_text.replace('Нічну', 'Денну').replace('Night', 'Day').replace('Noturno', 'Diurno').replace('Nuit', 'Jour').replace('Nocturno', 'Diurno');
    }
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentLang = localStorage.getItem('language') || 'uk';
        const t = translations[currentLang];
        
        // Функція для коректної заміни тексту кнопки на всіх мовах
        const getToggleText = (isDark) => {
            let text = t.toggle_text;
            if (currentLang === 'uk' && isDark) return text.replace('Нічну', 'Денну');
            if (currentLang === 'en' && isDark) return text.replace('Night', 'Day');
            if (currentLang === 'pt' && isDark) return text.replace('Noturno', 'Diurno');
            if (currentLang === 'fr' && isDark) return text.replace('Nuit', 'Jour');
            if (currentLang === 'es' && isDark) return text.replace('Nocturno', 'Diurno');
            return text; // Якщо світла, повертаємо початковий текст
        }

        if (body.classList.contains('dark-theme')) {
            body.classList.remove('dark-theme');
            themeToggle.textContent = t.toggle_text; // Включити Нічну
            localStorage.setItem('theme', 'light');
        } else {
            body.classList.add('dark-theme');
            themeToggle.textContent = getToggleText(true); // Включити Денну
            localStorage.setItem('theme', 'dark');
        }
    });
}

// Ініціалізація мови та перенаправлення
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('language') || 'uk';
    const langSwitcher = document.getElementById('language-switcher');
    
    // Завантажуємо текст
    // Викликаємо setLanguage тільки на головних сторінках, де є data-translate
    if (document.querySelectorAll('[data-translate]').length > 0) {
        setLanguage(savedLang); 
    }
    
    if (langSwitcher) {
        langSwitcher.value = savedLang;
        
        // Додаємо обробник події для зміни мови
        langSwitcher.addEventListener('change', (event) => {
            const newLang = event.target.value;
            // Перенаправляємо на відповідний файл
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
