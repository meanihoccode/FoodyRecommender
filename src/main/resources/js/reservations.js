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
    const bookingDateTime = new Date(`${bookingDate}T${bookingTime}`);
    const diffInMilliseconds = bookingDateTime - now;
    const diffInHours = diffInMilliseconds / (1000 * 60 * 60);

    if (diffInHours < 2) {
        return false;
    }
    return true;
}

/* ================= HÀM LOAD DỮ LIỆU ĐẶT BÀN ================= */
async function loadReservations () {
    // 1. THÊM COMPLETED VÀO CONTAINERS VÀ COUNTS
    const containers = {
        all: document.querySelector("#allReservations"),
        pending: document.querySelector("#pendingReservations"),
        confirmed: document.querySelector("#confirmedReservations"),
        completed: document.querySelector("#completedReservations"), // MỚI THÊM
        cancelled: document.querySelector("#cancelledReservations")
    };
    const counts = {
        all: document.querySelector("#allCount"),
        pending: document.querySelector("#pendingCount"),
        confirmed: document.querySelector("#confirmedCount"),
        completed: document.querySelector("#completedCount"), // MỚI THÊM
        cancelled: document.querySelector("#cancelledCount")
    };
    let countData = { all: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 }; // THÊM COMPLETED

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
                let statusClass = "bg-warning text-dark";
                let statusText = "Chờ xác nhận";
                let tabTarget = "pending";

                if (res.status === "CONFIRMED" || res.status === "Đã xác nhận") {
                    statusClass = "bg-primary";
                    statusText = "Đã xác nhận";
                    tabTarget = "confirmed";
                }
                // 2. THÊM LOGIC XÉT TRẠNG THÁI HOÀN THÀNH
                else if (res.status === "COMPLETED" || res.status === "Đã hoàn thành") {
                    statusClass = "bg-success"; // Dùng màu xanh lá cho việc đã ăn xong
                    statusText = "Đã hoàn thành";
                    tabTarget = "completed";
                }
                else if (res.status === "CANCELLED" || res.status === "Đã hủy") {
                    statusClass = "bg-danger";
                    statusText = "Đã hủy";
                    tabTarget = "cancelled";
                }

                countData.all++;
                countData[tabTarget]++;

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
                else if (statusText === "Đã hoàn thành") {
                    actionButtonsHtml = `
                        <button class="btn btn-sm btn-outline-success border-0 fw-bold" 
                                onclick="openRatingModal(${res.id}, ${res.restaurant?.id}, '${escapedRestName}')">
                            <i class="fas fa-star me-1"></i>Đánh giá
                        </button>
                    `;
                }

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

                containers.all?.insertAdjacentHTML('beforeend', cardHtml);
                containers[tabTarget]?.insertAdjacentHTML('beforeend', cardHtml);
            });

            // 4. GÁN SỐ ĐẾM HOÀN THÀNH LÊN GIAO DIỆN
            if(counts.all) counts.all.innerText = countData.all;
            if(counts.pending) counts.pending.innerText = countData.pending;
            if(counts.confirmed) counts.confirmed.innerText = countData.confirmed;
            if(counts.completed) counts.completed.innerText = countData.completed; // MỚI THÊM
            if(counts.cancelled) counts.cancelled.innerText = countData.cancelled;

            toggleNoResults(countData);
        } else {
            console.error("Lỗi tải dữ liệu!");
        }
    } catch (e) {
        console.error("Lỗi: ", e);
    }
}

// 5. CẬP NHẬT HÀM ẨN/HIỆN THÔNG BÁO
function toggleNoResults(countData) {
    const setDisplay = (id, count) => {
        const el = document.querySelector(id);
        if (el) el.style.display = count === 0 ? "block" : "none";
    };

    setDisplay("#noAllResults", countData.all);
    setDisplay("#noPendingResults", countData.pending);
    setDisplay("#noConfirmedResults", countData.confirmed);
    setDisplay("#noCompletedResults", countData.completed); // MỚI THÊM
    setDisplay("#noCancelledResults", countData.cancelled);
}

