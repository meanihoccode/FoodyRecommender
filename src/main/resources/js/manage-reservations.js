// 1. CHỐNG HACKER & HIỂN THỊ INFO
const userRole = localStorage.getItem('userRole');
if (!userRole || userRole !== 'ADMIN') {
    window.location.href = '/login.html';
} else {
    const adminName = localStorage.getItem('userFullName') || 'Administrator';
    document.getElementById('adminName').textContent = adminName;
    document.getElementById('adminAvatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(adminName)}&background=ee4d2d&color=fff`;
}

// 2. TOGGLE SIDEBAR
document.getElementById('sidebarToggle').addEventListener('click', function() {
    document.getElementById('sidebar').classList.toggle('active');
});

// 3. ĐĂNG XUẤT
const logoutModal = new bootstrap.Modal(document.getElementById('logoutModal'));
document.getElementById('btnLogout').addEventListener('click', e => { e.preventDefault(); logoutModal.show(); });
document.getElementById('confirmLogoutBtn').addEventListener('click', function() {
    this.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang xử lý...';
    this.disabled = true;
    setTimeout(() => { localStorage.clear(); window.location.href = '/login'; }, 1000);
});

let currentPage = 0; // Backend (Spring) đánh số trang từ 0
const pageSize = 4;// Biến kiểm soát trạng thái


// 1. CHỐNG HACKER & HIỂN THỊ INFO (Giữ nguyên)
// ... (Đoạn code check Role và Logout giữ nguyên nhé) ...

// ==========================================
// HÀM TẢI DỮ LIỆU TỪ BACKEND CÓ PHÂN TRANG
// ==========================================
// Thêm tham số isRefresh (mặc định là false)
// ==========================================
// HÀM TẢI DỮ LIỆU TỪ BACKEND (CÓ PHÂN TRANG + TÌM KIẾM)
// ==========================================
async function loadReservations(page = 0, isRefresh = false) {
    const tableBody = document.querySelector("#reservationTableBody");
    const currentScrollPosition = window.scrollY;

    if (!isRefresh) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary"></div> Đang tải dữ liệu...</td></tr>';
    }

    // --- 1. ĐỌC GIÁ TRỊ TỪ BỘ LỌC (FILTER) ---
// --- 1. ĐỌC GIÁ TRỊ TỪ BỘ LỌC ---
    const keyword = document.getElementById('searchInput').value.trim();
    const status = document.getElementById('statusFilter').value;
    const startDate = document.getElementById('startDateFilter').value;
    const endDate = document.getElementById('endDateFilter').value;

    // --- 2. XÂY DỰNG URL GỌI API ĐỘNG ---
    let url = `/api/reservations/paged?page=${page}&size=${pageSize}`;

    if (keyword !== "") url += `&keyword=${encodeURIComponent(keyword)}`;
    if (status !== "ALL") url += `&status=${status}`;
    if (startDate !== "") url += `&startDate=${startDate}`;
    if (endDate !== "") url += `&endDate=${endDate}`;

    try {
        const response = await fetch(url);

        if (response.ok) {
            const pageData = await response.json();
            currentPage = pageData.number;

            renderTable(pageData.content);
            renderPagination(pageData.totalPages, pageData.totalElements);

            window.scrollTo(0, currentScrollPosition);
        } else {
            console.error(await response.json());
            if(!isRefresh) tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Lỗi tải dữ liệu</td></tr>';
        }
    } catch (e) {
        console.error(e);
        if(!isRefresh) tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Mất kết nối máy chủ!</td></tr>';
    }
}

// ==========================================
// BẮT SỰ KIỆN CHO BỘ LỌC (Lưu ý: Dán đoạn này vào cuối file)
// ==========================================


