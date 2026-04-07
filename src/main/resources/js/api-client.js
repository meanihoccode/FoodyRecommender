// File: api-client.js
// Hàm này sẽ thay thế cho hàm fetch() mặc định của trình duyệt
async function apiFetch(url, options = {}) {
    // 1. Lấy thẻ từ trong ví ra
    const token = localStorage.getItem('token');

    // 2. Chuẩn bị giỏ hàng (headers)
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}) // Giữ lại các header cũ nếu có
    };

    // 3. Đeo thẻ vào (Nếu có thẻ)
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // 4. Gọi API thật
    const fetchOptions = {
        ...options,
        headers: headers
    };

    try {
        const response = await fetch(url, fetchOptions);

        // 5. BẮT LỖI TẬP TRUNG (Không cần viết lại ở các file khác)
        if (response.status === 401) {
            // 401: Token hết hạn hoặc sai
            alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
            localStorage.clear();
            window.location.href = '/login';
        } else if (response.status === 503) {
            // 503: Đang bảo trì
            const errorData = await response.json();
            alert(errorData.error || "Hệ thống đang bảo trì!");
        }

        return response; // Trả kết quả về cho các file JS khác dùng tiếp
    } catch (error) {
        console.error("Lỗi kết nối mạng:", error);
        throw error;
    }
}