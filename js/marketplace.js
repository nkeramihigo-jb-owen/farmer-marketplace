(function () {
"use strict";


const grid = document.getElementById("productGrid");
const searchInput = document.getElementById("productSearch");
const searchForm = document.getElementById("searchForm");
const sortSelect = document.getElementById("sortProducts");
const productCount = document.getElementById("productCount");
const activeFilter = document.getElementById("activeFilter");
const emptyResults = document.getElementById("emptyResults");
const resetButton = document.getElementById("resetFilters");
const toast = document.getElementById("toast");

let selectedCategory = "All";
let searchTerm = "";
let toastTimer;

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (character) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

function getProducts() {
    return window.HarvestHub.getProducts();
}

function getVisibleProducts() {
    let products = getProducts().filter(function (product) {
        return Number(product.quantity) > 0;
    });

    if (selectedCategory !== "All") {
        products = products.filter(function (product) {
            return product.category === selectedCategory;
        });
    }

    if (searchTerm) {
        const term = searchTerm.toLocaleLowerCase();

        products = products.filter(function (product) {
            const searchable = [
                product.name,
                product.category,
                product.farmerBusiness,
                product.farmerName,
                product.description
            ].join(" ").toLocaleLowerCase();

            return searchable.includes(term);
        });
    }

    const sortMode = sortSelect.value;

    if (sortMode === "price-low") {
        products.sort(function (a, b) {
            return Number(a.price) - Number(b.price);
        });
    } else if (sortMode === "price-high") {
        products.sort(function (a, b) {
            return Number(b.price) - Number(a.price);
        });
    } else if (sortMode === "name") {
        products.sort(function (a, b) {
            return a.name.localeCompare(b.name);
        });
    } else {
        products.sort(function (a, b) {
            return Number(Boolean(b.featured)) -
                Number(Boolean(a.featured));
        });
    }

    return products;
}

function renderProduct(product) {
    const id = escapeHTML(product.id);
    const name = escapeHTML(product.name);
    const category = escapeHTML(product.category);
    const farmer = escapeHTML(product.farmerBusiness || "Independent Farmer");
    const image = escapeHTML(product.image || "");
    const emoji = escapeHTML(product.emoji || "🌾");
    const unit = escapeHTML(product.unit || "item");

    const price = window.HarvestHub.formatUGX(product.price);
    const stock = Math.max(0, Number(product.quantity) || 0);

    const badge = product.featured
        ? '<span class="product-badge">Farm Favourite</span>'
        : "";

    const imageMarkup = image
        ? `
            <img
                class="product-image"
                src="${image}"
                alt="${name}"
                loading="lazy"
                data-fallback-emoji="${emoji}"
            >
          `
        : `
            <div class="product-image-fallback" role="img"
                 aria-label="${name}">
                ${emoji}
            </div>
          `;

    return `
        <article class="product-card">

            <a class="product-image-link"
               href="product-details.html?id=${encodeURIComponent(product.id)}"
               aria-label="View ${name} details">

                <div class="product-image-wrap">
                    ${imageMarkup}
                    ${badge}
                </div>

            </a>

            <div class="product-card-body">

                <span class="product-category">${category}</span>

                <h3 class="product-name">
                    <a href="product-details.html?id=${encodeURIComponent(product.id)}">
                        ${name}
                    </a>
                </h3>

                <div class="product-farmer">
                    <span class="product-farmer-icon">🌱</span>
                    <span>
                        Sold by
                        <a href="product-details.html?id=${encodeURIComponent(product.id)}">
                            ${farmer}
                        </a>
                    </span>
                </div>

                <div class="product-card-divider"></div>

                <div class="product-card-bottom">

                    <div class="product-price">
                        ${price}
                        <span class="product-unit">per ${unit}</span>
                    </div>

                    <button
                        class="add-cart-button"
                        type="button"
                        data-add-cart="${id}"
                        aria-label="Add ${name} to cart"
                        ${stock < 1 ? "disabled" : ""}
                    >
                        +
                    </button>

                </div>

                <div class="product-stock">
                    ${stock} ${unit}${stock === 1 ? "" : "s"} available
                </div>

            </div>

        </article>
    `;
}

function renderProducts() {
    const products = getVisibleProducts();

    grid.innerHTML = products.map(renderProduct).join("");

    productCount.textContent =
        products.length + (products.length === 1 ? " product" : " products");

    emptyResults.hidden = products.length !== 0;
    grid.hidden = products.length === 0;

    if (searchTerm && selectedCategory !== "All") {
        activeFilter.textContent =
            'Searching "' + searchTerm + '" in ' + selectedCategory;
    } else if (searchTerm) {
        activeFilter.textContent =
            'Search results for "' + searchTerm + '"';
    } else if (selectedCategory !== "All") {
        activeFilter.textContent =
            "Showing " + selectedCategory;
    } else {
        activeFilter.textContent = "Showing all available products";
    }

    grid.querySelectorAll("img[data-fallback-emoji]").forEach(function (img) {
        img.addEventListener("error", function () {
            const fallback = document.createElement("div");

            fallback.className = "product-image-fallback";
            fallback.setAttribute("role", "img");
            fallback.setAttribute("aria-label", img.alt);
            fallback.textContent = img.dataset.fallbackEmoji || "🌾";

            img.replaceWith(fallback);
        }, { once: true });
    });
}

function showToast(message) {
    clearTimeout(toastTimer);

    toast.textContent = message;
    toast.classList.add("show");

    toastTimer = setTimeout(function () {
        toast.classList.remove("show");
    }, 2600);
}

function selectCategory(category) {
    selectedCategory = category;

    document.querySelectorAll(".category-card").forEach(function (button) {
        const selected = button.dataset.category === category;

        button.classList.toggle("selected", selected);
        button.setAttribute("aria-pressed", String(selected));
    });

    renderProducts();
}

searchInput.addEventListener("input", function () {
    searchTerm = searchInput.value.trim();
    renderProducts();
});

searchForm.addEventListener("submit", function (event) {
    event.preventDefault();

    searchTerm = searchInput.value.trim();
    renderProducts();

    document.querySelector(".products-section").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

sortSelect.addEventListener("change", renderProducts);

document.querySelectorAll(".category-card").forEach(function (button) {
    button.setAttribute(
        "aria-pressed",
        String(button.dataset.category === "All")
    );

    button.addEventListener("click", function () {
        selectCategory(button.dataset.category);
    });
});

grid.addEventListener("click", function (event) {
    const button = event.target.closest("[data-add-cart]");

    if (!button) {
        return;
    }

    const result = window.HarvestHub.addToCart(
        button.dataset.addCart,
        1
    );

    showToast(result.message);

    if (result.success) {
        const originalText = button.textContent;

        button.textContent = "✓";

        setTimeout(function () {
            button.textContent = originalText;
        }, 900);
    }
});

resetButton.addEventListener("click", function () {
    searchInput.value = "";
    searchTerm = "";

    sortSelect.value = "featured";

    selectCategory("All");
});

const menuButton = document.getElementById("mobileMenuButton");
const navigation = document.querySelector(".main-nav");

menuButton.addEventListener("click", function () {
    const isOpen = navigation.classList.toggle("nav-open");

    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute(
        "aria-label",
        isOpen ? "Close navigation" : "Open navigation"
    );
});

document.getElementById("currentYear").textContent =
    new Date().getFullYear();

window.addEventListener("storage", function (event) {
    if (
        event.key === window.HarvestHub.STORAGE_KEYS.products ||
        event.key === window.HarvestHub.STORAGE_KEYS.cart
    ) {
        renderProducts();
        window.HarvestHub.updateCartCount();
    }
});

window.HarvestHub.updateCartCount();
renderProducts();


})();
