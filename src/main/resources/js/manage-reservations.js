// 1. CHỐNG HACKER & HIỂN THỊ INFO
const userRole = localStorage.getItem('userRole');
if (!userRole || userRole !== 'ADMIN') {
    window.location.href = '/login.html';
} else {
    const adminName = localStorage.getItem('userFullName') || 'Administrator';
    document.getElementById('adminName').textContent = adminName;
    document.getElementById('adminAvatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(adminName)}&background=ee4d2d&color=fff`;
}

// 2. TOGGLE SIDEBAR
document.getElementById('sidebarToggle').addEventListener('click', function() {
    document.getElementById('sidebar').classList.toggle('active');
});

// 3. ĐĂNG XUẤT
const logoutModal = new bootstrap.Modal(document.getElementById('logoutModal'));
document.getElementById('btnLogout').addEventListener('click', e => { e.preventDefault(); logoutModal.show(); });
document.getElementById('confirmLogoutBtn').addEventListener('click', function() {
    this.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang xử lý...';
    this.disabled = true;
    setTimeout(() => { localStorage.clear(); window.location.href = '/login.html'; }, 1000);
});

// TODO: Viết logic fetch dữ liệu từ API /api/reservations ở đây giống như trang Users