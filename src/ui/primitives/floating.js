/**
 * Floating layer — base untuk elemen melayang di atas halaman
 * (tooltip, popover preview). Satu elemen yang di-reposition terhadap
 * trigger; retarget antar trigger tidak merusak animasi (pola glider).
 *
 * Lifecycle: show → (opsional scheduleHide grace period) → hide
 * → (opsional removeAfterHide, elemen dibuang & dibangun ulang via build()).
 *
 * @param {Object} opts
 * @param {HTMLElement} [opts.el] - elemen layer persisten (popover)
 * @param {Function} [opts.build] - factory elemen sekali pakai (tooltip);
 *   jika diset, elemen dibangun saat show pertama & dibuang setelah hide
 * @param {number} [opts.removeAfterHide=0] - ms setelah hide sebelum elemen
 *   build() dibuang dari DOM
 * @param {string} [opts.visibleClass='is-visible']
 * @param {Function} opts.position - (target, el) => void, wajib
 * @param {Function} [opts.onShow] - (target, el) => void
 * @param {Function} [opts.onHide] - () => void
 * @param {number} [opts.hideDelay=0] - grace period default scheduleHide()
 * @param {'reposition'|'hide'} [opts.onScroll='reposition']
 * @param {boolean} [opts.dismissOutsideClick=false]
 * @param {boolean} [opts.dismissEscape=false]
 * @returns {{ el: HTMLElement, show, hide, scheduleHide, cancelHide,
 *             reposition, isOpen, current }}
 */
export function createFloatingLayer(opts) {
  var build = opts.build || null;
  var removeAfterHide = opts.removeAfterHide || 0;
  var visibleClass = opts.visibleClass || 'is-visible';
  var hideDelay = opts.hideDelay || 0;
  var position = opts.position || function () {};
  var onShow = opts.onShow || null;
  var onHide = opts.onHide || null;

  var el = opts.el || null;
  var current = null;
  var shown = false;
  var hideTimer = null;
  var removeTimer = null;

  function ensureEl() {
    if (build && !el) el = build();
    if (el && !el.parentNode) document.body.appendChild(el);
    return el;
  }

  function show(target) {
    clearTimeout(hideTimer);
    clearTimeout(removeTimer);
    var layer = ensureEl();
    if (!layer || !target) return;
    var wasShown = shown;
    position(target, layer);
    if (!wasShown) {
      shown = true;
      current = target;
      // class visible dipasang setelah paint pertama agar transisi
      // fade-in berjalan (append + class di frame yang sama = tanpa animasi)
      requestAnimationFrame(function () {
        if (shown && el) {
          el.classList.add(visibleClass);
          if (onShow) onShow(target, el);
        }
      });
    } else {
      current = target;
    }
  }

  function hide() {
    clearTimeout(hideTimer);
    if (!shown) return;
    shown = false;
    var closing = current;
    current = null;
    el.classList.remove(visibleClass);
    if (onHide) onHide(closing);
    if (build && removeAfterHide > 0) {
      var doomed = el;
      removeTimer = setTimeout(function () {
        if (doomed && doomed.parentNode) doomed.parentNode.removeChild(doomed);
        if (el === doomed) el = null;
      }, removeAfterHide);
    }
  }

  /** Grace period: panggilan show()/cancelHide() berikutnya membatalkan. */
  function scheduleHide(delay) {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, delay != null ? delay : hideDelay);
  }

  function cancelHide() {
    clearTimeout(hideTimer);
  }

  function reposition() {
    if (shown && current) position(current, el);
  }

  function onScrollResize() {
    if (opts.onScroll === 'hide') hide();
    else reposition();
  }

  window.addEventListener('resize', onScrollResize, { passive: true });
  window.addEventListener('scroll', onScrollResize, { passive: true });
  if (opts.dismissOutsideClick) {
    document.addEventListener('click', function (e) {
      if (shown && el && !el.contains(e.target)) hide();
    });
  }
  if (opts.dismissEscape) {
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && shown) hide();
    });
  }

  return {
    el: function () {
      return el;
    },
    show: show,
    hide: hide,
    scheduleHide: scheduleHide,
    cancelHide: cancelHide,
    reposition: reposition,
    isOpen: function () {
      return shown;
    },
    current: function () {
      return current;
    },
  };
}
