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
}
