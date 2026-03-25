# 📝 Cập Nhật HTML - Recommender System

## ✅ Hoàn Thành

### 1. **signup.html** - Cập Nhật Giao Diện
Đã cập nhật để đồng bộ với login.html:

**Thay đổi:**
- Giao diện hiện đại với backdrop blur
- Đầu vào: Họ tên, Email, Số điện thoại, Mật khẩu, Nhập lại mật khẩu
- Password strength indicator (màu đỏ/vàng/xanh)
- Error/Success messages
- Icons từ Font Awesome
- Responsive design
- Link qua login.html

**Form Fields:**
```html
- Full Name (input text)
- Email (input email)
- Phone (input tel, pattern: [0-9]{10,11})
- Password (input password, min 6 chars)
- Confirm Password (input password)
```

---

### 2. **restaurant-detail.html** - Thêm Phần Gợi Ý

**Thêm vào cuối trang (trước footer):**
```html
<!-- Recommended Restaurants Section -->
<div class="container my-5">
    <div class="section-header mb-4">
        <i class="fas fa-sparkles text-warning"></i>
        <h4>Nhà hàng gợi ý cho bạn</h4>
    </div>
    <div class="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4 mb-5" id="recommendedContainer">
        <!-- Recommended restaurants will be loaded here -->
    </div>
    <div id="noRecommended" class="text-center text-muted py-4" style="display: none;">
        <i class="fas fa-info-circle me-2"></i>
        <span>Không có nhà hàng gợi ý khác</span>
    </div>
</div>
```

**Mục đích:**
- Hiển thị các nhà hàng tương tự dựa trên category
- Hỗ trợ recommender system
- Gợi ý thêm nhà hàng cho người dùng

---

## 🎨 CSS Cập Nhật

### Thêm `.section-header`
```css
.section-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 3px solid var(--primary-color);
}

.section-header i {
    font-size: 1.5rem;
}

.section-header h4 {
    font-weight: 700;
    font-size: 1.5rem;
    margin: 0;
    color: var(--text-dark);
}
```

---

## 📋 API Integration Cần Code (JavaScript)

### restaurant-detail.js

**1. Fetch nhà hàng gợi ý cùng category:**
```javascript
// Lấy danh sách nhà hàng cùng category
fetch(`/api/restaurants?category=${restaurantCategory}`)
  .then(res => res.json())
  .then(data => {
    // Filter bỏ nhà hàng hiện tại
    const recommendations = data.filter(r => r.id !== currentRestaurantId);
    // Hiển thị max 4 nhà hàng
    renderRecommendations(recommendations.slice(0, 4));
  });
```

**2. Hoặc fetch từ API gợi ý:**
```javascript
// Nếu backend có API riêng cho recommendations
fetch(`/api/recommendations/${restaurantId}`)
  .then(res => res.json())
  .then(data => renderRecommendations(data));
```

**3. Render recommendations:**
```javascript
function renderRecommendations(restaurants) {
  const container = document.getElementById('recommendedContainer');
  const noRecommended = document.getElementById('noRecommended');
  
  if (restaurants.length === 0) {
    noRecommended.style.display = 'block';
    container.innerHTML = '';
    return;
  }
  
  noRecommended.style.display = 'none';
  container.innerHTML = restaurants.map(r => `
    <div class="col">
      <div class="restaurant-card" onclick="goToDetail(${r.id})">
        <img src="${r.imageUrl}" class="card-img-top" alt="${r.name}">
        <div class="card-body">
          <h5 class="card-title">${r.name}</h5>
          <p class="card-text text-muted">${r.category}</p>
          <div class="card-footer-info">
            <span class="category-tag">${r.category}</span>
            <span class="price-tag">${r.priceAverage}</span>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}
```

---

## 📊 Recommender System Flow

```
User View Restaurant Detail
    ↓
Load Restaurant Info
    ↓
Load Recommendations (by category / similarity)
    ↓
Display 4 Similar Restaurants Below
    ↓
User can Click → View Similar Restaurant
    ↓
New Recommendations Load
```

---

## 🎯 Các Endpoint API Cần Implement

```
GET /api/restaurants?category={category}
  - Trả về danh sách nhà hàng theo category
  - Query params: category, limit, offset

GET /api/recommendations/{restaurantId}
  - Trả về danh sách nhà hàng gợi ý (tùy chọn)
  - Có thể dùng algorithm gợi ý ở backend
```

---

## 🔄 Workflow Recommender System

### Scenario 1: Dùng Category
1. User vào chi tiết nhà hàng phở
2. Frontend fetch `/api/restaurants?category=Phở&exclude={currentId}`
3. Hiển thị top 4 nhà hàng phở khác

### Scenario 2: Dùng Similarity (Advanced)
1. Backend có lưu `similar_restaurant_ids` (JSON)
2. Frontend fetch `/api/recommendations/{restaurantId}`
3. Backend trả về danh sách nhà hàng tương tự

### Scenario 3: Dùng User History (ML)
1. Backend ghi nhớ nhà hàng user xem
2. Gợi ý dựa trên hành vi user
3. Frontend fetch `/api/recommendations/user/{userId}`

---

## 📝 Ghi Chú

- **signup.html** đã cập nhật style, cần code JS để handle registration
- **restaurant-detail.html** đã thêm HTML/CSS cho recommendations, cần code JS để fetch & render
- CSS đã hoàn thiện với `.section-header` component
- Build thành công ✅

---

## 🎁 Recommendation UX Tips

✅ Hiển thị "Nhà hàng gợi ý cho bạn" ở dưới form booking
✅ Max 4 nhà hàng để không quá dài trang
✅ Click vào card → chuyển sang detail page của nhà hàng đó
✅ Recommendation cập nhật mỗi lần user vào trang
✅ Lazy load recommendations sau 2 giây (tối ưu tốc độ)

---

**Status:** ✅ HTML/CSS DONE - Ready for JavaScript  
**Ngày cập nhật:** 25/03/2026

