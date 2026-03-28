// ================= BIẾN TOÀN CỤC =================
let currentPage = 0;
let currentKeyword = "";
let currentCategory = ""; // rỗng nghĩa là Tất cả

// Hàm vẽ sao
function renderStars(rating) {
    let stars = "";
    for (let i = 1; i <= 5; i++) {
        if (rating >= i) stars += '<i class="fas fa-star text-warning"></i>';
        else if (rating >= i - 0.5) stars += '<i class="fas fa-star-half-alt text-warning"></i>';
        else stars += '<i class="far fa-star text-warning"></i>';
    }
    return stars;
}

document.addEventListener('DOMContentLoaded', function () {
    // 1. Kiểm tra đăng nhập
    const userId = localStorage.getItem('userId');
    if (!userId) {
        window.location.href = '/login';
        return;
    }
    document.getElementById('username').textContent = localStorage.getItem('userFullName') || "User";

    // 2. Load dữ liệu lần đầu
    fetchRestaurants("", "", 0, false);

    // 3. Sự kiện Đăng xuất
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.clear();
        window.location.href = '/login';
    });

    // 4. Sự kiện Tìm kiếm
    document.getElementById('searchBtn').addEventListener('click', handleSearch);
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    // 5. Sự kiện Lọc theo Danh mục
    document.querySelectorAll(".category-badge").forEach(badge => {
        badge.addEventListener("click", () => {
            // Đổi màu badge
            document.querySelectorAll(".category-badge").forEach(b => b.classList.remove("active"));
            badge.classList.add("active");

            // Lấy category (Nếu là 'all' thì gán bằng chuỗi rỗng để API tìm tất cả)
            const selectedCat = badge.dataset.category;
            currentCategory = (selectedCat === "all") ? "" : selectedCat;

            // Tìm mới nên reset trang và từ khóa
            currentKeyword = "";
            document.getElementById('searchInput').value = "";
            currentPage = 0;

            fetchRestaurants(currentKeyword, currentCategory, currentPage, false);
        });
    });

    // 6. Sự kiện Xem thêm
    document.getElementById('loadMoreBtn').addEventListener('click', () => {
        currentPage++;
        fetchRestaurants(currentKeyword, currentCategory, currentPage, true);
    });

    // 7. Sự kiện Sắp xếp (Đọc phần Lưu ý bên dưới)
    document.getElementById("sortBy").addEventListener("change", () => {
        alert("Tính năng sắp xếp đang được cập nhật ở Backend!");
        // Sau này khi API hỗ trợ, bạn sẽ gọi fetchRestaurants kèm thêm tham số sort ở đây
    });
});

// ================= HÀM GỌI API =================
function handleSearch() {
    currentKeyword = document.getElementById('searchInput').value.trim();
    // Giữ nguyên category hiện tại để có thể vừa lọc vừa tìm
    currentPage = 0;
    fetchRestaurants(currentKeyword, currentCategory, currentPage, false);
}

async function fetchRestaurants(keyword, category, page, isAppend) {
    try {
        const spinner = document.getElementById('loadMoreBtn');
        const loadingSpinner = document.getElementById('loadingSpinner');

        if(isAppend) {
            spinner.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang tải...';
        } else {
            loadingSpinner.style.display = "block"; // Hiện xoay xoay to ở giữa trang
            document.getElementById("restaurantsContainer").innerHTML = ""; // Xóa dữ liệu cũ
        }

        const url = `/api/restaurants/search?keyword=${encodeURIComponent(keyword)}&category=${encodeURIComponent(category)}&page=${page}&size=12`;
        const response = await fetch(url);

        if (response.ok) {
            const pageData = await response.json();
            const restaurants = pageData.content || pageData; // Phòng ngừa API trả về mảng thường

            renderRestaurants(restaurants, isAppend);

            const loadMoreContainer = document.getElementById('loadMoreContainer');
            if (pageData.last === true || restaurants.length === 0) {
                loadMoreContainer.style.display = "none";
            } else {
                loadMoreContainer.style.display = "block";
            }
        }

        if(isAppend) spinner.innerHTML = '<i class="fas fa-chevron-down me-2"></i>Xem thêm';
        loadingSpinner.style.display = "none";

    } catch (error) {
        console.error("Lỗi kết nối API:", error);
    }
}

// ================= HÀM VẼ GIAO DIỆN =================
function renderRestaurants(list, isAppend) {
    const container = document.getElementById("restaurantsContainer");
    const noResults = document.getElementById("noResults");

    // Nếu không có dữ liệu và là trang đầu tiên
    if (list.length === 0 && !isAppend) {
        noResults.style.display = "block";
        return;
    }

    noResults.style.display = "none";

    list.forEach(r => {
        const starHtml = renderStars(r.rating || 0);

        // Cấu trúc HTML giống với trang chủ
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
        // Dùng insertAdjacentHTML để không bị mất các Card cũ khi Xem thêm
        container.insertAdjacentHTML('beforeend', cardHtml);
    });
}