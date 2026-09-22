// Add your javascript here
// Don't forget to add it into respective layouts where this js file is needed

// Smooth scroll for links with hashes
$('a.smooth-scroll')
.click(function(event) {
  // On-page links
  if (
    location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') 
    && 
    location.hostname == this.hostname
  ) {
    // Figure out element to scroll to
    var target = $(this.hash);
    target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
    // Does a scroll target exist?
    if (target.length) {
      event.preventDefault();
      
      // If menu is open, close it first, then scroll from original position
      if ($('html').hasClass('nav-open')) {
        $('html, body').stop(true);
        $('#bodyClick').trigger('click');
        // Restore scroll position before animating
        var scrollTop = parseInt(document.body.style.top) * -1 || 0;
        $('html, body').scrollTop(scrollTop);
        // Small delay to let menu close and unlock first
        setTimeout(function() {
          $('html, body').animate({
            scrollTop: target.offset().top
          }, 600);
        }, 100);
        return;
      }
      
      // Normal smooth scroll
      $('html, body').animate({
        scrollTop: target.offset().top
      }, 1000, function() {
        // Callback after animation
        // Must change focus!
        var $target = $(target);
        $target.focus();
        if ($target.is(":focus")) { // Checking if the target was focused
          return false;
        } else {
          $target.attr('tabindex','-1'); // Adding tabindex for elements not focusable
          $target.focus(); // Set focus again
        };
      });
    }
  }
});

// Tutup menu mobile ketika link navigasi diklik
$('.navbar-collapse a').on('click', function() {
  if ($('html').hasClass('nav-open')) {
    // Stop smooth scroll animation sebelum close
    $('html, body').stop(true);
    $('#bodyClick').trigger('click');
  }
});

// Scroll lock saat navbar mobile open — prevents address bar hide/show → no viewport jump
(function () {
  var scrollPosition = 0;

  function lockScroll() {
    scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = '-' + scrollPosition + 'px';
  }

  function unlockScroll() {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.top = '';
    window.scrollTo(0, scrollPosition);
  }

  // Use MutationObserver to watch nav-open class on <html>
  if (typeof MutationObserver !== 'undefined') {
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.attributeName === 'class') {
          var html = document.documentElement;
          if (html.classList.contains('nav-open')) {
            lockScroll();
          } else {
            unlockScroll();
          }
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
  }
})();

// Lazy load background images
if ('IntersectionObserver' in window) {
  var lazyBgObserver = new IntersectionObserver(function(entries, observer) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        var dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        var bg = (dark && el.getAttribute('data-bg-dark')) || el.getAttribute('data-bg');
        if (bg) {
          el.style.backgroundImage = 'url(' + bg + ')';
        }
        observer.unobserve(el);
      }
    });
  });
  document.querySelectorAll('.lazy-bg').forEach(function(el) {
    lazyBgObserver.observe(el);
  });
} else {
  document.querySelectorAll('.lazy-bg').forEach(function(el) {
    var bg = el.getAttribute('data-bg');
    if (bg) el.style.backgroundImage = 'url(' + bg + ')';
  });
}

// Tooltips: render in <body> (not clipped by hero overflow:hidden);
// social tooltips get their brand color via a custom template class
$('[data-toggle="tooltip"], [rel="tooltip"]').tooltip('dispose').each(function () {
  var net = (this.className.match(/cc-(github|linkedin|twitter|instagram|threads)/) || [])[1];
  $(this).tooltip({
    container: 'body',
    template: '<div class="tooltip' + (net ? ' cc-' + net + '-tip' : '') + '" role="tooltip"><div class="arrow"></div><div class="tooltip-inner"></div></div>'
  });
});

// Validasi email form kontak: sintaks ketat + blocklist domain spam/disposable
// Sumber data: data/disposable_email_domains.json (125 ribu domain), dimuat
// lazy saat user mulai mengisi email supaya tidak membebani initial load.
(function () {
  var CORE_SPAM_DOMAINS = [
    'mailinator.com', 'tempmail.com', 'temp-mail.org', '10minutemail.com', 'guerrillamail.com',
    'yopmail.com', 'throwawaymail.com', 'getnada.com', 'dispostable.com', 'trashmail.com'
  ];
  var fullList = null; // Set domain lengkap (setelah fetch)

  var EMAIL_RE = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/;

  var form = document.querySelector('form[action*="formspree"]');
  if (!form) return;
  var input = form.querySelector('input[type="email"]');
  var errEl = form.querySelector('.form-error');

  // Muat daftar lengkap saat email pertama kali difokuskan
  input.addEventListener('focus', function loadFullList() {
    input.removeEventListener('focus', loadFullList);
    fetch('data/disposable_email_domains.json')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        fullList = new Set(d.domains || []);
      })
      .catch(function () { /* fallback: pakai core list */ });
  });

  function isSpam(domain) {
    if (fullList) return fullList.has(domain);
    return CORE_SPAM_DOMAINS.indexOf(domain) !== -1;
  }

  function showError(msg) {
    errEl.textContent = msg;
    errEl.style.display = 'block';
    input.style.borderColor = '#B3261E';
    input.setAttribute('aria-invalid', 'true');
  }
  function clearError() {
    errEl.style.display = 'none';
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
  var WA_ICON = '<svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" focusable="false" style="vertical-align:-2px;margin-right:6px"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';
  var TEL_ICON = '<svg aria-hidden="true" viewBox="0 0 24 24" width="14" height="14" fill="currentColor" focusable="false" style="vertical-align:-2px;margin-right:8px"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>';

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
    b.addEventListener('click', function () { chatMode = b.getAttribute('data-mode') === 'wa'; render(); });
  });
  render();
})();
