document.addEventListener('DOMContentLoaded', () => {
    // 1. KIỂM TRA ĐĂNG NHẬP VÀ HIỂN THỊ ADMIN
    const userRole = localStorage.getItem('userRole');
    if (!userRole || userRole !== 'ADMIN') {
        window.location.href = '/login';
        return; // Dừng thực thi nếu không phải admin
    } else {
        const adminName = localStorage.getItem('userFullName') || 'Administrator';
        document.getElementById('adminName').textContent = adminName;
        document.getElementById('adminAvatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(adminName)}&background=ee4d2d&color=fff`;
    }

    // Bật tắt Sidebar trên Mobile
    document.getElementById('sidebarToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('active');
    });

    // 2. XỬ LÝ ĐĂNG XUẤT
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

    // Gán thời gian giả định cho việc cập nhật AI (Có thể fetch API sau này)
    document.getElementById('lastAiRunTime').innerText = "Hôm nay, 02:00 AM";

    // 3. XỬ LÝ NÚT CHẠY AI (RECOMENDATION ENGINE)
    const btnRunAI = document.getElementById('btnRunAI');
    if (btnRunAI) {
        btnRunAI.addEventListener('click', async function() {
            if(!confirm("Hệ thống sẽ chạy thuật toán Machine Learning. Quá trình này có thể mất 15-30 giây tùy theo số lượng dữ liệu. Bạn có muốn tiếp tục?")) {
                return;
            }

            this.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang trích xuất Vector...';
            this.disabled = true;

            try {
                // Gọi API backend Spring Boot (Bạn cần viết 1 API trong Java gọi hàm runPythonRecommendation)
                const response = await fetch('/api/system/trigger-ai', { method: 'POST' });

                if (response.ok) {
                    alert("Chạy thuật toán AI thành công! Danh sách gợi ý đã được cập nhật mới nhất.");
                    document.getElementById('lastAiRunTime').innerText = "Vừa xong";
                } else {
                    alert("Thuật toán đang chạy ngầm hoặc đã xảy ra lỗi. Vui lòng kiểm tra log server.");
                }
            } catch (error) {
                alert("Không thể kết nối đến máy chủ AI.");
            } finally {
                this.innerHTML = '<i class="fas fa-play-circle me-2"></i>Chạy Thuật toán Gợi ý ngay';
                this.disabled = false;
            }
        });
    }

    // 4. XỬ LÝ ĐỔI MẬT KHẨU
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const currentPw = document.getElementById('currentPassword').value;
            const newPw = document.getElementById('newPassword').value;
            const confirmPw = document.getElementById('confirmNewPassword').value;
            const alertBox = document.getElementById('passwordAlert');

            // Reset thông báo
            alertBox.classList.remove('d-none', 'alert-success', 'alert-danger');

            if (newPw !== confirmPw) {
                alertBox.classList.add('alert-danger');
                alertBox.innerText = "Mật khẩu xác nhận không khớp!";
                return;
            }

            if (newPw.length < 6) {
                alertBox.classList.add('alert-danger');
                alertBox.innerText = "Mật khẩu mới phải có ít nhất 6 ký tự.";
                return;
            }

            // Gửi API đổi mật khẩu (Giả lập cấu trúc gọi API)
            try {
                // Thay thế bằng API thật của bạn, nhớ truyền userId lấy từ localStorage nếu cần
                const adminId = localStorage.getItem('userId');
                const response = await fetch(`/api/users/${adminId}/change-password`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ oldPassword: currentPw, newPassword: newPw })
                });

                if (response.ok) {
                    alertBox.classList.add('alert-success');
                    alertBox.innerText = "Đổi mật khẩu thành công!";
                    changePasswordForm.reset();
                } else {
                    const errorData = await response.json();
                    alertBox.classList.add('alert-danger');
                    alertBox.innerText = errorData.message || "Mật khẩu hiện tại không đúng!";
                }
            } catch (error) {
                alertBox.classList.add('alert-danger');
                alertBox.innerText = "Lỗi kết nối đến máy chủ!";
            }
        });
    }
});