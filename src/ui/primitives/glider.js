/**
 * Glider — indikator pill geser yang mengikuti hover dan pulang ke item aktif.
 *
 * Base component untuk nav-glider (navbar), tab-glider (chip kategori),
 * dan sort-glider (dropdown sort). Satu elemen <span> di-append ke container,
 * dipindah via transform GPU-accelerated; visual (warna/radius/blur) tetap
 * di stylesheet masing-masing pattern.
 *
 * @param {HTMLElement} container - elemen position:relative (menjadi offsetParent)
 * @param {string} className - class skin milik pattern (mis. 'nav-glider')
 * @returns {{ el: HTMLElement, move: Function, hide: Function }}
 */
export function createGlider(container, className) {
  var el = document.createElement('span');
  el.className = className;
  container.appendChild(el);
  container.classList.add('has-glider');

  var ready = false;

  /**
   * Pindahkan glider ke target.
   * @param {HTMLElement} target - elemen acuan posisi
   * @param {Object} [rect] - override geometri {left, top, width, height};
   *   tanpa override, dipakai offset rect target terhadap container
   */
  function move(target, rect) {
    if (!target) return;
    var left = rect && rect.left != null ? rect.left : target.offsetLeft;
    var top = rect && rect.top != null ? rect.top : target.offsetTop;
    var width = rect && rect.width != null ? rect.width : target.offsetWidth;
    var height = rect && rect.height != null ? rect.height : target.offsetHeight;
    el.style.transform = 'translate3d(' + left + 'px, ' + top + 'px, 0)';
    el.style.width = width + 'px';
    el.style.height = height + 'px';
    if (!ready) {
      requestAnimationFrame(function () {
        el.classList.add('is-ready');
        ready = true;
      });
    }
  }

  /** Sembunyikan glider (mis. viewport mobile / tidak ada item aktif). */
  function hide() {
    el.classList.remove('is-ready');
    ready = false;
  }

  return { el: el, move: move, hide: hide };
}
