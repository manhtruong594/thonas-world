# Kế Hoạch Triển Khai: Trà Thất Tản Mạn

Tài liệu thiết kế và lộ trình kỹ thuật cho phân khu **Trà Thất Tản Mạn** (thay thế khối *Khí Cụ Chế Tác* cũ) trên website **thonas-world**.

---

## 1. Định Vị & Mục Tiêu

* **Tên phân khu:** Trà Thất Tản Mạn (ID anchor: `#musings`).
* **Ý niệm cổ phong:** Quán trà ven đường dành cho người làm game dừng chân: nhấp ngụm trà nóng, đàm đạo chuyện nghề, sự đời và những tầng sâu văn hóa.
* **Mục tiêu:** 
  * Biến portfolio từ một trang kỹ thuật thuần túy thành không gian có chiều sâu cá tính và tư tưởng của một *Unity Game Artisan*.
  * Cung cấp góc nhìn chân thực về quá trình làm game độc lập (Indie Game Devlog).

---

## 2. Ba Trụ Cột Nội Dung Cốt Lõi

| Trụ Cột | Tên Tiếng Việt / Cổ Phong | Nội Dung Dự Kiến |
| :--- | :--- | :--- |
| **1. Game Devlog** | *Chế Tác Thực Lục* | • Hậu trường thai nghén ý tưởng từ bản vẽ nháp đến prototype.<br>• Các thử thách kỹ thuật, những lần đập đi xây lại hệ thống.<br>• Nhật ký phát hành, bài học từ các đợt playtest. |
| **2. Chiêm Nghiệm** | *Nhân Sinh Cảm Ngộ* | • Tâm thế người làm kỹ thuật: sự cô đơn, kỷ luật và niềm đam mê.<br>• Cách giữ lửa làm game, cân bằng giữa cuộc sống và dự án cá nhân.<br>• Góc nhìn về sự nghiệp, phát triển bản thân và tư duy phản biện. |
| **3. Văn Sử** | *Cổ Phong & Sử Luận* | • Điển tích, trang phục, kiến trúc, mỹ cảm Á Đông làm chất liệu game.<br>• Tản mạn về lịch sử dân tộc, huyền sử và cách tái hiện vào thế giới ảo.<br>• Triết lý thẩm mỹ (Thủy mặc, giấy Dó, sự tĩnh lặng trong game). |

---

## 3. Kiến Trúc Dữ Liệu & Giao Diện Đề Xuất

### Mô hình 1: Quản lý qua file dữ liệu độc lập (`assets/data/musings.json`)
Tách biệt khỏi hệ thống bài viết kỹ thuật dài (`articles.json`) để giữ bản sắc tản văn ngắn gọn, giàu hình ảnh:

```json
[
  {
    "id": "devlog-01-khoi-nguyen",
    "pillar": "che-tac",
    "pillarLabel": "Chế Tác Thực Lục",
    "title": "Khi Dòng Code Đầu Tiên Vẽ Nên Cổ Kiếm",
    "season": "Tiết Hàn Lộ • Thu 2026",
    "excerpt": "Ba tháng trước, khi ngồi trước màn hình trống rỗng, tôi tự hỏi liệu một game thủ thành có thể mang trọn vẹn phong vị thủy mặc hay không...",
    "quote": "Làm game như mài kiếm, chín phần nhẫn nại, một phần thăng hoa.",
    "readTime": "3 phút ngẫm",
    "tags": ["Devlog", "Cổ Kiếm Vấn Đạo", "Prototype"]
  },
  {
    "id": "tam-but-01-su-co-don",
    "pillar": "nhan-sinh",
    "pillarLabel": "Nhân Sinh Cảm Ngộ",
    "title": "Về Những Đêm Một Mình Cùng Trình Biên Dịch",
    "season": "Đêm Trừ Tịch • 2026",
    "excerpt": "Trong căn phòng tối chỉ có ánh sáng từ màn hình, tiếng quạt tản nhiệt quay đều đều như tiếng thở dài của thời gian...",
    "quote": "Người chế tác thế giới ảo trước hết phải thấu suốt thế giới thật.",
    "readTime": "2 phút ngẫm",
    "tags": ["Chiêm Nghiệm", "Đời Lập Trình"]
  }
]
```

---

## 4. Thiết Kế UI/UX Theo Mỹ Cảm Cổ Phong

1. **Thẻ Tản Mạn (Musing Cards):**
   * Nền màu giấy Dó (`bg-heritage-card/40`), viền họa tiết mờ (`border-heritage-border/70`).
   * Phân loại trụ cột bằng các huy hiệu cổ phong riêng biệt:
     * *Chế Tác Thực Lục:* Viền hổ phách vàng (`text-heritage-amber border-heritage-amber/30`).
     * *Nhân Sinh Cảm Ngộ:* Viền chu sa đỏ (`text-heritage-cinnabar border-heritage-cinnabar/30`).
     * *Cổ Phong & Sử Luận:* Viền hoàng kim lấp lánh (`text-heritage-gold border-heritage-gold/30`).
   * Thời gian hiển thị theo tiết khí / mùa thay vì ngày tháng khô khan (ví dụ: *Tiết Lập Thu*, *Đêm tàn tháng Ba*).
   * Khối trích dẫn châm ngôn (`quote`) in nghiêng font Serif có đường kẻ viền chu sa bên trái (`border-l-2 border-heritage-cinnabar pl-3`).

2. **Cơ chế đọc nội dung:**
   * **Cách A (Gọn nhẹ):** Mở xem bài tản mạn trực tiếp trong một Modal cổ phong dạng thư tịch cổ (tương tự như `<dialog id="inspector-modal">` của phần Kỳ Thư Tác Phẩm).
   * **Cách B (Mở rộng):** Chuyển hướng sang trang đọc tản văn chi tiết nếu bài viết dài.

---

## 5. Lộ Trình Triển Khai (Roadmap)

- [x] **Giai đoạn 1:** Dỡ bỏ khối *Khí Cụ Chế Tác* cũ trong `index.html`.
- [x] **Giai đoạn 2:** Tạo khối *Trà Thất Tản Mạn* trạng thái `Coming Soon` tại `index.html` và đồng bộ Navbar/CSS.
- [ ] **Giai đoạn 3 (Khi kích hoạt):**
  1. Tạo file dữ liệu `assets/data/musings.json`.
  2. Viết module JavaScript `assets/js/musings.js` (nạp dữ liệu, lọc theo 3 trụ cột, mở popup đọc).
  3. Render 3 thẻ tản mạn tiêu biểu trên trang chủ với hiệu ứng cuộn mượt và ấn triện tâm đắc.
  4. (Tùy chọn) Bổ sung trang con `musings/index.html` nếu số lượng bài viết tản mạn phát triển lớn.
