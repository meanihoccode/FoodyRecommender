async function loadBreadcrumbName() {
    const userName = document.querySelector("#username");
    userName.innerHTML = localStorage.getItem("userFullName");
}

function renderStars(rating) {
    let stars = "";
    for (let i = 1; i <= 5; i++) {
        if (rating >= i) {
            // Sao đầy
            stars += '<i class="fas fa-star text-warning"></i>';
        } else if (rating >= i - 0.5) {
            // Nửa sao
            stars += '<i class="fas fa-star-half-alt text-warning"></i>';
        } else {
            // Sao rỗng
            stars += '<i class="far fa-star text-warning"></i>';
        }
    }
    return stars;
}

async function loadRestaurantDetail(id) {
    try {
        const response = await fetch(`api/restaurants/${id}`)
        if (response.ok) {
            const restaurant = await response.json();
            const breadcrumbName = document.querySelector("#breadcrumbName");
            breadcrumbName.innerHTML = restaurant.name;
            const restaurantName = document.querySelector("#restaurantName");
            restaurantName.innerHTML = restaurant.name;
            const restaurantAddress = document.querySelector("#restaurantAddress")
            restaurantAddress.innerHTML = restaurant.address;
            const restaurantCategory = document.querySelector("#restaurantCategory");
            restaurantCategory.innerHTML = restaurant.category;
            const restaurantDescription = document.querySelector("#restaurantDescription");
            let text = restaurant.description;

            // BƯỚC 1: "Tẩy rửa" sạch sẽ dữ liệu gốc
            // Xóa toàn bộ dấu enter (\n, \r) hoặc thẻ <br> cũ có sẵn từ DB, biến chúng thành khoảng trắng
            text = text.replace(/(\r\n|\n|\r|<br>)/gm, " ");
            // Xóa các khoảng trắng thừa liên tiếp nhau (ví dụ 3-4 dấu cách liền nhau) thành 1 dấu cách duy nhất
            text = text.replace(/\s+/g, " ");

            // BƯỚC 2: Thêm định dạng chuẩn
            // Dùng thẻ <b> thay vì <strong> để tránh bị dính lỗi CSS display: block từ template
            text = text.replace(/([A-ZÀ-Ỹ][A-ZÀ-Ỹ\s]+:)/g, "<br><br><b>$1</b> ");

            // BƯỚC 3: Xử lý dấu gạch ngang thành dấu chấm (bullet)
            text = text.replace(/\s*-\s/g, "<br>• ");

            // BƯỚC 4: Quét dọn lần cuối
            // Xóa các thẻ <br> hoặc khoảng trắng bị dư ra ở tận cùng đầu câu
            text = text.replace(/^(<br>|\s)+/, "");

            restaurantDescription.innerHTML = text;
            const restaurantPrice = document.querySelector("#restaurantPrice");
            restaurantPrice.innerHTML = restaurant.priceAverage;
            // Tìm đến đoạn render sao trong loadRestaurantDetail:
            const restaurantRating = document.querySelector("#restaurantRating");
            const starHtml = renderStars(restaurant.rating);
            restaurantRating.innerHTML = `${starHtml} (${restaurant.rating}/5)`;

            const restaurantImage = document.querySelector("#restaurantImage");
            restaurantImage.src = restaurant.imageUrl;
        } else {
            throw new Error("Lỗi tải dữ liệu nhà hàng")
        }
    } catch (e) {
        console.error(e);
    }
}

const bookTableBtn = document.getElementById("bookTableBtn");
const bookingForm = document.getElementById("bookingForm");

bookTableBtn.addEventListener('click', () => {
    bookingForm.scrollIntoView({
        behavior: "smooth",
    });
});

const favoriteBtn = document.querySelector("#favoriteBtn");
favoriteBtn.addEventListener('click', addFavouriteRestaurant);
async function addFavouriteRestaurant () {
    try {
        const response = await fetch("/api/user-saved", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user: {
                    id: localStorage.getItem("userId")
                },
                restaurant: {
                    id: getRestaurantIdFromURL()
                } // fix sau
            })
        })
        if (response.ok) {
            alert("Đã thêm nhà hàng vào danh sách yêu thích");
        } else {
            alert("Lỗi: Thêm nhà hàng trùng lặp");
            console.error(response.json());
        }
    } catch (e) {
        console.error(e);
    }
}

bookingForm.addEventListener('submit', async function (event) {
    // 1. Chặn hành vi load lại trang
    event.preventDefault();

    const selectedDate = document.getElementById("bookingDate").value;
    const selectedTime = document.getElementById("bookingTime").value;

    // Lấy ngày và giờ hiện tại
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // So sánh: Nếu khách đặt bàn vào đúng HÔM NAY, thì phải kiểm tra xem giờ chọn đã qua chưa
    if (selectedDate === todayStr) {
        // Format giờ hiện tại thành HH:mm (ví dụ: 14:30)
        const currentHours = String(now.getHours()).padStart(2, '0');
        const currentMinutes = String(now.getMinutes()).padStart(2, '0');
        const currentTimeStr = `${currentHours}:${currentMinutes}`;

        if (selectedTime < currentTimeStr) {
            alert("Giờ đặt bàn không hợp lệ! Vui lòng chọn giờ trong tương lai.");
            return; // Dừng luôn hàm, không cho gửi fetch() xuống server nữa
        }
    }
    // 2. Gom dữ liệu NGAY LÚC BẤM NÚT
    const bookingData = {
        bookingDate: document.getElementById("bookingDate").value,
        bookingTime: document.getElementById("bookingTime").value,
        partySize: parseInt(document.getElementById("partySize").value),
        contactName: document.getElementById("contactName").value,
        contactPhone: document.getElementById("contactPhone").value,
        notes: document.getElementById("notes").value,
        restaurant: {
            id: getRestaurantIdFromURL() // Nhớ sửa cái này thành ID động sau này nhé
        },
        user: {
            id: localStorage.getItem("userId")
        }
    };

    // 3. Gửi dữ liệu đi
    try {
        const response = await fetch("api/reservations", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });

        if (response.ok) {
            const successModal = new bootstrap.Modal(document.getElementById('successModal'));
            successModal.show();
            // Tùy chọn: Xóa trắng form sau khi đặt thành công
            bookingForm.reset();
        } else {
            const errorData = await response.json(); // Nhận cục JSON { "message": "..." } từ Backend

            // Hiển thị đúng dòng thông báo lỗi từ Service
            alert("Lỗi: " + errorData.message);

            console.error("Chi tiết lỗi: ", errorData);
        }
    } catch (e) {
        console.error("Lỗi kết nối:", e);
    }
});

