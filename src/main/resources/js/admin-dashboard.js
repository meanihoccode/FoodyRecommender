// ==========================================
// 1. TRẠM KIỂM SOÁT BẢO MẬT (CHỐNG HACKER)
// ==========================================
const userRole = localStorage.getItem('userRole');
if (!userRole || userRole !== 'ADMIN') {
    // Hiển thị một cái màn hình trắng luôn cho ngầu, không cho xem HTML
    document.body.innerHTML = '<h2 style="text-align:center; margin-top: 20%; color: red;">⛔ TRUY CẬP BỊ TỪ CHỐI. BẠN KHÔNG CÓ QUYỀN ADMIN!</h2>';
    setTimeout(() => {
        window.location.href = '/login';
    }, 2000);
}

// ==========================================
// 2. HIỂN THỊ THÔNG TIN ADMIN LÊN TOPBAR
// ==========================================
const adminName = localStorage.getItem('userFullName') || 'Administrator';
document.getElementById('adminName').textContent = adminName;
// Tạo avatar xịn xò từ chữ cái đầu của tên
document.getElementById('adminAvatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(adminName)}&background=ee4d2d&color=fff`;

// ==========================================
// 3. XỬ LÝ NÚT ĐĂNG XUẤT
// ==========================================
document.getElementById('btnLogout').addEventListener('click', function(e) {
    e.preventDefault();
    if(confirm('Bạn có chắc chắn muốn đăng xuất khỏi trang Quản trị?')) {
        localStorage.clear(); // Xóa sạch bộ nhớ
        window.location.href = '/login';
    }
});

// Toggle Sidebar cho màn hình điện thoại
document.getElementById('sidebarToggle').addEventListener('click', function() {
    document.getElementById('sidebar').classList.toggle('active');
});

async function loadUsers() {
    const userTableBody = document.querySelector("#userTableBody");
    try {
        const response = await apiFetch("/api/user");
        if (response.ok) {
            userTableBody.innerHTML = ''; // Xóa chữ "Đang tải..."
            const userData = await response.json();

            // Cập nhật số lượng
            document.querySelector("#totalUsers").innerHTML = userData.length;

            userData.forEach(user => {
                // Trang điểm cho chữ bằng Badge của Bootstrap
                const verifiedBadge = user.isVerified
                    ? '<span class="badge bg-success">Đã xác thực</span>'
                    : '<span class="badge bg-warning text-dark">Chưa xác thực</span>';

                const activeBadge = user.isActive
                    ? '<span class="badge bg-primary">Đang hoạt động</span>'
                    : '<span class="badge bg-danger">Bị khóa</span>';

                // ==========================================
                // VẼ NÚT ĐỘNG: Đang hoạt động -> Nút Khóa (Đỏ). Đã khóa -> Nút Mở (Xanh)
                // ==========================================
                const actionButton = user.isActive
                    ? `<button class="btn btn-sm btn-outline-danger" title="Khóa tài khoản" onclick="lockAccount(${user.id})">
                           <i class="fas fa-lock"></i>
                       </button>`
                    : `<button class="btn btn-sm btn-outline-success" title="Mở khóa tài khoản" onclick="lockAccount(${user.id})">
                           <i class="fas fa-unlock-alt"></i>
                       </button>`;

                // BỌC TRONG THẺ <tr> VÀ ĐIỀN ĐỦ 7 CỘT
                const html = `
                    <tr>
                        <td>${user.id}</td>
                        <td class="fw-bold">${user.fullName}</td>
                        <td>${user.email}</td>
                        <td>${user.phone || '<span class="text-muted fst-italic">Trống</span>'}</td>
                        <td>${verifiedBadge}</td>
                        <td>${activeBadge}</td>
                        <td>
                            ${actionButton}
                        </td>
                    </tr>
                `;
                userTableBody.insertAdjacentHTML('beforeend', html);
            });
        } else {
            console.error(await response.json());
            userTableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Lỗi tải dữ liệu</td></tr>';
        }
    } catch (e) {
        console.error(e);
        userTableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Mất kết nối máy chủ!</td></tr>';
    }
}

async function loadRestaurantCount() {
    const totalRestaurants = document.querySelector("#totalRestaurants");
    try {
        const response = await apiFetch('/api/restaurants/count'); // Thêm dấu /
        if (response.ok) {
            totalRestaurants.innerHTML = await response.json();
        } else {
            console.error("Lỗi đếm nhà hàng:", await response.json());
        }
    } catch (e) {
        console.error(e);
    }
}

async function loadReservationCount() {
    const totalReservations = document.querySelector("#totalReservations");
    try {
        const response = await apiFetch('/api/reservations/count'); // Thêm dấu /
        if (response.ok) {
            totalReservations.innerHTML = await response.json();
        } else {
            console.error("Lỗi đếm đặt bàn:", await response.json());
        }
    } catch (e) {
        console.error(e);
    }
}

async function lockAccount(id) {
    // Thêm hàm confirm để tránh lỡ tay bấm nhầm khóa oan người ta
    if (!confirm("Bạn có chắc chắn muốn khóa/mở khóa tài khoản này không?")) {
        return;
    }

    try {
        // Đã thêm dấu / ở đầu link
        const response = await apiFetch(`/api/user/lockacc/${id}`, {
            method: "PUT" // Hoặc POST tùy theo Backend của bạn thiết kế
        });

        if (response.ok) {
            loadUsers(); // Load lại bảng để thấy badge màu đổi ngay lập tức
        } else {
            console.error(await response.json());
            alert("Lỗi: Không thể khóa tài khoản.");
        }
    } catch (e) {
        console.error(e);
        alert("Lỗi kết nối mạng!");
    }
}
// Chạy khi trang web vừa load xong bộ khung
document.addEventListener('DOMContentLoaded', function () {
    loadUsers();
    loadRestaurantCount();
    loadReservationCount();
});