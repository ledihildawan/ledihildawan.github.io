/**
 * Media query helper bersama (hindari duplikasi matchMedia antar pattern).
 */

/** Perangkat punya pointer halus (mouse) — gerbang efek hover-follow. */
export function hasFinePointer() {
  return !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);
}

/** Viewport desktop navbar (breakpoint lg Bootstrap). */
export function isDesktop() {
  return window.innerWidth >= 992;
}
