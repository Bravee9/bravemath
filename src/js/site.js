function applyInitialTheme() {
  const saved = localStorage.getItem('bravemath-theme');
  document.documentElement.classList.toggle('dark', saved === 'dark');
}

applyInitialTheme();

document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');

  menuButton?.addEventListener('click', () => {
    const isOpen = menu?.classList.toggle('open') ?? false;
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });

  menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    menu.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  }));

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('bravemath-theme', isDark ? 'dark' : 'light');
  };

  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
  document.getElementById('theme-toggle-mobile')?.addEventListener('click', toggleTheme);
});
