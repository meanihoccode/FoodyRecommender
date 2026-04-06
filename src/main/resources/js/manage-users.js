const userRole = localStorage.getItem('userRole');
if (!userRole || userRole !== 'ADMIN') {
    window.location.href = '/login';
} else {
    const adminName = localStorage.getItem('userFullName') || 'Administrator';
    document.getElementById('adminName').textContent = adminName;
    document.getElementById('adminAvatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(adminName)}&background=ee4d2d&color=fff`;
}

document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('active');
});

const logoutModal = new bootstrap.Modal(document.getElementById('logoutModal'));
document.getElementById('btnLogout').addEventListener('click', e => { e.preventDefault(); logoutModal.show(); });
document.getElementById('confirmLogoutBtn').addEventListener('click', function() {
    this.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang xử lý...';
    setTimeout(() => { localStorage.clear(); window.location.href = '/login'; }, 1000);
});

let currrentPage = 0;
const pageSize = 4;

async function loadUsers(page =0, isRefresh = false) {
    const tableBody = document.querySelector("#userTableBody");
    const currentScroll = window.scrollY;

    if (!isRefresh) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-5"><div class="spinner-border text-primary"></div></td></tr>';
    }

    const keyword = document.querySelector("#searchUserInput").value.trim();
    const isVerified = document.querySelector("#verifiedFilter").value;
    const isActive = document.querySelector("#activeFilter").value;

    let url = `/api/user/paged?page=${page}&size=${pageSize}`;
    if (keyword !== "") url += `&keyword=${encodeURIComponent(keyword)}`
    if (isVerified !== "ALL") url += `&isVerified=${isVerified === 'TRUE'}`;
    if (isActive !== "ALL") url += `&isActive=${isActive === 'TRUE'}`;
    try {
        const response = await fetch(url);
        if (response.ok) {
            const pageData = await response.json();
            currentPage = pageData.number;

            renderTable(pageData.content);
            renderPagination(pageData.totalPages, pageData.totalElements);
            window.scrollTo(0,currentScroll);
        } else {
            if(!isRefresh) tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Lỗi lấy dữ liệu từ máy chủ</td></tr>';
        }
    } catch (e) {
        if(!isRefresh) tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Mất kết nối mạng!</td></tr>';
    }
}

