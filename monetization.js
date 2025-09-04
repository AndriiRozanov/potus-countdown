// monetization.js
(function () {
  const scriptEl = document.currentScript;

  // Read IDs from data-attributes on the script tag
  const GA_ID       = scriptEl?.dataset?.ga || "";               // e.g. G-XXXXXXXXXX
  const ADS_CLIENT  = scriptEl?.dataset?.adsense || "";          // e.g. ca-pub-XXXXXXXXXXXXXXXX
  const SLOT_TOP    = scriptEl?.dataset?.slotTop || "";
  const SLOT_INFEED = scriptEl?.dataset?.slotInfeed || "";
  const SLOT_SIDE   = scriptEl?.dataset?.slotSide || "";

  const CONSENT_KEY = "pc_consent"; // 'granted' | 'denied'
  const existing = (() => { try { return localStorage.getItem(CONSENT_KEY); } catch { return null; }})();

  // ---------- style for banner & ad-slot ----------
  (function injectStyles(){
    const css = `
      .ad-slot{ margin:.75rem 0; }
      .pc-consent {
        position: fixed; inset: auto 0 0 0; z-index: 9999;
        background: #0b0f18; color: #e8ecff; padding: 1rem;
        box-shadow: 0 -8px 30px rgba(0,0,0,.35);
        display:flex; align-items:center; gap:1rem; flex-wrap:wrap; justify-content:center;
        font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Inter,Arial,sans-serif;
      }
      .pc-consent p { margin: 0; max-width: 880px; }
      .pc-consent .btn {
        border-radius: 10px; padding: .6rem 1rem; cursor: pointer; font: inherit; border: 1px solid #2a3550;
      }
      .pc-consent .btn.primary { background:#5b8cff; color:#0b0f18; border:none; }
      .pc-consent .btn.secondary { background:#121728; color:#e8ecff; }
      .pc-consent a { color:#9bc0ff; }
    `;
    const st = document.createElement("style");
    st.textContent = css;
    document.head.appendChild(st);
  })();

  // ---------- GA4 ----------
  function loadGA() {
    if (!GA_ID) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ window.dataLayer.push(arguments); };
    gtag('js', new Date());
    // Default: denied (until user acts)
    gtag('consent', 'default', {
      ad_storage: 'denied',
      analytics_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    gtag('config', GA_ID, { 'anonymize_ip': true });
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
    document.head.appendChild(s);
  }
  function grantGtagConsent() {
    if (!window.gtag) return;
    window.gtag('consent', 'update', {
      ad_storage: 'granted',
      analytics_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted'
    });
  }

  // ---------- AdSense ----------
  function loadAdSense() {
    if (!ADS_CLIENT) return;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    s.setAttribute('data-ad-client', ADS_CLIENT);
    s.crossOrigin = 'anonymous';
    document.head.appendChild(s);
  }
  function createAdIns(slot, format='auto') {
    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.style.minHeight = '90px';
    ins.setAttribute('data-ad-client', ADS_CLIENT);
    ins.setAttribute('data-ad-slot', slot);
    ins.setAttribute('data-ad-format', format);
    ins.setAttribute('data-full-width-responsive', 'true');
    return ins;
  }
  function renderAd(containerId, slot) {
    if (!slot) return;
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = '';
    const ins = createAdIns(slot, 'auto');
    el.appendChild(ins);
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }
  function renderAllAds() {
    renderAd('ad-top',    SLOT_TOP);
    renderAd('ad-infeed', SLOT_INFEED);
    renderAd('ad-side',   SLOT_SIDE);
  }

  // ---------- Consent UI ----------
  function showConsentBanner() {
    const wrap = document.createElement('div');
    wrap.className = 'pc-consent';
    wrap.innerHTML = `
      <p>
        We use cookies for analytics and ads personalization (via Google). See our
        <a href="privacy.html" target="_blank" rel="noopener">Privacy Policy</a>.
      </p>
      <div>
        <button class="btn secondary" id="pc-deny">Reject</button>
        <button class="btn primary" id="pc-accept">Accept</button>
      </div>
    `;
    document.body.appendChild(wrap);

    const acceptBtn = wrap.querySelector('#pc-accept');
    const denyBtn   = wrap.querySelector('#pc-deny');

    acceptBtn.addEventListener('click', () => {
      try { localStorage.setItem(CONSENT_KEY, 'granted'); } catch {}
      wrap.remove();
      grantGtagConsent();
      loadAdSense();
      // after AdSense script attaches, render units
      setTimeout(renderAllAds, 250);
    });

    denyBtn.addEventListener('click', () => {
      try { localStorage.setItem(CONSENT_KEY, 'denied'); } catch {}
      wrap.remove();
      // keep GA/Ads in denied mode (no ad/analytics storage)
    });
  }

  // ---------- Init ----------
  loadGA();

  if (existing === 'granted') {
    grantGtagConsent();
    loadAdSense();
    setTimeout(renderAllAds, 250);
  } else if (existing === 'denied') {
    // do nothing (still can add a “Manage cookies” link later)
  } else {
    // no decision yet
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showConsentBanner);
    } else {
      showConsentBanner();
    }
  }
})();
