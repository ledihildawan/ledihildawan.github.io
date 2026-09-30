import { createFloatingLayer } from './floating.js';
import { createGlider } from './glider.js';

export function initPopovers() {
  // ===== Popover Preview Kontribusi Proyek (Experience Rich Hover & Tap) =====
  (function () {
    var chips = Array.prototype.slice.call(
      document.querySelectorAll(
        '.cc-project-avatar[data-project-title], .cc-shipped-chip[data-project-title]'
      )
    );
    if (!chips.length) return;

    // Glider ring (createGlider base): mengikuti hover avatar, pulang ke
    // avatar popover-nya terbuka, sembunyi saat tidak ada yang aktif.
    var stackGliders = new Map(); // stack -> { comp, glider } (cache referensi)
    function gliderFor(chip) {
      var stack = chip.closest('.cc-avatar-stack');
      if (!stack) return null;
      if (!stackGliders.has(stack)) {
        var comp = createGlider(stack, 'avatar-glider');
        stackGliders.set(stack, { comp: comp, glider: comp.el });
      }
      return stackGliders.get(stack).comp;
    }
    function moveRing(chip) {
      var comp = gliderFor(chip);
      if (!comp) return;
      /* Guard race event: mouseenter bisa datang terlambat (coalesced)
         SETELAH mouseleave stack menyala. Cek posisi pointer riil via
         :hover - kalau pointer tidak ada di stack atau popover, ring tetap sembunyi. */
      var stack = chip.closest('.cc-avatar-stack');
      /* Tetap aktif bila pointer di atas stack ATAU di atas kartu popover */
      if (!(stack && (stack.matches(':hover') || popover.matches(':hover')))) {
        comp.hide();
        return;
      }
      comp.move(chip, {
        left: chip.offsetLeft - 4,
        top: chip.offsetTop - 4,
        width: chip.offsetWidth + 8,
        height: chip.offsetHeight + 8,
      });
    }

    var popover = document.createElement('div');
    popover.id = 'cc-project-popover';
    popover.className = 'cc-project-popover';
    popover.setAttribute('role', 'dialog');
    popover.setAttribute('aria-modal', 'false');
    popover.setAttribute('aria-hidden', 'true');
    popover.setAttribute('tabindex', '-1');

    popover.innerHTML = [
      '<div class="cc-popover-media">',
      '  <img class="cc-popover-img" src="" alt="" loading="lazy" width="640" height="360" />',
      '  <span class="cc-popover-category"></span>',
      '  <button type="button" class="cc-popover-close" aria-label="Tutup preview">✕</button>',
      '</div>',
      '<div class="cc-popover-body">',
      '  <div class="cc-popover-header">',
      '    <h4 class="cc-popover-title"></h4>',
      '    <span class="cc-popover-status"></span>',
      '  </div>',
      '  <p class="cc-popover-desc"></p>',
      '  <div class="cc-popover-stack-wrap">',
      '    <span class="cc-popover-stack-label">Stack:</span>',
      '    <div class="cc-popover-stack-chips"></div>',
      '  </div>',
      '  <div class="cc-popover-footer">',
      '    <a class="cc-popover-link" href="#" target="_blank" rel="noopener noreferrer" style="display:none">',
      '      <span>Kunjungi Proyek</span>',
      '      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
      '    </a>',
      '    <span class="cc-popover-restricted-badge">',
      '      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
      '      <span class="cc-popover-access-text">Akses Terbatas</span>',
      '    </span>',
      '  </div>',
      '</div>',
    ].join('');

    document.body.appendChild(popover);

    var imgEl = popover.querySelector('.cc-popover-img');
    var catEl = popover.querySelector('.cc-popover-category');
    var closeBtn = popover.querySelector('.cc-popover-close');
    var titleEl = popover.querySelector('.cc-popover-title');
    var statusEl = popover.querySelector('.cc-popover-status');
    var descEl = popover.querySelector('.cc-popover-desc');
    var stackContainer = popover.querySelector('.cc-popover-stack-chips');
    var linkEl = popover.querySelector('.cc-popover-link');
    var accessBadge = popover.querySelector('.cc-popover-restricted-badge');
    var accessText = popover.querySelector('.cc-popover-access-text');

    var showTimer = null;
    var lastStack = null;

    // Floating layer base: lifecycle show/hide/grace period/dismiss
    // terpusat di primitives/floating.js (scroll/resize = reposition,
    // klik luar & Escape = tutup)
    var layer = createFloatingLayer({
      el: popover,
      visibleClass: 'is-visible',
      hideDelay: 300,
      onShow: function () {
        popover.setAttribute('aria-hidden', 'false');
      },
      onHide: function (chip) {
        popover.setAttribute('aria-hidden', 'true');
        /* onHide jalan di SEMUA jalur tutup (wrapper/dismiss/Escape/scheduled)
           dan menerima chip aktif terakhir — is-active & ring dibersihkan di
           sini agar tidak nyangkut */
        if (chip) {
          chip.classList.remove('is-active');
          var comp = gliderFor(chip);
          if (comp) comp.hide();
        }
      },
      position: function (chip, pop) {
        updatePosition(chip, pop);
      },
      dismissOutsideClick: true,
      dismissEscape: true,
    });

    function updatePosition(chip, pop) {
      if (!chip) return;
      popover = pop || popover;
      var rect = chip.getBoundingClientRect();
      var popWidth = popover.offsetWidth || 320;
      var popHeight = popover.offsetHeight || 340;
      var margin = 12;

      // Horizontal centering relative to chip, clamped within viewport
      var left = rect.left + rect.width / 2 - popWidth / 2;
      left = Math.max(margin, Math.min(window.innerWidth - popWidth - margin, left));

      // Vertical positioning: default above chip, flip below if not enough space
      var top = rect.top - popHeight - 10;
      if (top < margin) {
        top = rect.bottom + 10;
      }
      if (top + popHeight > window.innerHeight - margin) {
        top = Math.max(margin, window.innerHeight - popHeight - margin);
      }

      popover.style.left = Math.round(left) + 'px';
      popover.style.top = Math.round(top) + 'px';
    }

    function show(chip) {
      clearTimeout(showTimer);
      layer.cancelHide();

      var prev = layer.current();
      if (prev && prev !== chip) prev.classList.remove('is-active');
      chip.classList.add('is-active');
      lastStack = chip.closest('.cc-avatar-stack');
      moveRing(chip);

      // Populate data
      var title = chip.getAttribute('data-project-title') || '';
      var category = chip.getAttribute('data-project-category') || 'Project';
      var status = chip.getAttribute('data-project-status') || '';
      var statusType = chip.getAttribute('data-project-status-type') || 'internal';
      var img = chip.getAttribute('data-project-img') || '';
      var desc = chip.getAttribute('data-project-desc') || '';
      var stack = (chip.getAttribute('data-project-stack') || '')
        .split(',')
        .map(function (s) {
          return s.trim();
        })
        .filter(Boolean);
      var url = chip.getAttribute('data-project-url') || '';
      var access = chip.getAttribute('data-project-access') || 'Akses Terbatas';

      titleEl.textContent = title;
      catEl.textContent = category;
      descEl.textContent = desc;

      imgEl.src = img;
      imgEl.alt = 'Preview ' + title;

      statusEl.className = 'cc-popover-status status-' + statusType;
      statusEl.textContent = status;

      // Render stack tags
      stackContainer.innerHTML = '';
      stack.forEach(function (tech) {
        var badge = document.createElement('span');
        badge.className = 'cc-popover-tech-badge';
        badge.textContent = tech;
        stackContainer.appendChild(badge);
      });

      // Link / Access
      if (url) {
        linkEl.href = url;
        linkEl.style.display = 'inline-flex';
        accessBadge.style.display = 'none';
      } else {
        linkEl.style.display = 'none';
        accessBadge.style.display = 'inline-flex';
        accessText.textContent = access;
      }

      layer.show(chip);
    }

    function hide() {
      layer.hide();
    }

    // Event handlers per chip
    chips.forEach(function (chip) {
      // Hover desktop
      chip.addEventListener('mouseenter', function () {
        layer.cancelHide();
        moveRing(chip);
        showTimer = setTimeout(function () {
          show(chip);
        }, 120);
      });

      chip.addEventListener('mouseleave', function () {
        clearTimeout(showTimer);
        layer.scheduleHide();
      });

      // Click / Tap toggle
      chip.addEventListener('click', function (e) {
        e.stopPropagation();
        if (layer.isOpen() && layer.current() === chip) {
          hide();
        } else {
          show(chip);
        }
      });

      // Accessibility keyboard support (Enter or Space to open)
      chip.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (layer.isOpen() && layer.current() === chip) {
            hide();
          } else {
            show(chip);
          }
        } else if (e.key === 'Escape') {
          hide();
        }
      });
    });

    // Hover popover card: batalkan hide saat pointer masuk ke dalam kartu popover
    popover.addEventListener('mouseenter', function () {
      layer.cancelHide();
      var activeChip = layer.current();
      if (activeChip) moveRing(activeChip);
    });

    popover.addEventListener('mouseleave', function () {
      layer.scheduleHide(250);
    });

    /* Watchdog 100ms + reconciler mousemove: mouseleave boundary events bisa
       tidak tereksekusi saat hover secepat kilang (coalescing).
       outsideSince melacak durasi pointer di luar stack & popover — jika melebihi
       grace period (300ms), popover ditutup tanpa mengganggu transisi hover. */
    var outsideSince = 0;
    setInterval(function () {
      if (
        layer.isOpen() &&
        lastStack &&
        !lastStack.matches(':hover') &&
        !popover.matches(':hover')
      ) {
        if (!outsideSince) outsideSince = Date.now();
        else if (Date.now() - outsideSince > 300) {
          clearTimeout(showTimer);
          hide();
          outsideSince = 0;
        }
      } else {
        outsideSince = 0;
      }
    }, 100);

    document.addEventListener(
      'mousemove',
      function () {
        document.querySelectorAll('.avatar-glider').forEach(function (g) {
          var stack = g.closest('.cc-avatar-stack');
          if (
            g.classList.contains('is-ready') &&
            !(stack && (stack.matches(':hover') || popover.matches(':hover')))
          ) {
            g.classList.remove('is-ready');
          }
        });
      },
      { passive: true }
    );

    // Close button
    if (closeBtn) {
      closeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        hide();
      });
    }
  })();
}
