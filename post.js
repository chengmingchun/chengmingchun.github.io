// ─── Theme (persist from index) ───────────────────────────────────────────
const html = document.documentElement;
const saved = localStorage.getItem('theme') || 'dark';
html.dataset.theme = saved;

// ─── Reading progress bar ─────────────────────────────────────────────────
const bar = document.getElementById('reading-progress');
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const total = document.body.scrollHeight - window.innerHeight;
  bar.style.width = total > 0 ? (scrolled / total * 100) + '%' : '0%';
}, { passive: true });

// ─── Build Table of Contents ──────────────────────────────────────────────
function buildTOC() {
  const content = document.getElementById('post-content');
  const tocNav = document.getElementById('toc-nav');
  if (!content || !tocNav) return;

  const headings = content.querySelectorAll('h2, h3');
  if (!headings.length) {
    document.getElementById('toc').style.display = 'none';
    return;
  }

  headings.forEach((h, i) => {
    if (!h.id) h.id = `heading-${i}`;
    const a = document.createElement('a');
    a.href = `#${h.id}`;
    a.textContent = h.textContent;
    a.className = h.tagName === 'H3' ? 'toc-h3' : '';
    a.addEventListener('click', e => {
      e.preventDefault();
      h.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    tocNav.appendChild(a);
  });
}

// ─── TOC active highlight on scroll ──────────────────────────────────────
function setupTOCHighlight() {
  const links = document.querySelectorAll('#toc-nav a');
  const headings = Array.from(document.querySelectorAll('.markdown-body h2, .markdown-body h3'));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(l => l.classList.toggle('active', l.hash === `#${id}`));
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  headings.forEach(h => observer.observe(h));
}

// ─── Category colour (mirrors app.js) ─────────────────────────────────────
const CAT_COLORS = {
  'Rust': '#f97316', '算法': '#22c55e', '前端': '#06b6d4',
  'Backend': '#a855f7', '系统': '#ec4899', 'default': '#6366f1',
};

function applyCategoryColor() {
  const badge = document.querySelector('.category-badge');
  if (!badge) return;
  const color = CAT_COLORS[badge.textContent.trim()] || CAT_COLORS.default;
  document.documentElement.style.setProperty('--cat-color', color);
  badge.style.background = color;
  // tint progress bar to category color
  bar.style.background = `linear-gradient(90deg, ${color}, #6366f1, #06b6d4)`;
}

// ─── Smooth scroll for anchor links ──────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});

// ─── Category Tree ────────────────────────────────────────────────────────
async function buildTree() {
  const treeNav = document.getElementById('tree-nav');
  if (!treeNav) return;
  try {
    const res = await fetch('/api/posts');
    const data = await res.json();
    const posts = data.posts || [];
    
    const byCat = {};
    posts.forEach(p => {
      if (!byCat[p.category]) byCat[p.category] = [];
      byCat[p.category].push(p);
    });
    
    let openState = {};
    try {
      openState = JSON.parse(localStorage.getItem('tree_open_cats') || '{}');
    } catch(e) {}

    let html = '';
    const currentSlug = window.location.pathname.replace(/\/$/, '').split('/').pop();
    
    for (const cat of Object.keys(byCat).sort()) {
      let catHtml = '';
      let hasActive = false;
      byCat[cat].forEach(p => {
        const isActive = p.slug === currentSlug;
        if (isActive) hasActive = true;
        catHtml += `<a href="/post/${p.slug}" class="tree-item ${isActive ? 'active' : ''}">${p.title}</a>`;
      });
      const isOpen = hasActive || openState[cat];
      html += `
        <details class="tree-group" data-cat="${cat}" ${isOpen ? 'open' : ''}>
          <summary class="tree-cat">${cat}</summary>
          <div class="tree-items">${catHtml}</div>
        </details>
      `;
    }
    treeNav.innerHTML = html;

    // Persist user interaction
    document.querySelectorAll('.tree-group').forEach(el => {
      el.addEventListener('toggle', () => {
        const catName = el.getAttribute('data-cat');
        openState[catName] = el.open;
        localStorage.setItem('tree_open_cats', JSON.stringify(openState));
      });
    });
  } catch(e) {
    console.error('Failed to load category tree:', e);
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────
buildTree();
buildTOC();
setupTOCHighlight();
applyCategoryColor();
