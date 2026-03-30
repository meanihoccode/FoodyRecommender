if (localStorage.getItem('userId')) {
    window.location.href = '/home.html';
}

// --- CÁC THÀNH PHẦN GIAO DIỆN ---
const signupForm = document.getElementById('signupForm');
const submitBtn = signupForm.querySelector('button[type="submit"]');
const errorMsg = document.getElementById('errorMsg');
const errorText = document.getElementById('errorText');
const successMsg = document.getElementById('successMsg');
const successText = document.getElementById('successText');

// Vùng chứa Form nhập liệu
const formInputsDiv = document.createElement('div');
formInputsDiv.id = "formInputsWrapper";
// Di chuyển tất cả các thẻ form-group vào trong Wrapper này để lát dễ ẩn đi
const formGroups = signupForm.querySelectorAll('.form-group');
formGroups.forEach(fg => formInputsDiv.appendChild(fg));
signupForm.insertBefore(formInputsDiv, errorMsg);

// Vùng chứa Form OTP (Ban đầu ẩn)
// ... (Tìm đoạn otpWrapper = ... lúc nãy và thay bằng đoạn này) ...
const otpWrapper = document.createElement('div');
otpWrapper.id = "otpWrapper";
otpWrapper.className = "d-none text-center mb-4";
otpWrapper.innerHTML = `
            <div class="alert alert-info text-start small mb-4">
                <i class="fas fa-envelope-open-text me-2"></i>Mã xác thực (OTP) gồm 6 chữ số đã được gửi đến Email của bạn.
            </div>
            <div class="form-floating mb-3">
                <input type="text" class="form-control text-center fw-bold fs-4 tracking-widest" id="otpCode" placeholder="Nhập 6 số" maxlength="6" autocomplete="off">
                <label for="otpCode" class="text-center w-100">Nhập mã OTP</label>
            </div>
            
            <div class="mt-3">
                <span class="text-muted small">Chưa nhận được mã? </span>
                <button type="button" id="resendOtpBtn" class="btn btn-link text-decoration-none p-0 fw-bold" disabled>
                    Gửi lại mã (<span id="countdown">90</span>s)
                </button>
            </div>
        `;
signupForm.insertBefore(otpWrapper, errorMsg);

// Trạng thái hiện tại: 1 = Điền Form, 2 = Nhập OTP
let currentStep = 1;
let registeredEmail = "";

// --- HIỆU ỨNG ĐỘ MẠNH MẬT KHẨU ---
const passwordInput = document.getElementById('password');
const passwordStrengthBar = document.getElementById('passwordStrengthBar');

passwordInput.addEventListener('input', function() {
    const strength = this.value.length;
    passwordStrengthBar.className = 'password-strength-bar'; // Reset

    if (strength > 0 && strength < 6) {
        passwordStrengthBar.classList.add('weak');
    } else if (strength >= 6 && strength < 10) {
        passwordStrengthBar.classList.add('fair');
    } else if (strength >= 10) {
        passwordStrengthBar.classList.add('strong');
    }
});

// --- HÀM HIỂN THỊ THÔNG BÁO ---
const showError = (msg) => {
    errorText.textContent = msg;
    errorMsg.classList.remove('d-none');
    successMsg.classList.add('d-none');
};

const showSuccess = (msg) => {
    successText.textContent = msg;
    successMsg.classList.remove('d-none');
    errorMsg.classList.add('d-none');
};

