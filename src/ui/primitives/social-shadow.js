/**
 * Social shadow snap — pola "entrance fade, retarget snap" (sama dengan
 * tooltip: pertama tampil fade-in, pindah antar target langsung).
 *
 * Hover pertama (tidak ada tombol lain baru ditinggalkan): shadow tombol
 * fade-in normal 0.25s bersama tooltip. Hover cepat pindah antar tombol
 * (grace 300ms sejak mouseleave terakhir): transisi box-shadow dimatikan
 * sesaat — glow langsung pindah, tanpa fase dua-glow bersamaan.
 */
export function initSocialShadowSnap() {
  var container = document.querySelector('.button-container');
  if (!container) return;
  var buttons = container.querySelectorAll('.btn-icon');
  if (!buttons.length) return;

  var lastLeave = 0;
  var snapTimer = null;

  Array.prototype.forEach.call(buttons, function (btn) {
    btn.addEventListener('mouseenter', function () {
      var quick = performance.now() - lastLeave < 300;
      if (quick) {
        container.classList.add('shadow-snap');
        clearTimeout(snapTimer);
        snapTimer = setTimeout(function () {
          container.classList.remove('shadow-snap');
        }, 50);
      }
    });
    btn.addEventListener('mouseleave', function () {
      lastLeave = performance.now();
    });
  });
}