// ==========================================
// HÀM VẼ BẢNG DỮ LIỆU (Chỉ vẽ những gì nhận được)
// ==========================================
function renderTable(reservations) {
    const tableBody = document.querySelector("#reservationTableBody");
    tableBody.innerHTML = ''; // Xóa sạch

    if (!reservations || reservations.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">Không có đơn đặt bàn nào.</td></tr>';
        return;
    }

    reservations.forEach(res => {
        // Cấu hình trạng thái
        const statusConfig = {
            'PENDING':   { text: 'Chờ xác nhận', class: 'bg-warning text-dark' },
            'CONFIRMED': { text: 'Đã xác nhận', class: 'bg-primary' },
            'COMPLETED': { text: 'Đã hoàn thành', class: 'bg-success' },
            'CANCELLED': { text: 'Đã hủy',       class: 'bg-danger' }
        };
        const currentStatus = statusConfig[res.status] || { text: 'Không rõ', class: 'bg-secondary' };

        // Nút thao tác
        // Nút thao tác
        let activityBtn = '';
        if (res.status === "PENDING") {
            // Đơn mới: Cần Xác nhận hoặc Hủy
            activityBtn = `
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-success me-1" title="Xác nhận đơn" onclick="confirmReservation(${res.id})"><i class="fas fa-check"></i></button>
                    <button class="btn btn-sm btn-outline-danger me-1" title="Từ chối đơn" onclick="cancelReservation(${res.id})"><i class="fas fa-times"></i></button>
                    <button class="btn btn-sm btn-outline-secondary" title="Xem chi tiết" onclick="viewReservation(${res.id})"><i class="fas fa-eye"></i></button>
                </td>`;
        } else if (res.status === "CONFIRMED") {
            // Đơn đã duyệt: Đợi khách đến (Hoàn thành) hoặc Khách báo hủy (Hủy)
            activityBtn = `
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-info me-1" title="Khách đã đến (Hoàn thành)" onclick="completeReservation(${res.id})"><i class="fas fa-sign-in-alt"></i></button>
                    <button class="btn btn-sm btn-outline-danger me-1" title="Khách báo hủy / Vắng mặt" onclick="cancelReservation(${res.id})"><i class="fas fa-times"></i></button>
                    <button class="btn btn-sm btn-outline-secondary" title="Xem chi tiết" onclick="viewReservation(${res.id})"><i class="fas fa-eye"></i></button>
                </td>`;
        } else {
            // Đã Hoàn thành hoặc Đã Hủy: Chỉ cho xem chi tiết
            activityBtn = `
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-secondary" title="Xem chi tiết" onclick="viewReservation(${res.id})"><i class="fas fa-eye"></i></button>
                </td>`;
        }

        const cardHtml = `
            <tr>
                <td class="fw-bold text-muted">#RES${res.id}</td>
                <td>
                    <div class="fw-bold text-dark">${res.contactName || 'Khách'}</div>
                    <small class="text-muted">${res.contactPhone || 'N/A'}</small>
                </td>
                <td>
                    <div class="fw-bold text-primary">${res.restaurant?.name || 'Đang tải...'}</div>
                    <small class="text-muted text-truncate" style="max-width: 150px; display: inline-block;">
                        ${res.restaurant?.address || ''}
                    </small>
                </td>
                <td>
                    <div class="fw-bold text-dark">${res.bookingTime}</div>
                    <small class="text-muted">${res.bookingDate}</small>
                </td>
                <td><i class="fas fa-users me-2 text-muted"></i>${res.partySize} khách</td>
                <td><span class="badge ${currentStatus.class}">${currentStatus.text}</span></td>
                ${activityBtn}
            </tr>`;

        tableBody.insertAdjacentHTML('beforeend', cardHtml);
    });
}

