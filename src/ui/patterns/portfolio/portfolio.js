import { createGlider } from '../../primitives/glider.js';
import { hasFinePointer } from '../../primitives/media.js';

export function initPortfolioTabs() {
  // ===== Filter + Sort portofolio (dengan Sliding Indicator Glider) =====
  // Chip filter per kategori (tanpa "Semua") + urutkan berdasarkan judul.
  // Glider dipertahankan: slide antar chip filter, GPU-accelerated.
  (function () {
    var chips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
    var row = document.getElementById('portfolio-items');
    var dropdown = document.querySelector('[data-sort-dropdown]');
    if (!chips.length || !row) return;
    var container = chips[0].closest('.nav-pills');
    var currentSort = 'recent';

    // Buat elemen glider background via komponen base
    var gliderComp = container ? createGlider(container, 'tab-glider') : null;

    function updateGlider(targetEl) {
      if (gliderComp && targetEl) gliderComp.move(targetEl);
    }

    var activeChip = chips[0];

    function applyFilter() {
      var category = activeChip.getAttribute('data-filter');
      var items = row.querySelectorAll('[data-category]');
      for (var i = 0; i < items.length; i++) {
        items[i].hidden = items[i].getAttribute('data-category') !== category;
      }
      for (var j = 0; j < chips.length; j++) {
        var isActive = chips[j] === activeChip;
        chips[j].classList.toggle('active', isActive);
        chips[j].setAttribute('aria-pressed', isActive ? 'true' : 'false');
      }
      if (!isHovering) updateGlider(activeChip);
    }

    function applySort() {
      var mode = currentSort;
      var items = Array.prototype.slice.call(row.querySelectorAll('[data-title]'));
      var byOrderAsc = function (a, b) {
        return +a.getAttribute('data-order') - +b.getAttribute('data-order');
      };
      var byOrderDesc = function (a, b) {
        return +b.getAttribute('data-order') - +a.getAttribute('data-order');
      };
      var byMode = mode === 'popular' ? byOrderAsc : byOrderDesc;
      // Pinned: item featured SELALU teratas (dalam mode sort apa pun),
      // sisanya diurutkan mengikuti mode yang dipilih
      var featured = [];
      var rest = [];
      for (var s = 0; s < items.length; s++) {
        if (items[s].getAttribute('data-featured') === 'true') featured.push(items[s]);
        else rest.push(items[s]);
      }
      featured.sort(byMode);
      rest.sort(byMode);
      var ordered = featured.concat(rest);
      for (var k = 0; k < ordered.length; k++) row.appendChild(ordered[k]);
    }

    for (var c = 0; c < chips.length; c++) {
      (function (chip) {
        chip.addEventListener('click', function () {
          if (chip === activeChip) return;
          activeChip = chip;
          applyFilter();
        });
      })(chips[c]);
    }

    // ===== Sort dropdown component =====
    if (dropdown) {
      var trigger = dropdown.querySelector('.sort-trigger');
      var menu = dropdown.querySelector('.sort-menu');
      var label = dropdown.querySelector('[data-sort-label]');
      var options = Array.prototype.slice.call(dropdown.querySelectorAll('.sort-option'));

      // glider vertikal: slide mengikuti hover, pulang ke opsi terpilih
      var sortGliderComp = null;
      if (menu) {
        sortGliderComp = createGlider(menu, 'sort-glider');
      }

      function updateSortGlider(option) {
        // menu position:absolute → offsetParent opsi adalah menu,
        // offset rect = geometri persis mengikuti item
        if (sortGliderComp && option) sortGliderComp.move(option);
      }

      function gliderToSelected() {
        var selected = menu.querySelector('.is-selected') || options[0];
        if (selected) updateSortGlider(selected);
      }

      function openMenu() {
        menu.hidden = false;
        trigger.setAttribute('aria-expanded', 'true');
        dropdown.classList.add('is-open');
        var selected = menu.querySelector('.is-selected') || options[0];
        if (selected) {
          selected.focus();
          requestAnimationFrame(function () {
            // display:none->block membuat Chrome menganggap computed style
            // glider ter-reset (none): tanpa ini, buka menu memicu transisi
            // "menuju selected" yang terlihat. Posisikan instan sekali frame.
            var gl = sortGliderComp && sortGliderComp.el;
            if (gl) {
              var prev = gl.style.transition;
              gl.style.transition = 'none';
              updateSortGlider(selected);
              void gl.offsetWidth;
              gl.style.transition = prev;
            } else {
              updateSortGlider(selected);
            }
          });
        }
      }

      function closeMenu() {
        menu.hidden = true;
        // buka berikutnya instan — animasi masuk hanya untuk buka pertama
        menu.classList.add('is-opened-once');
        trigger.setAttribute('aria-expanded', 'false');
        dropdown.classList.remove('is-open');
      }

      function isOpen() {
        return !menu.hidden;
      }

      function selectOption(option) {
        options.forEach(function (o) {
          var on = o === option;
          o.classList.toggle('is-selected', on);
          o.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        if (label) label.textContent = option.textContent.trim();
        currentSort = option.getAttribute('data-value');
        gliderToSelected();
        closeMenu();
        trigger.focus();
        applySort();
      }

      trigger.addEventListener('click', function () {
        isOpen() ? closeMenu() : openMenu();
      });

      options.forEach(function (option) {
        option.addEventListener('click', function () {
          selectOption(option);
        });
        option.addEventListener('mouseenter', function () {
          updateSortGlider(option);
        });
        option.addEventListener('focus', function () {
          updateSortGlider(option);
        });
        option.addEventListener('keydown', function (e) {
          var idx = options.indexOf(option);
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            options[(idx + 1) % options.length].focus();
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            options[(idx - 1 + options.length) % options.length].focus();
          } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectOption(option);
          }
        });
      });

      menu.addEventListener('mouseleave', function () {
        gliderToSelected();
      });

      document.addEventListener('click', function (e) {
        if (isOpen() && !dropdown.contains(e.target)) closeMenu();
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isOpen()) {
          closeMenu();
          trigger.focus();
        }
      });
    }

    // Effek hover: glider mengikuti chip yang di-hover, kembali ke chip
    // aktif saat mouse keluar dari SELURUH grup chip (pola navbar) —
    // menyusur gap antar chip tidak memicu lompatan
    var canHover = hasFinePointer();
    var isHovering = false;
    if (canHover && container) {
      for (var h = 0; h < chips.length; h++) {
        (function (chip) {
          chip.addEventListener('mouseenter', function () {
            isHovering = true;
            updateGlider(chip);
          });
        })(chips[h]);
      }
      container.addEventListener('mouseenter', function () {
        // selama hover-preview: chip aktif ditampilkan normal (muted)
        container.classList.add('is-hovering');
      });
      container.addEventListener('mouseleave', function () {
        isHovering = false;
        container.classList.remove('is-hovering');
        updateGlider(activeChip);
      });
    }

    window.addEventListener(
      'resize',
      function () {
        updateGlider(activeChip);
      },
      { passive: true }
    );

    applyFilter();
    initPortfolioModal();
  })();
}

