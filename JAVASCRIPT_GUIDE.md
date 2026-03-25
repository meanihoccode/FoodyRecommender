# 🚀 Hướng Dẫn Quick Start - Code JavaScript

## 📁 Cấu Trúc Folder JS

```
src/main/resources/js/
  ├─ login.js              (xử lý login/signup)
  ├─ restaurants.js        (load, filter, search)
  ├─ restaurant-detail.js  (booking, favorites)
  ├─ reservations.js       (danh sách booking)
  ├─ favorites.js          (danh sách yêu thích)
  └─ utils.js              (helper functions)
```

---

## 📝 Template Cơ Bản Cho Mỗi File

### **login.js**
```javascript
// Lưu user vào localStorage
localStorage.setItem('userId', user.id);
localStorage.setItem('userFullName', user.fullName);
localStorage.setItem('userEmail', user.email);

// Redirect
window.location.href = '/home';

// Logout
localStorage.clear();
window.location.href = '/login';
```

### **restaurants.js**
```javascript
// Load restaurants
fetch('/api/restaurants')
  .then(res => res.json())
  .then(data => {
    // Render cards
    data.forEach(restaurant => {
      // Tạo HTML card từ template
    });
  });

// Filter by category
document.querySelectorAll('.category-badge').forEach(badge => {
  badge.addEventListener('click', () => {
    // Filter dữ liệu
  });
});

// Search
document.getElementById('searchBtn').addEventListener('click', () => {
  const keyword = document.getElementById('searchInput').value;
  // Filter by name
});
```

### **restaurant-detail.js**
```javascript
// Lấy ID từ URL
const params = new URLSearchParams(window.location.search);
const restaurantId = params.get('id');

// Load chi tiết nhà hàng
fetch(`/api/restaurants/${restaurantId}`)
  .then(res => res.json())
  .then(data => {
    // Set innerHTML cho các element
    document.getElementById('restaurantName').textContent = data.name;
    // ... set các field khác
  });

// Submit form booking
document.getElementById('bookingForm').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const reservation = {
    userId: localStorage.getItem('userId'),
    restaurantId: restaurantId,
    bookingDate: document.getElementById('bookingDate').value,
    bookingTime: document.getElementById('bookingTime').value,
    partySize: document.getElementById('partySize').value,
    contactName: document.getElementById('contactName').value,
    contactPhone: document.getElementById('contactPhone').value
  };

  fetch('/api/reservations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reservation)
  })
  .then(res => res.json())
  .then(data => {
    // Show success modal
    // Redirect sau 2 giây
  });
});

// Favorite button
document.getElementById('favoriteBtn').addEventListener('click', () => {
  const userSaved = {
    userId: localStorage.getItem('userId'),
    restaurantId: restaurantId
  };

  fetch('/api/user-saved', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userSaved)
  });
});
```

### **reservations.js**
```javascript
// Load reservations
const userId = localStorage.getItem('userId');
fetch(`/api/reservations?userId=${userId}`)
  .then(res => res.json())
  .then(data => {
    // Group by status
    const groupedByStatus = groupBy(data, 'status');
    
    // Render cards cho mỗi status
    renderReservations(groupedByStatus);
  });

// Cancel reservation
function cancelReservation(reservationId) {
  fetch(`/api/reservations/${reservationId}`, {
    method: 'DELETE'
  })
  .then(() => {
    // Reload page hoặc remove card
  });
}
```

### **favorites.js**
```javascript
// Load favorites
const userId = localStorage.getItem('userId');
fetch(`/api/user-saved/${userId}`)
  .then(res => res.json())
  .then(data => {
    // Render restaurant cards
    data.forEach(restaurant => {
      // Tạo card HTML
    });
  });

// Remove from favorites
function removeFavorite(restaurantId) {
  const userId = localStorage.getItem('userId');
  fetch(`/api/user-saved/${userId}/${restaurantId}`, {
    method: 'DELETE'
  })
  .then(() => {
    // Remove card từ DOM
  });
}
```

---

## 🔧 Helper Functions (utils.js)

