export function initHeader() {
  // 1. Mobile Menu Drawer
  // ===== Menu mobile: toggle nav-open + overlay #bodyClick (pengganti now-ui-kit) =====
  // Animasi via CSS (slide .3s + scrim fade + morph ikon); JS hanya toggle class.
  var navMenu = { visible: 0, toggle: null };
  function navMenuClose() {
    document.documentElement.classList.remove('nav-open');
    navMenu.visible = 0;
    if (navMenu.toggle) {
      navMenu.toggle.classList.remove('toggled');
      navMenu.toggle.setAttribute('aria-expanded', 'false');
    }
    var bc = document.getElementById('bodyClick');
    if (bc) {
      bc.classList.add('is-closing');
      setTimeout(function () {
        if (bc.parentNode) bc.parentNode.removeChild(bc);
      }, 300);
    }
  }
  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.navbar-toggler') : null;
    if (!btn) return;
    navMenu.toggle = btn;
    if (navMenu.visible === 1) {
      navMenuClose();
      return;
    }
    // buang sisa overlay lama (mis. close lalu cepat-cepat buka lagi)
    var old = document.getElementById('bodyClick');
    if (old) old.parentNode.removeChild(old);
    btn.classList.add('toggled');
    btn.setAttribute('aria-expanded', 'true');
    var bc = document.createElement('div');
    bc.id = 'bodyClick';
    bc.addEventListener('click', navMenuClose);
    document.body.appendChild(bc);
    document.documentElement.classList.add('nav-open');
    navMenu.visible = 1;
  });

  // 2. Auto Close Mobile Drawer on Link Click
  // ===== Tutup menu mobile ketika link navigasi diklik =====
  document.querySelectorAll('.navbar-collapse a').forEach(function (a) {
    a.addEventListener('click', function () {
      if (document.documentElement.classList.contains('nav-open')) {
        var bc = document.getElementById('bodyClick');
        if (bc) bc.click();
      }
    });
  });

  // 3. Smart Hide/Show Navbar on Scroll
  // ===== Smart Navbar: Hide on scroll down, show on scroll up, color-on-scroll =====
  (function () {
    var navbar = document.querySelector('.navbar');
    if (!navbar) return;
    var dist = parseInt(navbar.getAttribute('color-on-scroll'), 10) || 400;
    var lastScrollTop = 0;
    var delta = 6;
    var topThreshold = 50;
    var isTransparent = true;
    var isHidden = false;
    var ticking = false;

    function updateNavbar() {
      ticking = false;
      var currentScroll = window.pageYOffset || document.documentElement.scrollTop || 0;

      // Toggle background transparan vs solid berdasarkan jarak scroll dari hero
      if (currentScroll > dist) {
        if (isTransparent) {
          isTransparent = false;
          navbar.classList.remove('navbar-transparent');
        }
      } else {
        if (!isTransparent) {
          isTransparent = true;
          navbar.classList.add('navbar-transparent');
        }
      }

      // Jangan sembunyikan navbar jika menu mobile (drawer) sedang terbuka
      if (document.documentElement.classList.contains('nav-open')) {
        if (isHidden) {
          isHidden = false;
          navbar.classList.remove('navbar-hidden');
        }
        lastScrollTop = currentScroll;
        return;
      }

      // Abaikan efek rubber-band / bounce (iOS / macOS)
      if (currentScroll < 0) return;
      var maxScroll =
        (document.documentElement.scrollHeight || document.body.scrollHeight) - window.innerHeight;
      if (currentScroll > maxScroll) return;

      // Selalu tampilkan navbar ketika berada di area paling atas (hero / top)
      if (currentScroll <= topThreshold) {
        if (isHidden) {
          isHidden = false;
          navbar.classList.remove('navbar-hidden');
        }
        lastScrollTop = currentScroll;
        return;
      }

      // Cek arah scroll dengan batas toleransi delta
      if (Math.abs(currentScroll - lastScrollTop) > delta) {
        if (currentScroll > lastScrollTop) {
          // Scroll ke bawah -> sembunyikan navbar
          if (!isHidden) {
            isHidden = true;
            navbar.classList.add('navbar-hidden');
          }
        } else {
          // Scroll ke atas -> tampilkan navbar
          if (isHidden) {
            isHidden = false;
            navbar.classList.remove('navbar-hidden');
          }
        }
        lastScrollTop = currentScroll;
      }
    }

    window.addEventListener(
      'scroll',
      function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(updateNavbar);
      },
      { passive: true }
    );

    lastScrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
    updateNavbar();
  })();

  // 4. Desktop Glider & ScrollSpy
  // ===== Navbar Desktop Glider + ScrollSpy =====
  (function () {
    var navNav = document.querySelector('.navbar-expand-lg .navbar-nav');
    if (!navNav) return;

    var links = Array.prototype.slice.call(navNav.querySelectorAll('.nav-link.smooth-scroll'));
    if (!links.length) return;

    var hasFinePointer =
      window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    // Buat elemen glider
    var glider = document.createElement('span');
    glider.className = 'nav-glider';
    navNav.appendChild(glider);

    var activeLink = null;
    var isHovering = false;

    function isDesktop() {
      return window.innerWidth >= 992;
    }

    function updateGlider(targetEl) {
      if (!targetEl || !isDesktop()) {
        glider.classList.remove('is-ready');
        return;
      }
      var left = targetEl.offsetLeft;
      var width = targetEl.offsetWidth;
      var height = 36;
      var top = targetEl.offsetTop + (targetEl.offsetHeight - height) / 2;

      glider.style.transform = 'translate3d(' + left + 'px, ' + top + 'px, 0)';
      glider.style.width = width + 'px';
      glider.style.height = height + 'px';
      if (!glider.classList.contains('is-ready')) {
        requestAnimationFrame(function () {
          glider.classList.add('is-ready');
        });
      }
    }

    function setActive(link) {
      activeLink = link;
      links.forEach(function (l) {
        var on = l === link;
        l.classList.toggle('active', on);
        var parent = l.closest('.nav-item');
        if (parent) parent.classList.toggle('active', on);
      });
      if (!isHovering) {
        updateGlider(link);
      }
    }

    // Hover slide preview pada navbar desktop
    if (hasFinePointer) {
      links.forEach(function (link) {
        link.addEventListener('mouseenter', function () {
          if (!isDesktop()) return;
          isHovering = true;
          updateGlider(link);
        });
      });

      navNav.addEventListener('mouseleave', function () {
        if (!isDesktop()) return;
        isHovering = false;
        if (activeLink) {
          updateGlider(activeLink);
        } else {
          glider.classList.remove('is-ready');
        }
      });
    }

    var isManualScrolling = false;
    var manualScrollTimer = null;

    // Klik link langsung update active & glider serta kunci ScrollSpy selama animasi scroll
    links.forEach(function (link) {
      link.addEventListener('click', function () {
        setActive(link);
        isManualScrolling = true;
        if (manualScrollTimer) clearTimeout(manualScrollTimer);
        manualScrollTimer = setTimeout(function () {
          isManualScrolling = false;
        }, 800);
      });
    });

    // ScrollSpy: sinkronkan active link dengan posisi section yang sedang dibaca
    var sectionMap = links
      .map(function (link) {
        var hash = link.hash;
        var target = hash ? document.querySelector(hash) : null;
        return { link: link, target: target };
      })
      .filter(function (item) {
        return item.target !== null;
      });
    function checkScrollSpy() {
      if (isManualScrolling) return;

      var scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      var vpHeight = window.innerHeight;
      var triggerY = 160;

      var current = sectionMap.length ? sectionMap[0].link : null;
      for (var i = 0; i < sectionMap.length; i++) {
        var s = sectionMap[i];
        var rect = s.target.getBoundingClientRect();
        if (rect.top <= triggerY) {
          current = s.link;
        }
      }

      var isAtBottom = scrollY + vpHeight >= document.documentElement.scrollHeight - 40;
      if (isAtBottom && sectionMap.length) {
        current = sectionMap[sectionMap.length - 1].link;
      }

      if (current && current !== activeLink) {
        setActive(current);
      }
    }
    var spyTicking = false;
    window.addEventListener(
      'scroll',
      function () {
        if (isManualScrolling) return;
        if (spyTicking) return;
        spyTicking = true;
        requestAnimationFrame(function () {
          checkScrollSpy();
          spyTicking = false;
        });
      },
      { passive: true }
    );

    window.addEventListener('resize', function () {
      if (isDesktop() && activeLink) {
        updateGlider(activeLink);
      } else {
        glider.classList.remove('is-ready');
      }
    });

    // Inisialisasi awal
    setTimeout(function () {
      checkScrollSpy();
      if (!activeLink && sectionMap.length) setActive(sectionMap[0].link);
    }, 100);
  })();

  // Lazy load background images
  if ('IntersectionObserver' in window) {
    var lazyBgObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
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
    document.querySelectorAll('.lazy-bg').forEach(function (el) {
      lazyBgObserver.observe(el);
    });
  } else {
    document.querySelectorAll('.lazy-bg').forEach(function (el) {
      var bg = el.getAttribute('data-bg');
      if (bg) el.style.backgroundImage = 'url(' + bg + ')';
    });
  }
}
