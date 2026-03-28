// 1. BIẾN TOÀN CỤC
let allFavorites = [];

// 2. KHỞI TẠO KHI TẢI TRANG
document.addEventListener("DOMContentLoaded", () => {
    // Đổ tên User (Có kiểm tra an toàn tránh lỗi null)
    const username = document.querySelector("#username");
    if (username) {
        username.innerHTML = localStorage.getItem("userFullName") || "User";
    }

    // Gắn sự kiện (Event Listeners)
    const sortBy = document.querySelector("#sortBy");
    if (sortBy) sortBy.addEventListener("change", applyFilterAndSort);

    const searchBtn = document.querySelector("#searchBtn");
    if (searchBtn) searchBtn.addEventListener("click", applyFilterAndSort);

    const searchInput = document.querySelector("#searchInput");
    if (searchInput) {
        searchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                applyFilterAndSort();
            }
        });
    }

    // Gọi API lấy dữ liệu
    LoadFavoritesContainer();
});

// 3. HÀM TẢI DỮ LIỆU TỪ API
async function LoadFavoritesContainer() {
    const userId = localStorage.getItem("userId");
    if (!userId) { window.location.href = '/login'; return; }

    try {
        const spinner = document.querySelector("#loadingSpinner");
        if (spinner) spinner.style.display = "block";

        const response = await fetch(`/api/user-saved/${userId}`); // Tùy API của bạn, có thể là /users/${userId}/favorites

        if (spinner) spinner.style.display = "none";

        if (response.ok) {
            const rawData = await response.json();
            console.log("DỮ LIỆU TỪ BACKEND TRẢ VỀ:", rawData); // F12 để xem dữ liệu này nhé!

            // Xử lý trường hợp Spring Boot trả về phân trang (Page<T>) hoặc mảng chuẩn
            allFavorites = Array.isArray(rawData) ? rawData : (rawData.content || []);

            // Hiển thị mặc định
            applyFilterAndSort();
        } else {
            alert("Lỗi tải danh sách nhà hàng yêu thích");
        }
    } catch (e) {
        console.error("Lỗi kết nối API: ", e);
    }
}

