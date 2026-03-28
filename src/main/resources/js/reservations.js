const username = document.querySelector("#username");
username.innerHTML = localStorage.getItem("userFullName") || "User";

function getLoggedInUserId() {
    const key = document.body?.dataset?.useridKey || 'userId';
    const raw = localStorage.getItem(key);
    const id = raw ? Number(raw) : NaN;
    return Number.isFinite(id) ? id : null;
}

async function loadReservations () {
    const containers = {
        all: document.querySelector("#allReservations"),
        pending: document.querySelector("#pendingReservations"),
        confirmed: document.querySelector("#confirmedReservations"),
        cancelled: document.querySelector("#cancelledReservations")
    };
    const counts = {
        all: document.querySelector("#allCount"),
        pending: document.querySelector("#pendingCount"),
        confirmed: document.querySelector("#confirmedCount"),
        cancelled: document.querySelector("#cancelledCount")
    };
    let countData = { all: 0, pending: 0, confirmed: 0, cancelled: 0 };

    // Xóa trắng dữ liệu cũ trước khi nạp mới
    Object.values(containers).forEach(c => c && (c.innerHTML = ''));

    const userId = getLoggedInUserId();
    if (!userId) {
        // Chưa đăng nhập (hoặc localStorage thiếu userId) => về trang login
        window.location.href = '/login';
        return;
    }

    try {
        const apiBase = document.body?.dataset?.apiBase || '';
        const response = await fetch(`/api/reservations/users/${userId}`);
        if (response.ok) {
            const data = await response.json();

            data.forEach(res => {
                // Xác định màu sắc và text cho Status Badge
                let statusClass = "bg-warning text-dark"; // mặc định PENDING
                let statusText = "Chờ xác nhận";
                let tabTarget = "pending";

                if (res.status === "CONFIRMED") {
                    statusClass = "bg-success";
                    statusText = "Đã xác nhận";
                    tabTarget = "confirmed";
                } else if (res.status === "CANCELLED") {
                    statusClass = "bg-danger";
                    statusText = "Đã hủy";
                    tabTarget = "cancelled";
                }

                // Cập nhật biến đếm
                countData.all++;
                countData[tabTarget]++;

                // Tạo giao diện Card
                const cardHtml = `
                    <div class="col-md-6 col-lg-4">
                        <div class="card h-100 border-0 shadow-sm hover-shadow transition">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-start mb-3">
                                    <h5 class="card-title fw-bold mb-0 text-truncate" style="max-width: 70%;">
                                        ${res.restaurant?.name || 'Nhà hàng'}
                                    </h5>
                                    <span class="badge ${statusClass}">${statusText}</span>
                                </div>

                                <div class="mb-2 text-muted small">
                                    <i class="fas fa-map-marker-alt me-2"></i>${res.restaurant?.address || ''}
                                </div>

                                <hr class="my-3 opacity-25">

                                <div class="row g-2 mb-3">
                                    <div class="col-6">
                                        <div class="p-2 bg-light rounded text-center">
                                            <div class="small text-muted">Ngày đặt</div>
                                            <div class="fw-bold">${res.bookingDate || ''}</div>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <div class="p-2 bg-light rounded text-center">
                                            <div class="small text-muted">Giờ đặt</div>
                                            <div class="fw-bold">${res.bookingTime || ''}</div>
                                        </div>
                                    </div>
                                </div>

                                <div class="d-flex justify-content-between align-items-center">
                                    <div class="text-muted small">
                                        <i class="fas fa-users me-1"></i> Số lượng: <b>${res.partySize || 0} khách</b>
                                    </div>
                                    ${res.status !== 'CANCELLED' ? `
                                        <button class="btn btn-sm btn-outline-danger border-0" 
                                                onclick="openCancelModal(${res.id}, '${(res.restaurant?.name || '').replace(/'/g, "\\'")}')">
                                            Hủy bàn
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                // Đổ vào Tab "Tất cả" và Tab tương ứng với trạng thái
                containers.all?.insertAdjacentHTML('beforeend', cardHtml);
                containers[tabTarget]?.insertAdjacentHTML('beforeend', cardHtml);
            });

            counts.all.innerText = countData.all;
            counts.pending.innerText = countData.pending;
            counts.confirmed.innerText = countData.confirmed;
            counts.cancelled.innerText = countData.cancelled;

            // Hiển thị thông báo "Trống" nếu không có đơn nào
            toggleNoResults(countData);
        } else {
            alert("Lỗi tải lịch đặt bàn");
            try { console.error(await response.json()); } catch { /* ignore */ }
        }
    } catch (e) {
        console.error("Lỗi: ", e);
    }
}

// Hàm hỗ trợ ẩn/hiện thông báo khi không có kết quả
function toggleNoResults(countData) {
    document.querySelector("#noAllResults").style.display = countData.all === 0 ? "block" : "none";
    document.querySelector("#noPendingResults").style.display = countData.pending === 0 ? "block" : "none";
    document.querySelector("#noConfirmedResults").style.display = countData.confirmed === 0 ? "block" : "none";
    document.querySelector("#noCancelledResults").style.display = countData.cancelled === 0 ? "block" : "none";
}

// Hàm bổ trợ để mở Modal hủy (Minh cần viết thêm logic xử lý nút bấm này)
let currentCancelId = null;
async function openCancelModal(id, restaurantName) {
    currentCancelId = id;
    document.querySelector("#cancelRestaurantName").innerText = restaurantName;
    const modal = new bootstrap.Modal(document.getElementById('cancelModal'));
    modal.show();
}

document.querySelector("#confirmCancelBtn").addEventListener('click', async function() {
    if (!currentCancelId) return;
    try {
        const response = await fetch(`/api/reservations/cancellation/${currentCancelId}`, {
            method: "PUT"
        });
        if (response.ok) {
            alert("Hủy lịch đặt thành công");

            // Đóng Modal lại một cách an toàn
            const modalElement = document.getElementById('cancelModal');
            let modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (!modalInstance) {
                modalInstance = new bootstrap.Modal(modalElement);
            }
            modalInstance.hide();

            // Tải lại toàn bộ danh sách, lúc này đơn vừa hủy sẽ tự nhảy sang Tab "Đã hủy"
            loadReservations();

        } else {
            alert("Lỗi hủy lịch");
            console.error("Lỗi: ",await response.json());
        }
    } catch (e) {
        console.error(e);
    }
})

document.getElementById('logoutBtn').addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.clear();
    window.location.href = '/login';
});
// Gọi hàm khi load trang
document.addEventListener('DOMContentLoaded', loadReservations);