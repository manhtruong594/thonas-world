/**
 * Theme (light/dark) + cấu hình Tailwind dùng chung.
 * Nạp ngay sau Tailwind CDN, trong <head>, để áp chủ đề trước khi vẽ trang (tránh nhấp nháy).
 */
(function () {
  const STORAGE_KEY = 'ky_su_game_theme';

  function getSavedTheme() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function getInitialTheme() {
    const saved = getSavedTheme();
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      const label = theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối';
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
    });
  }

  applyTheme(getInitialTheme());

  // Cấu hình Tailwind: màu lấy từ biến CSS trong assets/css/theme.css
  const c = function (name) { return 'rgb(var(--c-' + name + ') / <alpha-value>)'; };
  window.tailwind = window.tailwind || {};
  window.tailwind.config = {
    darkMode: 'class',
    theme: {
      extend: {
        fontFamily: {
          serif: ['"Playfair Display"', '"Cinzel"', 'serif'],
          sans: ['"Be Vietnam Pro"', 'sans-serif'],
          mono: ['"JetBrains Mono"', 'monospace'],
        },
        colors: {
          heritage: {
            ink: c('ink'),
            card: c('card'),
            border: c('border'),
            gold: c('gold'),
            amber: c('amber'),
            cinnabar: c('cinnabar'),
            parchment: c('parchment'),
            muted: c('muted'),
          },
        },
      },
    },
  };

  document.addEventListener('DOMContentLoaded', function () {
    applyTheme(document.documentElement.classList.contains('light') ? 'light' : 'dark');
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
        try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* bỏ qua */ }
        applyTheme(next);
      });
    });
  });
})();
