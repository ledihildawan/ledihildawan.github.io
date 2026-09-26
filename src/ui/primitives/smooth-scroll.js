export function initSmoothScroll() {
  var reduceMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('a.smooth-scroll').forEach(function (link) {
    link.addEventListener('click', function (event) {
      var hash = link.hash;
      if (
        !hash ||
        location.pathname.replace(/^\//, '') !== link.pathname.replace(/^\//, '') ||
        location.hostname !== link.hostname
      )
        return;
      var target =
        document.querySelector(hash) || document.querySelector('[name="' + hash.slice(1) + '"]');
      if (!target) return;
      event.preventDefault();
      var doScroll = function () {
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.pageYOffset,
          behavior: reduceMotion ? 'auto' : 'smooth',
        });
        setTimeout(
          function () {
            target.focus({ preventScroll: true });
            if (document.activeElement !== target) {
              target.setAttribute('tabindex', '-1');
              target.focus({ preventScroll: true });
            }
          },
          reduceMotion ? 0 : 700
        );
      };
      if (document.documentElement.classList.contains('nav-open')) {
        var bc = document.getElementById('bodyClick');
        if (bc) bc.click();
        var scrollTop = parseInt(document.body.style.top, 10) * -1 || 0;
        window.scrollTo(0, scrollTop);
        setTimeout(doScroll, 100);
        return;
      }
      doScroll();
    });
  });
}
