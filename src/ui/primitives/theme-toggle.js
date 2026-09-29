// Theme Toggle with Keyboard Shortcut
// Press 'D' key (when not in input/textarea) to toggle dark/light mode

export function initThemeToggle() {
  const STORAGE_KEY = 'lh-theme';
  const html = document.documentElement;

  // Get saved theme or detect system preference
  function getPreferredTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // Apply theme by toggling class
  function applyTheme(theme) {
    if (theme === 'dark') {
      html.classList.add('dark-mode');
    } else {
      html.classList.remove('dark-mode');
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }

  // Toggle theme
  function toggleTheme() {
    const isDark = html.classList.contains('dark-mode');
    const next = isDark ? 'light' : 'dark';
    applyTheme(next);
  }

  // Initialize
  // Live OS-switch: hanya relevan bila user belum menyimpan tema manual
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(STORAGE_KEY)) applyTheme(e.matches ? 'dark' : 'light');
  });

  const initial = getPreferredTheme();
  applyTheme(initial);

  // Keyboard shortcut: press 'D' key (not in input/textarea/contenteditable)
  document.addEventListener('keydown', (e) => {
    // Skip if typing in input fields
    const tag = e.target.tagName;
    const isEditable = e.target.isContentEditable;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || isEditable) return;

    // 'D' key to toggle dark mode
    if (e.key === 'd' || e.key === 'D') {
      toggleTheme();
    }
  });
}
