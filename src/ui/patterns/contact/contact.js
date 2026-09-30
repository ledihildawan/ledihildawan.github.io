export function initContactForm() {
  // ===== Highlight input-group saat fokus & klik addon =====
  document.querySelectorAll('.input-group').forEach(function (group) {
    const input = group.querySelector('.form-control');
    const addon = group.querySelector('.input-group-addon');
    if (!input) return;

    input.addEventListener('focus', function () {
      group.classList.add('input-group-focus');
    });
    input.addEventListener('blur', function () {
      group.classList.remove('input-group-focus');
    });

    if (addon) {
      addon.style.cursor = 'text';
      addon.addEventListener('click', function () {
        input.focus();
      });
    }
  });

  // ===== Auto-resize untuk textarea pesan kontak =====
  const textareas = document.querySelectorAll('textarea[data-auto-resize]');
  textareas.forEach((textarea) => {
    const resize = () => {
      // Reset height to auto untuk mendapatkan scrollHeight yang akurat saat baris dihapus
      textarea.style.height = 'auto';
      const targetHeight = Math.min(Math.max(textarea.scrollHeight, 90), 380);
      textarea.style.height = `${targetHeight}px`;
      textarea.style.overflowY = textarea.scrollHeight > 380 ? 'auto' : 'hidden';
    };

    textarea.addEventListener('input', resize);
    window.addEventListener('resize', resize, { passive: true });
    // Inisialisasi awal
    resize();
  });
}