// ==========================================
// HÀM VẼ THANH PHÂN TRANG ĐỘNG
// ==========================================
function renderPagination(totalPages, totalElements) {
    const paginationContainer = document.querySelector(".pagination");
    const infoText = document.querySelector(".d-flex.justify-content-between span.text-muted");

    // Nếu không có dữ liệu
    if (totalElements === 0) {
        infoText.textContent = "Không có dữ liệu";
        paginationContainer.innerHTML = '';
        return;
    }

    // Hiển thị text: Đang xem 1-6 trên tổng 100
    const startCount = (currentPage * pageSize) + 1;
    const endCount = Math.min((currentPage + 1) * pageSize, totalElements);
    infoText.textContent = `Đang hiển thị ${startCount}-${endCount} trên tổng số ${totalElements} đơn`;

    paginationContainer.innerHTML = '';

    if (totalPages <= 1) return; // Chỉ có 1 trang thì ẩn luôn thanh chuyển

    // Nút Trước (Trang 0 thì disable)
    const prevDisabled = currentPage === 0 ? 'disabled' : '';
    paginationContainer.innerHTML += `
        <li class="page-item ${prevDisabled}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1}, event)">Trước</a>
        </li>`;

    // Vẽ các số trang (Lưu ý UI hiện 1,2,3 nhưng data truyền đi là 0,1,2)
    for (let i = 0; i < totalPages; i++) {
        const displayPageNum = i + 1; // Số hiển thị cho người dùng xem

        if (i === currentPage) {
            paginationContainer.innerHTML += `
                <li class="page-item active">
                    <a class="page-link" href="#" style="background-color: var(--primary-color); border-color: var(--primary-color);" onclick="event.preventDefault()">${displayPageNum}</a>
                </li>`;
        } else {
            // Rút gọn trang nếu quá nhiều (chỉ hiển thị 5 trang gần nhất) - Nâng cao
            // Tạm thời hiển thị tất cả
            paginationContainer.innerHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" style="color: var(--text-dark);" onclick="changePage(${i}, event)">${displayPageNum}</a>
                </li>`;
        }
    }

    // Nút Sau
    const nextDisabled = currentPage === totalPages - 1 ? 'disabled' : '';
    paginationContainer.innerHTML += `
        <li class="page-item ${nextDisabled}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1}, event)">Sau</a>
        </li>`;
}

// Hàm Bắt sự kiện bấm nút chuyển trang
function changePage(newPage, event) {
    event.preventDefault();
    loadReservations(newPage); // Gọi lại API lấy dữ liệu của trang mới
}

// Hàm đổi trạng thái (Ví dụ dùng chung cho cả Confirm và Cancel)
async function updateStatus(id, newStatus) {
    if(!confirm(`Xác nhận chuyển trạng thái thành: ${newStatus}?`)) return;

    try {
        // GỌI API PUT Ở ĐÂY
        const response = await fetch("api/");

        // Gọi xong thì load lại đúng trang hiện tại để thấy cập nhật
         loadReservations(currentPage);
    } catch (e) {
        alert("Lỗi kết nối");
    }
}


async function confirmReservation(id) {
    if(!confirm(`Xác nhận lịch đặt bàn !`)) return;

    try {
        // GỌI API PUT Ở ĐÂY
        const response = await fetch(`api/reservations/confirmation/${id}`,{
            method: "PUT",
        });
        if (response.ok) {

            loadReservations(currentPage,true);
        } else {
            alert("Lỗi hủy đặt bàn");
        }

        // Gọi xong thì load lại đúng trang hiện tại để thấy cập nhật

    } catch (e) {
        alert("Lỗi kết nối");
    }
}

async function cancelReservation(id) {
    if(!confirm(`Xác nhận hủy đặt bàn !`)) return;

    try {
        // GỌI API PUT Ở ĐÂY
        const response = await fetch(`api/reservations/cancellation/${id}`,{
            method: "PUT",
        });
        if (response.ok) {

            loadReservations(currentPage,true);
        } else {
            alert("Lỗi hủy đặt bàn");
        }

        // Gọi xong thì load lại đúng trang hiện tại để thấy cập nhật

    } catch (e) {
        alert("Lỗi kết nối");
    }
}

async function completeReservation(id) {
    if(!confirm(`Xác nhận khách đã đến nhà hàng (Hoàn thành đơn)?`)) return;

    try {
        // GỌI API PUT Ở ĐÂY (Sửa lại link API cho khớp với Backend của bạn nhé)
        const response = await fetch(`/api/reservations/completion/${id}`, {
            method: "PUT",
        });

        if (response.ok) {
            loadReservations(currentPage, true); // Load ngầm, giữ nguyên trang
        } else {
            alert("Lỗi cập nhật trạng thái hoàn thành");
        }
    } catch (e) {
        alert("Lỗi kết nối");
    }
}

// ==========================================
// TÍNH NĂNG 1: XEM CHI TIẾT
// ==========================================
async function viewReservation(id) {
    try {
        // Gọi API lấy chi tiết 1 đơn
        const response = await fetch(`/api/reservations/${id}`);
        if (response.ok) {
            const res = await response.json();

            // Đổ dữ liệu lên UI Modal
            document.getElementById('detailId').textContent = `#${res.id}`;
            document.getElementById('detailCustomerName').textContent = res.contactName || 'N/A';
            document.getElementById('detailCustomerPhone').textContent = res.contactPhone || 'N/A';
            document.getElementById('detailRestaurantName').textContent = res.restaurant?.name || 'Lỗi tên nhà hàng';
            document.getElementById('detailRestaurantAddress').textContent = res.restaurant?.address || 'N/A';
            document.getElementById('detailDate').textContent = res.bookingDate;
            document.getElementById('detailTime').textContent = res.bookingTime;
            document.getElementById('detailPartySize').textContent = `${res.partySize} khách`;

            // Màu sắc trạng thái
            const statusConfig = {
                'PENDING':   { text: 'Chờ xác nhận', class: 'bg-warning text-dark' },
                'CONFIRMED': { text: 'Đã xác nhận', class: 'bg-primary' },
                'COMPLETED': { text: 'Đã hoàn thành', class: 'bg-success' },
                'CANCELLED': { text: 'Đã hủy',       class: 'bg-danger' }
            };
            const st = statusConfig[res.status] || { text: 'Không rõ', class: 'bg-secondary' };
            const statusBadge = document.getElementById('detailStatus');
            statusBadge.className = `badge fs-6 px-3 py-2 ${st.class}`;
            statusBadge.textContent = st.text;

            // Mở Modal
            const viewModal = new bootstrap.Modal(document.getElementById('viewReservationModal'));
            viewModal.show();
        } else {
            alert("Lỗi không lấy được dữ liệu chi tiết!");
        }
    } catch (e) {
        console.error(e);
        alert("Lỗi kết nối mạng!");
    }
}

