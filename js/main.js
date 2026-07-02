/* ================================================
   D4av3 — main.js
   Navigation · Terminals · Dynamic content loader
   ================================================ */

// ─────────────────────────────────────
// NAVIGATION & DEEP LINKING
// ─────────────────────────────────────
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-link');

function showSection(id) {
  sections.forEach(s => s.classList.remove('active'));
  navLinks.forEach(l => l.classList.remove('active'));

  const target = document.getElementById(id);
  if (target) {
    target.classList.add('active');
    // load dynamic content on first visit
    if (!target.dataset.loaded) {
      target.dataset.loaded = 'true';
      if (id === 'scripts')  loadScripts();
      if (id === 'projects') loadProjects();
      if (id === 'blog')     loadBlog();
    }
  }

  // Update active state on sidebar links
  document.querySelectorAll(`.nav-link[data-section="${id}"]`).forEach(l => l.classList.add('active'));

  // close mobile sidebar
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.remove('open');
  
  // Scroll to top of the page smoothly when changing sections
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Read the URL hash on load or when using back/forward browser buttons
function handleUrlHash() {
  const hash = window.location.hash.replace('#', '');
  
  // If hash exists and matches a valid section ID, show it. Otherwise, default to 'home'
  if (hash && document.getElementById(hash) && document.getElementById(hash).classList.contains('section')) {
    showSection(hash);
  } else {
    // Make sure your main landing section has id="home" in index.html!
    showSection('home');
    history.replaceState(null, null, '#home');
  }
}

// Run routing on initial page load and on back/forward navigation
window.addEventListener('DOMContentLoaded', handleUrlHash);
window.addEventListener('hashchange', handleUrlHash);

// click any element with data-section
document.addEventListener('click', function(e) {
  const el = e.target.closest('[data-section]');
  if (el && !el.classList.contains('tag-lang')) {
    e.preventDefault();
    const targetId = el.dataset.section;
    
    // Update the URL without reloading the page
    history.pushState(null, null, '#' + targetId);
    showSection(targetId);
  }
});

// hamburger menu
const hamburger = document.getElementById('hamburger');
if (hamburger) {
  hamburger.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });
}

// ─────────────────────────────────────
// MULTI-TERMINAL PANELS
// ─────────────────────────────────────
const panels = Array.from(document.querySelectorAll('.term-panel'));
let autoTimer   = null;
let autoIndex   = 0;
let userClicked = false;

function collapsePanel(p) {
  p.classList.remove('expanded');
  // Remove inline styles so CSS transitions take over cleanly on next expand
  p.querySelectorAll('.to').forEach(t => {
    t.style.removeProperty('opacity');
    t.style.removeProperty('transform');
    t.style.removeProperty('transition-delay');
  });
}

function expandPanel(panel) {
  const isAlreadyOpen = panel.classList.contains('expanded');

  // Collapse all panels first
  panels.forEach(p => collapsePanel(p));

  if (isAlreadyOpen) return; // clicking open panel just closes it

  // Force a reflow so the browser registers the collapsed state
  // before we add 'expanded' — this makes transitions re-fire every time
  void panel.offsetHeight;

  panel.classList.add('expanded');
}

panels.forEach(panel => {
  const bar = panel.querySelector('.term-bar');
  if (bar) {
    bar.addEventListener('click', () => {
      userClicked = true;
      clearTimeout(autoTimer);
      expandPanel(panel);
    });
  }
});

// Auto-cycle: open each panel in sequence, close it, then open the next
function autoCycle() {
  if (userClicked || panels.length === 0) return;
  const panel = panels[autoIndex % panels.length];
  autoIndex++;

  // Close everything first, wait for collapse animation, then expand
  panels.forEach(p => collapsePanel(p));
  void panel.offsetHeight; // force reflow
  panel.classList.add('expanded');

  autoTimer = setTimeout(autoCycle, 3400);
}

setTimeout(() => {
  if (!userClicked && panels.length > 0) autoCycle();
}, 900);

// ─────────────────────────────────────
// SKILLS → SCRIPTS filter bridge
// ─────────────────────────────────────
document.querySelectorAll('.tag-lang').forEach(tag => {
  tag.addEventListener('click', () => {
    const lang = tag.dataset.lang;
    
    // Update URL to show we moved to scripts
    history.pushState(null, null, '#scripts');
    showSection('scripts');
    
    setTimeout(() => applyFilter(lang), 80);
  });
});

// ─────────────────────────────────────
// SCRIPT FILTER
// ─────────────────────────────────────
let currentFilter = 'all';

