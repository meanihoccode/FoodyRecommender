let restaurants = [];
let filteredRestaurants = [];
let currentCategory = "all";

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

        container.innerHTML += `
        <div class="col">
            <div class="card h-100 shadow-sm">
                <img src="${r.image || 'https://via.placeholder.com/300'}" 
                     class="card-img-top" 
                     style="height:180px; object-fit:cover">

                <div class="card-body">
                    <h5 class="card-title">${r.name}</h5>
                    <p class="text-muted small">${r.category || ''}</p>
                    <p class="fw-bold text-danger">
                        ${r.price || ''} VNĐ
                    </p>
                </div>

                <div class="card-footer bg-white border-0">
                    <button class="btn btn-outline-danger w-100">
                        Xem chi tiết
                    </button>
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