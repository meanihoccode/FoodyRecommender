// ==========================================
// 1. KIỂM TRA ĐĂNG NHẬP VÀ HIỂN THỊ ADMIN
// ==========================================
const userRole = localStorage.getItem('userRole');
if (!userRole || userRole !== 'ADMIN') {
    window.location.href = '/login';
} else {
    const adminName = localStorage.getItem('userFullName') || 'Administrator';
    document.getElementById('adminName').textContent = adminName;
    document.getElementById('adminAvatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(adminName)}&background=ee4d2d&color=fff`;
}

// Bật tắt Sidebar trên Mobile
document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('active');
});

// Mở Modal Thêm mới
function openRestaurantModal() {
    document.getElementById('restaurantForm').reset();
    document.getElementById('restId').value = ''; // Reset ID về rỗng để phân biệt Thêm/Sửa
    document.getElementById('modalTitle').innerText = "Thêm Nhà hàng mới";
    new bootstrap.Modal(document.getElementById('restaurantModal')).show();
}

// ==========================================
// 2. TẢI DANH SÁCH NHÀ HÀNG & PHÂN TRANG
// ==========================================
let currentPage = 0;
let pageSize = 6; // Nên để 10 dòng 1 trang cho chuẩn Admin

async function loadRestaurants(page = 0, isRefresh = false) {
    const searchRestInput = document.getElementById('searchRestInput').value.trim();
    const categoryFilter = document.getElementById('categoryFilter').value.trim();
    const currentScroll = window.scrollY;
    const restaurantTableBody = document.getElementById('restaurantTableBody');

    let url = `/api/restaurants/search?page=${page}&size=${pageSize}`;
    if (searchRestInput !== "") url += `&keyword=${encodeURIComponent(searchRestInput)}`;
    if (categoryFilter !== "") url += `&category=${encodeURIComponent(categoryFilter)}`;
    try {
        const response = await fetch(url);
        if (response.ok) {
            const pageData = await response.json();
            currentPage = pageData.number;

            renderTable(pageData.content);
            renderPagination(pageData.totalPages, pageData.totalElements);

            window.scrollTo(0, currentScroll);
        } else {
            if (!isRefresh) restaurantTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-4">Lỗi lấy dữ liệu từ máy chủ</td></tr>';
        }
    } catch (e) {
        if (!isRefresh) restaurantTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-4">Mất kết nối mạng!</td></tr>';
    }
}

