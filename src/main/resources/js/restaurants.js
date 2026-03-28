let restaurants = [];
let filteredRestaurants = [];
let currentCategory = "all";

// HÀM VẼ SAO (Dùng chung)
function renderStars(rating) {
    let stars = "";
    for (let i = 1; i <= 5; i++) {
        if (rating >= i) stars += '<i class="fas fa-star text-warning"></i>';
        else if (rating >= i - 0.5) stars += '<i class="fas fa-star-half-alt text-warning"></i>';
        else stars += '<i class="far fa-star text-warning"></i>';
    }
    return stars;
}

// Load dữ liệu
async function loadRestaurants() {
    try {
        document.getElementById("loadingSpinner").style.display = "block";

        const response = await fetch("/api/restaurants");

        if (!response.ok) {
            throw new Error("Không thể tải dữ liệu");
        }

        restaurants = await response.json();
        filteredRestaurants = [...restaurants];

        renderRestaurants(filteredRestaurants);

    } catch (error) {
        console.error(error);
    } finally {
        document.getElementById("loadingSpinner").style.display = "none";
    }
}

function renderRestaurants(list) {

    const container = document.getElementById("restaurantsContainer");
    const noResults = document.getElementById("noResults");

    container.innerHTML = "";

    if (list.length === 0) {
        noResults.style.display = "block";
        return;
    }

    noResults.style.display = "none";

    list.forEach(r => {
        const starHtml = renderStars(r.rating || 0);
        container.innerHTML += `
                    <div class="col">
                        <div class="card h-100 border-0 shadow-sm hover-shadow transition">
                            <div class="position-relative">
                                <a href="/restaurant-detail.html?id=${r.id}">
                                    <img src="${r.imageUrl}" class="card-img-top rounded-top" style="height: 180px; object-fit: cover;" alt="${r.name}">
                                </a>
                            </div>
                            <div class="card-body p-3">
                                <span class="badge bg-danger bg-opacity-10 text-danger mb-2" style="font-size: 0.7rem;">${r.category}</span>
                                <h6 class="card-title fw-bold mb-1 text-truncate">
                                    <a href="/restaurant-detail.html?id=${r.id}" class="text-decoration-none text-dark">${r.name}</a>
                                </h6>
                                <div class="mb-2 small">${starHtml} <span class="text-muted">(${r.rating || 0})</span></div>
                                <p class="card-text small text-muted text-truncate mb-2"><i class="fas fa-map-marker-alt me-1"></i>${r.address}</p>
                                <p class="card-text small fw-bold text-danger mb-3"><i class="fas fa-tag me-1"></i>${r.priceAverage}</p>
                                <a href="/restaurant-detail.html?id=${r.id}" class="btn btn-outline-danger btn-sm w-100 rounded-pill fw-bold">Xem chi tiết</a>
                            </div>
                        </div>
                    </div>
                `;
    });
}

function applyFilters() {

    const keyword = document.getElementById("searchInput").value.toLowerCase();

    filteredRestaurants = restaurants.filter(r => {

        const matchName = r.name.toLowerCase().includes(keyword);

        const matchCategory =
            currentCategory === "all" ||
            r.category === currentCategory;

        return matchName && matchCategory;
    });

    applySort();
}

function applySort() {

    const sortType = document.getElementById("sortBy").value;

    if (sortType === "name") {

        filteredRestaurants.sort((a, b) =>
            a.name.localeCompare(b.name)
        );

    } else if (sortType === "price-asc") {

        filteredRestaurants.sort((a, b) =>
            (a.price || 0) - (b.price || 0)
        );

    } else if (sortType === "price-desc") {

        filteredRestaurants.sort((a, b) =>
            (b.price || 0) - (a.price || 0)
        );
    }

    renderRestaurants(filteredRestaurants);
}

// Search button
document.getElementById("searchBtn").addEventListener("click", () => {
    applyFilters();
});

// Enter search
document.getElementById("searchInput").addEventListener("keyup", e => {
    if (e.key === "Enter") {
        applyFilters();
    }
});

// Sort
document.getElementById("sortBy").addEventListener("change", () => {
    applySort();
});

// Category filter
document.querySelectorAll(".category-badge").forEach(badge => {

    badge.addEventListener("click", () => {

        document
            .querySelectorAll(".category-badge")
            .forEach(b => b.classList.remove("active"));

        badge.classList.add("active");

        currentCategory = badge.dataset.category;

        applyFilters();
    });
});


document.getElementById('logoutBtn').addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.clear();
    window.location.href = '/login';
});

// Load khi mở trang
loadRestaurants();