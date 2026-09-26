// ==========================================================================
// MASTER JS ENTRY POINT (Vite 8 ESM Bundler)
// ==========================================================================

import { initSmoothScroll } from './primitives/smooth-scroll.js';
import { initTooltips } from './primitives/tooltips.js';
import { initPopovers } from './primitives/popovers.js';
import { initHeader } from './patterns/navbar/navbar.js';
import { initPortfolioTabs } from './patterns/portfolio/portfolio.js';
import { initContactForm } from './patterns/contact/contact.js';

function initApp() {
  initSmoothScroll();
  initHeader();
  initPortfolioTabs();
  initContactForm();
  initTooltips();
  initPopovers();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
