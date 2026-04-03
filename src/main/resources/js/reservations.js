/* ================= THIẾT LẬP THÔNG TIN USER ================= */
const username = document.querySelector("#username");
username.innerHTML = localStorage.getItem("userFullName") || "User";

function getLoggedInUserId() {
    const raw = localStorage.getItem('userId');
    const id = raw ? Number(raw) : NaN;
    return Number.isFinite(id) ? id : null;
}

/* ================= HÀM KIỂM TRA THỜI GIAN HỦY ================= */
function canCancelReservation(bookingDate, bookingTime) {
    const now = new Date();
    // Ghép ngày và giờ thành 1 chuỗi Date hợp lệ
    const bookingDateTime = new Date(`${bookingDate}T${bookingTime}`);
    const diffInMilliseconds = bookingDateTime - now;
    const diffInHours = diffInMilliseconds / (1000 * 60 * 60);

    // Nếu thời gian ở trong quá khứ hoặc còn chưa tới 2 tiếng thì KHÔNG cho hủy
    if (diffInHours < 2) {
        return false;
    }
    return true;
}

/* ================= HÀM LOAD DỮ LIỆU ĐẶT BÀN ================= */
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
        window.location.href = '/login';
        return;
    }

    try {
        const response = await fetch(`/api/reservations/users/${userId}`);
        if (response.ok) {
            const data = await response.json();

            data.forEach(res => {
                // 1. Xác định màu sắc và text cho Status Badge
                let statusClass = "bg-warning text-dark"; // mặc định
                let statusText = "Chờ xác nhận";
                let tabTarget = "pending";

                if (res.status === "CONFIRMED" || res.status === "Đã xác nhận") {
                    statusClass = "bg-success";
                    statusText = "Đã xác nhận";
                    tabTarget = "confirmed";
                } else if (res.status === "CANCELLED" || res.status === "Đã hủy") {
                    statusClass = "bg-danger";
                    statusText = "Đã hủy";
                    tabTarget = "cancelled";
                }

                // Cập nhật biến đếm
                countData.all++;
                countData[tabTarget]++;

                // 2. Xử lý logic hiển thị nút Hủy dựa trên thời gian
                let actionButtonsHtml = '';
                const escapedRestName = (res.restaurant?.name || '').replace(/'/g, "\\'");

                if (statusText === "Chờ xác nhận") {
                    actionButtonsHtml = `
                        <button class="btn btn-sm btn-outline-danger border-0 fw-bold" 
                                onclick="openCancelModal(${res.id}, '${escapedRestName}')">
                            <i class="fas fa-times-circle me-1"></i>Hủy bàn
                        </button>
                    `;
                } else if (statusText === "Đã xác nhận") {
                    const isCancelable = canCancelReservation(res.bookingDate, res.bookingTime);
                    if (isCancelable) {
                        actionButtonsHtml = `
                            <button class="btn btn-sm btn-outline-danger border-0 fw-bold" 
                                    onclick="openCancelModal(${res.id}, '${escapedRestName}')">
                                <i class="fas fa-times-circle me-1"></i>Hủy bàn
                            </button>
                        `;
                    } else {
                        actionButtonsHtml = `
                            <div class="text-end mt-2 mt-md-0">
                                <button class="btn btn-sm btn-secondary border-0 mb-1 opacity-75" disabled>
                                    <i class="fas fa-lock me-1"></i>Hết hạn hủy
                                </button>
                                <div class="text-danger fw-bold" style="font-size: 0.7rem;">
                                    Quá hạn hủy. Xin gọi CSKH: 0358764465
                                </div>
                            </div>
                        `;
                    }
                }
                // Nếu là "Đã hủy" thì actionButtonsHtml tự động là rỗng (không có nút gì)

                // 3. Tạo giao diện Card
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
                                    <i class="fas fa-map-marker-alt me-2"></i>${res.restaurant?.address || 'Đang cập nhật'}
                                </div>

                                <hr class="my-3 opacity-25">

                                <div class="row g-2 mb-3">
                                    <div class="col-6">
                                        <div class="p-2 bg-light rounded text-center">
                                            <div class="small text-muted mb-1">Ngày đặt</div>
                                            <div class="fw-bold text-dark">${res.bookingDate || ''}</div>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <div class="p-2 bg-light rounded text-center">
                                            <div class="small text-muted mb-1">Giờ đặt</div>
                                            <div class="fw-bold text-dark">${res.bookingTime || ''}</div>
                                        </div>
                                    </div>
                                </div>

                                <div class="d-flex justify-content-between align-items-center flex-wrap">
                                    <div class="text-muted small">
                                        <i class="fas fa-users me-1 text-primary"></i> <b>${res.partySize || 0} khách</b>
                                    </div>
                                    <div class="ms-auto">
                                        ${actionButtonsHtml}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                // Đổ vào Tab "Tất cả" và Tab tương ứng
                containers.all?.insertAdjacentHTML('beforeend', cardHtml);
                containers[tabTarget]?.insertAdjacentHTML('beforeend', cardHtml);
            });

            // Gán số đếm lên giao diện
            counts.all.innerText = countData.all;
            counts.pending.innerText = countData.pending;
            counts.confirmed.innerText = countData.confirmed;
            counts.cancelled.innerText = countData.cancelled;

            toggleNoResults(countData);
        } else {
            console.error("Lỗi tải dữ liệu!");
        }
    } catch (e) {
        console.error("Lỗi: ", e);
    }
}

// Ẩn/Hiện thông báo khi không có đơn
function toggleNoResults(countData) {
    document.querySelector("#noAllResults").style.display = countData.all === 0 ? "block" : "none";
    document.querySelector("#noPendingResults").style.display = countData.pending === 0 ? "block" : "none";
    document.querySelector("#noConfirmedResults").style.display = countData.confirmed === 0 ? "block" : "none";
    document.querySelector("#noCancelledResults").style.display = countData.cancelled === 0 ? "block" : "none";
}

/* ================= XỬ LÝ SỰ KIỆN NÚT HỦY & MODAL ================= */
let currentCancelId = null;

// Hàm mở Modal
async function openCancelModal(id, restaurantName) {
    currentCancelId = id;
    document.querySelector("#cancelRestaurantName").innerText = restaurantName;
    const modal = new bootstrap.Modal(document.getElementById('cancelModal'));
    modal.show();
}

// Hàm xác nhận Hủy trong Modal
document.querySelector("#confirmCancelBtn").addEventListener('click', async function() {
    if (!currentCancelId) return;
    try {
        const response = await fetch(`/api/reservations/cancellation/${currentCancelId}`, {
            method: "PUT"
        });
        if (response.ok) {
            // Đóng Modal
            const modalElement = document.getElementById('cancelModal');
            let modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (!modalInstance) {
                modalInstance = new bootstrap.Modal(modalElement);
            }
            modalInstance.hide();
            // Reload lại giao diện để Cập nhật trạng thái tab
            loadReservations();
        } else {
            alert("Lỗi hủy lịch! Vui lòng thử lại.");
        }
    } catch (e) {
        console.error(e);
    }
});

/* ================= SỰ KIỆN KHÁC ================= */
document.getElementById('logoutBtn').addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.clear();
    window.location.href = '/login';
});

// Chạy hàm ngay khi load trang
document.addEventListener('DOMContentLoaded', loadReservations);