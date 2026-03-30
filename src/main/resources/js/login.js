// Gắn sự kiện trực tiếp cho form
document.getElementById('loginForm').addEventListener('submit', handleLogin);

async function handleLogin(e) {
    // 1. Chặn load lại trang
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');

    // Hàm tiện ích hiển thị lỗi
    const showError = (msg) => {
        errorMsg.textContent = msg;
        errorMsg.classList.remove('d-none');
    };

    // 2. Validate cơ bản
    if (!email || !password) {
        showError('Vui lòng nhập đầy đủ email và mật khẩu.');
        return;
    }

    try {
        // 3. Gọi API Đăng nhập
        const response = await fetch("/api/user/login", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const user = await response.json();

            if (!user.id) {
                showError('Lỗi: Dữ liệu tài khoản không hợp lệ.');
                return;
            }

            // 4. Lưu vào LocalStorage (Lưu xong là có liền, không cần chờ)
            localStorage.setItem('userId', String(user.id));
            localStorage.setItem('userEmail', user.email || '');
            localStorage.setItem('userFullName', user.fullName || '');

            // LƯU Ý MỚI: Lưu thêm Role (Quyền) để lát nữa làm Admin
            const userRole = user.role || 'USER';
            localStorage.setItem('userRole', userRole);

            // 5. CHUYỂN HƯỚNG THÔNG MINH (Role-Based Routing)
            if (userRole === 'ADMIN') {
                // Nếu là Admin -> Cho vào thẳng khu vực quản trị
                window.location.href = '/admin-dashboard';
            } else {
                // Nếu là Khách -> Cho ra trang chủ tìm quán ăn
                window.location.href = '/home';
            }

        } else {
            // 6. Xử lý Lỗi từ Backend báo về
            let errorMessage = 'Email hoặc mật khẩu không chính xác.';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (err) {
                if (response.status === 500) errorMessage = 'Hệ thống đang bận. Vui lòng thử lại sau.';
            }
            showError(errorMessage);
        }
    } catch (error) {
        console.error('Lỗi Login:', error);
        showError('Mất kết nối đến máy chủ. Kiểm tra lại mạng của bạn!');
    }
}