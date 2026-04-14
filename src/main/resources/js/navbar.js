// File: js/navbar.js
// Nơi chứa các logic dùng chung cho TOÀN BỘ các trang có Navbar

document.addEventListener('DOMContentLoaded', function() {
    // 1. Hiển thị tên người dùng lên Navbar
    const userFullName = localStorage.getItem('userFullName');
    const userId = localStorage.getItem("userId");
    if (userFullName && document.getElementById('username')) {
        document.getElementById('username').textContent = userFullName;
    }

    // 2. Xử lý Đăng xuất
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.clear(); // Xóa sạch ví
            window.location.href = '/login';
        });
    }

// ==========================================
// 5. XỬ LÝ MODAL THÔNG TIN CÁ NHÂN
// ==========================================
    const profileModalEl = document.getElementById('profileModal');
    if (profileModalEl) {
        // 5.1. KHI VỪA MỞ MODAL -> Gọi API lấy số điện thoại, email từ Backend để điền vào
        profileModalEl.addEventListener('show.bs.modal', async () => {
            try {
                const response = await apiFetch(`/api/user/${userId}`);
                if (response.ok) {
                    const userData = await response.json();

                    // Đổ dữ liệu vào các ô Input
                    document.getElementById('profileFullName').value = userData.fullName || '';
                    document.getElementById('profilePhone').value = userData.phone || '';
                    document.getElementById('profileEmail').value = userData.email || '';

                }
            } catch (error) {
                console.error("Lỗi khi tải thông tin user:", error);
            }
        });
    }

// 5.2. KHI BẤM NÚT LƯU THÔNG TIN
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Chặn load lại trang

            const btn = document.getElementById('btnUpdateProfile');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang lưu...';
            btn.disabled = true;

            const newFullName = document.getElementById('profileFullName').value.trim();
            const newPhone = document.getElementById('profilePhone').value.trim();

            // THÊM ĐOẠN KIỂM TRA SỐ ĐIỆN THOẠI VÀO ĐÂY:
            const phoneRegex = /^[0-9]{10,12}$/;
            if (!phoneRegex.test(newPhone)) {
                alert("Số điện thoại không hợp lệ! Vui lòng chỉ nhập số, độ dài từ 10 đến 12 ký tự.");

                // Trả lại trạng thái nút lưu nếu bị lỗi
                btn.innerHTML = originalText;
                btn.disabled = false;
                return; // Dừng lại, không gọi API nữa
            }

            try {
                // Gọi API vừa tạo ở Backend
                const response = await apiFetch(`/api/user/${userId}/profile`, {
                    method: 'PUT',
                    body: JSON.stringify({ fullName: newFullName, phone: newPhone })
                });

                if (response.ok) {
                    alert("Cập nhật hồ sơ thành công!");

                    // Cập nhật lại tên trên thanh Navbar và LocalStorage
                    localStorage.setItem('userFullName', newFullName);
                    document.getElementById('username').textContent = newFullName;

                    // Tự động đóng Modal
                    bootstrap.Modal.getInstance(profileModalEl).hide();
                } else {
                    const err = await response.json();
                    alert(err.message || "Có lỗi xảy ra!");
                }
            } catch (error) {
                alert("Lỗi kết nối mạng!");
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false; // Trả lại trạng thái nút
            }
        });
    }

// ==========================================
// 6. XỬ LÝ ĐỔI MẬT KHẨU
// ==========================================
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const currentPw = document.getElementById('currentPassword').value;
            const newPw = document.getElementById('newPassword').value;
            const confirmPw = document.getElementById('confirmNewPassword').value;
            const alertBox = document.getElementById('passwordAlert');

            // Reset thông báo lỗi
            alertBox.classList.remove('d-none', 'alert-success', 'alert-danger');

            // Kiểm tra mật khẩu xác nhận
            if (newPw !== confirmPw) {
                alertBox.classList.add('alert-danger');
                alertBox.innerText = "Mật khẩu xác nhận không khớp!";
                return;
            }

            const btn = document.getElementById('btnSubmitPassword');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang xử lý...';
            btn.disabled = true;

            try {
                // Gọi API đổi mật khẩu (đã có sẵn ở Backend)
                const response = await apiFetch(`/api/user/${userId}/change-password`, {
                    method: 'PUT',
                    body: JSON.stringify({ oldPassword: currentPw, newPassword: newPw })
                });

                if (response.ok) {
                    alertBox.classList.add('alert-success');
                    alertBox.innerText = "Đổi mật khẩu thành công!";
                    changePasswordForm.reset(); // Xóa trắng các ô nhập
                } else {
                    const err = await response.json();
                    alertBox.classList.add('alert-danger');
                    alertBox.innerText = err.message || "Mật khẩu hiện tại không đúng!";
                }
            } catch (error) {
                alertBox.classList.add('alert-danger');
                alertBox.innerText = "Lỗi kết nối mạng!";
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }
});