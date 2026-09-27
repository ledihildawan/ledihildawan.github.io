export function initPortfolioTabs() {
  // ===== Filter + Sort portofolio (dengan Sliding Indicator Glider) =====
  // Chip filter per kategori (tanpa "Semua") + urutkan berdasarkan judul.
  // Glider dipertahankan: slide antar chip filter, GPU-accelerated.
  (function () {
    var chips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
    var row = document.getElementById('portfolio-items');
    var sortSelect = document.getElementById('portfolio-sort');
    if (!chips.length || !row) return;
    var container = chips[0].closest('.nav-pills');

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
      if (!sortSelect) return;
      var mode = sortSelect.value || 'recent';
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

    if (sortSelect) sortSelect.addEventListener('change', applySort);

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
