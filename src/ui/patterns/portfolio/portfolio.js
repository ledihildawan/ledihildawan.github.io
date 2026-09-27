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

    // Buat elemen glider background
    var glider = null;
    if (container) {
      glider = document.createElement('span');
      glider.className = 'tab-glider';
      container.appendChild(glider);
      container.classList.add('has-glider');
    }

    function updateGlider(targetEl) {
      if (!glider || !targetEl) return;
      glider.style.transform =
        'translate3d(' + targetEl.offsetLeft + 'px, ' + targetEl.offsetTop + 'px, 0)';
      glider.style.width = targetEl.offsetWidth + 'px';
      glider.style.height = targetEl.offsetHeight + 'px';
      if (!glider.classList.contains('is-ready')) {
        requestAnimationFrame(function () {
          glider.classList.add('is-ready');
        });
      }
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
      var sortGlider = null;
      if (menu) {
        sortGlider = document.createElement('span');
        sortGlider.className = 'sort-glider';
        menu.insertBefore(sortGlider, menu.firstChild);
      }

      function updateSortGlider(option) {
        if (!sortGlider || !option) return;
        // geometri persis mengikuti item: delta rect terhadap menu
        var m = menu.getBoundingClientRect();
        var o = option.getBoundingClientRect();
        sortGlider.style.top = Math.round(o.top - m.top - menu.clientTop) + 'px';
        sortGlider.style.left = Math.round(o.left - m.left - menu.clientLeft) + 'px';
        sortGlider.style.width = Math.round(o.width) + 'px';
        sortGlider.style.height = Math.round(o.height) + 'px';
        menu.classList.add('is-glider-ready');
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
            updateSortGlider(selected);
          });
        }
      }

      function closeMenu() {
        menu.hidden = true;
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
    var canHover =
      window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
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
  })();
}
