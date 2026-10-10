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

/*
 * Escape dynamic text before inserting it into HTML.
 */
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

/*
 * Get products from the shared HarvestHub data module.
 */
function getProducts() {
    return window.HarvestHub.getProducts();
}

/*
 * Resolve an image filename or path.
 *
 * Examples:
 * eggs.jfif                  -> assets/images/eggs.jfif
 * assets/images/eggs.jfif    -> assets/images/eggs.jfif
 * ../assets/images/eggs.jfif -> ../assets/images/eggs.jfif
 *
 * Full URLs and data URLs are preserved.
 */
function getImagePath(image) {
    const value = String(image || "").trim();

    if (!value) {
        return "";
    }

    if (
        /^(https?:\/\/|data:image\/|blob:|\/|\.\/|\.\.\/)/i.test(value)
    ) {
        return value;
    }

    if (value.startsWith("assets/")) {
        return value;
    }

    return "assets/images/" + value;
}

/*
 * Filter and sort the available products.
 */
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
            return String(a.name || "").localeCompare(
                String(b.name || "")
            );
        });
    } else {
        products.sort(function (a, b) {
            return Number(Boolean(b.featured)) -
                Number(Boolean(a.featured));
        });
    }

    return products;
}

/*
 * Render a consistent image area.
 *
 * Real images are loaded from assets/images/.
 * If an image cannot be loaded, a neutral placeholder appears.
 * No hardcoded product emojis are used as image replacements.
 */
function renderProductImage(product, name, imagePath) {
    if (!imagePath) {
        return `
            <div class="product-image-fallback"
                 role="img"
                 aria-label="${name} image unavailable">
                <span>Image unavailable</span>
            </div>
        `;
    }

    return `
        <img
            class="product-image"
            src="${escapeHTML(imagePath)}"
            alt="${name}"
            loading="lazy"
            data-product-image
        >
    `;
}

/*
 * Render an individual product card.
 */
function renderProduct(product) {
    const id = escapeHTML(product.id);
    const name = escapeHTML(product.name || "Unnamed Product");
    const category = escapeHTML(product.category || "Agricultural Product");
    const farmer = escapeHTML(
        product.farmerBusiness || "Independent Farmer"
    );

    const imagePath = getImagePath(product.image);
    const unit = escapeHTML(product.unit || "item");

    const price = window.HarvestHub.formatUGX(product.price);
    const stock = Math.max(0, Number(product.quantity) || 0);

    const badge = product.featured
        ? '<span class="product-badge">Farm Favourite</span>'
        : "";

    const productURL =
        "product-details.html?id=" +
        encodeURIComponent(String(product.id));

    const imageMarkup = renderProductImage(
        product,
        name,
        imagePath
    );

    return `
        <article class="product-card">

            <a
                class="product-image-link"
                href="${productURL}"
                aria-label="View ${name} details">

                <div class="product-image-wrap">
                    ${imageMarkup}
                    ${badge}
                </div>

            </a>

            <div class="product-card-body">

                <span class="product-category">
                    ${category}
                </span>

                <h3 class="product-name">
                    <a href="${productURL}">
                        ${name}
                    </a>
                </h3>

                <div class="product-farmer">
                    <span class="product-farmer-icon" aria-hidden="true">
                        🌱
                    </span>

                    <span>
                        Sold by
                        <a href="${productURL}">
                            ${farmer}
                        </a>
                    </span>
                </div>

                <div class="product-card-divider"></div>

                <div class="product-price">
                    ${price}
                    <span class="product-unit">
                        per ${unit}
                    </span>
                </div>

                <div class="product-stock">
                    ${stock} ${unit}${stock === 1 ? "" : "s"} available
                </div>

                <button
                    class="add-cart-button"
                    type="button"
                    data-add-cart="${id}"
                    aria-label="Add ${name} to cart"
                    ${stock < 1 ? "disabled" : ""}>

                    <span aria-hidden="true">🛒</span>
                    <span>Add to Cart</span>

                </button>

            </div>

        </article>
    `;
}

/*
 * Handle failed image requests without replacing the image
 * with an emoji.
 */