```javascript
// Format ngày tháng
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('vi-VN');
}

// Format tiền
function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

// Group array by property
function groupBy(array, key) {
  return array.reduce((result, item) => {
    (result[item[key]] = result[item[key]] || []).push(item);
    return result;
  }, {});
}

// Validate email
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validate phone
function validatePhone(phone) {
  return /^[0-9]{10,11}$/.test(phone);
}

// Show error message
function showError(message, elementId = 'errorMsg') {
  const errorEl = document.getElementById(elementId);
  if (errorEl) {
    errorEl.classList.remove('d-none');
    errorEl.textContent = message;
  }
}

// Hide error message
function hideError(elementId = 'errorMsg') {
  const errorEl = document.getElementById(elementId);
  if (errorEl) {
    errorEl.classList.add('d-none');
  }
}

// Show toast notification
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `alert alert-${type} position-fixed bottom-0 end-0 m-3`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.remove(), 3000);
}

// Check authentication
function checkAuth() {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    window.location.href = '/login';
    return false;
  }
  return true;
}

// Get set username
function setUserDisplay() {
  const fullName = localStorage.getItem('userFullName');
  if (fullName) {
    document.getElementById('username').textContent = fullName;
  }
}

// Set min date for booking (hôm nay)
function setMinDate() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('bookingDate').setAttribute('min', today);
}
```

---

## 🔄 Flow Khi Code JavaScript

### Step 1: Mỗi trang JS bắt đầu bằng
```javascript
// Kiểm tra auth
if (!checkAuth()) return;

// Set user display name
setUserDisplay();

// Load dữ liệu
loadData();
```

### Step 2: Fetch dữ liệu từ API
```javascript
fetch('/api/endpoint')
  .then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then(data => {
    // Render dữ liệu
  })
  .catch(error => {
    showError(error.message);
  });
```

### Step 3: Render HTML từ dữ liệu
```javascript
function renderRestaurants(restaurants) {
  const container = document.getElementById('restaurantsContainer');
  container.innerHTML = restaurants.map(r => `
    <div class="col">
      <div class="restaurant-card" onclick="goToDetail(${r.id})">
        <img src="${r.imageUrl}" class="card-img-top">
        <div class="card-body">
          <h5 class="card-title">${r.name}</h5>
          <p class="card-text">${r.category}</p>
        </div>
      </div>
    </div>
  `).join('');
}
```

### Step 4: Xử lý events
```javascript
document.getElementById('searchBtn').addEventListener('click', () => {
  const keyword = document.getElementById('searchInput').value;
  // Filter & render
});
```

---

## 🎯 Ưu tiên Code JS

**Tuần 1:** (Cần ASAP)
1. login.js - Đăng nhập
2. restaurants.js - Danh sách
3. restaurant-detail.js - Chi tiết + booking

**Tuần 2:** (Sau đó)
4. reservations.js - Lịch booking
5. favorites.js - Yêu thích

---

## 🚀 Tip Khi Code

✅ **Luôn kiểm tra auth trước**
```javascript
if (!checkAuth()) return;
```

✅ **Validate form trước submit**
```javascript
if (!validateEmail(email)) {
  showError('Email không hợp lệ');
  return;
}
```

✅ **Xử lý error response từ API**
```javascript
.then(res => res.ok ? res.json() : Promise.reject(res))
.catch(error => showError('Lỗi: ' + error));
```

✅ **Set min date cho date picker**
```javascript
document.getElementById('bookingDate').min = today;
```

✅ **Debounce search để không quá nhiều request**
```javascript
let searchTimeout;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => search(), 300);
});
```

---

## 📌 API Format Response

```javascript
// GET /api/restaurants
[
  { id: 1, name: "Nhà hàng A", category: "Phở", priceAverage: "50000", description: "...", imageUrl: "..." },
  ...
]

// GET /api/restaurants/{id}
{ id: 1, name: "...", category: "...", priceAverage: "...", address: "...", imageUrl: "..." }

// POST /api/reservations
{ 
  id: 1, 
  userId: 1,
  restaurantId: 1,
  bookingDate: "2026-03-25",
  bookingTime: "19:00",
  partySize: 4,
  contactName: "Nguyễn Văn A",
  contactPhone: "0123456789",
  status: "PENDING",
  createdAt: "2026-03-25T12:00:00"
}
```

---

## ✨ Link Tham Khảo

- Bootstrap 5 Docs: https://getbootstrap.com/docs/5.3/
- MDN Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
- JavaScript.info: https://javascript.info/

---

Sẵn sàng code JS! 💪

