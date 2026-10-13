# Tổng Quan Kiến Trúc & Logic Dự Án thonas-world

Dự án **thonas-world** là một website cá nhân / portfolio kiêm blog kỹ thuật chuyên sâu dành cho **Unity Game Developer**, xây dựng theo phong cách mỹ cảm cổ phong Á Đông (giấy Dó, mực tàu, thếp vàng, chu sa, ấn triện). Toàn bộ hệ thống chạy dưới dạng static site không phụ thuộc backend server, triển khai trên GitHub Pages.

---

## 1. Cấu Trúc Thư Mục & Các Thành Phần

```text
thonas-world/
├── index.html                      # Trang chủ portfolio chính (Showcase 3 bài tiêu biểu)
├── articles/                       # Thư mục chuyên đề bài viết
│   ├── index.html                  # Bách Khoa Các: Toàn bộ bài viết, tìm kiếm, lọc chuyên mục
│   ├── zero-alloc-gc.html          # Chuyên đề tối ưu Garbage Collection trong Unity
│   ├── scriptable-objects-architecture.html # Chuyên đề kiến trúc GameEvent ScriptableObjects
│   └── water-ink-shader.html       # Chuyên đề URP Shader Graph Thủy Mặc & Sobel
├── projects/                       # Thư mục Kỳ Thư Tác Phẩm
│   └── index.html                  # Kỳ Thư Tác Phẩm: Danh sách dự án, tra cứu theo tên, modal giám định
├── assets/
│   ├── data/
│   │   ├── articles.json           # Siêu dữ liệu bài viết tập trung (metadata registry)
│   │   └── projects.json           # Siêu dữ liệu tác phẩm dự án game
│   ├── css/
│   │   └── theme.css               # Hệ biến màu cổ phong & Dark/Light mode
│   └── js/
│       ├── theme.js                # Quản lý giao diện sáng/tối (áp dụng toàn site, nút toggle chỉ đặt tại trang chủ)
│       ├── article-interactions.js # Module xử lý tương tác độc giả & LocalStorage
│       └── projects.js             # Module quản lý Kỳ Thư Tác Phẩm & Modal Giám Định Kỹ Thuật
└── PROJECT_LOGIC_SUMMARY.md        # Tài liệu tóm tắt logic toàn bộ dự án
```

---

## 2. Logic Chi Tiết Từng Thành Phần

### 2.1. Trang Chủ (`index.html`)

- **Phong cách & Giao diện:**
  - Tailwind CSS qua CDN với bảng màu tùy biến `heritage` (`ink`, `card`, `border`, `gold`, `amber`, `cinnabar`, `parchment`, `muted`).
  - Họa tiết chấm hạt giấy Dó (`bg-do-paper`), hiệu ứng ánh sáng mờ (`ink-glow`), con dấu triện (`seal-stamp`).
  - Hệ thống icon Lucide (`lucide.createIcons()`).
  - **Tối ưu Typography & Render (Baseline Standards):**
    - Áp dụng `text-wrap: balance` cho các tiêu đề `h1, h2, h3` và `text-wrap: pretty` cho các đoạn văn nhằm cân đối layout chữ và chống ngắt từ đơn lẻ (orphans).
    - Hoãn render nội dung dưới viewport ban đầu (Deferred Rendering) bằng `content-visibility: auto` và `contain-intrinsic-size` cho `#projects`, `#tech`, `#contact`, danh sách bài viết/dự án từ vị trí thứ 3, và bình luận từ vị trí thứ 4.
