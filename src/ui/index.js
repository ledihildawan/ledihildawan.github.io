// ==========================================================================
// MASTER JS ENTRY POINT (Vite 8 ESM Bundler)
// ==========================================================================

import { initSmoothScroll } from './primitives/smooth-scroll.js';
import { initTooltips } from './primitives/tooltips.js';
import { initPopovers } from './primitives/popovers.js';
import { initSocialShadowSnap } from './primitives/social-shadow.js';
import { initThemeToggle } from './primitives/theme-toggle.js';
import { initHeader } from './patterns/navbar/navbar.js';
import { initPortfolioTabs } from './patterns/portfolio/portfolio.js';
import { initContactForm } from './patterns/contact/contact.js';

let appInitialized = false;

function initApp() {
  // Idempoten: panggilan ganda (HMR/embed) tidak boleh membuat
  // listener & elemen glider/tooltip/popover dua kali (sumber leak klasik)
  if (appInitialized) return;
  appInitialized = true;
  initSmoothScroll();
  initThemeToggle();
  initHeader();
  initPortfolioTabs();
  initContactForm();
  initTooltips();
  initPopovers();
  initSocialShadowSnap();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