// ==========================================
// TÍNH NĂNG 2: TẠO ĐƠN MỚI
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // ... (Code cũ của bạn giữ nguyên ở đây) ...
    // 1. Load dữ liệu lần đầu tiên khi mở trang
    loadReservations(0);
    loadRestaurantDropdown();

    // 2. Bắt sự kiện khi bấm nút "Lọc dữ liệu"
    const filterBtn = document.querySelector('.filter-card .btn-dark');
    if (filterBtn) {
        filterBtn.addEventListener('click', function() {
            // Khi lọc dữ liệu mới, luôn quay về trang đầu tiên
            loadReservations(0);
        });
    }

    // 3. Bắt sự kiện ấn phím Enter ở ô tìm kiếm (UX xịn)
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loadReservations(0);
            }
        });
    }

    // Bắt sự kiện click nút "Tạo đơn đặt bàn mới" ở góc trên
    const btnAddNew = document.querySelector('.page-header .btn-primary');
    if (btnAddNew) {
        btnAddNew.addEventListener('click', () => {
            document.getElementById('addReservationForm').reset(); // Xóa trắng form cũ
            const addModal = new bootstrap.Modal(document.getElementById('addReservationModal'));
            addModal.show();
        });
    }

    // Bắt sự kiện khi bấm nút "Tạo đơn" trong Modal
    const btnSubmit = document.getElementById('btnSubmitNewReservation');
    if (btnSubmit) {
        btnSubmit.addEventListener('click', async function() {
            // Lấy dữ liệu từ form
            const newRes = {
                contactName: document.getElementById('newContactName').value.trim(),
                contactPhone: document.getElementById('newContactPhone').value.trim(),
                bookingDate: document.getElementById('newDate').value,
                bookingTime: document.getElementById('newTime').value + ":00",
                partySize: parseInt(document.getElementById('newPartySize').value),
                status: 'CONFIRMED',
                restaurant: {
                    id: document.getElementById('newRestaurantId').value
                },
                // BỔ SUNG DÒNG NÀY: Truyền ID của Admin đang đăng nhập vào
                user: {
                    id: localStorage.getItem('userId')
                }
            };

            // Validate sơ bộ
            if (!newRes.contactName || !newRes.contactPhone || !newRes.bookingDate || !newRes.restaurant.id) {
                alert("Vui lòng nhập đầy đủ thông tin bắt buộc!");
                return;
            }

            // Gọi API POST
            this.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang xử lý...';
            this.disabled = true;

            try {
                const response = await fetch('/api/reservations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newRes)
                });

                if (response.ok || response.status === 201) {
                    alert("Đã tạo đơn đặt bàn thành công!");
                    // Đóng modal
                    bootstrap.Modal.getInstance(document.getElementById('addReservationModal')).hide();
                    // Load lại bảng ở trang 0 để thấy đơn mới nhất
                    loadReservations(0);
                } else {
                    const err = await response.json();
                    alert("Vui lòng nhập đầy đủ thông tin bắt buộc!");
                    console.error(err);
                }
            } catch (e) {
                alert("Lỗi kết nối mạng!");
            } finally {
                this.innerHTML = 'Tạo đơn';
                this.disabled = false;
            }
        });
    }
});

