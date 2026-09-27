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
      updateGlider(activeChip);
    }

    function applySort() {
      if (!sortSelect) return;
      var mode = sortSelect.value;
      var items = Array.prototype.slice.call(row.querySelectorAll('[data-title]'));
      if (mode === 'default') {
        items.sort(function (a, b) {
          return +a.getAttribute('data-order') - +b.getAttribute('data-order');
        });
      } else {
        var mult = mode === 'za' ? -1 : 1;
        items.sort(function (a, b) {
          return (
            mult * a.getAttribute('data-title').localeCompare(b.getAttribute('data-title'), 'id')
          );
        });
      }
      for (var k = 0; k < items.length; k++) row.appendChild(items[k]);
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
