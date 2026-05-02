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

// ==========================================
// --- BỘ XỬ LÝ QUÊN MẬT KHẨU ---
// ==========================================

// 1. Mở popup khi bấm "Quên mật khẩu?"
document.querySelector('.forgot-password').addEventListener('click', function(e) {
    e.preventDefault();
    // Reset lại trạng thái form
    document.getElementById('step1Forgot').classList.remove('d-none');
    document.getElementById('step2Forgot').classList.add('d-none');
    document.getElementById('forgotEmail').value = '';
    document.getElementById('forgotErrorMsg1').classList.add('d-none');

    const forgotModal = new bootstrap.Modal(document.getElementById('forgotPasswordModal'));
    forgotModal.show();
});

// 2. Xử lý nút Gửi mã OTP
document.getElementById('btnSendForgotOtp').addEventListener('click', async function() {
    const email = document.getElementById('forgotEmail').value.trim();
    const btn = this;
    const errorMsg = document.getElementById('forgotErrorMsg1');

    if (!email) {
        errorMsg.textContent = "Vui lòng nhập email!";
        errorMsg.classList.remove('d-none');
        return;
    }

    errorMsg.classList.add('d-none');
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Đang gửi...`;

    try {
        // GỌI API GỬI OTP QUÊN MẬT KHẨU
        const response = await fetch(`/api/user/forgot-password?email=${encodeURIComponent(email)}`, {
            method: 'POST'
        });

        if (response.ok) {
            // Chuyển sang bước 2
            document.getElementById('step1Forgot').classList.add('d-none');
            document.getElementById('step2Forgot').classList.remove('d-none');
            document.getElementById('showForgotEmail').textContent = email;
        } else {
            const data = await response.json();
            errorMsg.textContent = data.message || "Không tìm thấy email này trong hệ thống.";
            errorMsg.classList.remove('d-none');
        }
    } catch (err) {
        errorMsg.textContent = "Lỗi kết nối máy chủ!";
        errorMsg.classList.remove('d-none');
    } finally {
        btn.disabled = false;
        btn.innerHTML = `GỬI MÃ XÁC NHẬN`;
    }
});

// 3. Xử lý nút Xác nhận đổi mật khẩu
document.getElementById('btnResetPassword').addEventListener('click', async function() {
    const email = document.getElementById('forgotEmail').value.trim();
    const otp = document.getElementById('forgotOtpCode').value.trim();
    const newPassword = document.getElementById('newPassword').value;
    const btn = this;
    const errorMsg = document.getElementById('forgotErrorMsg2');
    const successMsg = document.getElementById('forgotSuccessMsg');

    if (otp.length !== 6 || !newPassword) {
        errorMsg.textContent = "Vui lòng nhập đủ OTP và mật khẩu mới!";
        errorMsg.classList.remove('d-none');
        return;
    }

    errorMsg.classList.add('d-none');
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Đang xử lý...`;

    try {
        // GỌI API ĐỔI MẬT KHẨU
        const response = await fetch("/api/user/reset-password", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, otp: otp, newPassword: newPassword })
        });

        if (response.ok) {
            successMsg.textContent = "Đổi mật khẩu thành công! Vui lòng đăng nhập lại.";
            successMsg.classList.remove('d-none');

            setTimeout(() => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('forgotPasswordModal'));
                modal.hide();
                // Tự động điền email vào form đăng nhập chính
                document.getElementById('email').value = email;
                document.getElementById('password').value = '';
                document.getElementById('password').focus();
            }, 2000);
        } else {
            const data = await response.json();
            errorMsg.textContent = data.message || "Mã OTP không chính xác hoặc đã hết hạn!";
            errorMsg.classList.remove('d-none');
            btn.disabled = false;
            btn.innerHTML = `XÁC NHẬN ĐỔI MẬT KHẨU`;
        }
    } catch (err) {
        errorMsg.textContent = "Lỗi kết nối máy chủ!";
        errorMsg.classList.remove('d-none');
        btn.disabled = false;
        btn.innerHTML = `XÁC NHẬN ĐỔI MẬT KHẨU`;
    }
});