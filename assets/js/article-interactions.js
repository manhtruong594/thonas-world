/**
 * Hệ thống tương tác Á Đông cho bài viết (Ký Sử Làm Game)
 * - Ấn Triện: Tâm Đắc (Chu sa) & Khai Sáng (Hổ phách)
 * - Tàng Thư (Bookmarks)
 * - Sao chép liên kết (Copy link & Toast)
 * - Khu vực đàm đạo (Bình luận LocalStorage & Google Auth profile hook)
 * - Thước đo tiến trình đọc (Reading Progress bar)
 */

const STORAGE_PREFIX = 'ky_su_game_';

// Dữ liệu bình luận mẫu mặc định ban đầu cho từng bài
const DEFAULT_COMMENTS = {
  'zero-alloc-gc': [
    {
      id: 'c1',
      author: 'Kiếm Khách Tối Ưu',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=KiemKhach',
      date: '02/10/2026',
      content: 'Bài viết đúc kết rất chuẩn xác! Nhất là vụ Box/Unbox khi gọi Log hoặc Interface, trước đây dự án mình bị spike nặng mỗi khi combat đông.'
    },
    {
      id: 'c2',
      author: 'Vô Danh Coder',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=VoDanh',
      date: '05/10/2026',
      content: 'Chờ đợi bài viết sâu hơn về NativeArray và Job System kết hợp Object Pool không GC!'
    }
  ],
  'scriptable-objects-architecture': [
    {
      id: 'c1',
      author: 'Đạo Sĩ Kiến Trúc',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=DaoSi',
      date: '28/09/2026',
      content: 'Sử dụng GameEvent bằng ScriptableObject giúp tách Scene hoàn toàn, đội artist tự gắn sfx/vfx mà không cần đụng đến code.'
    }
  ],
  'water-ink-shader': [
    {
      id: 'c1',
      author: 'Họa Sư Thủy Mặc',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=HoaSu',
      date: '06/10/2026',
      content: 'Hiệu ứng lan mực trên thớ giấy Dó nhìn hoài niệm và đậm chất Á Đông. Cảm ơn tác giả đã chia sẻ công thức Sobel Outline!'
    }
  ]
};

// Dữ liệu ban đầu số lượt ấn triện
const DEFAULT_REACTIONS = {
  'zero-alloc-gc': { tamDac: 42, khaiSang: 28 },
  'scriptable-objects-architecture': { tamDac: 35, khaiSang: 19 },
  'water-ink-shader': { tamDac: 51, khaiSang: 34 }
};

class ArticleInteractions {
  constructor(articleId) {
    this.articleId = articleId;
    this.init();
  }

  init() {
    this.initProgressBar();
    this.loadReactions();
    this.loadBookmark();
    this.loadComments();
    this.setupEvents();
  }

  // 1. THANH TIẾN TRÌNH ĐỌC
  initProgressBar() {
    const progressBar = document.getElementById('reading-progress-bar');
    if (!progressBar) return;

    window.addEventListener('scroll', () => {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      progressBar.style.width = scrolled + '%';
    });
  }

