
// Theme & font persistence
(function(){
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('theme');
  document.documentElement.classList.toggle('dark', savedTheme ? savedTheme==='dark' : prefersDark);

  const savedFont = localStorage.getItem('fontSize');
  if (savedFont) document.documentElement.style.setProperty('--fs-body', savedFont + 'px');
})();

// Elements
const searchInput = document.getElementById('search');
const listEl = document.getElementById('news-list');
const filtersEl = document.getElementById('filters');
const tickerContentEl = document.getElementById('ticker-content');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.getElementById('close-modal');
const toast = document.getElementById('toast');

let NEWS = [];
let filtered = [];
let activeCategory = 'Todos';

async function init() {
  try {
    const response = await fetch('assets/news.json');
    if (!response.ok) throw new Error('Failed to fetch news');
    NEWS = await response.json();
    applyFilters();
    renderFilters();
    renderTicker();
  } catch (error) {
    console.error(error);
    listEl.innerHTML = '<p>Não foi possível carregar as notícias. Tente novamente mais tarde.</p>';
  }
}

function renderFilters() {
  const sections = ['Todos', ...new Set(NEWS.map(n => n.section))];
  filtersEl.innerHTML = sections.map(s => `<button class="btn ghost" data-filter="${s}">${s}</button>`).join('');
  filtersEl.querySelector(`[data-filter="${activeCategory}"]`)?.classList.add('active');
}

function renderTicker() {
  const recentNews = [...NEWS].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
  tickerContentEl.innerHTML = recentNews.map(n => `<a href="#" data-open="${n.id}">${n.title}</a>`).join('<span style="margin-inline: 12px;">//</span>');
}

function applyFilters() {
  const q = searchInput.value.toLowerCase();

  // Start with category filter
  let items = activeCategory === 'Todos'
    ? [...NEWS]
    : NEWS.filter(n => n.section === activeCategory);

  // Then apply search query
  if (q) {
    items = items.filter(n => n.title.toLowerCase().includes(q) || n.summary.toLowerCase().includes(q) || n.tags.join(' ').includes(q));
  }

  filtered = items;
  renderList(filtered);
}

filtersEl?.addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) return;

  activeCategory = btn.dataset.filter;
  searchInput.value = '';
  applyFilters();

  filtersEl.querySelector('.active')?.classList.remove('active');
  btn.classList.add('active');
});

function renderList(items){
  if (!items.length) {
    listEl.innerHTML = '<p>Nenhuma notícia encontrada.</p>';
    return;
  }
  listEl.innerHTML = items.map((n, i) => `
    <article class="card ${i === 0 ? 'card--hero' : ''} fade-in" style="animation-delay: ${i * 50}ms" tabindex="0" role="article" aria-labelledby="t-${n.id}">
      <div class="badge">${n.regional ? 'Regional' : 'Natividade'}</div>
      <h3 id="t-${n.id}" style="margin:.5rem 0">${n.title}</h3>
      <p style="color:var(--muted); margin:.25rem 0 .75rem 0">${new Date(n.date).toLocaleDateString()}</p>
      <p>${n.summary}</p>
      <div class="controls" style="margin-top:12px">
        <button class="btn" data-open="${n.id}">Ler</button>
        <button class="btn ghost" data-save="${n.id}" aria-pressed="false" aria-label="Salvar notícia">Salvar</button>
      </div>
    </article>
  `).join('');
}
renderList(filtered);

// Search with debounce
let t;
searchInput?.addEventListener('input', ()=>{
  clearTimeout(t);
  t = setTimeout(applyFilters, 150);
});

// Delegated events
document.addEventListener('click', (e)=>{
  const openBtn = e.target.closest('[data-open]');
  if (openBtn){
    const id = +openBtn.getAttribute('data-open');
    const n = NEWS.find(x=>x.id===id);
    if (n) openModal(n);
  }
  const saveBtn = e.target.closest('[data-save]');
  if (saveBtn){
    const pressed = saveBtn.getAttribute('aria-pressed')==='true';
    saveBtn.setAttribute('aria-pressed', String(!pressed));
    showToast(pressed ? 'Removido dos salvos' : 'Salvo com sucesso');
  }
});

// Modal a11y
let lastFocus;
function openModal(n){
  lastFocus = document.activeElement;
  modalTitle.textContent = n.title;
  modalBody.innerHTML = `<p><strong>Seção:</strong> ${n.section}</p><p style="color:var(--muted)">${new Date(n.date).toLocaleString()}</p><hr/><p>${n.content}</p>`;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  trapFocus(modal);
  closeModalBtn.focus();
}
function closeModal(){
  modal.classList.remove('open');
  document.body.style.overflow = '';
  (lastFocus || document.body).focus();
}
closeModalBtn?.addEventListener('click', closeModal);
modal?.addEventListener('click', (e)=>{ if (e.target === modal) closeModal(); });
window.addEventListener('keydown', (e)=>{ if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });

function trapFocus(node){
  const focusables = node.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (!focusables.length) return;
  let first = focusables[0], last = focusables[focusables.length-1];
  node.addEventListener('keydown', e=>{
    if (e.key !== 'Tab') return;
    if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  });
}

// Toast (aria-live)
function showToast(msg){
  toast.textContent = msg;
  toast.classList.remove('hide');
  setTimeout(()=> toast.classList.add('hide'), 1800);
}

// Theme toggle & font size
document.getElementById('toggle-theme')?.addEventListener('click', ()=>{
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});
document.getElementById('font-plus')?.addEventListener('click', ()=>{
  const cur = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--fs-body')) || 16;
  const next = Math.min(cur + 1, 20);
  document.documentElement.style.setProperty('--fs-body', next+'px');
  localStorage.setItem('fontSize', next);
});

// SW register
if ('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('./sw.js').catch(()=>{});
  });
}

// Init app
document.addEventListener('DOMContentLoaded', init);
