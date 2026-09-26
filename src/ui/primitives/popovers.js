export function initPopovers() {
  // ===== Popover Preview Kontribusi Proyek (Experience Rich Hover & Tap) =====
  (function () {
    var chips = Array.prototype.slice.call(
      document.querySelectorAll(
        '.cc-project-avatar[data-project-title], .cc-shipped-chip[data-project-title]'
      )
    );
    if (!chips.length) return;

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

    var currentChip = null;
    var showTimer = null;
    var hideTimer = null;

    function updatePosition(chip) {
      if (!chip) return;
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
      clearTimeout(hideTimer);
      clearTimeout(showTimer);

      if (currentChip && currentChip !== chip) {
        currentChip.classList.remove('is-active');
      }
      currentChip = chip;
      chip.classList.add('is-active');

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

      popover.setAttribute('aria-hidden', 'false');
      popover.classList.add('is-visible');
      updatePosition(chip);
    }

    function hide() {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      if (currentChip) {
        currentChip.classList.remove('is-active');
        currentChip = null;
      }
      popover.classList.remove('is-visible');
      popover.setAttribute('aria-hidden', 'true');
    }

    // Event handlers per chip
    chips.forEach(function (chip) {
      // Hover desktop
      chip.addEventListener('mouseenter', function () {
        clearTimeout(hideTimer);
        showTimer = setTimeout(function () {
          show(chip);
        }, 120);
      });

      chip.addEventListener('mouseleave', function () {
        clearTimeout(showTimer);
        hideTimer = setTimeout(function () {
          hide();
        }, 200);
      });

      // Click / Tap toggle
      chip.addEventListener('click', function (e) {
        e.stopPropagation();
        if (currentChip === chip && popover.classList.contains('is-visible')) {
          hide();
        } else {
          show(chip);
        }
      });

      // Accessibility keyboard support (Enter or Space to open)
      chip.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (currentChip === chip && popover.classList.contains('is-visible')) {
            hide();
          } else {
            show(chip);
          }
        } else if (e.key === 'Escape') {
          hide();
        }
      });
    });

    // Keep open when mouse is over popover itself
    popover.addEventListener('mouseenter', function () {
      clearTimeout(hideTimer);
    });

    popover.addEventListener('mouseleave', function () {
      hideTimer = setTimeout(function () {
        hide();
      }, 200);
    });

    // Close button
    if (closeBtn) {
      closeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        hide();
      });
    }

    // Global dismissals
    document.addEventListener('click', function (e) {
      if (!popover.contains(e.target)) {
        hide();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && popover.classList.contains('is-visible')) {
        hide();
      }
    });

    window.addEventListener(
      'resize',
      function () {
        if (currentChip && popover.classList.contains('is-visible')) {
          updatePosition(currentChip);
        }
      },
      { passive: true }
    );

    window.addEventListener(
      'scroll',
      function () {
        if (currentChip && popover.classList.contains('is-visible')) {
          updatePosition(currentChip);
        }
      },
      { passive: true }
    );
  })();
}
