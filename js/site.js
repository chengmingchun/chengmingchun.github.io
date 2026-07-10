(() => {
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('site-theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = savedTheme || (systemDark ? 'dark' : 'light');

  const themeButton = document.querySelector('[data-theme-toggle]');
  const syncThemeLabel = () => {
    if (!themeButton) return;
    const dark = root.dataset.theme === 'dark';
    themeButton.setAttribute('aria-label', dark ? '切换到浅色模式' : '切换到深色模式');
    themeButton.textContent = dark ? '☀︎' : '☾';
  };
  syncThemeLabel();

  themeButton?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('site-theme', root.dataset.theme);
    syncThemeLabel();
  });

  const menuButton = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav]');
  menuButton?.addEventListener('click', () => {
    const open = nav?.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(Boolean(open)));
  });

  document.querySelectorAll('[data-year]').forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  const search = document.querySelector('[data-post-search]');
  const cards = Array.from(document.querySelectorAll('[data-post-card]'));
  const filters = Array.from(document.querySelectorAll('[data-filter]'));
  const emptyState = document.querySelector('[data-empty-state]');
  let activeCategory = 'all';

  const applyFilters = () => {
    const query = (search?.value || '').trim().toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const category = card.dataset.category || '';
      const text = card.textContent?.toLowerCase() || '';
      const matched = (activeCategory === 'all' || category.includes(activeCategory)) && (!query || text.includes(query));
      card.hidden = !matched;
      if (matched) visible += 1;
    });
    if (emptyState) emptyState.style.display = visible ? 'none' : 'block';
  };

  search?.addEventListener('input', applyFilters);
  filters.forEach((button) => button.addEventListener('click', () => {
    activeCategory = button.dataset.filter || 'all';
    filters.forEach((item) => item.classList.toggle('is-active', item === button));
    applyFilters();
  }));

  const progress = document.querySelector('[data-reading-progress]');
  if (progress) {
    let ticking = false;
    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
      progress.style.width = `${Math.min(100, Math.max(0, ratio * 100))}%`;
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateProgress);
        ticking = true;
      }
    }, { passive: true });
    updateProgress();
  }

  document.querySelectorAll('.article-body pre').forEach((pre) => {
    const button = document.createElement('button');
    button.className = 'copy-code';
    button.type = 'button';
    button.textContent = '复制';
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(pre.innerText);
        button.textContent = '已复制';
        setTimeout(() => { button.textContent = '复制'; }, 1400);
      } catch {
        button.textContent = '复制失败';
      }
    });
    pre.appendChild(button);
  });
})();
