<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Presidency Clock</title>
  <link rel="stylesheet" href="/css/style.css"> <!-- Якщо є CSS, залиши цей рядок -->
</head>
<body>
  <!-- Тут твій HTML-код: таймер, кнопки, реклама тощо -->
  <div id="days"><span class="num"></span> Days</div>
  <div id="hours"><span class="num"></span> Hours</div>
  <div id="minutes"><span class="num"></span> Minutes</div>
  <div id="seconds"><span class="num"></span> Seconds</div>
  <!-- Приклад слотів для реклами (залиш, якщо є) -->
  <div class="ad-slot" style="width: 300px; height: 250px;">Ad slot 1 — 300×250</div>
  <div class="ad-slot" style="width: 300px; height: 250px;">Ad slot 2 — 300×250</div>
  <div class="ad-slot" style="width: 728px; height: 90px;">Ad slot 3 — 728×90</div>
  <!-- Кнопки тощо (додай, якщо є у твоєму коді) -->
  <button id="enable-sound" data-i18n="enable">Enable sound</button>
  <button id="mute-btn" data-i18n="unmute">Unmute</button>
  <button class="sound-option" data-mode="tick" data-i18n="tickSound">Ticking</button>
  <button class="sound-option" data-mode="beep" data-i18n="beepSound">Digital beep</button>
  <a id="share-x" data-i18n="shareX">Share on X</a>
  <a id="share-fb" data-i18n="shareFB">Share on Facebook</a>

  <!-- Підключення нового файлу -->
  <script src="/js/embed.js" data-lang="" data-theme="dark" async></script>
</body>
</html>