  // 2. ẤN TRIỆN (REACTIONS)
  loadReactions() {
    const stored = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'reactions_' + this.articleId)) || DEFAULT_REACTIONS[this.articleId] || { tamDac: 10, khaiSang: 5 };
    const userVoted = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'user_voted_' + this.articleId)) || {};

    const tamDacCount = document.getElementById('count-tam-dac');
    const khaiSangCount = document.getElementById('count-khai-sang');
    const btnTamDac = document.getElementById('btn-tam-dac');
    const btnKhaiSang = document.getElementById('btn-khai-sang');

    if (tamDacCount) tamDacCount.textContent = stored.tamDac;
    if (khaiSangCount) khaiSangCount.textContent = stored.khaiSang;

    if (btnTamDac && userVoted.tamDac) {
      btnTamDac.classList.add('border-heritage-cinnabar', 'bg-heritage-cinnabar/20', 'text-heritage-cinnabar');
    }
    if (btnKhaiSang && userVoted.khaiSang) {
      btnKhaiSang.classList.add('border-heritage-gold', 'bg-heritage-gold/20', 'text-heritage-gold');
    }
  }

  toggleReaction(type) {
    const reactions = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'reactions_' + this.articleId)) || DEFAULT_REACTIONS[this.articleId] || { tamDac: 10, khaiSang: 5 };
    const userVoted = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'user_voted_' + this.articleId)) || {};

    const btn = document.getElementById(type === 'tamDac' ? 'btn-tam-dac' : 'btn-khai-sang');
    const countEl = document.getElementById(type === 'tamDac' ? 'count-tam-dac' : 'count-khai-sang');

    if (!userVoted[type]) {
      reactions[type] += 1;
      userVoted[type] = true;
      this.showStampAnimation(btn, type === 'tamDac' ? '💮 Tâm Đắc' : '💡 Khai Sáng');
      this.showToast(type === 'tamDac' ? 'Đã hạ bút ấn triện Chu Sa: Tâm Đắc!' : 'Đã hạ bút ấn triện Hổ Phách: Khai Sáng!');
    } else {
      reactions[type] = Math.max(0, reactions[type] - 1);
      userVoted[type] = false;
      this.showToast('Đã thu hồi ấn triện.');
    }

    localStorage.setItem(STORAGE_PREFIX + 'reactions_' + this.articleId, JSON.stringify(reactions));
    localStorage.setItem(STORAGE_PREFIX + 'user_voted_' + this.articleId, JSON.stringify(userVoted));

    if (countEl) countEl.textContent = reactions[type];
    if (btn) {
      const activeColor = type === 'tamDac' ? 'heritage-cinnabar' : 'heritage-gold';
      btn.classList.toggle(`border-${activeColor}`);
      btn.classList.toggle(`bg-${activeColor}/20`);
      btn.classList.toggle(`text-${activeColor}`);
    }
  }

  showStampAnimation(btn, text) {
    if (!btn) return;
    const stamp = document.createElement('div');
    stamp.className = 'absolute -top-8 left-1/2 -translate-x-1/2 font-serif text-xs font-bold px-2 py-0.5 rounded border border-heritage-cinnabar bg-heritage-cinnabar text-white shadow-lg pointer-events-none animate-bounce';
    stamp.textContent = text;
    btn.style.position = 'relative';
    btn.appendChild(stamp);
    setTimeout(() => stamp.remove(), 1200);
  }

  // 3. TÀNG THƯ (BOOKMARK)
  loadBookmark() {
    const bookmarks = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'bookmarks')) || [];
    const isBookmarked = bookmarks.includes(this.articleId);
    const btn = document.getElementById('btn-bookmark');
    if (!btn) return;

    if (isBookmarked) {
      btn.classList.add('text-heritage-gold', 'border-heritage-gold');
      btn.setAttribute('title', 'Đã lưu trong Tàng Thư');
    }
  }

  toggleBookmark() {
    let bookmarks = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'bookmarks')) || [];
    const isBookmarked = bookmarks.includes(this.articleId);
    const btn = document.getElementById('btn-bookmark');

    if (!isBookmarked) {
      bookmarks.push(this.articleId);
      this.showToast('Đã lưu bài viết vào Tàng Thư Các!');
      if (btn) btn.classList.add('text-heritage-gold', 'border-heritage-gold');
    } else {
      bookmarks = bookmarks.filter(id => id !== this.articleId);
      this.showToast('Đã bỏ lưu khỏi Tàng Thư Các.');
      if (btn) btn.classList.remove('text-heritage-gold', 'border-heritage-gold');
    }

    localStorage.setItem(STORAGE_PREFIX + 'bookmarks', JSON.stringify(bookmarks));
  }

  // 4. SAO CHÉP LIÊN KẾT (SHARE)
  copyArticleLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      this.showToast('Đã sao chép bút tích liên kết vào khay nhớ tạm!');
    }).catch(() => {
      this.showToast('Không thể sao chép liên kết.');
    });
  }

  // 5. KHU VỰC ĐÀM ĐẠO (BÌNH LUẬN)
  loadComments() {
    const listEl = document.getElementById('comments-list');
    const countEl = document.getElementById('comments-count');
    if (!listEl) return;

    let comments = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'comments_' + this.articleId));
    if (!comments) {
      comments = DEFAULT_COMMENTS[this.articleId] || [];
      localStorage.setItem(STORAGE_PREFIX + 'comments_' + this.articleId, JSON.stringify(comments));
    }

    if (countEl) countEl.textContent = `${comments.length} đàm đạo`;

    if (comments.length === 0) {
      listEl.innerHTML = `
        <div class="text-center py-8 text-heritage-muted font-serif text-sm italic">
          Chưa có đồng đạo nào để lại bút tích. Hãy là người đầu tiên mở lời đàm đạo!
        </div>
      `;
      return;
    }

    listEl.innerHTML = comments.map(c => `
      <div class="p-4 rounded-xl bg-heritage-card/60 border border-heritage-border/70 space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <img src="${c.avatar}" alt="${c.author}" class="w-8 h-8 rounded-full border border-heritage-gold/30 bg-heritage-ink" />
            <div>
              <span class="font-serif font-bold text-sm text-heritage-parchment">${this.escapeHtml(c.author)}</span>
              ${c.isGoogle ? '<span class="ml-2 text-[10px] px-1.5 py-0.2 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400">Google Verified</span>' : ''}
            </div>
          </div>
          <span class="font-mono text-xs text-heritage-muted">${c.date}</span>
        </div>
        <p class="text-sm text-heritage-parchment/90 leading-relaxed font-light pl-11">
          ${this.escapeHtml(c.content)}
        </p>
      </div>
    `).join('');
  }

  addComment(author, content, isGoogle = false, avatar = null) {
    if (!content.trim()) return;

    let comments = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'comments_' + this.articleId)) || [];
    const dateStr = new Date().toLocaleDateString('vi-VN');
    const safeAuthor = author.trim() || 'Lữ Khách Ẩn Danh';

    const newComment = {
      id: 'c_' + Date.now(),
      author: safeAuthor,
      avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(safeAuthor)}`,
      date: dateStr,
      content: content.trim(),
      isGoogle: isGoogle
    };

    comments.unshift(newComment);
    localStorage.setItem(STORAGE_PREFIX + 'comments_' + this.articleId, JSON.stringify(comments));

    this.loadComments();
    this.showToast('Bút tích đã được khắc ghi thành công!');
  }

  // 6. THÔNG BÁO TOAST
  showToast(message) {
    let toast = document.getElementById('heritage-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'heritage-toast';
      toast.className = 'fixed bottom-8 right-8 z-50 flex items-center gap-3 px-5 py-3 rounded-xl bg-heritage-card border border-heritage-gold/50 text-heritage-parchment shadow-2xl font-serif text-sm transition-all duration-300 opacity-0 translate-y-4 pointer-events-none';
      document.body.appendChild(toast);
    }

    toast.innerHTML = `
      <span class="w-2 h-2 rounded-full bg-heritage-cinnabar animate-pulse"></span>
      <span>${message}</span>
    `;
    toast.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
    }, 3000);
  }

  escapeHtml(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  // 7. GẮN SỰ KIỆN GIAO DIỆN
  setupEvents() {
    const btnTamDac = document.getElementById('btn-tam-dac');
    const btnKhaiSang = document.getElementById('btn-khai-sang');
    const btnBookmark = document.getElementById('btn-bookmark');
    const btnShare = document.getElementById('btn-share');
    const formComment = document.getElementById('form-comment');
    const btnGoogleLogin = document.getElementById('btn-google-login');

    if (btnTamDac) btnTamDac.addEventListener('click', () => this.toggleReaction('tamDac'));
    if (btnKhaiSang) btnKhaiSang.addEventListener('click', () => this.toggleReaction('khaiSang'));
    if (btnBookmark) btnBookmark.addEventListener('click', () => this.toggleBookmark());
    if (btnShare) btnShare.addEventListener('click', () => this.copyArticleLink());

    if (formComment) {
      formComment.addEventListener('submit', (e) => {
        e.preventDefault();
        const authorInput = document.getElementById('comment-author');
        const contentInput = document.getElementById('comment-content');
        if (contentInput && contentInput.value.trim()) {
          this.addComment(authorInput ? authorInput.value : '', contentInput.value);
          contentInput.value = '';
        }
      });
    }

    if (btnGoogleLogin) {
      btnGoogleLogin.addEventListener('click', () => {
        // Tích hợp giả lập / hook Google Sign-In cục bộ
        const guestName = prompt('Nhập danh xưng hoặc tài khoản Google của bạn:', 'DongDao_Google');
        if (guestName) {
          const authorInput = document.getElementById('comment-author');
          if (authorInput) {
            authorInput.value = guestName;
            authorInput.setAttribute('disabled', 'true');
          }
          btnGoogleLogin.innerHTML = `<i data-lucide="check" class="w-4 h-4 text-emerald-400"></i><span>Đã xác nhận (${guestName})</span>`;
          if (window.lucide) lucide.createIcons();
          this.showToast(`Đã ghi nhận danh xưng ${guestName}`);
        }
      });
    }
  }
}

// Khởi chạy khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  const articleContainer = document.querySelector('[data-article-id]');
  if (articleContainer) {
    const articleId = articleContainer.getAttribute('data-article-id');
    window.articleInteractions = new ArticleInteractions(articleId);
  }
});
