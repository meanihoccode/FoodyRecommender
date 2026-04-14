/* ==================== BIẾN TOÀN CỤC ==================== */
let currentPage = 0;
let currentKeyword = "";
let currentCategory = "";

/* ==================== KHỞI TẠO KHI TẢI TRANG ==================== */
document.addEventListener('DOMContentLoaded', async function() {
    // 1. Kiểm tra đăng nhập (Bảo vệ trang)
    const userId = localStorage.getItem('userId');
    if (!userId) {
        window.location.href = '/login';
        return;
    }

    // 2. Tải danh mục tĩnh
    loadCategories();

    // =========================================================
    // 3. GỌI API GỢI Ý CỦA AI TRƯỚC (PHẦN "DÀNH RIÊNG CHO BẠN")
    // =========================================================
    await fetchPersonalizedRecommendations(userId);

    // 4. Gọi API lấy trang đầu tiên của danh sách tổng hợp (Khám phá tự do)
    fetchRestaurants("", "", 0, false);

    // 5. Gắn sự kiện (Event Listeners)
    // Nút Tìm kiếm
    document.getElementById('searchBtn').addEventListener('click', handleSearch);

    // Gõ Enter trong ô tìm kiếm
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    // Nút Xem thêm
    document.getElementById('loadMoreBtn').addEventListener('click', () => {
        currentPage++; // Tăng số trang lên
        fetchRestaurants(currentKeyword, currentCategory, currentPage, true);
    });
});

/* ==================== HÀM XỬ LÝ AI RECOMMENDER ==================== */

// Gọi API lấy gợi ý cá nhân hóa
async function fetchPersonalizedRecommendations(userId) {
    try {
        const response = await apiFetch(`/api/recommendations/user/${userId}`);

        if (response.ok) {
            // Nếu người dùng mới chưa có data, Backend trả về 204 No Content -> Bỏ qua
            if(response.status === 204) return;

            const recommendedRestaurants = await response.json();

            // Nếu có dữ liệu trả về, tiến hành vẽ giao diện VIP
            if (recommendedRestaurants && recommendedRestaurants.length > 0) {
                renderRecommendationSection(recommendedRestaurants);
            }
        }
    } catch (error) {
        console.error("Lỗi khi tải gợi ý từ AI:", error);
    }
}

// Vẽ khu vực "Dành riêng cho bạn"
function renderRecommendationSection(restaurants) {
    // Lấy tối đa 4 nhà hàng để hiển thị cho đẹp 1 hàng ngang
    const top4Restaurants = restaurants.slice(0, 4);

    // Tìm cái block chứa danh sách nhà hàng bình thường để chèn lên đầu
    const mainContainer = document.getElementById('restaurantsContainer').closest('.container');

    // Xóa khu vực AI cũ nếu người dùng tìm kiếm/lọc lại (để tránh bị duplicate)
    const oldAiSection = document.getElementById('aiRecommendationSection');
    if (oldAiSection) oldAiSection.remove();

    // Tạo Block HTML với viền đỏ nổi bật
    let aiSectionHtml = `
        <div class="mb-5 bg-danger bg-opacity-10 p-4 rounded-4 shadow-sm border border-danger border-opacity-25" id="aiRecommendationSection">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 class="fw-bold text-danger mb-0">
                        <i class="fas fa-magic me-2"></i>Dành Riêng Cho Bạn
                    </h4>
                    <p class="text-muted small mt-1 mb-0">Gợi ý từ Trí tuệ nhân tạo (AI) dựa trên sở thích của bạn</p>
                </div>
            </div>
            <div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
    `;

    // Vẽ từng Card
    top4Restaurants.forEach(r => {
        const starHtml = renderStars(r.rating || 0);

        aiSectionHtml += `
            <div class="col">
                <div class="card h-100 border-danger shadow-sm hover-shadow transition">
                    <div class="position-relative">
                        <span class="position-absolute top-0 start-0 badge bg-danger m-2 z-3 px-2 py-1 shadow-sm">
                            <i class="fas fa-star text-warning me-1"></i>Đề xuất AI
                        </span>
                        <a href="/restaurant-detail?id=${r.id}">
                            <img src="${r.imageUrl || 'https://via.placeholder.com/500x300?text=No+Image'}" 
                                 class="card-img-top rounded-top" style="height: 160px; object-fit: cover;">
                        </a>
                    </div>
                    <div class="card-body p-3 bg-white rounded-bottom">
                        <h6 class="card-title fw-bold mb-1 text-truncate">
                            <a href="/restaurant-detail?id=${r.id}" class="text-decoration-none text-dark">${r.name}</a>
                        </h6>
                        <div class="mb-2 small">${starHtml} <span class="text-muted">(${r.rating || 0})</span></div>
                        <p class="card-text small text-muted text-truncate mb-3"><i class="fas fa-map-marker-alt me-1"></i>${r.address || 'Đang cập nhật'}</p>
                        <a href="/restaurant-detail?id=${r.id}" class="btn btn-danger btn-sm w-100 rounded-pill fw-bold">Khám phá ngay</a>
                    </div>
                </div>
            </div>
        `;
    });

    aiSectionHtml += `</div></div>`;

    // Chèn khu vực VIP này vào ngay TRƯỚC khu vực "Địa điểm nổi bật hôm nay"
    mainContainer.insertAdjacentHTML('beforebegin', aiSectionHtml);
}