// 4. HÀM VẼ GIAO DIỆN (RENDER)
function renderFavorites(dataToRender) {
    const container = document.querySelector("#favoritesContainer");
    const noResults = document.querySelector("#noResults");

    container.innerHTML = ''; // Xóa sạch giao diện cũ

    if (!dataToRender || dataToRender.length === 0) {
        noResults.style.display = "block";
        return;
    }

    noResults.style.display = "none";

    dataToRender.forEach(item => {
        // TUYỆT CHIÊU: Hỗ trợ cả 2 dạng JSON từ Backend (Lồng nhau hoặc Flat)
        const res = item.restaurant ? item.restaurant : item;

        // Dùng item.id (nếu là bảng trung gian) hoặc res.id (nếu xóa trực tiếp bằng ID nhà hàng)
        // Cần đảm bảo hàm Xóa lấy đúng ID mà API của bạn yêu cầu. Giả sử API xóa theo ID của bảng Yêu Thích.
        const favId = item.id;

        const starHtml = renderStars(res.rating || 0);

        const cardHtml = `
            <div class="col" id="fav-item-${favId}">
                <div class="card h-100 border-0 shadow-sm hover-shadow transition">
                    <div class="position-relative">
                        <a href="/restaurant-detail.html?id=${res.id}">
                            <img src="${res.imageUrl || 'https://via.placeholder.com/300x200'}" class="card-img-top rounded-top" style="height: 180px; object-fit: cover;">
                        </a>
                        <button onclick="removeFavorite(${favId})" class="btn btn-light btn-sm position-absolute top-0 end-0 m-2 rounded-circle text-danger shadow-sm">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                    <div class="card-body p-3">
                        <span class="badge bg-danger bg-opacity-10 text-danger mb-2" style="font-size: 0.7rem;">${res.category || 'Ẩm thực'}</span>
                        <h6 class="card-title fw-bold mb-1 text-truncate"><a href="/restaurant-detail.html?id=${res.id}" class="text-decoration-none text-dark">${res.name}</a></h6>
                        <div class="mb-2 small">${starHtml} <span class="text-muted">(${res.rating || 0})</span></div>
                        <p class="card-text small text-muted text-truncate mb-2"><i class="fas fa-map-marker-alt me-1"></i>${res.address || 'Đang cập nhật'}</p>
                        <p class="card-text small fw-bold text-danger mb-3"><i class="fas fa-tag me-1"></i>${res.priceAverage || 'Liên hệ'}</p>
                        <a href="/restaurant-detail.html?id=${res.id}" class="btn btn-outline-danger btn-sm w-100 rounded-pill fw-bold">Đặt bàn ngay</a>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', cardHtml);
    });
}

// 5. CÁC HÀM LỌC VÀ SẮP XẾP
function applyFilterAndSort() {
    let filteredData = [...allFavorites];

    // Lọc theo tên
    const searchInput = document.querySelector("#searchInput");
    if (searchInput) {
        const searchText = searchInput.value.toLowerCase().trim();
        if (searchText) {
            filteredData = filteredData.filter(item => {
                const res = item.restaurant ? item.restaurant : item;
                return res.name && res.name.toLowerCase().includes(searchText);
            });
        }
    }

    // Sắp xếp
    const sortByEl = document.querySelector("#sortBy");
    const sortBy = sortByEl ? sortByEl.value : 'newest';

    filteredData.sort((a, b) => {
        const resA = a.restaurant ? a.restaurant : a;
        const resB = b.restaurant ? b.restaurant : b;

        switch (sortBy) {
            case 'newest': return b.id - a.id;
            case 'name': return (resA.name || '').localeCompare(resB.name || '');
            case 'price-asc': return extractMinPrice(resA.priceAverage) - extractMinPrice(resB.priceAverage);
            case 'price-desc': return extractMinPrice(resB.priceAverage) - extractMinPrice(resA.priceAverage);
            default: return 0;
        }
    });

    renderFavorites(filteredData);
}

function extractMinPrice(priceStr) {
    if (!priceStr) return 0;
    const cleanStr = priceStr.replace(/\./g, '');
    const match = cleanStr.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
}

// 6. HÀM XÓA YÊU THÍCH (Đã sửa lại cho chuẩn)
async function removeFavorite(favId) {
    // Thêm hàm confirm cho chắc chắn
    if (!confirm("Bạn có chắc muốn bỏ yêu thích nhà hàng này?")) return;

    try {
        // Gọi API Xóa (Đường dẫn phụ thuộc vào Backend của bạn)
        const response = await fetch(`/api/user-saved/${favId}`, {
            method: "DELETE"
        });

        if (response.ok) {
            // Xóa thẻ HTML có ID tương ứng để tạo hiệu ứng biến mất lập tức
            const card = document.querySelector(`#fav-item-${favId}`);
            if (card) card.remove();

            // Cập nhật lại mảng dữ liệu gốc
            allFavorites = allFavorites.filter(item => item.id !== favId);

            // Kiểm tra nếu mảng trống thì hiện thông báo "Chưa có nhà hàng"
            if (allFavorites.length === 0) {
                document.querySelector("#noResults").style.display = "block";
            }
        } else {
            alert("Lỗi hủy yêu thích");
        }
    } catch (e) {
        console.error("Lỗi:", e);
    }
}

// 7. HÀM VẼ SAO
function renderStars(rating) {
    let stars = "";
    for (let i = 1; i <= 5; i++) {
        if (rating >= i) stars += '<i class="fas fa-star text-warning"></i>';
        else if (rating >= i - 0.5) stars += '<i class="fas fa-star-half-alt text-warning"></i>';
        else stars += '<i class="far fa-star text-warning"></i>';
    }
    return stars;
}

document.getElementById('logoutBtn').addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.clear();
    window.location.href = '/login';
});