/* /assets/theme.js */
(function(){
  function apply(pref){
    localStorage.setItem('theme', pref);
    var darkOS = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = pref==='auto' ? (darkOS?'dark':'light') : pref;
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = (theme==='dark'?'dark':'light');
  }
  // слухач зміни теми ОС у режимі auto
  try{
    var pref=(localStorage.getItem('theme')||'auto').toLowerCase();
    if(pref==='auto' && window.matchMedia){
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',function(e){
        apply('auto');
      });
    }
    // робимо глобально доступним перемикач
    window.__setTheme = apply;
  }catch(e){}
})();