/* ==================== HÀM XỬ LÝ LOGIC CHÍNH ==================== */

// 1. Hàm gọi API từ Backend (Hỗ trợ phân trang)
async function fetchRestaurants(keyword, category, page, isAppend) {
    try {
        const spinner = document.getElementById('loadMoreBtn');
        if(isAppend) spinner.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang tải...';

        const url = `/api/restaurants/search?keyword=${encodeURIComponent(keyword)}&category=${encodeURIComponent(category)}&page=${page}&size=12`;

        const response = await apiFetch(url);
        if (response.ok) {
            const pageData = await response.json();
            const restaurants = pageData.content;

            renderRestaurants(restaurants, isAppend);

            const loadMoreContainer = document.getElementById('loadMoreContainer');
            if (pageData.last === true || restaurants.length === 0) {
                loadMoreContainer.style.display = "none";
            } else {
                loadMoreContainer.style.display = "block";
            }
        }

        if(isAppend) spinner.innerHTML = '<i class="fas fa-chevron-down me-2"></i>Xem thêm';

    } catch (error) {
        console.error("Lỗi kết nối API:", error);
    }
}

// 2. Hàm vẽ giao diện thẻ nhà hàng bình thường
function renderRestaurants(restaurantsToRender, isAppend) {
    const container = document.getElementById('restaurantsContainer');

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
                        <a href="/restaurant-detail?id=${r.id}">
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
                            <a href="/restaurant-detail?id=${r.id}" class="text-decoration-none text-dark">
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
                        <a href="/restaurant-detail?id=${r.id}" class="btn btn-outline-danger btn-sm w-100 rounded-pill fw-bold">
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
    currentCategory = "";
    currentPage = 0;
    fetchRestaurants(currentKeyword, currentCategory, currentPage, false);

    // Nếu có nhập chữ tìm kiếm thì tạm ẩn khu vực AI đi cho đỡ rối mắt
    const aiSection = document.getElementById('aiRecommendationSection');
    if (aiSection) {
        aiSection.style.display = currentKeyword ? 'none' : 'block';
    }
}

// 4. Hàm xử lý Lọc theo danh mục
function filterByCategory(categoryName) {
    currentCategory = categoryName;
    currentKeyword = "";
    document.getElementById('searchInput').value = "";
    currentPage = 0;
    fetchRestaurants(currentKeyword, currentCategory, currentPage, false);

    // Nếu người dùng chọn lọc Lẩu/Nướng... thì tạm ẩn AI đi
    const aiSection = document.getElementById('aiRecommendationSection');
    if (aiSection) aiSection.style.display = 'none';
}

/* ==================== HÀM BỔ TRỢ GIAO DIỆN ==================== */

function loadCategories() {
    const categories = [
        { name: 'Lẩu', searchKey: 'lẩu', icon: 'fas fa-fire' },
        { name: 'Hải sản', searchKey: 'hải sản', icon: 'fas fa-shrimp' },
        { name: 'Âu / Á', searchKey: 'âu', icon: 'fas fa-utensils' },
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

function renderStars(rating) {
    let stars = "";
    for (let i = 1; i <= 5; i++) {
        if (rating >= i) stars += '<i class="fas fa-star text-warning"></i>';
        else if (rating >= i - 0.5) stars += '<i class="fas fa-star-half-alt text-warning"></i>';
        else stars += '<i class="far fa-star text-warning"></i>';
    }
    return stars;
}