function attachImageFallbacks() {
    grid.querySelectorAll("img[data-product-image]").forEach(function (img) {
        img.addEventListener("error", function () {
            const fallback = document.createElement("div");

            fallback.className = "product-image-fallback";
            fallback.setAttribute("role", "img");
            fallback.setAttribute(
                "aria-label",
                img.alt + " image unavailable"
            );

            const message = document.createElement("span");
            message.textContent = "Image unavailable";

            fallback.appendChild(message);

            img.replaceWith(fallback);
        }, { once: true });
    });
}

/*
 * Update the product grid and filter information.
 */
function renderProducts() {
    const products = getVisibleProducts();

    grid.innerHTML = products.map(renderProduct).join("");

    productCount.textContent =
        products.length +
        (products.length === 1 ? " product" : " products");

    emptyResults.hidden = products.length !== 0;
    grid.hidden = products.length === 0;

    if (searchTerm && selectedCategory !== "All") {
        activeFilter.textContent =
            'Searching "' + searchTerm + '" in ' + selectedCategory;
    } else if (searchTerm) {
        activeFilter.textContent =
            'Search results for "' + searchTerm + '"';
    } else if (selectedCategory !== "All") {
        activeFilter.textContent = "Showing " + selectedCategory;
    } else {
        activeFilter.textContent = "Showing all available products";
    }

    attachImageFallbacks();
}

/*
 * Display a confirmation message after cart actions.
 */
function showToast(message) {
    clearTimeout(toastTimer);

    toast.textContent = message;
    toast.classList.add("show");

    toastTimer = setTimeout(function () {
        toast.classList.remove("show");
    }, 2600);
}

/*
 * Select a category and update the active category button.
 */
function selectCategory(category) {
    selectedCategory = category;

    document.querySelectorAll(".category-card").forEach(function (button) {
        const selected = button.dataset.category === category;

        button.classList.toggle("selected", selected);
        button.setAttribute("aria-pressed", String(selected));
    });

    renderProducts();
}

/*
 * Search products as the buyer types.
 */
searchInput.addEventListener("input", function () {
    searchTerm = searchInput.value.trim();
    renderProducts();
});

/*
 * Submit the search and move the buyer to the product section.
 */
searchForm.addEventListener("submit", function (event) {
    event.preventDefault();

    searchTerm = searchInput.value.trim();
    renderProducts();

    document.querySelector(".products-section").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

/*
 * Sort products.
 */
sortSelect.addEventListener("change", renderProducts);

/*
 * Category filtering.
 */
document.querySelectorAll(".category-card").forEach(function (button) {
    button.setAttribute(
        "aria-pressed",
        String(button.dataset.category === "All")
    );

    button.addEventListener("click", function () {
        selectCategory(button.dataset.category);
    });
});

/*
 * Add a product to the cart.
 */
grid.addEventListener("click", function (event) {
    const button = event.target.closest("[data-add-cart]");

    if (!button || button.disabled) {
        return;
    }

    const result = window.HarvestHub.addToCart(
        button.dataset.addCart,
        1
    );

    showToast(result.message);

    if (result.success) {
        button.disabled = true;

        const originalHTML = button.innerHTML;

        button.innerHTML = `
            <span aria-hidden="true">✓</span>
            <span>Added to Cart</span>
        `;

        button.classList.add("cart-added");

        window.setTimeout(function () {
            button.innerHTML = originalHTML;
            button.classList.remove("cart-added");
            button.disabled = false;
        }, 1100);
    }

    window.HarvestHub.updateCartCount();
});

/*
 * Reset the search, category, and sorting filters.
 */
resetButton.addEventListener("click", function () {
    searchInput.value = "";
    searchTerm = "";

    sortSelect.value = "featured";

    selectCategory("All");
});


/*
 * Footer year.
 */
const yearElement = document.getElementById("currentYear");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

/*
 * Refresh product data when another tab changes localStorage.
 */
window.addEventListener("storage", function (event) {
    const app = window.HarvestHub;

    if (
        event.key === app.STORAGE_KEYS.products ||
        event.key === app.STORAGE_KEYS.cart
    ) {
        renderProducts();
        app.updateCartCount();
    }
});

/*
 * Initial page setup.
 */
window.HarvestHub.updateCartCount();
renderProducts();


})();
