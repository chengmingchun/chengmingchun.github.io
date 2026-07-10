const POSTS=[
  {slug:'sql-performance-playbook',title:'从 49 秒到 0.9 秒：复杂 SQL 性能排查方法论',category:'数据与性能',description:'从慢查询现象出发，沿执行计划、扫描行数、回表、排序与分页逐层收敛问题，而不是靠“加索引”碰运气。',outcome:'读完可建立一套从现象到验证的 SQL 排障流程。',tags:['MySQL','索引','执行计划'],date:'2026-07-10',read_minutes:14},
  {slug:'cloud-order-state-machine',title:'云资源订单系统：状态机、幂等、重试与补偿如何协作',category:'系统设计',description:'把异步订单从“轮询接口”还原成状态迁移系统，解释重复请求、超时、部分成功和人工介入应该落在哪一层。',outcome:'读完可画出一套可恢复、可追踪的异步订单状态模型。',tags:['状态机','幂等','补偿'],date:'2026-07-10',read_minutes:13},
  {slug:'redis-cache-consistency',title:'缓存一致性不是一道八股题：从读写竞态到工程兜底',category:'数据与性能',description:'从旧值回填、删缓存失败和主从延迟三个竞态出发，分析更新数据库后删缓存、延迟双删与订阅 binlog 的边界。',outcome:'读完能按业务容忍度选择一致性方案，而非背固定答案。',tags:['Redis','一致性','并发'],date:'2026-07-10',read_minutes:12},
  {slug:'agentic-engineering',title:'Agentic 研发系统如何收敛：任务图、证据链与质量门禁',category:'AI 工程化',description:'多 Agent 的核心不是角色数量，而是让任务分解、工具调用、产物验证和失败回退形成可检查的闭环。',outcome:'读完可设计一条不会无限对话、能够验收的 Agent 工作流。',tags:['Agent','MCP','工作流'],date:'2026-07-10',read_minutes:15},
  {slug:'javascript-async-guide',title:'Promise 与 async/await：从状态机理解异步控制流',category:'基础与算法',description:'把 Promise、微任务、异常传播和并发控制放进同一条执行链理解，并给出常见错误与可运行示例。',outcome:'读完不再把 await 理解成“简单阻塞”，能正确组织并发任务。',tags:['JavaScript','Promise','并发'],date:'2026-07-10',read_minutes:11},
  {slug:'engineering-review-method',title:'如何写一份真正有用的工程复盘',category:'工程复盘',description:'从事实、机制、防线和行动项四层重构复盘，让文档不再只是事故时间线，而能真正降低重复故障概率。',outcome:'读完可产出一份有负责人、有验收条件、能形成系统改进的复盘。',tags:['故障','可观测性','复盘'],date:'2026-07-10',read_minutes:10}
];

const CATEGORY_ORDER=['全部','系统设计','数据与性能','AI 工程化','基础与算法','工程复盘'];
const CATEGORY_COLORS={'系统设计':'#a855f7','数据与性能':'#06b6d4','AI 工程化':'#8b5cf6','基础与算法':'#22c55e','工程复盘':'#ec4899'};
let activeCategory='全部';
let searchQuery='';

function create(tag,className,text){
  const node=document.createElement(tag);
  if(className)node.className=className;
  if(text!==undefined)node.textContent=text;
  return node;
}

function initTheme(){
  const root=document.documentElement;
  const button=document.getElementById('themeBtn');
  const current=root.dataset.theme||'dark';
  if(button)button.textContent=current==='dark'?'🌙':'☀️';
  button?.addEventListener('click',()=>{
    const next=root.dataset.theme==='dark'?'light':'dark';
    root.dataset.theme=next;
    button.textContent=next==='dark'?'🌙':'☀️';
    try{localStorage.setItem('theme',next)}catch(e){}
  });
}

function initHeroTyping(){
  const target=document.getElementById('typing-text');
  if(!target)return;
  const text='Think. Code. Iterate.';
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){target.textContent=text;return;}
  target.textContent='';
  let index=0;
  const type=()=>{
    target.textContent=text.slice(0,++index);
    if(index<text.length)setTimeout(type,index<7?74:54);
  };
  requestAnimationFrame(type);
}

function renderStats(){
  const categories=new Set(POSTS.map(post=>post.category));
  const minutes=POSTS.reduce((sum,post)=>sum+post.read_minutes,0);
  const values={'stat-posts':POSTS.length,'stat-categories':categories.size,'stat-hours':Math.max(1,Math.ceil(minutes/60))};
  Object.entries(values).forEach(([id,value])=>{const el=document.getElementById(id);if(el)el.textContent=String(value)});
}

function renderCategories(){
  const container=document.getElementById('catChips');
  if(!container)return;
  container.replaceChildren();
  CATEGORY_ORDER.forEach(category=>{
    const button=create('button','cat-chip'+(category===activeCategory?' active':''),category);
    button.type='button';
    button.dataset.category=category;
    button.setAttribute('aria-pressed',String(category===activeCategory));
    button.addEventListener('click',()=>selectCategory(category));
    container.appendChild(button);
  });
}