const setButtonLoading = (isLoading, text) => {
    if (isLoading) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Đang xử lý...`;
    } else {
        submitBtn.disabled = false;
        submitBtn.innerHTML = text;
    }
};

// --- XỬ LÝ SUBMIT FORM ---
signupForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    errorMsg.classList.add('d-none');

    // BƯỚC 1: XỬ LÝ ĐĂNG KÝ
    if (currentStep === 1) {
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validate
        if (!fullName || !email || !phone || !password) {
            showError('Vui lòng điền đầy đủ thông tin'); return;
        }
        if (password.length < 6) {
            showError('Mật khẩu phải tối thiểu 6 ký tự'); return;
        }
        if (password !== confirmPassword) {
            showError('Mật khẩu nhập lại không khớp'); return;
        }

        setButtonLoading(true);

        try {
            // Gọi API Đăng ký
            const response = await fetch("/api/user/register", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, email, phone, password })
            });

            setButtonLoading(false, "XÁC NHẬN OTP");

            if (response.ok) {
                // Thành công -> Chuyển sang màn nhập OTP
                registeredEmail = email;
                currentStep = 2;

                // Đổi giao diện
                formInputsDiv.classList.add('d-none');
                otpWrapper.classList.remove('d-none');
                showSuccess("Đã gửi mã OTP đến email của bạn!");
                startResendCountdown();
                document.querySelector('.subtitle').innerHTML = `<i class="fas fa-shield-alt me-1 text-success"></i>Xác thực Tài khoản`;

            } else {
                const errorData = await response.json();
                showError(errorData.message || 'Lỗi đăng ký. Vui lòng thử lại.');
            }
        } catch (error) {
            setButtonLoading(false, `<i class="fas fa-user-plus me-2"></i>ĐĂNG KÝ`);
            showError('Không thể kết nối đến máy chủ.');
        }
    }

    // BƯỚC 2: XỬ LÝ XÁC THỰC OTP
    else if (currentStep === 2) {
        const otp = document.getElementById('otpCode').value.trim();
        if (otp.length !== 6) {
            showError('Vui lòng nhập đủ 6 số OTP'); return;
        }

        setButtonLoading(true);

        try {
            // Gọi API Xác thực OTP
            const response = await fetch("/api/user/verify-otp", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: registeredEmail, otp: otp })
            });

            if (response.ok) {
                // Thành công 100%
                formInputsDiv.classList.add('d-none');
                otpWrapper.classList.add('d-none');
                submitBtn.classList.add('d-none');

                showSuccess("Xác thực thành công! Đang chuyển đến trang Đăng nhập...");

                // Chuyển hướng sau 2 giây
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);

            } else {
                setButtonLoading(false, "XÁC NHẬN OTP");
                const errorData = await response.json();
                showError(errorData.message || 'Mã OTP không chính xác.');
            }
        } catch (error) {
            setButtonLoading(false, "XÁC NHẬN OTP");
            showError('Không thể kết nối đến máy chủ.');
        }
    }
});

// --- LOGIC GỬI LẠI OTP VÀ ĐẾM NGƯỢC ---
let resendTimer;

function startResendCountdown() {
    const resendBtn = document.getElementById('resendOtpBtn');
    const countdownSpan = document.getElementById('countdown');
    let timeLeft = 90; // 60 giây

    // Khóa nút bấm
    resendBtn.disabled = true;
    resendBtn.style.color = 'gray';

    // Xóa timer cũ nếu có
    if (resendTimer) clearInterval(resendTimer);

    resendTimer = setInterval(() => {
        timeLeft--;
        resendBtn.innerHTML = `Gửi lại mã (<span id="countdown">${timeLeft}</span>s)`;

        if (timeLeft <= 0) {
            clearInterval(resendTimer);
            resendBtn.disabled = false;
            resendBtn.style.color = 'var(--primary-color)';
            resendBtn.innerHTML = `Gửi lại mã ngay`;
        }
    }, 1000);
}

// Bắt sự kiện khi click vào nút Gửi lại OTP
document.getElementById('signupForm').addEventListener('click', async function(e) {
    if (e.target && (e.target.id === 'resendOtpBtn' || e.target.closest('#resendOtpBtn'))) {
        const resendBtn = document.getElementById('resendOtpBtn');
        if (resendBtn.disabled) return;

        // Tạm khóa nút để chờ API
        resendBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status"></span> Đang gửi...`;
        resendBtn.disabled = true;

        try {
            const response = await fetch("/api/user/send-again", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: registeredEmail })
            });

            if (response.ok) {
                showSuccess("Đã gửi lại mã OTP mới vào Email của bạn!");
                // Bắt đầu đếm ngược lại từ 60s
                startResendCountdown();
            } else {
                const err = await response.json();
                showError(err.message || "Lỗi gửi lại mã.");
                resendBtn.innerHTML = `Gửi lại mã ngay`;
                resendBtn.disabled = false;
            }
        } catch (error) {
            showError("Lỗi kết nối mạng.");
            resendBtn.innerHTML = `Gửi lại mã ngay`;
            resendBtn.disabled = false;
        }
    }
});