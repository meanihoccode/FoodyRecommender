// Biến toàn cục để lưu email khi cần xác thực OTP
let unverifiedEmail = "";

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
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password})
        });

        if (response.ok) {
            const data = await response.json();

            // Cất toàn bộ thông tin Backend trả về vào "Ví"
            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('userFullName', data.fullName);

            // Chuyển hướng tùy theo quyền
            if (data.role === 'ADMIN') {
                window.location.href = '/admin-dashboard';
            } else {
                window.location.href = '/home'; // Trang cho khách
            }
        }

         else {
            let errorMessage = 'Email hoặc mật khẩu không chính xác.';
            try {

                const errorData = await response.json();

                // ======== BẮT SỰ KIỆN CHƯA XÁC THỰC ========
                if (response.status === 403 && errorData.errorCode === 'NOT_VERIFIED') {
                    unverifiedEmail = email; // Lưu tạm email khách vừa nhập
                    document.getElementById('verifyEmailText').textContent = email;

                    // Ẩn thông báo lỗi ở form chính (nếu có)
                    errorMsg.classList.add('d-none');

                    // Mở Popup OTP lên
                    const otpModal = new bootstrap.Modal(document.getElementById('otpModal'));
                    otpModal.show();

                    // Tự động kích hoạt API gửi lại mã OTP
                    triggerResendOtp();
                    return; // Dừng luồng chạy báo lỗi đỏ ở ngoài màn hình
                }
                // ===========================================

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

// ==========================================
// --- BỘ XỬ LÝ CHO POPUP OTP ---
// ==========================================

// Bấm nút "Xác nhận & Đăng nhập" trong Popup
document.getElementById('btnVerifyLoginOtp').addEventListener('click', async function() {
    const otp = document.getElementById('loginOtpCode').value.trim();
    const btn = this;
    const errorAlert = document.getElementById('otpErrorMsg');
    const successAlert = document.getElementById('otpSuccessMsg');

    errorAlert.classList.add('d-none');

    if (otp.length !== 6) {
        errorAlert.textContent = "Vui lòng nhập đủ 6 số!";
        errorAlert.classList.remove('d-none');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Đang xử lý...`;

    try {
        const res = await fetch("/api/user/verify-otp", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: unverifiedEmail, otp: otp })
        });

        if (res.ok) {
            successAlert.textContent = "Xác thực thành công! Đang đăng nhập...";
            successAlert.classList.remove('d-none');

            // Đóng popup và tự động submit lại form đăng nhập
            setTimeout(() => {
                const otpModalEl = document.getElementById('otpModal');
                const modal = bootstrap.Modal.getInstance(otpModalEl);
                modal.hide();

                document.getElementById('loginForm').dispatchEvent(new Event('submit'));
            }, 1500);
        } else {
            const err = await res.json();
            errorAlert.textContent = err.message || "Mã OTP không chính xác!";
            errorAlert.classList.remove('d-none');
            btn.disabled = false;
            btn.innerHTML = `XÁC NHẬN & ĐĂNG NHẬP`;
        }
    } catch (e) {
        errorAlert.textContent = "Lỗi kết nối mạng!";
        errorAlert.classList.remove('d-none');
        btn.disabled = false;
        btn.innerHTML = `XÁC NHẬN & ĐĂNG NHẬP`;
    }
});

// Hàm gọi API gửi lại mã OTP + Đếm ngược 90s
let loginResendTimer;
async function triggerResendOtp() {
    const resendBtn = document.getElementById('loginResendOtpBtn');
    let timeLeft = 90;

    fetch("/api/user/send-again", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: unverifiedEmail })
    });

    resendBtn.disabled = true;
    resendBtn.style.color = 'gray';
    if (loginResendTimer) clearInterval(loginResendTimer);

    loginResendTimer = setInterval(() => {
        timeLeft--;
        resendBtn.innerHTML = `Gửi lại mã (<span id="loginCountdown">${timeLeft}</span>s)`;

        if (timeLeft <= 0) {
            clearInterval(loginResendTimer);
            resendBtn.disabled = false;
            resendBtn.style.color = 'var(--primary-color)';
            resendBtn.innerHTML = `Gửi lại mã ngay`;
        }
    }, 1000);
}

// Bấm nút "Gửi lại mã" thủ công trong popup
document.getElementById('loginResendOtpBtn').addEventListener('click', function() {
    if (!this.disabled) triggerResendOtp();
});