- **Các phân khu nội dung (Sections):**
  1. `header`: Thanh điều hướng cố định với menu desktop, drawer mobile menu (khai báo Popover API native qua `popover` và `popovertarget="mobile-menu"`, kèm fallback JS) và nút chuyển đổi giao diện sáng/tối (`data-theme-toggle`). Đây là vị trí duy nhất trên website đặt nút đổi theme Dark/Light.
  2. `#hero`: Lời tựa, định danh "Unity Game Artisan", thẻ trạng thái thông số kỹ thuật (120 FPS, 0 B GC, URP Pipeline).
  3. `#about` (Ngẫm & Luận): 3 trụ cột triết lý làm game (Tối ưu thuần khiết, Game Feel, Mỹ cảm Á Đông).
  4. `#articles` (Ký Sự Kỹ Nghệ): Hiển thị cố định 3 bài viết tiêu biểu (`featured: true`) kèm nút điều hướng "Vào Bách Khoa Các" (`articles/index.html`).
  5. `#projects` (Kỳ Thư Tác Phẩm): Giới thiệu dự án game nổi bật (*Cổ Kiếm Vấn Đạo*, *Vân Sơn Mê Cung*) kèm nút điều hướng "Vào Kỳ Thư Tác Phẩm" (`projects/index.html`).
  6. `#tech` (Khí Cụ Làm Game): Danh sách công cụ (C#, Unity, Shader Graph, Unity Profiler, Git LFS, FMOD, Blender, DOTS).
  7. `#contact` (Bái Phỏng): Khung kết nối qua email và menu dropdown mạng xã hội (Facebook, Discord).
- **Logic Script Trang Chủ:**
  - **Mobile Menu Popover:** Khai báo declarative với HTML Popover API, tự động light-dismiss và đóng khi click phím Escape hoặc bấm vào liên kết chuyển trang. Có script fallback kiểm tra `!('showPopover' in HTMLElement.prototype)` để toggle class `hidden` trên trình duyệt cũ.
  - **Nạp động 3 bài tiêu biểu:** Tải từ `assets/data/articles.json`, lọc theo `featured: true`, render tối đa 3 thẻ bài viết cổ phong.
  - **Điều hướng bài viết tức thời:** Bắt sự kiện click trên `[data-article-link]` để chuyển hướng ngay sang trang bài viết.
  - **Đồng bộ chỉ số tương tác thời gian thực:** Đọc số lượt Ấn Triện (`tamDac`) và số lượt bình luận từ `localStorage` để cập nhật trực tiếp lên các thẻ tương ứng.

---

### 2.2. Module Tương Tác Dùng Chung (`assets/js/article-interactions.js`)

Module hướng đối tượng `ArticleInteractions`, khởi tạo theo từng `data-article-id` của trang bài viết. Toàn bộ dữ liệu được quản lý với tiền tố key `ky_su_game_`.

#### A. Thanh tiến trình đọc (`initProgressBar`)
- **CSS Scroll-driven animations:** Áp dụng `@keyframes grow-reading-progress` kết hợp `animation-timeline: scroll(root block)` trong khối `@supports (animation-timeline: scroll())` của `assets/css/theme.css`. Hoạt động trực tiếp trên GPU Compositor thread, không tiêu tốn CPU Main thread.
- **JavaScript Fallback:** `initProgressBar()` kiểm tra `CSS.supports('animation-timeline: scroll()')`. Nếu trình duyệt chưa hỗ trợ, tự động kích hoạt event listener `window.onscroll` với cờ `{ passive: true }` để tính tỷ lệ cuộn gán vào `width: X%`.

#### B. Hệ thống Ấn Triện / Phản hồi (`toggleReaction`)
- Phân loại:
  - `tamDac`: 💮 Tâm Đắc (Ấn Chu Sa đỏ - tương đương Like/Clap).
  - `khaiSang`: 💡 Khai Sáng (Ấn Hổ Phách vàng - tương đương Insightful).
- Cơ chế lưu trữ:
  - `ky_su_game_reactions_[articleId]`: Lưu tổng số lượng từng loại. Có giá trị khởi tạo mặc định.
  - `ky_su_game_user_voted_[articleId]`: Lưu trạng thái đã ấn của người dùng hiện tại (bấm lần 1 tăng điểm + đổi màu nút, bấm lần 2 thu hồi điểm).
- Hiệu ứng thị giác: `showStampAnimation` tạo badge con dấu dập nảy (`animate-bounce`) bung lên phía trên nút ấn.

#### C. Bách Khoa Các / Bookmark (`toggleBookmark`)
- Lưu mảng các ID bài viết đã đánh dấu vào `ky_su_game_bookmarks`.
- Cập nhật trạng thái hiển thị của nút `#btn-bookmark` (đổi sang viền vàng hoàng kim khi đã lưu).

#### D. Sao chép liên kết (`copyArticleLink`)
- Gọi `navigator.clipboard.writeText(window.location.href)`.
- Hiển thị Toast thông báo cổ phong ở góc dưới màn hình.

#### E. Khu vực Đàm Đạo / Bình Luận (`loadComments`, `addComment`)
- Khóa lưu trữ: `ky_su_game_comments_[articleId]`.
- Cấu trúc 1 bình luận: `{ id, author, avatar, date, content, isGoogle }`.
- Luồng hoạt động:
  - Khởi tạo với bình luận mẫu nếu chưa có dữ liệu trong máy.
  - Form validation: Kết hợp thuộc tính `required` với pseudo-class CSS `:user-invalid` và `:user-valid` trong `assets/css/theme.css` để chỉ cảnh báo viền đỏ chu sa sau khi người dùng rời khỏi ô nhập liệu (blur).
  - Khi người dùng gửi form `#form-comment`: Kiểm tra chuỗi, escape HTML chống XSS, tạo bình luận mới, đẩy lên đầu danh sách (`unshift`), lưu `localStorage`, cập nhật lại giao diện và thông báo Toast.
  - Nút `#btn-google-login`: chỉ mô phỏng. Mở `prompt()` nhập danh xưng, rồi gắn `isGoogle: true` (hiện huy hiệu "Google Verified"). Không có OAuth thật (xem mục 5).

#### F. Thông báo Toast cổ phong (`showToast`)
- Tự động sinh container `#heritage-toast` với thuộc tính `popover="manual"` để đẩy phần tử lên **Top Layer** độc lập, không bị ảnh hưởng bởi `z-index` hay `overflow: hidden` của container cha.
- Hỗ trợ trợ năng: Khai báo `role="status"` và `aria-live="polite"` cho trình đọc màn hình.
- Đi kèm đèn tín hiệu chu sa nhấp nháy (`bg-heritage-cinnabar animate-pulse`), quản lý timer chống giật nháy khi bấm liên tục, tự động ẩn sau 3 giây.
- Fallback tự động bằng class opacity nếu trình duyệt chưa hỗ trợ Popover API.

---

### 2.3. Các Trang Bài Viết Độc Lập (`articles/*.html`)

Mỗi trang là một tài liệu HTML hoàn chỉnh, kế thừa layout Á Đông của trang chủ:
- Có thanh tiến trình đọc trên cùng (`#reading-progress-bar`).
- Có Header với nút quay lại trang chủ và các nút hành động nhanh (`Chia sẻ`, `Tàng Thư`), không có nút chỉnh Dark/Light mode (kế thừa tự động trạng thái theme từ `localStorage`).
- Breadcrumb điều hướng phân cấp rõ ràng.
- Nội dung chuyên sâu kèm code block có format giao diện trình đọc code.
- Khung hành động "Hạ Bút Ấn Triện" (`#btn-tam-dac`, `#btn-khai-sang`).
- Khu vực "Góc Đàm Đạo Đồng Đạo" với form bình luận và danh sách bình luận đã lưu.

### 2.4. Trang Bách Khoa Các (`articles/index.html`)

Trang kho lưu trữ bài viết toàn diện của hệ thống:
- **Header:** Giữ thanh điều hướng phong cách cổ phong Á Đông và nút quay lại trang chủ (không có nút chỉnh Dark/Light mode).
- **Thanh tìm kiếm tức thời (Client-side Search):** Tìm kiếm theo tiêu đề, tóm tắt và thẻ tag (`#ZeroAlloc`, `#Shader`...).
- **Bộ lọc chuyên mục (Taxonomy Tabs):** *Tất Cả*, *Thuật Tối Ưu*, *Kiến Trúc Code*, *Thủy Mặc & Shader*, và tab *Đã Đánh Dấu* (lọc theo danh sách bookmark của người dùng).
- **Bộ đếm & Danh sách bài:** Tự động nạp từ `assets/data/articles.json`, hiển thị số lượng bài tương ứng, render thẻ bài viết kèm số liệu Ấn Triện và Đàm Đạo từ `localStorage`.
- **Trạng thái rỗng (Empty State):** Thông báo cổ phong trang nhã khi không tìm thấy kết quả phù hợp.

### 2.5. Trang Kỳ Thư Tác Phẩm (`projects/index.html`)

Trang lưu trữ và trưng bày các dự án game thực chiến của tác giả:
- **Header:** Giữ thanh điều hướng phong cách cổ phong Á Đông và nút quay lại trang chủ (không có nút chỉnh Dark/Light mode).
- **Cơ sở dữ liệu tập trung (`assets/data/projects.json`):** Quản lý toàn bộ danh sách tác phẩm, thông số tối ưu, kiến trúc code và giải pháp kỹ thuật.
- **Thanh tra cứu theo tên tác phẩm (Search by Name):** Tìm kiếm tức thời theo tên dự án (bỏ qua dấu tiếng Việt, không phân biệt hoa thường).
- **Bộ đếm tác phẩm:** Hiển thị số lượng tác phẩm khớp từ khóa / tổng số tác phẩm.
- **Kỳ Thư Giám Định (Technical Inspector Modal):** Thẻ native `<dialog id="inspector-modal" closedby="any" aria-labelledby="inspector-modal-title">`, quản lý mở/đóng bằng `showModal()` và `close()`. Nền mờ xử lý bằng pseudo-element bản địa `::backdrop`. Tự động bẫy tiêu điểm (focus trap), hỗ trợ phím Escape và light-dismiss (kèm JS fallback kiểm tra bounding rect cho trình duyệt chưa hỗ trợ `closedby`). Hiển thị đầy đủ thông số Profiler (Target FPS, GC Alloc, Draw Calls), kiến trúc phần mềm, danh sách giải pháp kỹ thuật và nút đóng modal linh hoạt.
- **Hệ thống Ấn Triện Tác Phẩm:** Độc giả có thể hạ ấn triện `tamDac` (💮 Tâm Đắc) và `tinhDieu` (⚡ Tinh Diệu), đồng bộ thời gian thực vào `localStorage`.

---

## 3. Cơ Chế Lưu Trữ Dữ Liệu Cục Bộ (LocalStorage Schema)

| Key trong LocalStorage | Kiểu Dữ Liệu | Mục Đích |
| :--- | :--- | :--- |
| `ky_su_game_reactions_{id}` | `{ tamDac: number, khaiSang: number }` | Lưu tổng số lượt ấn triện của bài viết `{id}` |
| `ky_su_game_user_voted_{id}` | `{ tamDac: boolean, khaiSang: boolean }` | Lưu trạng thái người dùng đã ấn triện bài viết hay chưa |
| `ky_su_game_bookmarks` | `Array<string>` | Danh sách các ID bài viết đã lưu vào Tàng Thư |
| `ky_su_game_comments_{id}` | `Array<{ id, author, avatar, date, content, isGoogle }>` | Danh sách bình luận của bài viết `{id}` |
| `ky_su_game_project_reactions_{id}` | `{ tamDac: number, tinhDieu: number }` | Lưu tổng số lượt ấn triện của tác phẩm `{id}` |
| `ky_su_game_project_voted_{id}` | `{ tamDac: boolean, tinhDieu: boolean }` | Lưu trạng thái người dùng đã ấn triện tác phẩm hay chưa |
| `ky_su_game_theme` | `'light' \| 'dark'` | Trạng thái giao diện sáng/tối toàn website |

---

## 4. Cách Vận Hành & Lưu Ý Triển Khai (Deployment)

1. **GitHub Pages:**
   - Website được deploy tự động từ nhánh `main`.
   - Lưu ý đệm cache (`Cache-Control: max-age=600`): Khi có commit mới đẩy lên, cần **Ctrl + F5** hoặc mở tab ẩn danh để trình duyệt bỏ qua cache cũ.
2. **Khả năng mở rộng — thêm bài viết mới (Data-Driven):**
   1. Nhân bản một file trong `articles/`, đặt `data-article-id="id-moi"` (ví dụ: `articles/new-post.html`).
   2. Thêm siêu dữ liệu vào `assets/data/articles.json`:
      ```json
      {
        "id": "new-post",
        "title": "Tiêu đề bài viết...",
        "slug": "articles/new-post.html",
        "category": "Thuật Tối Ưu",
        "badgeStyle": "border-heritage-gold/30 bg-heritage-gold/5 text-heritage-gold",
        "readTime": "8 phút",
        "season": "Đông 2026",
        "summary": "Tóm tắt...",
        "tags": ["Tag1", "Tag2"],
        "featured": true,
        "date": "2026-11-01"
      }
      ```
   - Trang Bách Khoa Các (`articles/index.html`) tự động nạp bài mới vào danh sách, tìm kiếm và phân loại.
   - Trang chủ (`index.html`) tự động hiển thị bài mới nếu gán `featured: true` (giới hạn top 3 bài tiêu biểu). Không cần sửa tay file `index.html`.

---

## 5. Giới Hạn Hiện Tại

1. **Dữ liệu chỉ nằm trên trình duyệt (`localStorage`).**
   - Reaction, bookmark, bình luận không chia sẻ giữa người dùng hoặc thiết bị. Đây là mô phỏng giao diện tương tác, không phải tính năng cộng đồng.
   - Số liệu ban đầu lấy từ `DEFAULT_REACTIONS` / `DEFAULT_COMMENTS` (hardcode trong `article-interactions.js`; ví dụ `zero-alloc-gc`: `tamDac: 42`, `khaiSang: 28`). Bình luận mẫu là dữ liệu giả.
   - Xóa dữ liệu trình duyệt sẽ mất toàn bộ trạng thái.
2. **Không có xác thực thật.**
   - `#btn-google-login` chỉ mở `prompt()` để nhập danh xưng, rồi gắn cờ `isGoogle: true`. Không có OAuth / Google Sign-In.
   - Huy hiệu "Google Verified" không có giá trị xác minh và có thể bị giả mạo.
3. **Bảo mật:**
   - `escapeHtml` được áp dụng cho `author` và `content` khi hiển thị.
   - `alt="${c.author}"` và `src="${c.avatar}"` của thẻ `<img>` được chèn vào HTML không qua `escapeHtml`. Cần rà soát nếu cho phép dữ liệu bên ngoài.
   - Tiền tố key `ky_su_game_` chỉ là namespace, không mang ý nghĩa bảo mật.
4. **Phụ thuộc bên ngoài:**
   - Tailwind (`cdn.tailwindcss.com`), Lucide, Google Fonts, avatar DiceBear (`api.dicebear.com`) tải qua CDN/API ngoài, không có SRI và không có fallback offline. Tailwind CDN không khuyến nghị cho production.
5. **Chưa có:** meta SEO / Open Graph, kiểm tra accessibility, đo hiệu năng của chính trang web.
