/* ==================== BIẾN TOÀN CỤC ==================== */
let currentPage = 0;
let currentKeyword = "";
let currentCategory = "";

/* ==================== KHỞI TẠO KHI TẢI TRANG ==================== */
document.addEventListener('DOMContentLoaded', function() {
    // 1. Kiểm tra đăng nhập
    const userId = localStorage.getItem('userId');
    const userFullName = localStorage.getItem('userFullName');

    if (!userId) {
        window.location.href = '/login';
        return;
    }
    document.getElementById('username').textContent = userFullName || "User";

    // 2. Tải dữ liệu ban đầu
    loadCategories();
    // Gọi API lấy trang đầu tiên (trang 0), không nối thêm (isAppend = false)
    fetchRestaurants("", "", 0, false);

    // 3. Gắn sự kiện (Event Listeners)
    // Nút đăng xuất
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.clear();
        window.location.href = '/login';
    });

    // Nút Tìm kiếm
    document.getElementById('searchBtn').addEventListener('click', handleSearch);

    // Gõ Enter trong ô tìm kiếm
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    // Nút Xem thêm
    document.getElementById('loadMoreBtn').addEventListener('click', () => {
        currentPage++; // Tăng số trang lên
        fetchRestaurants(currentKeyword, currentCategory, currentPage, true); // true = Nối thêm vào danh sách cũ
    });
});

/* ==================== HÀM XỬ LÝ LOGIC CHÍNH ==================== */

// 1. Hàm gọi API từ Backend (Hỗ trợ phân trang)
async function fetchRestaurants(keyword, category, page, isAppend) {
    try {
        const spinner = document.getElementById('loadMoreBtn');
        if(isAppend) spinner.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang tải...';

        // URL gọi đến API Search có phân trang của Spring Boot
        const url = `/api/restaurants/search?keyword=${encodeURIComponent(keyword)}&category=${encodeURIComponent(category)}&page=${page}&size=12`;

        const response = await fetch(url);
        if (response.ok) {
            const pageData = await response.json(); // Nhận object Page từ Spring
            const restaurants = pageData.content;   // Danh sách nhà hàng nằm trong 'content'

            renderRestaurants(restaurants, isAppend);

            // Quản lý hiển thị nút "Xem thêm"
            const loadMoreContainer = document.getElementById('loadMoreContainer');
            if (pageData.last === true || restaurants.length === 0) {
                loadMoreContainer.style.display = "none"; // Nếu là trang cuối thì ẩn nút
            } else {
                loadMoreContainer.style.display = "block"; // Nếu còn trang thì hiện nút
            }
        }

        if(isAppend) spinner.innerHTML = '<i class="fas fa-chevron-down me-2"></i>Xem thêm';

    } catch (error) {
        console.error("Lỗi kết nối API:", error);
    }
}