function renderTable(users) {
    const tableBody = document.querySelector("#userTableBody");
    tableBody.innerHTML = '';

    if (!users || users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">Không tìm thấy người dùng nào.</td></tr>';
        return;
    }

    users.forEach(user => {
        // Badge Xác thực
        const verifiedBadge = user.isVerified
            ? '<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25"><i class="fas fa-check-circle me-1"></i>Đã xác thực</span>'
            : '<span class="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 text-dark"><i class="fas fa-exclamation-circle me-1"></i>Chưa xác thực</span>';

        // Badge Trạng thái
        const activeBadge = user.isActive
            ? '<span class="badge bg-primary">Đang hoạt động</span>'
            : '<span class="badge bg-danger">Bị khóa</span>';

        // Nút Thao tác: Nếu đang hoạt động -> Hiện nút Khóa (Màu Đỏ). Nếu bị khóa -> Hiện nút Mở (Màu Xanh).
        const toggleLockBtn = user.isActive
            ? `<button class="btn btn-sm btn-outline-danger me-1" title="Khóa tài khoản" onclick="toggleUserStatus(${user.id}, false)"><i class="fas fa-lock"></i></button>`
            : `<button class="btn btn-sm btn-outline-success me-1" title="Mở khóa tài khoản" onclick="toggleUserStatus(${user.id}, true)"><i class="fas fa-unlock-alt"></i></button>`;

        const html = `
            <tr>
                <td class="text-muted fw-bold">#${user.id}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random" class="rounded-circle me-2" style="width: 35px; height: 35px;">
                        <span class="fw-bold">${user.fullName}</span>
                    </div>
                </td>
                <td>
                    <div class="text-dark">${user.email}</div>
                    <small class="text-muted"><i class="fas fa-phone-alt me-1" style="font-size: 0.7rem;"></i>${user.phone || 'Chưa cập nhật'}</small>
                </td>
                <td><span class="badge bg-secondary">${user.role || 'USER'}</span></td>
                <td>${verifiedBadge}</td>
                <td>${activeBadge}</td>
                <td class="text-center">
                    ${toggleLockBtn}
                    <button class="btn btn-sm btn-outline-secondary" title="Xem chi tiết" onclick="viewUser(${user.id})"><i class="fas fa-eye"></i></button>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', html);
    });
}

function renderPagination(totalPages, totalElements) {
    const paginationContainer = document.getElementById("userPagination");
    const infoText = document.getElementById("userInfoText");

    if (totalElements === 0) {
        infoText.textContent = "Không có dữ liệu";
        paginationContainer.innerHTML = '';
        return;
    }
    const startCount = (currentPage * pageSize) + 1;
    const endCount = Math.min((currentPage + 1) * pageSize, totalElements);
    infoText.textContent = `Đang hiển thị ${startCount}-${endCount} trên tổng số ${totalElements} tài khoản`;
    paginationContainer.innerHTML = '';
    if (totalPages <= 1) return;

    const prevDisabled = currentPage === 0 ? 'disabled' : '';
    paginationContainer.innerHTML += `<li class="page-item ${prevDisabled}"><a class="page-link" href="#" onclick="changePage(${currentPage - 1}, event)">Trước</a></li>`;

    for (let i = 0; i < totalPages; i++) {
        if (i === currentPage) {
            paginationContainer.innerHTML += `<li class="page-item active"><a class="page-link" href="#" style="background-color: var(--primary-color); border-color: var(--primary-color);" onclick="event.preventDefault()">${i + 1}</a></li>`;
        } else {
            paginationContainer.innerHTML += `<li class="page-item"><a class="page-link" href="#" style="color: var(--text-dark);" onclick="changePage(${i}, event)">${i + 1}</a></li>`;
        }
    }
    const nextDisabled = currentPage === totalPages - 1 ? 'disabled' : '';
    paginationContainer.innerHTML += `<li class="page-item ${nextDisabled}"><a class="page-link" href="#" onclick="changePage(${currentPage + 1}, event)">Sau</a></li>`;
}

function changePage(newPage, event) {
    event.preventDefault();
    loadUsers(newPage);
}

async function toggleUserStatus(id,unlock) {
    const actionText = unlock ? "MỞ KHÓA" : "KHÓA";
    if(!confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản này không?`)) return;
    try {
        const response = await fetch(`/api/user/lockacc/${id}`, {
            method: "PUT"
        });
        if (response.ok) {
            loadUsers(currentPage,true);
        } else {
            alert(`Lỗi: Không thể ${actionText.toLowerCase()} tài khoản này.`);
            console.error(await response.json());
        }
    } catch (e) {
        alert("Lỗi kết nối mạng");
    }
}

async function viewUser(id) {
    try {
        const response = await fetch(`/api/user/${id}`);
        if (response.ok) {
            const user = await response.json();

            // Đổ dữ liệu vào Modal
            document.getElementById('detailUserAvatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`;
            document.getElementById('detailUserFullName').textContent = user.fullName;
            document.getElementById('detailUserEmail').textContent = user.email;
            document.getElementById('detailUserPhone').textContent = user.phone || 'Chưa cập nhật';
            document.getElementById('detailUserRole').textContent = user.role || 'USER';

            const verifiedSpan = document.getElementById('detailUserVerified');
            verifiedSpan.textContent = user.isVerified ? "Đã xác thực" : "Chưa xác thực";
            verifiedSpan.className = user.isVerified ? "badge bg-success" : "badge bg-warning text-dark";

            const activeSpan = document.getElementById('detailUserActive');
            activeSpan.textContent = user.isActive ? "Đang hoạt động" : "Bị khóa";
            activeSpan.className = user.isActive ? "badge bg-primary" : "badge bg-danger";

            // Mở Modal
            const viewModal = new bootstrap.Modal(document.getElementById('viewUserModal'));
            viewModal.show();
        } else {
            alert("Lỗi tải thông tin chi tiết!");
        }
    } catch (e) {
        alert("Lỗi kết nối mạng!");
    }
}

document.addEventListener('DOMContentLoaded', ()=>{
    loadUsers(0);
    const btnFilter = document.getElementById('btnFilterUsers');
    if (btnFilter) {
        btnFilter.addEventListener('click',()=>loadUsers(0));
    }
    const searchInput = document.getElementById('searchUserInput');
    if (searchInput) {
        searchInput.addEventListener('keypress',(e)=>{
            if (e.key==='Enter') loadUsers(0);
        });
    }
});