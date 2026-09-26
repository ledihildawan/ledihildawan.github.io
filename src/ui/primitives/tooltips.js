export function initTooltips() {
  // ===== Tooltips vanilla (pengganti Bootstrap tooltip + Popper) =====
  // Render di <body> agar tidak terpotong overflow:hidden hero; warna brand
  // via class cc-<net>-tip. Placement: top. Animasi smooth via CSS fade + transform.
  (function () {
    var tipEl = null;
    var hideTimer = null;
    function hide() {
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
      if (tipEl) {
        var current = tipEl;
        current.classList.remove('show');
        hideTimer = setTimeout(function () {
          if (current && current.parentNode) {
            current.parentNode.removeChild(current);
          }
          if (tipEl === current) tipEl = null;
        }, 200);
      }
    }
    function show(el) {
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
      if (tipEl && tipEl.parentNode) {
        tipEl.parentNode.removeChild(tipEl);
        tipEl = null;
      }
      var title = el.getAttribute('data-tooltip-title');
      if (!title) return;
      var net = (el.className.match(/cc-(github|linkedin|twitter|instagram|threads)/) || [])[1];
      tipEl = document.createElement('div');
      tipEl.className = 'tooltip bs-tooltip-top' + (net ? ' cc-' + net + '-tip' : '');
      tipEl.setAttribute('role', 'tooltip');
      var arrow = document.createElement('div');
      arrow.className = 'arrow';
      arrow.style.left = '50%';
      arrow.style.transform = 'translateX(-50%)';
      var inner = document.createElement('div');
      inner.className = 'tooltip-inner';
      inner.textContent = title;
      tipEl.appendChild(arrow);
      tipEl.appendChild(inner);
      document.body.appendChild(tipEl);
      var r = el.getBoundingClientRect();
      tipEl.style.top = r.top + window.pageYOffset - tipEl.offsetHeight - 4 + 'px';
      tipEl.style.left = r.left + window.scrollX + r.width / 2 + 'px';
      requestAnimationFrame(function () {
        if (tipEl) tipEl.classList.add('show');
      });
    }
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
          show(el);
        });
        el.addEventListener('mouseleave', hide);
        el.addEventListener('focus', function () {
          show(el);
        });
        el.addEventListener('blur', hide);
      });
    window.addEventListener('scroll', hide, { passive: true });
    window.addEventListener('resize', hide);
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
      '<svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" focusable="false" style="vertical-align:-2px;margin-right:6px"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';
    var TEL_ICON =
      '<svg aria-hidden="true" viewBox="0 0 24 24" width="14" height="14" fill="currentColor" focusable="false" style="vertical-align:-2px;margin-right:8px"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>';

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