function selectCategory(category){
  activeCategory=category;
  document.querySelectorAll('.cat-chip').forEach(button=>{
    const active=button.dataset.category===category;
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',String(active));
  });
  renderPosts();
}

function getFilteredPosts(){
  const q=searchQuery.trim().toLocaleLowerCase('zh-CN');
  return POSTS.filter(post=>{
    const categoryMatch=activeCategory==='全部'||post.category===activeCategory;
    const haystack=[post.title,post.description,post.outcome,post.category,...post.tags].join(' ').toLocaleLowerCase('zh-CN');
    return categoryMatch&&(!q||haystack.includes(q));
  });
}

function buildPostCard(post){
  const color=CATEGORY_COLORS[post.category]||'#6366f1';
  const card=create('a','post-card');
  card.href=`/post/${post.slug}/`;
  card.style.setProperty('--card-color',color);
  card.setAttribute('aria-label',`阅读：${post.title}`);

  const banner=create('div','card-banner');
  const body=create('div','card-body');
  const meta=create('div','card-meta');
  meta.append(create('span','category-badge',post.category),create('span','read-time',`☕ ${post.read_minutes} min`));
  const title=create('h3','card-title',post.title);
  const desc=create('p','card-desc',post.description);
  const outcome=create('p','card-outcome',post.outcome);
  const footer=create('div','card-footer');
  footer.append(create('time','card-date',post.date));
  const tags=create('div','card-tags');
  post.tags.forEach(tag=>tags.appendChild(create('span','tag',`#${tag}`)));
  footer.appendChild(tags);
  body.append(meta,title,desc,outcome,footer);
  card.append(banner,body);
  return card;
}

function renderPosts(){
  const grid=document.getElementById('postsGrid');
  if(!grid)return;
  const posts=getFilteredPosts();
  const result=document.getElementById('resultCount');
  if(result)result.textContent=`${posts.length} 篇`;
  grid.replaceChildren();
  if(!posts.length){
    const empty=create('div','empty-state');
    empty.append(create('h3','', '没有找到匹配的文章'),create('p','', '换个关键词，或者选择其他知识领域。'));
    grid.appendChild(empty);
    return;
  }
  const fragment=document.createDocumentFragment();
  posts.forEach(post=>fragment.appendChild(buildPostCard(post)));
  grid.appendChild(fragment);
}

function initSearch(){
  const input=document.getElementById('searchInput');
  if(input){
    let frame=0;
    input.addEventListener('input',event=>{
      searchQuery=event.target.value;
      cancelAnimationFrame(frame);
      frame=requestAnimationFrame(renderPosts);
    });
  }
  document.querySelectorAll('[data-category-link]').forEach(link=>{
    link.addEventListener('click',()=>{
      const category=link.dataset.categoryLink;
      if(category){
        selectCategory(category);
        setTimeout(()=>document.getElementById('articles')?.scrollIntoView({block:'start'}),0);
      }
    });
  });
}

function initReadingProgress(){
  const bar=document.querySelector('[data-reading-progress]');
  const article=document.querySelector('.article-content');
  if(!bar||!article)return;
  let scheduled=false;
  const update=()=>{
    const start=article.offsetTop;
    const distance=Math.max(1,article.offsetHeight-window.innerHeight);
    const progress=Math.min(1,Math.max(0,(window.scrollY-start)/distance));
    bar.style.width=`${progress*100}%`;
    scheduled=false;
  };
  window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update)}},{passive:true});
  update();
}

function initToc(){
  const toc=document.querySelector('[data-toc]');
  const article=document.querySelector('.article-content');
  if(!toc||!article)return;
  [...article.querySelectorAll('h2,h3')].forEach((heading,index)=>{
    if(!heading.id)heading.id=`section-${index+1}`;
    const link=create('a',heading.tagName==='H3'?'toc-sub':'',heading.textContent);
    link.href=`#${heading.id}`;
    toc.appendChild(link);
  });
}

function initCodeCopy(){
  document.querySelectorAll('.article-content pre').forEach(pre=>{
    const button=create('button','copy-btn','复制');
    button.type='button';
    button.addEventListener('click',async()=>{
      try{await navigator.clipboard.writeText(pre.querySelector('code')?.innerText||pre.innerText);button.textContent='已复制';setTimeout(()=>button.textContent='复制',1200)}
      catch(e){button.textContent='复制失败'}
    });
    pre.appendChild(button);
  });
}

function init(){
  initTheme();
  initHeroTyping();
  renderStats();
  renderCategories();
  initSearch();
  renderPosts();
  initReadingProgress();
  initToc();
  initCodeCopy();
  const year=document.getElementById('year');
  if(year)year.textContent=String(new Date().getFullYear());
}

document.addEventListener('DOMContentLoaded',init,{once:true});