// 2. Hàm vẽ giao diện thẻ nhà hàng
function renderRestaurants(restaurantsToRender, isAppend) {
    const container = document.getElementById('restaurantsContainer');

    // Nếu không phải nối thêm (tức là tìm kiếm mới hoặc lọc mới) thì xóa trắng container
    if (!isAppend) {
        container.innerHTML = '';
    }

    if (restaurantsToRender.length === 0 && !isAppend) {
        container.innerHTML = `
            <div class="col-12 text-center text-muted py-5">
                <i class="fas fa-search fa-3x mb-3 opacity-50"></i>
                <p class="fs-5">Không tìm thấy nhà hàng nào phù hợp.</p>
            </div>`;
        return;
    }

    restaurantsToRender.forEach(r => {
        const starHtml = renderStars(r.rating || 0);

        const cardHtml = `
            <div class="col">
                <div class="card h-100 border-0 shadow-sm hover-shadow transition">
                    <div class="position-relative">
                        <a href="/restaurant-detail.html?id=${r.id}">
                            <img src="${r.imageUrl || 'https://via.placeholder.com/500x300?text=No+Image'}" 
                                 class="card-img-top rounded-top" 
                                 style="height: 180px; object-fit: cover;" alt="${r.name}">
                        </a>
                    </div>
                    <div class="card-body p-3">
                        <span class="badge bg-danger bg-opacity-10 text-danger mb-2" style="font-size: 0.7rem;">
                            ${r.category || 'Ẩm thực'}
                        </span>
                        <h6 class="card-title fw-bold mb-1 text-truncate">
                            <a href="/restaurant-detail.html?id=${r.id}" class="text-decoration-none text-dark">
                                ${r.name}
                            </a>
                        </h6>
                        <div class="mb-2 small">
                            ${starHtml} <span class="text-muted">(${r.rating || 0})</span>
                        </div>
                        <p class="card-text small text-muted text-truncate mb-2">
                            <i class="fas fa-map-marker-alt me-1"></i>${r.address || 'Đang cập nhật'}
                        </p>
                        <p class="card-text small fw-bold text-danger mb-3">
                            <i class="fas fa-tag me-1"></i>${r.priceAverage || 'Liên hệ'}
                        </p>
                        <a href="/restaurant-detail.html?id=${r.id}" class="btn btn-outline-danger btn-sm w-100 rounded-pill fw-bold">
                            Xem chi tiết
                        </a>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', cardHtml);
    });
}

// 3. Hàm xử lý Tìm kiếm
function handleSearch() {
    currentKeyword = document.getElementById('searchInput').value.trim();
    currentCategory = ""; // Reset danh mục khi tìm kiếm bằng chữ
    currentPage = 0;      // Reset về trang đầu tiên
    fetchRestaurants(currentKeyword, currentCategory, currentPage, false);
}

// 4. Hàm xử lý Lọc theo danh mục
function filterByCategory(categoryName) {
    currentCategory = categoryName;
    currentKeyword = "";  // Reset từ khóa khi lọc theo danh mục
    document.getElementById('searchInput').value = "";
    currentPage = 0;      // Reset về trang đầu tiên
    fetchRestaurants(currentKeyword, currentCategory, currentPage, false);
}

/* ==================== HÀM BỔ TRỢ GIAO DIỆN ==================== */


// Vẽ danh sách icon danh mục
function loadCategories() {
    // THÊM THUỘC TÍNH 'searchKey': Đây là từ khóa thực sự sẽ gửi xuống API
    const categories = [
        { name: 'Lẩu', searchKey: 'lẩu', icon: 'fas fa-fire' },
        { name: 'Hải sản', searchKey: 'hải sản', icon: 'fas fa-shrimp' },
        { name: 'Âu / Á', searchKey: 'âu', icon: 'fas fa-utensils' }, // Gửi chữ 'âu' sẽ dính cả Á Âu
        { name: 'Nhật Bản', searchKey: 'nhật', icon: 'fas fa-torii-gate' },
        { name: 'Ăn nhậu', searchKey: 'nhậu', icon: 'fas fa-beer' },
        { name: 'Buffet', searchKey: 'buffet', icon: 'fas fa-hamburger' }
    ];

    const container = document.getElementById('categoriesContainer');
    container.innerHTML = categories.map(cat => `
        <div class="col category-item" onclick="filterByCategory('${cat.searchKey}')">
            <div class="category-icon"><i class="${cat.icon}"></i></div>
            <h6>${cat.name}</h6>
        </div>
    `).join('');
}

// Vẽ sao đánh giá
function renderStars(rating) {
    let stars = "";
    for (let i = 1; i <= 5; i++) {
        if (rating >= i) stars += '<i class="fas fa-star text-warning"></i>';
        else if (rating >= i - 0.5) stars += '<i class="fas fa-star-half-alt text-warning"></i>';
        else stars += '<i class="far fa-star text-warning"></i>';
    }
    return stars;
}