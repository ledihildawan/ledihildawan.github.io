import { createFloatingLayer } from './floating.js';

export function initTooltips() {
  // ===== Tooltips vanilla (pengganti Bootstrap tooltip + Popper) =====
  // Render di <body> agar tidak terpotong overflow:hidden hero; warna brand
  // via class cc-<net>-tip. Placement: top. Animasi smooth via CSS fade + transform.
  (function () {
    var TIP_FADE_MS = 200; // sinkron dengan transition opacity .tooltip di CSS
    var TIP_GAP = 4; // jarak tooltip di atas ikon
    var HIDE_GRACE_MS = 120; // grace period lintas gap antar ikon

    var NETS = ['github', 'linkedin', 'twitter', 'instagram', 'threads'];

    function buildTip() {
      var tip = document.createElement('div');
      tip.className = 'tooltip bs-tooltip-top';
      tip.setAttribute('role', 'tooltip');
      var arrow = document.createElement('div');
      arrow.className = 'arrow';
      arrow.style.left = '50%';
      arrow.style.transform = 'translateX(-50%)';
      var inner = document.createElement('div');
      inner.className = 'tooltip-inner';
      tip.appendChild(arrow);
      tip.appendChild(inner);
      return tip;
    }

    var layer = createFloatingLayer({
      build: buildTip,
      removeAfterHide: TIP_FADE_MS,
      visibleClass: 'show',
      onScroll: 'hide',
      position: function (target, tip) {
        var title = target.getAttribute('data-tooltip-title');
        var net = (target.className.match(/cc-(github|linkedin|twitter|instagram|threads)/) ||
          [])[1];
        // retarget di tempat: ganti warna brand + teks tanpa buang elemen —
        // tooltip "menempel" mulus antar ikon (pola glider navbar/chips)
        NETS.forEach(function (n) {
          tip.classList.remove('cc-' + n + '-tip');
        });
        if (net) tip.classList.add('cc-' + net + '-tip');
        tip.querySelector('.tooltip-inner').textContent = title || '';
        var r = target.getBoundingClientRect();
        tip.style.top = r.top + window.pageYOffset - tip.offsetHeight - TIP_GAP + 'px';
        tip.style.left = r.left + window.scrollX + r.width / 2 + 'px';
      },
    });

    document
      .querySelectorAll('[data-toggle="tooltip"], [rel="tooltip"], [data-tooltip-title], [title]')
      .forEach(function (el) {
        var title =
          el.getAttribute('data-tooltip-title') ||
          el.getAttribute('title') ||
          el.getAttribute('data-original-title');
        if (!title) return;
        el.setAttribute('data-tooltip-title', title);
        el.removeAttribute('title');
        el.addEventListener('mouseenter', function () {
          layer.show(el);
        });
        // grace period: melintasi gap antar ikon tidak mematikan tooltip
        el.addEventListener('mouseleave', function () {
          layer.scheduleHide(HIDE_GRACE_MS);
        });
        el.addEventListener('focus', function () {
          layer.show(el);
        });
        el.addEventListener('blur', function () {
          layer.hide();
        });
      });
  })();

  // Validasi email form kontak: sintaks ketat + blocklist domain spam/disposable
  // Sumber data: data/disposable_email_domains.txt (satu domain per baris, domain
  // registrable saja), dimuat lazy saat user mulai mengisi email. Pencocokan
  // suffix: domain apapun di bawah domain yang diblok ikut tertangkap.
  (function () {
    var CORE_SPAM_DOMAINS = [
      'mailinator.com',
      'tempmail.com',
      'temp-mail.org',
      '10minutemail.com',
      'guerrillamail.com',
      'yopmail.com',
      'throwawaymail.com',
      'getnada.com',
      'dispostable.com',
      'trashmail.com',
    ];
    var fullList = null; // Set domain lengkap (setelah fetch)

    var EMAIL_RE =
      /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/;

    var form = document.querySelector('form[action*="formspree"]');
    if (!form) return;
    var input = form.querySelector('input[type="email"]');
    var errEl = form.querySelector('.form-error');

    // Muat daftar lengkap saat email pertama kali difokuskan
    input.addEventListener('focus', function loadFullList() {
      input.removeEventListener('focus', loadFullList);
      fetch('data/disposable_email_domains.txt')
        .then(function (r) {
          return r.text();
        })
        .then(function (t) {
          fullList = new Set(t.split(/\r?\n/));
        })
        .catch(function () {
          /* fallback: pakai core list */
        });
    });

    // Cek domain dan semua suffix-nya (foo.mailinator.com -> mailinator.com)
    function inFullList(domain) {
      if (!fullList) return false;
      var labels = domain.split('.');
      for (var i = 0; i < labels.length; i++) {
        if (fullList.has(labels.slice(i).join('.'))) return true;
      }
      return false;
    }

    function isSpam(domain) {
      if (fullList) return inFullList(domain);
      return CORE_SPAM_DOMAINS.indexOf(domain) !== -1;
    }

    function showError(msg) {
      errEl.textContent = msg;
      errEl.classList.add('is-visible');
      input.style.borderColor = '#B3261E';
      input.setAttribute('aria-invalid', 'true');
    }
    function clearError() {
      errEl.classList.remove('is-visible');
      input.removeAttribute('aria-invalid');
      input.style.borderColor = '';
    }

    input.addEventListener('input', clearError);

    form.addEventListener('submit', function (e) {
      clearError();
      var email = (input.value || '').trim().toLowerCase();
      input.value = email;
      var domain = email.split('@')[1] || '';

      if (!EMAIL_RE.test(email)) {
        e.preventDefault();
        showError('Format email belum benar. Coba periksa lagi ya!');
        input.focus();
        return;
      }
      if (isSpam(domain)) {
        e.preventDefault();
        showError('Email sekali pakai tidak diterima. Pakai email aktif kamu ya!');
        input.focus();
      }
      // lolos validasi -> form terkirim ke Formspree seperti biasa
    });
  })();

  // Toggle mode kontak telepon: chat WhatsApp <-> panggilan telepon
  (function () {
    var NUM = '+62 851-6161-8197';
    var WA_URL = 'https://wa.me/6285161618197';
    var TEL_URL = 'tel:+6285161618197';
    var WA_ICON =
      '<svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" focusable="false" style="vertical-align:-2px;margin-right:6px"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/></svg>';
    var TEL_ICON =
      '<svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" focusable="false" style="vertical-align:-2px;margin-right:6px"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';

    var link = document.querySelector('.cc-wa');
    var btns = [].slice.call(document.querySelectorAll('.cc-mode-btn'));
    if (!link || !btns.length) return;

    var chatMode = true;
    function render() {
      link.setAttribute('href', chatMode ? WA_URL : TEL_URL);
      link.setAttribute('target', chatMode ? '_blank' : '_self');
      link.setAttribute('rel', chatMode ? 'noopener noreferrer' : '');
      link.innerHTML = (chatMode ? WA_ICON : TEL_ICON) + NUM;
      link.setAttribute('aria-label', (chatMode ? 'Chat WhatsApp: ' : 'Telepon: ') + NUM);
      btns.forEach(function (b) {
        var active = (b.getAttribute('data-mode') === 'wa') === chatMode;
        b.style.opacity = active ? '1' : '.7';
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        chatMode = b.getAttribute('data-mode') === 'wa';
        render();
      });
    });
    render();
  })();
}
