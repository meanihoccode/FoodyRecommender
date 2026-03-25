// ========== EVENT LISTENER ==========
// Khi form submit (nhấn Enter hoặc click button)
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    handleLogin();
});

// ========== LOGIN FUNCTION ==========
async function handleLogin() {
    console.log('handleLogin function called');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');

    console.log('Email:', email, 'Password:', password);

    // Validate input
    if (!email || !password) {
        errorMsg.textContent = 'Vui lòng nhập email và mật khẩu';
        errorMsg.classList.remove('d-none');
        return;
    }

    try {
        console.log('Sending login request for:', email);

        // Gọi API login
        const response = await fetch("/api/user/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (response.ok) {
            const user = await response.json();
            console.log('Login successful! User:', user);
            console.log('User ID type:', typeof user.id, 'Value:', user.id);
            console.log('User fullName type:', typeof user.fullName, 'Value:', user.fullName);

            // Kiểm tra dữ liệu user
            if (!user.id) {
                console.error('User ID không hợp lệ:', user);
                errorMsg.textContent = 'Lỗi: Dữ liệu người dùng không hợp lệ';
                errorMsg.classList.remove('d-none');
                return;
            }

            // Lưu thông tin user vào localStorage
            const userId = String(user.id);
            const userEmail = user.email || '';
            const userFullName = user.fullName || '';

            console.log('Saving to localStorage:');
            console.log('userId:', userId);
            console.log('userEmail:', userEmail);
            console.log('userFullName:', userFullName);

            localStorage.setItem('userId', userId);
            localStorage.setItem('userEmail', userEmail);
            localStorage.setItem('userFullName', userFullName);

            // Verify localStorage
            console.log('LocalStorage after save:');
            console.log('userId:', localStorage.getItem('userId'));
            console.log('userEmail:', localStorage.getItem('userEmail'));
            console.log('userFullName:', localStorage.getItem('userFullName'));

            // Xóa thông báo lỗi
            errorMsg.classList.add('d-none');

            // Chuyển hướng tới home page (sau 500ms để đảm bảo localStorage được save)
            console.log('Redirecting to /home...');
            setTimeout(() => {
                window.location.href = '/home';
            }, 500);
        } else {
            // Xử lý lỗi - parse JSON từ error response
            let errorMessage = 'Đăng nhập thất bại';

            try {
                const errorData = await response.json();
                console.log('Error response data:', errorData);
                errorMessage = errorData.message || errorMessage;
            } catch (parseError) {
                console.log('Could not parse error JSON, using default message');
                if (response.status === 401) {
                    errorMessage = 'Email hoặc mật khẩu không chính xác';
                } else if (response.status === 500) {
                    errorMessage = 'Lỗi server. Vui lòng thử lại sau';
                } else if (response.status === 400) {
                    errorMessage = 'Email hoặc mật khẩu không hợp lệ';
                }
            }

            console.log('Setting error message:', errorMessage);
            errorMsg.textContent = errorMessage;
            errorMsg.classList.remove('d-none');
        }
    } catch (error) {
        console.error('Lỗi:', error);
        errorMsg.textContent = 'Lỗi kết nối đến server';
        errorMsg.classList.remove('d-none');
    }
}
