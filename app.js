const CAT_COLORS = {
  'Rust':     '#f97316',
  '算法':     '#22c55e',
  '其他语言': '#06b6d4',
  'AI':       '#8b5cf6',
  '杂记':     '#ec4899',
  'default':  '#6366f1',
};

function catColor(name) {
  return CAT_COLORS[name] || CAT_COLORS['default'];
}

// ─── Typing animation ─────────────────────────────────────────────────────
const PHRASES = [
  '写代码，写思想',
  'Build in Rust 🦀',
  '每次学习都是迭代',
  'Think. Code. Iterate.',
];
let phraseIdx = 0, charIdx = 0, deleting = false;
const typingEl = document.getElementById('typing-text');

function tick() {
  const phrase = PHRASES[phraseIdx];
  if (!deleting) {
    typingEl.textContent = phrase.slice(0, ++charIdx);
    if (charIdx === phrase.length) { deleting = true; setTimeout(tick, 1800); return; }
  } else {
    typingEl.textContent = phrase.slice(0, --charIdx);
    if (charIdx === 0) { deleting = false; phraseIdx = (phraseIdx + 1) % PHRASES.length; }
  }
  setTimeout(tick, deleting ? 40 : 80);
}
tick();

// ─── Theme ────────────────────────────────────────────────────────────────
const html = document.documentElement;
const themeBtn = document.getElementById('themeBtn');
let theme = localStorage.getItem('theme') || 'dark';

function applyTheme(t) {
  html.dataset.theme = t;
  themeBtn.textContent = t === 'dark' ? '🌙' : '☀️';
  localStorage.setItem('theme', t);
}
applyTheme(theme);
themeBtn.addEventListener('click', () => {
  theme = theme === 'dark' ? 'light' : 'dark';
  applyTheme(theme);
});

// ─── State ────────────────────────────────────────────────────────────────
let allPosts = [];
let activeCategory = 'all';
let searchQuery = '';

// ─── Scroll Observer ──────────────────────────────────────────────────────
const observerOptions = {
  root: null,
  rootMargin: '40px',
  threshold: 0.05
};

const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      // Remove transition delay after animation completes to not affect hover
      setTimeout(() => {
        entry.target.style.transitionDelay = '0s';
      }, 600);
      obs.unobserve(entry.target);
    }
  });
}, observerOptions);

// ─── Fetch posts ──────────────────────────────────────────────────────────
async function loadPosts() {
  try {
    const res = await fetch('/api/posts');
    const data = await res.json();
    allPosts = data.posts || [];
    updateStats();
    renderCategoryChips();
    renderCards();
  } catch (e) {
    document.getElementById('loadingState').innerHTML =
      '<h3>无法加载文章</h3><p>请确认后端服务正在运行（http://localhost:3000）</p>';
  }
}

// ─── Stats ────────────────────────────────────────────────────────────────
function updateStats() {
  const cats = new Set(allPosts.map(p => p.category)).size;
  const hours = Math.ceil(allPosts.reduce((s, p) => s + p.read_minutes, 0) / 60);
  animateNum('stat-posts', allPosts.length);
  animateNum('stat-categories', cats);
  animateNum('stat-hours', hours);
}

function animateNum(id, target) {
  const el = document.getElementById(id);
  let cur = 0;
  const step = Math.ceil(target / 30);
  const timer = setInterval(() => {
    cur = Math.min(cur + step, target);
    el.textContent = cur;
    if (cur >= target) clearInterval(timer);
  }, 30);
}

// ─── Category chips ───────────────────────────────────────────────────────
function renderCategoryChips() {
  const cats = ['all', ...new Set(allPosts.map(p => p.category))];
  const container = document.getElementById('catChips');
  container.innerHTML = '';
  cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'cat-chip' + (cat === activeCategory ? ' active' : '');
    btn.textContent = cat === 'all' ? '全部' : cat;
    btn.dataset.cat = cat;
    btn.addEventListener('click', () => {
      activeCategory = cat;
      document.querySelectorAll('.cat-chip').forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
      renderCards();
    });
    container.appendChild(btn);
  });
}

// ─── Filter ───────────────────────────────────────────────────────────────
function filteredPosts() {
  return allPosts.filter(p => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q ||
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });
}

// ─── Render cards ─────────────────────────────────────────────────────────
function renderCards() {
  const grid = document.getElementById('postsGrid');
  const posts = filteredPosts();

  document.getElementById('resultCount').textContent =
    posts.length ? `${posts.length} 篇` : '';

  if (!posts.length) {
    grid.innerHTML = '<div class="empty-state"><h3>没有找到匹配的文章</h3><p>换个关键词试试？</p></div>';
    return;
  }

  grid.innerHTML = posts.map((p, i) => {
    const color = catColor(p.category);
    const tags = p.tags.slice(0, 3).map(t => `<span class="tag">#${t}</span>`).join('');
    return `
    <a class="post-card" href="/post/${p.slug}">
      <div class="card-banner" style="background: linear-gradient(90deg, ${color}, ${color}88)"></div>
      <div class="card-body">
        <div class="card-meta">
          <span class="category-badge" style="background:${color}">${p.category}</span>
          <span class="read-time">☕ ${p.read_minutes} min</span>
        </div>
        <h3 class="card-title">${p.title}</h3>
        <p class="card-desc">${p.description}</p>
      </div>
      <div class="card-footer">
        <span class="card-date">${p.date}</span>
        <div class="card-tags">${tags}</div>
      </div>
    </a>`;
  }).join('');

  // Observe newly added cards for scroll animations
  document.querySelectorAll('.post-card').forEach((card, index) => {
    // Add staggered delay for the initial batch of cards
    if (index < 12) card.style.transitionDelay = `${index * 40}ms`;
    observer.observe(card);
  });
}

// ─── Search ───────────────────────────────────────────────────────────────
document.getElementById('searchInput').addEventListener('input', e => {
  searchQuery = e.target.value;
  renderCards();
});

// ─── Navigate to post ────────────────────────────────────────────────────
// Cards use <a href="/post/:slug"> — Rust backend serves the post HTML directly.

// ─── Init ─────────────────────────────────────────────────────────────────
loadPosts();