const callBtn = document.querySelector("#callBtn");
const chatBtn = document.querySelector("#chatBtn");

callBtn.addEventListener('click', () => alert("Số điện thoại nhà hàng: 0358764465"));
chatBtn.addEventListener('click', () => window.open("https://www.facebook.com/meani.1212", "_blank"));

// Hiển thị từ ngày hôm nay
const dateInput = document.getElementById("bookingDate");
const today = new Date();

// Lấy năm, tháng, ngày theo đúng múi giờ hiện tại (Local Time)
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0'); // Tháng trong JS bắt đầu từ 0 nên phải +1
const day = String(today.getDate()).padStart(2, '0');

// Ghép lại thành chuẩn YYYY-MM-DD
const todayFormatted = `${year}-${month}-${day}`;
dateInput.min = todayFormatted;

/**
 * Hàm lấy ID nhà hàng từ URL (Ví dụ: ?id=421 -> lấy ra 421)
 */
const getRestaurantIdFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || 1; // Mặc định là 1 nếu không tìm thấy id trên URL
};

/**
 * Hàm tải danh sách nhà hàng gợi ý
 */
async function loadRecommendedRestaurant() {
    const container = document.querySelector("#recommendedContainer");
    const currentId = getRestaurantIdFromURL();

    try {
        const responseIds = await fetch(`api/recommendations/${currentId}`);
        const rawData = await responseIds.json();

        if (rawData && rawData.length > 0) {
            const idList = rawData[0].similarRestaurantIds;
            const idsParam = idList.join(",");
            const responseDetails = await fetch(`api/restaurants/list?ids=${idsParam}`);

            if (responseDetails.ok) {
                const recommendations = await responseDetails.json();
                container.innerHTML = "";

                recommendations.forEach(res => {
                    // Gọi hàm renderStars để lấy chuỗi HTML sao chuẩn (xử lý được 4.5 sao)
                    const starHtml = renderStars(res.rating);

                    // Toàn bộ đoạn HTML cho một thẻ Slide
                    const resHtml = `
                        <div class="swiper-slide">
                            <div class="card h-100 border-0 shadow-sm hover-shadow transition">
                                <a href="/restaurant-detail?id=${res.id}">
                                    <img src="${res.imageUrl || 'https://via.placeholder.com/300x200'}" 
                                         class="card-img-top" 
                                         style="height: 150px; object-fit: cover;" 
                                         alt="${res.name}">
                                </a>
                                
                                <div class="card-body p-3 text-center">
                                    <h6 class="card-title fw-bold text-truncate">
                                        <a href="/restaurant-detail?id=${res.id}" class="text-decoration-none text-dark">
                                            ${res.name}
                                        </a>
                                    </h6>
                                    
                                    <div class="mb-2 small">
                                        ${starHtml} <span class="text-muted">(${res.rating})</span>
                                    </div>
                                    
                                    <p class="card-text small text-muted text-truncate">
                                        <i class="fas fa-map-marker-alt me-1"></i>${res.address || 'Đang cập nhật...'}
                                    </p>
                                    
                                    <a href="/restaurant-detail?id=${res.id}" class="btn btn-outline-danger btn-sm w-100 rounded-pill fw-bold">
                                        Xem chi tiết
                                    </a>
                                </div>
                            </div>
                        </div>
                    `;
                    container.insertAdjacentHTML('beforeend', resHtml);
                });

                // Kích hoạt Swiper sau khi đã đổ hết HTML vào DOM
                initSwiper();
            }
        }
    } catch (e) {
        console.error("Lỗi khi tải slider gợi ý:", e);
    }
}

// Hàm khởi tạo Slider với cấu hình chạy mượt
function initSwiper() {
    new Swiper(".mySwiper", {
        slidesPerView: 1, // Mặc định mobile hiện 1 card
        spaceBetween: 20,
        loop: true, // Chạy vô tận
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
        // --- CHÚ Ý PHẦN NÀY ---
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        // --- CHÚ Ý PHẦN NÀY ---
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
            dynamicBullets: true, // Chấm trang co giãn
        },
        breakpoints: {
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 4 },
        },
    });
}


// 1. Ép trình duyệt không tự động cuộn về vị trí cũ (Tắt Scroll Restoration)
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// 2. Đảm bảo mỗi khi load xong trang là phải ở trên cùng
window.scrollTo(0, 0);

// Hoặc cẩn thận hơn nữa thì bọc trong DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    window.scrollTo(0, 0);
});

document.getElementById('logoutBtn').addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.clear();
    window.location.href = '/login';
});
// Đừng quên gọi hàm để nó chạy khi trang web tải xong nhé!
document.addEventListener('DOMContentLoaded', () => {
    loadRecommendedRestaurant();
    loadRecommendedRestaurant();
    loadBreadcrumbName();
    loadRestaurantDetail(getRestaurantIdFromURL());
});