function applyFilter(tag) {
  currentFilter = tag;

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === tag);
  });

  if (tag === 'all') {
    // show everything, restore collapsed state
    document.querySelectorAll('.sc').forEach(c => c.classList.remove('sc-hidden'));
    document.querySelectorAll('.sg').forEach(g => g.classList.remove('sg-hidden'));
    return;
  }

  // 1. Show/hide individual script cards
  document.querySelectorAll('.sc').forEach(card => {
    const tags = (card.dataset.tags || '').split(',');
    card.classList.toggle('sc-hidden', !tags.includes(tag));
  });

  // 2. For each group bottom-up: visible if it has at least one visible child
  const allGroups = [...document.querySelectorAll('.sg')].reverse();
  allGroups.forEach(group => {
    const hasVisibleCard  = [...group.querySelectorAll(':scope > .sg-children > .sc')]
                              .some(c => !c.classList.contains('sc-hidden'));
    const hasVisibleGroup = [...group.querySelectorAll(':scope > .sg-children > .sg')]
                              .some(g => !g.classList.contains('sg-hidden'));
    group.classList.toggle('sg-hidden', !hasVisibleCard && !hasVisibleGroup);
    // force-open groups that have matches so the tree is navigable
    if (!group.classList.contains('sg-hidden')) group.classList.add('sg-open');
  });
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
});

// ─────────────────────────────────────
// SCRIPTS — toggle group open/closed
// ─────────────────────────────────────
function toggleGroup(hdr) {
  hdr.closest('.sg').classList.toggle('sg-open');
}
window.toggleGroup = toggleGroup;

function toggleScript(row) {
  const card   = row.closest('.sc');
  const body   = card.querySelector('.sc-body');
  if (!body) return;
  const isOpen = body.classList.toggle('sc-body-open');
  row.classList.toggle('sc-open', isOpen);
}
window.toggleScript = toggleScript;

// ─────────────────────────────────────
// DYNAMIC LOADERS
// ─────────────────────────────────────

async function loadScripts() {
  const container = document.getElementById('scripts-list');
  try {
    const manifest = await fetch('scripts/index.json').then(r => r.json());
    if (!manifest.length) {
      container.innerHTML = '<p class="loading-msg">No scripts yet.</p>';
      return;
    }

    const langClass = { bash:'sl-bash', powershell:'sl-ps', python:'sl-py', js:'sl-js', html:'sl-html', favorite:'sl-favorite' };

    const fileCache = {};
    function collectFiles(items) {
      for (const item of items) {
        if (item.file) fileCache[item.file] = null;
        else if (item.items) collectFiles(item.items);
      }
    }
    collectFiles(manifest);
    await Promise.all(Object.keys(fileCache).map(async f => {
      try { fileCache[f] = await fetch(`scripts/${f}`).then(r => r.text()); }
      catch(_) { fileCache[f] = '# could not load file'; }
    }));

    function countScripts(items) {
      let n = 0;
      for (const it of items) {
        if (it.file) n++;
        else if (it.items) n += countScripts(it.items);
      }
      return n;
    }

    function renderScript(entry, ancestorTags) {
      const ownTags  = entry.tags || [];
      const allTags  = [...new Set([...ancestorTags, ...ownTags])];
      const cls      = langClass[entry.lang] || 'sl-bash';
      const pills    = ownTags.map(t => `<span class="stag">${escapeHtml(t)}</span>`).join('');
      const code     = escapeHtml(fileCache[entry.file] || '');
      return `
<div class="sc" data-tags="${allTags.join(',')}">
  <div class="sc-row" onclick="toggleScript(this)">
    <span class="sc-arrow">▶</span>
    <span class="sc-lang ${cls}">${entry.lang}</span>
    <span class="sc-name">${escapeHtml(entry.name)}</span>
    <span class="sc-desc">${escapeHtml(entry.desc)}</span>
    <div class="sc-tag-pills">${pills}</div>
  </div>
  <div class="sc-body">
    <pre><code>${code}</code></pre>
  </div>
</div>`;
    }

    function renderGroup(item, ancestorTags, depth) {
      const groupTags  = [...new Set([...ancestorTags, ...(item.tags || [])])];
      const icon       = item.icon || '📁';
      const name       = item.group || 'group';
      const count      = countScripts(item.items || []);
      const groupPills = (item.tags || []).map(t => `<span class="stag">${escapeHtml(t)}</span>`).join('');
      const childrenHtml = (item.items || []).map(child =>
        child.file ? renderScript(child, groupTags)
                   : renderGroup(child, groupTags, depth + 1)
      ).join('');

      const openClass = depth === 0 ? 'sg-open' : '';

      return `
<div class="sg ${openClass}">
  <button class="sg-hdr" onclick="toggleGroup(this)">
    <span class="sg-arrow">▶</span>
    <span class="sg-icon">${icon}</span>
    <span class="sg-name">${escapeHtml(name)}</span>
    <div class="sg-tag-pills">${groupPills}</div>
    <span class="sg-count">${count} script${count !== 1 ? 's' : ''}</span>
  </button>
  <div class="sg-children">
    ${childrenHtml}
  </div>
</div>`;
    }

    const html = manifest.map(item =>
      item.file ? renderScript(item, [])
                : renderGroup(item, [], 0)
    ).join('');

    container.innerHTML = html;
    applyFilter(currentFilter);

  } catch(err) {
    container.innerHTML = fetchErrorMsg('scripts/index.json', err);
  }
}