function renderTable(restaurants) {
    const restaurantTableBody = document.getElementById('restaurantTableBody');
    restaurantTableBody.innerHTML = '';

    if (!restaurants || restaurants.length === 0) {
        restaurantTableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">Không tìm thấy nhà hàng nào.</td></tr>';
        return;
    }

    restaurants.forEach(res => {
        // Xử lý ảnh lỗi hoặc không có ảnh
        const imgUrl = res.imageUrl ? res.imageUrl : 'https://via.placeholder.com/60?text=No+Image';

        // ---- BỔ SUNG LOGIC TÁCH DANH MỤC Ở ĐÂY ----
        let categoryHtml = '';
        if (res.category) {
            // Tách chuỗi bằng dấu phẩy, xóa khoảng trắng thừa ở 2 đầu
            const catArray = res.category.split(',').map(c => c.trim()).filter(c => c !== '');

            categoryHtml = `<div class="category-wrapper">`;
            catArray.forEach(cat => {
                categoryHtml += `<span class="badge-tag">${cat}</span>`;
            });
            categoryHtml += `</div>`;
        } else {
            categoryHtml = `<span class="badge-tag text-muted bg-light border-0">Chưa cập nhật</span>`;
        }
        // ------------------------------------------

        const html = `                    
            <tr>
                <td class="fw-bold text-muted text-center">#${res.id}</td>
                <td>
                    <div class="d-flex align-items-center gap-3">
                        <img src="${imgUrl}" alt="RestImage" style="width: 50px; height: 50px; border-radius: 10px; object-fit: cover;">
                        <div>
                            <h6 class="mb-1 fw-bold text-dark">${res.name}</h6>
                            <small class="text-muted"><i class="fas fa-map-marker-alt me-1"></i>${res.address}</small>
                        </div>
                    </div>
                </td>
                
                <td>${categoryHtml}</td>
                
                <td class="fw-medium text-dark">${res.priceAverage || 'Đang cập nhật'}</td>
                <td class="text-center">
                    <span class="badge bg-warning text-dark fs-6" style="border-radius: 6px;">
                        <i class="fas fa-star me-1 text-white"></i>${res.rating || 0}
                    </span>
                    <div class="text-muted mt-1" style="font-size: 0.75rem;">(${res.ratingCount || 0} lượt)</div>
                </td>
                <td class="text-center">
                    <button class="action-btn text-primary me-1" title="Chỉnh sửa" onclick="updateRestaurant(${res.id})"><i class="fas fa-pen"></i></button>
                    <button class="action-btn text-danger" title="Xóa" onclick="deleteRestaurant(${res.id})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
        restaurantTableBody.insertAdjacentHTML('beforeend', html);
    });
}

function renderPagination(totalPages, totalElements) {
    const paginationContainer = document.getElementById("restPagination");
    const infoText = document.getElementById("restInfoText");

    if (totalElements === 0) {
        infoText.textContent = "Không có dữ liệu";
        paginationContainer.innerHTML = '';
        return;
    }

    // Tính toán số thứ tự hiển thị (VD: Đang hiển thị 1-10)
    const startCount = (currentPage * pageSize) + 1;
    const endCount = Math.min((currentPage + 1) * pageSize, totalElements);
    infoText.textContent = `Đang hiển thị ${startCount}-${endCount} trên tổng số ${totalElements} nhà hàng`;

    paginationContainer.innerHTML = '';
    if (totalPages <= 1) return;

    // --- NÚT "TRƯỚC" ---
    const prevDisabled = currentPage === 0 ? 'disabled' : '';
    paginationContainer.innerHTML += `<li class="page-item ${prevDisabled}"><a class="page-link" href="#" onclick="changePage(${currentPage - 1}, event)">Trước</a></li>`;

    // --- LOGIC THU GỌN TRANG (DÙNG DẤU ...) ---
    let startPage = Math.max(0, currentPage - 2); // Chỉ lấy 2 trang trước trang hiện tại
    let endPage = Math.min(totalPages - 1, currentPage + 2); // Chỉ lấy 2 trang sau trang hiện tại

    // Cân bằng lại nếu đang ở những trang đầu hoặc cuối
    if (currentPage <= 2) {
        endPage = Math.min(totalPages - 1, 4);
    }
    if (currentPage >= totalPages - 3) {
        startPage = Math.max(0, totalPages - 5);
    }

    // 1. Luôn in ra trang đầu tiên (Trang 1) và dấu ... nếu khoảng cách xa
    if (startPage > 0) {
        paginationContainer.innerHTML += `<li class="page-item"><a class="page-link" href="#" style="color: var(--text-dark);" onclick="changePage(0, event)">1</a></li>`;
        if (startPage > 1) {
            paginationContainer.innerHTML += `<li class="page-item disabled"><a class="page-link text-muted border-0" href="#">...</a></li>`;
        }
    }

    // 2. In ra các trang ở giữa
    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            paginationContainer.innerHTML += `<li class="page-item active"><a class="page-link" href="#" style="background-color: var(--primary-color); border-color: var(--primary-color);" onclick="event.preventDefault()">${i + 1}</a></li>`;
        } else {
            paginationContainer.innerHTML += `<li class="page-item"><a class="page-link" href="#" style="color: var(--text-dark);" onclick="changePage(${i}, event)">${i + 1}</a></li>`;
        }
    }

    // 3. In ra dấu ... và luôn in ra trang cuối cùng
    if (endPage < totalPages - 1) {
        if (endPage < totalPages - 2) {
            paginationContainer.innerHTML += `<li class="page-item disabled"><a class="page-link text-muted border-0" href="#">...</a></li>`;
        }
        paginationContainer.innerHTML += `<li class="page-item"><a class="page-link" href="#" style="color: var(--text-dark);" onclick="changePage(${totalPages - 1}, event)">${totalPages}</a></li>`;
    }

    // --- NÚT "SAU" ---
    const nextDisabled = currentPage === totalPages - 1 ? 'disabled' : '';
    paginationContainer.innerHTML += `<li class="page-item ${nextDisabled}"><a class="page-link" href="#" onclick="changePage(${currentPage + 1}, event)">Sau</a></li>`;
}

function changePage(newPage, event) {
    event.preventDefault();
    loadRestaurants(newPage);
}

// ==========================================
// 3. THÊM / SỬA / XÓA NHÀ HÀNG
// ==========================================

// --- LƯU THÔNG TIN (Dùng chung cho cả Thêm và Cập nhật) ---
async function saveRestaurant() {
    const id = document.getElementById('restId').value; // Nếu rỗng là Thêm, có số là Sửa
    const name = document.getElementById('restName').value.trim();
    const category = document.getElementById('restCategory').value.trim();
    const address = document.getElementById('restAddress').value.trim();
    const priceAverage = document.getElementById('restPrice').value.trim();
    const imageUrl = document.getElementById('restImage').value.trim();
    const description = document.getElementById('restDescription').value.trim();

    // Validate nhanh
    if (!name || !category || !address) {
        alert("Vui lòng nhập đủ các thông tin có dấu sao đỏ!");
        return;
    }

    // Đóng gói dữ liệu giống hệt Model trong Java
    const payload = {
        name: name,
        category: category,
        address: address,
        priceAverage: priceAverage,
        imageUrl: imageUrl,
        description: description
    };

    // Quyết định URL và Phương thức gọi API
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/restaurants/${id}` : '/api/restaurants';

    const saveBtn = document.getElementById('saveRestaurantBtn');
    saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Đang xử lý...';
    saveBtn.disabled = true;

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert(id ? "Cập nhật thành công!" : "Thêm nhà hàng mới thành công!");
            bootstrap.Modal.getInstance(document.getElementById('restaurantModal')).hide();
            loadRestaurants(currentPage); // Tải lại bảng hiện tại
        } else {
            alert("Đã xảy ra lỗi khi lưu vào cơ sở dữ liệu!");
        }
    } catch (e) {
        alert("Lỗi kết nối mạng!");
    } finally {
        saveBtn.innerHTML = 'Lưu thông tin';
        saveBtn.disabled = false;
    }
}