function initPortfolioModal() {
  var row = document.getElementById('portfolio-items');
  if (!row) return;

  var modal = document.createElement('div');
  modal.id = 'portfolio-modal';
  modal.className = 'portfolio-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-hidden', 'true');
  modal.setAttribute('tabindex', '-1');

  modal.innerHTML = [
    '<div class="portfolio-modal-backdrop" aria-hidden="true"></div>',
    '<header class="portfolio-modal-header">',
    '  <button type="button" class="portfolio-modal-close portfolio-modal-overlay-close" aria-label="Tutup preview karya">',
    '    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
    '  </button>',
    '</header>',
    '<main class="portfolio-modal-main portfolio-modal-container">',
    '  <article class="portfolio-modal-card">',
    '    <div class="portfolio-modal-body">',
    '      <div class="portfolio-modal-meta">',
    '        <h2 class="portfolio-modal-title"></h2>',
    '        <span class="portfolio-modal-badge"></span>',
    '      </div>',
    '      <div class="portfolio-modal-media">',
    '        <img class="portfolio-modal-img" src="" alt="" loading="eager" />',
    '      </div>',
    '      <p class="portfolio-modal-desc"></p>',
    '      <div class="portfolio-modal-tags"></div>',
    '    </div>',
    '  </article>',
    '</main>',
  ].join('');

  document.body.appendChild(modal);

  var backdrop = modal.querySelector('.portfolio-modal-backdrop');
  var closeBtn = modal.querySelector('.portfolio-modal-close');
  var titleEl = modal.querySelector('.portfolio-modal-title');
  var badgeEl = modal.querySelector('.portfolio-modal-badge');
  var imgEl = modal.querySelector('.portfolio-modal-img');
  var descEl = modal.querySelector('.portfolio-modal-desc');
  var tagsContainer = modal.querySelector('.portfolio-modal-tags');
  var container = modal.querySelector('.portfolio-modal-main');
  var cardEl = modal.querySelector('.portfolio-modal-card');

  var lastFocusedEl = null;
  var currentItem = null;

  function checkOverflow() {
    if (!container || !cardEl) return;
    var hasOverflow = container.scrollHeight > container.clientHeight;
    cardEl.classList.toggle('has-overflow', hasOverflow);
  }

  if (container && cardEl) {
    container.addEventListener(
      'scroll',
      function () {
        var isScrolled = container.scrollTop > 0;
        cardEl.classList.toggle('is-scrolled', isScrolled);
      },
      { passive: true }
    );
  }

  imgEl.addEventListener('load', function () {
    checkOverflow();
  });

  window.addEventListener(
    'resize',
    function () {
      if (modal.classList.contains('is-visible')) {
        checkOverflow();
      }
    },
    { passive: true }
  );

  function getVisibleItems() {
    return Array.prototype.slice.call(row.querySelectorAll('.portfolio-item:not([hidden])'));
  }

  function populateData(item) {
    if (!item) return;
    currentItem = item;

    var title = item.getAttribute('data-title') || '';
    var categoryLabel =
      item.getAttribute('data-category-label') || item.getAttribute('data-category') || '';
    var desc = item.getAttribute('data-desc') || '';
    var tags = (item.getAttribute('data-tags') || '')
      .split(',')
      .map(function (t) {
        return t.trim();
      })
      .filter(Boolean);

    var img = item.querySelector('img');
    var imgSrc = img ? img.getAttribute('src') : '';
    var imgAlt = img ? img.getAttribute('alt') : title;

    titleEl.textContent = title;
    badgeEl.textContent = categoryLabel;
    descEl.textContent = desc;

    imgEl.src = imgSrc;
    imgEl.alt = imgAlt;

    tagsContainer.innerHTML = '';
    tags.forEach(function (tag) {
      var span = document.createElement('span');
      span.className = 'portfolio-modal-tag';
      span.textContent = tag;
      tagsContainer.appendChild(span);
    });

    if (container) container.scrollTop = 0;
    if (cardEl) {
      cardEl.classList.remove('is-scrolled');
    }
    requestAnimationFrame(function () {
      checkOverflow();
    });
  }

  function openModal(item) {
    lastFocusedEl = document.activeElement;
    populateData(item);

    modal.classList.add('is-visible');
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('scroll-locked');
    document.body.classList.add('portfolio-modal-open');

    closeBtn.focus();
    requestAnimationFrame(function () {
      checkOverflow();
    });
  }

  function closeModal() {
    if (!modal.classList.contains('is-visible')) return;

    modal.classList.remove('is-visible');
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('scroll-locked');
    document.body.classList.remove('portfolio-modal-open');

    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
      lastFocusedEl.focus();
    }
  }

  function navigate(delta) {
    var visibleItems = getVisibleItems();
    if (visibleItems.length <= 1) return;

    var curIdx = visibleItems.indexOf(currentItem);
    if (curIdx === -1) curIdx = 0;

    var nextIdx = (curIdx + delta + visibleItems.length) % visibleItems.length;
    populateData(visibleItems[nextIdx]);
  }

  // Event trigger pada item portfolio
  row.addEventListener('click', function (e) {
    var item = e.target.closest('.portfolio-item');
    if (!item) return;
    openModal(item);
  });

  row.addEventListener('keydown', function (e) {
    var item = e.target.closest('.portfolio-item');
    if (!item) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openModal(item);
    }
  });

  // Modal actions
  backdrop.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', closeModal);
  container.addEventListener('click', function (e) {
    if (e.target === container) {
      closeModal();
    }
  });

  // Keyboard navigation saat modal terbuka
  document.addEventListener('keydown', function (e) {
    if (!modal.classList.contains('is-visible')) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      navigate(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      navigate(1);
    } else if (e.key === 'Tab') {
      // Focus trap
      var focusable = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  });
}