async function loadProjects() {
  const container = document.getElementById('projects-grid');
  try {
    const manifest = await fetch('projects/index.json').then(r => r.json());

    let html = '';
    let currentGroup = null;

    for (const item of manifest) {
      if (typeof item === 'string') {
        if (currentGroup !== null) {
          html += '</div></div>';
          currentGroup = null;
        }
        html += await buildProjectCard(`projects/${item}`, item);

      } else if (item.group !== undefined) {
        if (currentGroup !== null) html += '</div></div>';

        const groupLabel = item.group || 'Projects';
        html += `
<div class="project-group">
  <div class="project-group-header">
    <span class="project-group-label">${escapeHtml(groupLabel)}/</span>
  </div>
  <div class="projects-subgrid">`;

        for (const slug of item.projects) {
          const folder = item.group ? `${item.group}/${slug}` : slug;
          html += await buildProjectCard(`projects/${folder}`, slug);
        }

        html += '</div></div>';
        currentGroup = item.group;
      }
    }

    container.innerHTML = html || '<p class="loading-msg">No projects found.</p>';

  } catch(err) {
    container.innerHTML = fetchErrorMsg('projects/index.json', err);
  }
}

async function buildProjectCard(folderPath, slug) {
  try {
    const p = await fetch(`${folderPath}/project.json`).then(r => r.json());
    const tags = (p.tags || []).map(t => `<span class="project-tag">${escapeHtml(t)}</span>`).join('');
    const thumb = p.image
      ? `<div class="project-thumb"><img src="${folderPath}/${p.image}" alt="${escapeHtml(p.name)}"></div>`
      : `<div class="project-thumb project-thumb-icon">${p.icon || '📁'}</div>`;
    return `
<a href="${folderPath}/${p.link || 'index.html'}" class="project-card">
  ${thumb}
  <div class="project-info">
    <h3>${escapeHtml(p.name)}</h3>
    <p>${escapeHtml(p.desc)}</p>
    <div class="project-tags">${tags}</div>
  </div>
</a>`;
  } catch(_) {
    return `<div class="project-card project-card-err"><div class="project-thumb project-thumb-icon">⚠️</div><div class="project-info"><h3>${escapeHtml(slug)}</h3><p>Missing project.json</p></div></div>`;
  }
}

async function loadBlog() {
  const container = document.getElementById('blog-grid');
  try {
    const slugs = await fetch('blog/index.json').then(r => r.json());

    const cards = await Promise.all(slugs.map(async slug => {
      try {
        const p = await fetch(`blog/${slug}/post.json`).then(r => r.json());
        return `
<a href="blog/${slug}/index.html" class="blog-card">
  <div class="blog-meta">
    <span class="blog-date">${escapeHtml(p.date)}</span>
    <span class="blog-tag">${escapeHtml(p.tag)}</span>
  </div>
  <h3>${escapeHtml(p.title)}</h3>
  <p>${escapeHtml(p.desc)}</p>
  <span class="blog-read">Read →</span>
</a>`;
      } catch(_) {
        return `<div class="blog-card"><h3>${escapeHtml(slug)}</h3><p>Could not load post.json</p></div>`;
      }
    }));

    container.innerHTML = cards.join('') || '<p class="loading-msg">No posts yet.</p>';

  } catch(err) {
    container.innerHTML = fetchErrorMsg('blog/index.json', err);
  }
}

// ─────────────────────────────────────
// CONTACT FORM
// ─────────────────────────────────────
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    document.getElementById('form-feedback').textContent =
      '✓ Message sent! (connect to Formspree or similar to make this real)';
    this.reset();
  });
}

// ─────────────────────────────────────
// UTILS
// ─────────────────────────────────────
function fetchErrorMsg(file, err) {
  const isLocal = location.protocol === 'file:';
  if (isLocal) {
    return `<p class="loading-msg">
      ⚠️ You're opening the site directly as a file (<code>file://</code>).<br>
      Browsers block <code>fetch()</code> on local files for security reasons.<br><br>
      <strong>To test locally, run a simple server:</strong><br>
      <code>python3 -m http.server 8000</code><br>
      Then open <a href="http://localhost:8000" style="color:var(--accent)">http://localhost:8000</a><br><br>
      On GitHub Pages this will work automatically.
    </p>`;
  }
  return `<p class="loading-msg">Could not load <code>${file}</code> — make sure the file exists.<br><small>${err.message}</small></p>`;
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}