// --- MỞ MODAL ĐỂ CẬP NHẬT ---
async function updateRestaurant(id) {
    try {
        const response = await fetch(`/api/restaurants/${id}`);
        if (response.ok) {
            const rest = await response.json();

            // Đổ dữ liệu vào Form
            document.getElementById('restId').value = rest.id;
            document.getElementById('restName').value = rest.name;
            document.getElementById('restCategory').value = rest.category;
            document.getElementById('restAddress').value = rest.address;
            document.getElementById('restPrice').value = rest.priceAverage || '';
            document.getElementById('restImage').value = rest.imageUrl || '';
            document.getElementById('restDescription').value = rest.description || '';

            // Đổi tiêu đề và hiện Modal
            document.getElementById('modalTitle').innerText = "Cập nhật thông tin Nhà hàng";
            new bootstrap.Modal(document.getElementById('restaurantModal')).show();
        } else {
            alert("Không tìm thấy thông tin nhà hàng này!");
        }
    } catch (e) {
        alert("Lỗi kết nối mạng!");
    }
}

// --- XÓA NHÀ HÀNG ---
async function deleteRestaurant(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa nhà hàng này? Hành động này sẽ xóa toàn bộ đơn đặt bàn và đánh giá liên quan!")) {
        return;
    }

    try {
        const response = await fetch(`/api/restaurants/${id}`, { method: 'DELETE' });
        if (response.ok) {
            alert("Xóa thành công!");
            loadRestaurants(0); // Về trang 1 sau khi xóa
        } else {
            alert("Không thể xóa nhà hàng này!");
        }
    } catch (e) {
        alert("Lỗi kết nối mạng!");
    }
}

// ==========================================



// 4. KHỞI TẠO SỰ KIỆN KHI TRANG TẢI XONG
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    loadRestaurants(0);


    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        const logoutModal = new bootstrap.Modal(document.getElementById('logoutModal'));
        btnLogout.addEventListener('click', e => {
            e.preventDefault();
            logoutModal.show();
        });
    }
    const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener('click', function() {
            this.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang xử lý...';
            setTimeout(() => { localStorage.clear(); window.location.href = '/login'; }, 1000);
        });
    }

    // Bắt sự kiện Lọc
    const btnFilter = document.getElementById('btnFilterRest');
    if (btnFilter) {
        btnFilter.addEventListener('click', () => loadRestaurants(0));
    }

    // Bắt sự kiện Enter khi tìm kiếm
    const searchInput = document.getElementById('searchRestInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') loadRestaurants(0);
        });
    }
    const filter = document.getElementById('categoryFilter');
    if (filter) {
        filter.addEventListener('keypress', (e) => {
            if (e.key==='Enter') loadRestaurants(0);
        })
    }

    // Bắt sự kiện nút Lưu nhà hàng
    const saveRestaurantBtn = document.getElementById('saveRestaurantBtn');
    if (saveRestaurantBtn) {
        saveRestaurantBtn.addEventListener('click', saveRestaurant); // Đã sửa lỗi trí mạng
    }
});