/* ================= XỬ LÝ SỰ KIỆN NÚT HỦY & MODAL ================= */
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
            const modalElement = document.getElementById('cancelModal');
            let modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
            modalInstance.hide();
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

/* ================= XỬ LÝ SỰ KIỆN ĐÁNH GIÁ (RATING) ================= */
let currentRating = 0;
let currentRatingReservationId = null;
let currentRatingRestaurantId = null;

// Hàm mở Modal đánh giá
function openRatingModal(reservationId, restaurantId, restaurantName) {
    currentRatingReservationId = reservationId;
    currentRatingRestaurantId = restaurantId;
    currentRating = 0; // Reset điểm mỗi lần mở

    document.getElementById('ratingRestaurantName').innerText = restaurantName;
    document.getElementById('ratingText').innerText = "Vui lòng chọn số sao";
    document.getElementById('ratingText').className = "text-muted fw-bold mb-0";

    updateStarUI(0); // Reset UI sao về rỗng

    const modal = new bootstrap.Modal(document.getElementById('ratingModal'));
    modal.show();
}

// Xử lý hiệu ứng di chuột và click cho các ngôi sao
document.querySelectorAll('.rating-star').forEach(star => {
    // Khi Hover chuột vào: Sáng tạm thời
    star.addEventListener('mouseover', function() {
        const val = this.getAttribute('data-value');
        updateStarUI(val);
    });

    // Khi chuột rời đi: Trả về trạng thái của số điểm đã click
    star.addEventListener('mouseout', function() {
        updateStarUI(currentRating);
    });

    // Khi Click: Chốt điểm
    star.addEventListener('click', function() {
        currentRating = parseInt(this.getAttribute('data-value'));

        // Mảng text tương ứng với 1-5 sao
        const texts = ["", "Tệ", "Không hài lòng", "Bình thường", "Hài lòng", "Tuyệt vời!"];
        const textEl = document.getElementById('ratingText');
        textEl.innerText = texts[currentRating];
        textEl.className = "text-success fw-bold fs-5 mb-0";

        updateStarUI(currentRating);
    });
});

// Hàm vẽ lại UI ngôi sao (Đổi class far -> fas)
function updateStarUI(val) {
    document.querySelectorAll('.rating-star').forEach(s => {
        if (s.getAttribute('data-value') <= val) {
            s.classList.remove('far'); // Bỏ sao rỗng
            s.classList.add('fas');    // Thêm sao đặc
        } else {
            s.classList.remove('fas');
            s.classList.add('far');
        }
    });
}

// Gửi API Đánh giá
document.getElementById('submitRatingBtn').addEventListener('click', async function() {
    if (currentRating === 0) {
        alert("Vui lòng click chọn số sao trước khi gửi!");
        return;
    }

    // Đóng gói dữ liệu giống y hệt cấu trúc Entity Rating.java
    const payload = {
        user: { id: getLoggedInUserId() },
        restaurant: { id: currentRatingRestaurantId },
        reservation: { id: currentRatingReservationId },
        score: currentRating
    };

    this.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang xử lý...';
    this.disabled = true;

    try {
        const response = await fetch('/api/ratings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Cảm ơn bạn! Đánh giá đã được ghi nhận để cải thiện thuật toán Gợi ý.");
            const modalElement = document.getElementById('ratingModal');
            bootstrap.Modal.getInstance(modalElement).hide();
            // Load lại danh sách để reset giao diện
            loadReservations();
        } else {
            alert("Bạn đã đánh giá đơn này rồi, hoặc hệ thống đang bận!");
        }
    } catch (e) {
        alert("Lỗi kết nối mạng!");
    } finally {
        this.innerHTML = 'Gửi đánh giá';
        this.disabled = false;
    }
});

document.addEventListener('DOMContentLoaded', loadReservations);