// Khai báo biến toàn cục để lưu bộ chọn
let restaurantSelect;

// ==========================================
// HÀM LẤY DANH SÁCH NHÀ HÀNG (Dùng Choices.js)
// ==========================================
async function loadRestaurantDropdown() {
    const selectEl = document.getElementById('newRestaurantId');

    // 1. Khởi tạo giao diện ô tìm kiếm thông minh
    restaurantSelect = new Choices(selectEl, {
        searchEnabled: true,          // Bật tính năng gõ để tìm kiếm
        searchPlaceholderValue: "Gõ tên hoặc địa chỉ nhà hàng...", // Chữ mờ khi tìm kiếm
        itemSelectText: "Ấn để chọn", // Chữ hiện ra khi di chuột vào mục
        noResultsText: "Không tìm thấy nhà hàng nào",
        shouldSort: false             // Tắt tự động sắp xếp (giữ nguyên thứ tự từ API)
    });

    try {
        // 2. Gọi API lấy dữ liệu
        const response = await fetch('/api/restaurants');
        if (response.ok) {
            const restaurants = await response.json();

            // 3. Chuyển đổi dữ liệu từ API thành định dạng mà Choices.js hiểu
            const choicesData = restaurants.map(rest => ({
                value: rest.id,
                label: `${rest.name} - ${rest.address}`
            }));

            // 4. Nhét dữ liệu vào ô chọn
            restaurantSelect.setChoices(choicesData, 'value', 'label', true);
        } else {
            restaurantSelect.setChoices([{value: '', label: 'Lỗi tải danh sách', disabled: true}], 'value', 'label', true);
        }
    } catch (e) {
        restaurantSelect.setChoices([{value: '', label: 'Lỗi kết nối mạng', disabled: true}], 'value', 'label', true);
    }
}
