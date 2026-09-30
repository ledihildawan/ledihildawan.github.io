export function initContactForm() {
  // ===== Highlight input-group saat fokus (pengganti now-ui-kit) =====
  document.querySelectorAll('.form-control').forEach(function (input) {
    var parent = input.parentElement;
    if (!parent || !parent.classList.contains('input-group')) return;
    input.addEventListener('focus', function () {
      parent.classList.add('input-group-focus');
    });
    input.addEventListener('blur', function () {
      parent.classList.remove('input-group-focus');
    });
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
