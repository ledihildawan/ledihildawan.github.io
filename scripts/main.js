// Add your javascript here
// Don't forget to add it into respective layouts where this js file is needed

// Smooth scroll for links with hashes
$('a.smooth-scroll')
.click(function(event) {
  // On-page links
  if (
    location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') 
    && 
    location.hostname == this.hostname
  ) {
    // Figure out element to scroll to
    var target = $(this.hash);
    target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
    // Does a scroll target exist?
    if (target.length) {
      // Only prevent default if animation is actually gonna happen
      event.preventDefault();
      $('html, body').animate({
        scrollTop: target.offset().top
      }, 1000, function() {
        // Callback after animation
        // Must change focus!
        var $target = $(target);
        $target.focus();
        if ($target.is(":focus")) { // Checking if the target was focused
          return false;
        } else {
          $target.attr('tabindex','-1'); // Adding tabindex for elements not focusable
          $target.focus(); // Set focus again
        };
      });
    }
  }
});

// Lazy load background images
if ('IntersectionObserver' in window) {
  var lazyBgObserver = new IntersectionObserver(function(entries, observer) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        var dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        var bg = (dark && el.getAttribute('data-bg-dark')) || el.getAttribute('data-bg');
        if (bg) {
          el.style.backgroundImage = 'url(' + bg + ')';
        }
        observer.unobserve(el);
      }
    });
  });
  document.querySelectorAll('.lazy-bg').forEach(function(el) {
    lazyBgObserver.observe(el);
  });
} else {
  document.querySelectorAll('.lazy-bg').forEach(function(el) {
    var bg = el.getAttribute('data-bg');
    if (bg) el.style.backgroundImage = 'url(' + bg + ')';
  });
}

// Tooltips: render in <body> (not clipped by hero overflow:hidden);
// social tooltips get their brand color via a custom template class
$('[data-toggle="tooltip"], [rel="tooltip"]').tooltip('dispose').each(function () {
  var net = (this.className.match(/cc-(github|linkedin|twitter|instagram|threads)/) || [])[1];
  $(this).tooltip({
    container: 'body',
    template: '<div class="tooltip' + (net ? ' cc-' + net + '-tip' : '') + '" role="tooltip"><div class="arrow"></div><div class="tooltip-inner"></div></div>'
  });
});
