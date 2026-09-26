export function initPortfolioTabs() {
  // ===== Tab portofolio (dengan Sliding Indicator Glider) =====
  // Pola WAI-ARIA: roving tabindex + navigasi panah + sliding indicator GPU-accelerated
  (function () {
    var tabs = Array.prototype.slice.call(document.querySelectorAll('a[data-toggle="tab"]'));
    if (!tabs.length) return;
    var panes = tabs.map(function (t) {
      return document.querySelector(t.getAttribute('href'));
    });
    var container = tabs[0].closest('.nav-pills');
    if (!container) return;

    var hasFinePointer =
      window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    // Buat elemen glider background
    var glider = document.createElement('span');
    glider.className = 'tab-glider';
    container.appendChild(glider);
    container.classList.add('has-glider');

    var currentActive = tabs[0];

    function updateGlider(targetEl) {
      if (!targetEl || !glider) return;
      var item = targetEl.closest('.nav-item') || targetEl;
      var left = item.offsetLeft;
      var top = item.offsetTop;
      var width = targetEl.offsetWidth || 60;
      var height = targetEl.offsetHeight || 60;
      glider.style.transform = 'translate3d(' + left + 'px, ' + top + 'px, 0)';
      glider.style.width = width + 'px';
      glider.style.height = height + 'px';
      if (!glider.classList.contains('is-ready')) {
        requestAnimationFrame(function () {
          glider.classList.add('is-ready');
        });
      }
    }

    function activate(link, focus) {
      currentActive = link;
      tabs.forEach(function (a, i) {
        var on = a === link;
        a.classList.toggle('active', on);
        a.setAttribute('aria-selected', on ? 'true' : 'false');
        a.tabIndex = on ? 0 : -1;
        if (panes[i]) panes[i].classList.toggle('active', on);
      });
      updateGlider(link);
      if (focus) link.focus();
    }

    // Beri id + relasi aria-controls / aria-labelledby
    tabs.forEach(function (a, i) {
      if (!a.id && panes[i]) a.id = 'tab-' + panes[i].id.toLowerCase();
      if (panes[i]) {
        a.setAttribute('aria-controls', panes[i].id);
        if (!panes[i].getAttribute('aria-labelledby'))
          panes[i].setAttribute('aria-labelledby', a.id);
      }
    });

    tabs.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        activate(link, false);
      });

      link.addEventListener('keydown', function (e) {
        var i = tabs.indexOf(link);
        var n = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp')
          n = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') n = tabs[0];
        else if (e.key === 'End') n = tabs[tabs.length - 1];
        if (n) {
          e.preventDefault();
          activate(n, true);
        }
      });

      // Hover slide preview (hanya pada device dengan mouse/trackpad presisi)
      if (hasFinePointer) {
        link.addEventListener('mouseenter', function () {
          updateGlider(link);
        });
      }
    });

    if (hasFinePointer) {
      container.addEventListener('mouseleave', function () {
        if (currentActive) updateGlider(currentActive);
      });
    }

    // Sinkronkan status awal (markup punya class active)
    var initial = tabs[0];
    for (var i = 0; i < tabs.length; i++) {
      if (tabs[i].classList.contains('active')) initial = tabs[i];
    }
    activate(initial, false);

    // Recalculate saat resize / rotasi layar
    window.addEventListener('resize', function () {
      if (currentActive) updateGlider(currentActive);
    });
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(function () {
        if (currentActive) updateGlider(currentActive);
      }).observe(container);
    }
  })();
}
