/**
 * Module quản lý trang Kỳ Thư Tác Phẩm (projects/index.html).
 * Xử lý: Nạp dữ liệu từ projects.json, tra cứu theo tên tác phẩm,
 * modal Giám Định Kỹ Thuật (Tech Inspector) và hệ thống Ấn Triện LocalStorage.
 */

(function () {
  const STORAGE_PREFIX = 'ky_su_game_project_';
  let allProjects = [];
  let searchQuery = '';

  function normalizeText(str) {
    if (!str) return '';
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function showToast(message) {
    let toast = document.getElementById('heritage-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'heritage-toast';
      toast.setAttribute('popover', 'manual');
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      toast.className = 'fixed bottom-8 right-8 z-50 flex items-center gap-3 px-5 py-3 rounded-lg border border-heritage-gold/40 bg-heritage-ink/95 text-heritage-parchment font-serif text-xs shadow-2xl backdrop-blur-md transition-all duration-300 opacity-0 translate-y-2 pointer-events-none';
      document.body.appendChild(toast);
    }

    toast.innerHTML = `
      <span class="w-2 h-2 rounded-full bg-heritage-cinnabar animate-pulse"></span>
      <span>${message}</span>
    `;

    if (typeof toast.showPopover === 'function') {
      try {
        toast.showPopover();
        toast.classList.remove('opacity-0', 'translate-y-2', 'pointer-events-none');
        toast.classList.add('opacity-100', 'translate-y-0');
      } catch (e) {}
    } else {
      toast.classList.remove('opacity-0', 'translate-y-2', 'pointer-events-none');
      toast.classList.add('opacity-100', 'translate-y-0');
    }

    if (toast._timer) clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('opacity-100', 'translate-y-0');
      toast.classList.add('opacity-0', 'translate-y-2', 'pointer-events-none');
      if (typeof toast.hidePopover === 'function') {
        try { toast.hidePopover(); } catch (e) {}
      }
    }, 3000);
  }

  function getProjectReactions(project) {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'reactions_' + project.id);
      if (saved) return JSON.parse(saved);
    } catch (e) { /* bỏ qua */ }
    return Object.assign({}, project.defaultReactions || { tamDac: 10, tinhDieu: 5 });
  }

  function getUserVoted(projectId) {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'voted_' + projectId);
      if (saved) return JSON.parse(saved);
    } catch (e) { /* bỏ qua */ }
    return { tamDac: false, tinhDieu: false };
  }

  function toggleReaction(projectId, type) {
    const project = allProjects.find(p => p.id === projectId);
    if (!project) return;

    const reactions = getProjectReactions(project);
    const userVoted = getUserVoted(projectId);

    if (!userVoted[type]) {
      reactions[type] = (reactions[type] || 0) + 1;
      userVoted[type] = true;
      showToast(type === 'tamDac' ? '💮 Đã hạ ấn triện: Tâm Đắc!' : '⚡ Đã hạ ấn triện: Tinh Diệu!');
    } else {
      reactions[type] = Math.max(0, (reactions[type] || 0) - 1);
      userVoted[type] = false;
      showToast('Đã thu hồi ấn triện tác phẩm.');
    }

    try {
      localStorage.setItem(STORAGE_PREFIX + 'reactions_' + projectId, JSON.stringify(reactions));
      localStorage.setItem(STORAGE_PREFIX + 'voted_' + projectId, JSON.stringify(userVoted));
    } catch (e) { /* bỏ qua */ }

    // Cập nhật lại giao diện nút ấn trên thẻ
    updateReactionButton(projectId, type, reactions[type], userVoted[type]);
  }

  function updateReactionButton(projectId, type, count, isVoted) {
    const btn = document.querySelector(`[data-reaction-btn="${projectId}-${type}"]`);
    if (!btn) return;

    const countEl = btn.querySelector('.reaction-count');
    if (countEl) countEl.textContent = count;

    const activeColorClass = type === 'tamDac' ? 'border-heritage-cinnabar text-heritage-cinnabar bg-heritage-cinnabar/10' : 'border-heritage-gold text-heritage-gold bg-heritage-gold/10';
    if (isVoted) {
      btn.className = `px-3 py-1.5 rounded border text-xs font-serif flex items-center gap-1.5 transition-all ${activeColorClass}`;
    } else {
      btn.className = 'px-3 py-1.5 rounded border border-heritage-border text-xs font-serif flex items-center gap-1.5 text-heritage-muted hover:border-heritage-gold/60 hover:text-heritage-gold transition-all';
    }
  }

  function openInspectorModal(projectId) {
    const project = allProjects.find(p => p.id === projectId);
    if (!project) return;

    const modal = document.getElementById('inspector-modal');
    const modalContent = document.getElementById('inspector-modal-content');
    if (!modal || !modalContent) return;

    const isGold = project.themeColor === 'gold';
    const accentColor = isGold ? 'heritage-gold' : 'heritage-cinnabar';

    const solutionsHtml = (project.solutions || []).map((sol, index) => `
      <li class="flex items-start gap-2.5 text-xs text-heritage-parchment/90 leading-relaxed">
        <span class="w-4 h-4 rounded-full border border-${accentColor}/50 text-${accentColor} flex-shrink-0 flex items-center justify-center font-mono text-[10px] mt-0.5">${index + 1}</span>
        <span>${sol}</span>
      </li>
    `).join('');

    modalContent.innerHTML = `
      <!-- Modal Header -->
      <div class="flex items-start justify-between border-b border-heritage-border/70 pb-4">
        <div class="space-y-1">
          <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded border border-${accentColor}/40 bg-${accentColor}/10 text-${accentColor} text-[11px] font-serif tracking-widest">
            <span class="w-1.5 h-1.5 rounded-full bg-${accentColor}"></span>
            <span>${project.status}</span>
          </div>
          <h2 id="inspector-modal-title" class="text-2xl font-serif font-bold text-white tracking-wide">${project.title}</h2>
          <p class="text-xs text-heritage-muted font-serif">${project.subtitle}</p>
        </div>
        <button id="btn-close-modal" class="w-8 h-8 rounded border border-heritage-border hover:border-heritage-gold text-heritage-muted hover:text-heritage-gold flex items-center justify-center transition-colors" aria-label="Đóng cửa sổ">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="space-y-6 pt-2 max-h-[70vh] overflow-y-auto pr-1">

        <!-- Thông số Profiler / Tech Specs -->
        <div>
          <h3 class="text-xs font-serif font-semibold text-heritage-gold tracking-widest uppercase mb-3 flex items-center gap-2">
            <i data-lucide="activity" class="w-3.5 h-3.5"></i>
            <span>Thông Số Tối Ưu & Profiling</span>
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div class="p-3 rounded-lg border border-heritage-border bg-heritage-card/60 min-w-0">
              <span class="block text-[10px] text-heritage-muted">MỤC TIÊU FPS</span>
              <span class="text-sm font-bold text-heritage-parchment">${project.techSpecs.fpsTarget}</span>
            </div>
            <div class="p-3 rounded-lg border border-heritage-border bg-heritage-card/60 min-w-0">
              <span class="block text-[10px] text-heritage-muted">GC ALLOC</span>
              <span class="block text-sm font-bold text-heritage-parchment break-words" title="${project.techSpecs.gcAlloc}">${project.techSpecs.gcAlloc}</span>
            </div>
            <div class="p-3 rounded-lg border border-heritage-border bg-heritage-card/60 min-w-0">
              <span class="block text-[10px] text-heritage-muted">DRAW CALLS</span>
              <span class="text-sm font-bold text-heritage-parchment">${project.techSpecs.drawCalls}</span>
            </div>
            <div class="p-3 rounded-lg border border-heritage-border bg-heritage-card/60 min-w-0">
              <span class="block text-[10px] text-heritage-muted">CƠ CHẾ LÕI</span>
              <span class="block text-xs font-bold text-heritage-parchment break-words leading-snug" title="${project.techSpecs.keyMechanic}">${project.techSpecs.keyMechanic}</span>
            </div>
          </div>
        </div>

        <!-- Khí Cụ Công Nghệ -->
        <div class="p-4 rounded-lg border border-heritage-border/70 bg-heritage-ink/50 space-y-2">
          <h4 class="text-xs font-serif font-semibold text-heritage-parchment flex items-center gap-2">
            <i data-lucide="cpu" class="w-3.5 h-3.5 text-heritage-gold"></i>
            <span>Khí Cụ Kỹ Nghệ</span>
          </h4>
          <div class="flex flex-wrap items-center gap-2 font-mono text-xs text-heritage-muted">
            <span class="px-2.5 py-1 rounded border border-heritage-border bg-heritage-card">${project.engine}</span>
            <span class="px-2.5 py-1 rounded border border-heritage-border bg-heritage-card">${project.pipeline}</span>
            <span class="px-2.5 py-1 rounded border border-heritage-border bg-heritage-card">${project.language}</span>
          </div>
        </div>

        <!-- Kiến Trúc Code & Phân Tầng -->
        <div class="space-y-2">
          <h3 class="text-xs font-serif font-semibold text-heritage-gold tracking-widest uppercase flex items-center gap-2">
            <i data-lucide="layers" class="w-3.5 h-3.5"></i>
            <span>Kiến Trúc & Thiết Kế Phần Mềm</span>
          </h3>
          <p class="text-xs text-heritage-parchment/90 leading-relaxed font-light p-4 rounded-lg border border-heritage-border bg-heritage-card/40">
            ${project.architecture}
          </p>
        </div>

        <!-- Giải Pháp Tối Ưu Nổi Bật -->
        <div class="space-y-3">
          <h3 class="text-xs font-serif font-semibold text-heritage-gold tracking-widest uppercase flex items-center gap-2">
            <i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i>
            <span>Giải Pháp Kỹ Thuật Đã Áp Dụng</span>
          </h3>
          <ul class="space-y-2.5 p-4 rounded-lg border border-heritage-border bg-heritage-card/40">
            ${solutionsHtml}
          </ul>
        </div>

      </div>

      <!-- Modal Footer -->
      <div class="pt-4 border-t border-heritage-border/70 flex items-center justify-between font-serif text-xs">
        <span class="text-heritage-muted">Kỳ Thư Giám Định // Technical Dossier</span>
        <button id="btn-close-modal-bottom" class="px-4 py-1.5 rounded border border-heritage-border hover:border-heritage-gold text-heritage-parchment transition-colors">
          Đóng Giám Định
        </button>
      </div>
    `;

    if (typeof modal.showModal === 'function') {
      modal.showModal();
    } else {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      document.body.style.overflow = 'hidden';
    }

    if (window.lucide) window.lucide.createIcons();

    // Sự kiện đóng modal
    const closeBtnTop = document.getElementById('btn-close-modal');
    const closeBtnBottom = document.getElementById('btn-close-modal-bottom');
    if (closeBtnTop) closeBtnTop.addEventListener('click', closeInspectorModal);
    if (closeBtnBottom) closeBtnBottom.addEventListener('click', closeInspectorModal);
  }

  function closeInspectorModal() {
    const modal = document.getElementById('inspector-modal');
    if (!modal) return;
    if (typeof modal.close === 'function' && modal.open) {
      modal.close();
    } else {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.style.overflow = '';
    }
  }

  function renderProjects() {
    const container = document.getElementById('projects-container');
    const emptyState = document.getElementById('empty-state');
    const counter = document.getElementById('project-counter');
    if (!container) return;

    const query = normalizeText(searchQuery);
    const filtered = allProjects.filter(project => {
      if (!query) return true;
      return normalizeText(project.title).includes(query);
    });

    if (counter) {
      counter.textContent = `${filtered.length} / ${allProjects.length} Kỳ Thư Tác Phẩm`;
    }

    if (filtered.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    container.innerHTML = filtered.map(project => {
      const isGold = project.themeColor === 'gold';
      const borderClass = isGold ? 'border-heritage-gold/30 hover:border-heritage-gold/60' : 'border-heritage-cinnabar/30 hover:border-heritage-cinnabar/60';
      const iconColor = isGold ? 'text-heritage-gold' : 'text-heritage-cinnabar';
      const circleBorder = isGold ? 'border-heritage-gold/30' : 'border-heritage-cinnabar/30';
      const reactions = getProjectReactions(project);
      const userVoted = getUserVoted(project.id);

      const tamDacActiveClass = userVoted.tamDac ? 'border-heritage-cinnabar text-heritage-cinnabar bg-heritage-cinnabar/10' : 'border-heritage-border text-heritage-muted hover:border-heritage-gold/60 hover:text-heritage-gold';
      const tinhDieuActiveClass = userVoted.tinhDieu ? 'border-heritage-gold text-heritage-gold bg-heritage-gold/10' : 'border-heritage-border text-heritage-muted hover:border-heritage-gold/60 hover:text-heritage-gold';

      return `
        <article class="rounded-xl border ${borderClass} bg-heritage-card/60 p-6 flex flex-col justify-between transition-all duration-300 space-y-6 group">
          
          <div class="space-y-4">
            <!-- Khung minh họa nghệ thuật cổ phong -->
            <div class="h-44 rounded-lg border border-heritage-border/70 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden bg-heritage-ink/60">
              <div class="w-16 h-16 rounded-full border ${circleBorder} flex items-center justify-center mb-2 group-hover:scale-105 transition-transform duration-300">
                <i data-lucide="${project.icon}" class="w-7 h-7 ${iconColor}"></i>
              </div>
              <span class="font-serif text-[11px] ${iconColor} tracking-widest uppercase">
                ${project.subtitle}
              </span>
            </div>

            <!-- Tiêu đề & Trạng thái -->
            <div class="flex items-start justify-between gap-3">
              <div>
                <h2 class="text-xl font-serif font-bold text-white group-hover:text-heritage-gold transition-colors">
                  ${project.title}
                </h2>
                <div class="flex items-center gap-2 mt-1 text-xs font-mono text-heritage-muted">
                  <span>${project.engine}</span>
                  <span>•</span>
                  <span>${project.language}</span>
                </div>
              </div>
              <span class="text-[11px] font-serif px-2.5 py-1 rounded border ${project.badgeStyle} flex-shrink-0">
                ${project.status}
              </span>
            </div>

            <!-- Tóm lược gameplay & cơ chế -->
            <p class="text-heritage-muted text-xs sm:text-sm leading-relaxed font-light">
              ${project.summary}
            </p>

            <!-- Bảng thông số kỹ thuật nhanh -->
            <div class="grid grid-cols-3 gap-2 pt-2 border-t border-heritage-border/50 font-mono text-[11px] text-center">
              <div class="p-2 rounded bg-heritage-ink/50 border border-heritage-border/60 min-w-0">
                <span class="block text-[9px] text-heritage-muted uppercase">Mục tiêu</span>
                <span class="text-heritage-gold font-semibold">${project.techSpecs.fpsTarget}</span>
              </div>
              <div class="p-2 rounded bg-heritage-ink/50 border border-heritage-border/60 min-w-0">
                <span class="block text-[9px] text-heritage-muted uppercase">GC Alloc</span>
                <span class="block text-heritage-parchment font-semibold truncate" title="${project.techSpecs.gcAlloc}">${project.techSpecs.gcAlloc}</span>
              </div>
              <div class="p-2 rounded bg-heritage-ink/50 border border-heritage-border/60 min-w-0">
                <span class="block text-[9px] text-heritage-muted uppercase">Draw Calls</span>
                <span class="text-heritage-parchment font-semibold">${project.techSpecs.drawCalls}</span>
              </div>
            </div>
          </div>

          <!-- Nút hành động & Ấn triện -->
          <div class="pt-4 border-t border-heritage-border/60 flex flex-wrap items-center justify-between gap-3 font-serif text-xs">
            
            <div class="flex items-center gap-2">
              <button
                type="button"
                data-reaction-btn="${project.id}-tamDac"
                data-project-id="${project.id}"
                data-reaction-type="tamDac"
                class="px-3 py-1.5 rounded border ${tamDacActiveClass} transition-all flex items-center gap-1.5"
                title="Hạ ấn triện Tâm Đắc"
              >
                <span>💮 Tâm Đắc</span>
                <span class="reaction-count font-mono font-bold">${reactions.tamDac}</span>
              </button>

              <button
                type="button"
                data-reaction-btn="${project.id}-tinhDieu"
                data-project-id="${project.id}"
                data-reaction-type="tinhDieu"
                class="px-3 py-1.5 rounded border ${tinhDieuActiveClass} transition-all flex items-center gap-1.5"
                title="Hạ ấn triện Tinh Diệu"
              >
                <span>⚡ Tinh Diệu</span>
                <span class="reaction-count font-mono font-bold">${reactions.tinhDieu}</span>
              </button>
            </div>

            <button
              type="button"
              data-inspect-btn="${project.id}"
              class="px-3.5 py-1.5 rounded border border-heritage-gold/50 text-heritage-gold hover:bg-heritage-gold hover:text-heritage-ink font-semibold flex items-center gap-1.5 transition-all"
            >
              <i data-lucide="file-search" class="w-3.5 h-3.5"></i>
              <span>Giám Định Kỹ Thuật</span>
            </button>

          </div>

        </article>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();

    // Gắn sự kiện cho các nút trong danh sách vừa render
    container.querySelectorAll('[data-reaction-btn]').forEach(btn => {
      btn.addEventListener('click', () => {
        const pId = btn.getAttribute('data-project-id');
        const rType = btn.getAttribute('data-reaction-type');
        toggleReaction(pId, rType);
      });
    });

    container.querySelectorAll('[data-inspect-btn]').forEach(btn => {
      btn.addEventListener('click', () => {
        const pId = btn.getAttribute('data-inspect-btn');
        openInspectorModal(pId);
      });
    });
  }

  function init() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        searchQuery = e.target.value;
        renderProjects();
      });
    }

    // Đóng modal khi bấm ra ngoài backdrop (Fallback light-dismiss cho browser chưa hỗ trợ closedby)
    const modal = document.getElementById('inspector-modal');
    if (modal) {
      if (!('closedBy' in HTMLDialogElement.prototype)) {
        modal.addEventListener('click', e => {
          if (e.target !== modal) return;
          const rect = modal.getBoundingClientRect();
          const isDialogContent = (
            rect.top <= e.clientY &&
            e.clientY <= rect.top + rect.height &&
            rect.left <= e.clientX &&
            e.clientX <= rect.left + rect.width
          );
          if (!isDialogContent) closeInspectorModal();
        });
      }
    }

    // Nạp dữ liệu
    fetch('../assets/data/projects.json')
      .then(res => {
        if (!res.ok) throw new Error('Không thể tải projects.json');
        return res.json();
      })
      .then(data => {
        allProjects = data;
        renderProjects();
      })
      .catch(err => {
        console.error(err);
        const counter = document.getElementById('project-counter');
        if (counter) counter.textContent = 'Lỗi nạp dữ liệu kỳ thư';
      });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
