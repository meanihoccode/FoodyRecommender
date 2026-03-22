// Mock data - dữ liệu giả
const mockUsers = [
    { id: 1, username: 'user', password: '123456' },
    { id: 2, username: 'admin', password: 'admin123' },
    { id: 3, username: 'test', password: 'test123' }
];

async function handleLogin() {
    console.log('handleLogin function called');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');

    console.log('Email:', email, 'Password:', password);

    try {
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

        // Kiểm tra response
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (response.ok) {
            const user = await response.json();

            // Lưu thông tin user vào localStorage
            localStorage.setItem('userId', user.id);
            localStorage.setItem('userEmail', user.email);
            localStorage.setItem('userFullName', user.fullName);

            // Xóa thông báo lỗi
            errorMsg.classList.add('d-none');

            console.log('Login successful! Redirecting...');

            // Chuyển hướng tới home page
            window.location.href = '/home';
        } else {
            // Xử lý lỗi
            let errorMessage = 'Đăng nhập thất bại';

            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                // Nếu server trả về HTML thay vì JSON
                if (response.status === 401) {
                    errorMessage = 'Email hoặc mật khẩu không chính xác';
                } else if (response.status === 500) {
                    errorMessage = 'Lỗi server. Vui lòng thử lại sau';
                }
            }

            errorMsg.textContent = errorMessage;
            errorMsg.classList.remove('d-none');
            console.log('Login failed with status:', response.status);
        }
    } catch (error) {
        console.error('Lỗi:', error);
        errorMsg.textContent = 'Lỗi kết nối đến server';
        errorMsg.classList.remove('d-none');
    }
}
