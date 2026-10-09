(function () {
"use strict";


const detailsContainer = document.getElementById("productDetails");
const sellerSection = document.getElementById("sellerSection");
const sellerCard = document.getElementById("sellerCard");
const relatedSection = document.getElementById("relatedSection");
const relatedContainer = document.getElementById("relatedProducts");
const notFoundSection = document.getElementById("productNotFound");
const breadcrumbProduct = document.getElementById("breadcrumbProduct");
const toast = document.getElementById("toast");

let currentProduct = null;
let toastTimer = null;

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

function getProductFromURL() {
    const parameters = new URLSearchParams(window.location.search);
    const productId = parameters.get("id");

    if (!productId) {
        return null;
    }

    return getProducts().find(function (product) {
        return product.id === productId;
    }) || null;
}

function formatPrice(amount) {
    return window.HarvestHub.formatUGX(amount);
}

function formatPhone(phone) {
    return String(phone || "").trim();
}

function getPhoneLink(phone) {
    const cleanPhone = formatPhone(phone);

    if (!cleanPhone) {
        return "";
    }

    const digits = cleanPhone.replace(/\D/g, "");

    if (!digits) {
        return "";
    }

    return "tel:+" + digits;
}

function getWhatsAppLink(phone, productName) {
    const digits = String(phone || "").replace(/\D/g, "");

    if (!digits) {
        return "";
    }

    const message = "Hello, I found your " + productName +
        " listing on HarvestHub. Is it available?";

    return "https://wa.me/" + digits +
        "?text=" + encodeURIComponent(message);
}

function showToast(message) {
    clearTimeout(toastTimer);

    toast.textContent = message;
    toast.classList.add("show");

    toastTimer = setTimeout(function () {
        toast.classList.remove("show");
    }, 2800);
}

function createImageMarkup(product) {
    const image = String(product.image || "").trim();
    const emoji = escapeHTML(product.emoji || "🌾");
    const name = escapeHTML(product.name);

    if (!image) {
        return `
            <div class="details-image-fallback"
                 role="img"
                 aria-label="${name}">
                ${emoji}
            </div>
        `;
    }

    return `
        <img
            src="${escapeHTML(image)}"
            alt="${name}"
            data-fallback-emoji="${emoji}"
        >
    `;
}

function attachImageFallback() {
    const image = detailsContainer.querySelector(
        ".details-main-image img[data-fallback-emoji]"
    );

    if (!image) {
        return;
    }

    image.addEventListener("error", function () {
        const fallback = document.createElement("div");

        fallback.className = "details-image-fallback";
        fallback.setAttribute("role", "img");
        fallback.setAttribute("aria-label", image.alt);
        fallback.textContent = image.dataset.fallbackEmoji || "🌾";

        image.replaceWith(fallback);
    }, { once: true });
}

function renderProduct(product) {
    const name = escapeHTML(product.name);
    const category = escapeHTML(product.category || "Farm Produce");
    const farmerBusiness = escapeHTML(
        product.farmerBusiness || "Independent Farmer"
    );
    const farmerName = escapeHTML(product.farmerName || "Farmer");
    const description = escapeHTML(
        product.description || "Contact the farmer for more information."
    );
    const unit = escapeHTML(product.unit || "item");
    const quantity = Math.max(0, Number(product.quantity) || 0);
    const price = formatPrice(product.price);

    const phone = formatPhone(product.farmerPhone);
    const phoneLink = getPhoneLink(phone);
    const whatsAppLink = getWhatsAppLink(phone, product.name);

    const isAvailable = quantity > 0;

    const stockMarkup = isAvailable
        ? `
            <div class="details-stock">
                <span class="details-stock-dot"></span>
                ${quantity} ${unit}${quantity === 1 ? "" : "s"} available
            </div>
          `
        : `
            <div class="details-stock out-of-stock">
                <span class="details-stock-dot"></span>
                Currently out of stock
            </div>
          `;

    const contactMarkup = whatsAppLink
        ? `
            <a
                class="details-contact-button"
                href="${escapeHTML(whatsAppLink)}"
                target="_blank"
                rel="noopener noreferrer"
            >
                <span>💬</span>
                Contact Farmer on WhatsApp
            </a>
          `
        : `
            <button
                class="details-contact-button disabled"
                type="button"
                disabled
            >
                Seller contact not available
            </button>
          `;

    detailsContainer.innerHTML = `
        <div class="details-gallery">

            <div class="details-main-image">

                ${createImageMarkup(product)}

                ${
                    product.featured
                        ? '<span class="details-image-badge">Farm Favourite</span>'
                        : ''
                }

            </div>

            <div class="details-gallery-note">
                <span>🌿</span>
                <span>
                    Product information is supplied by the listing's
                    farming business.
                </span>
            </div>

        </div>


        <div class="details-information">

            <div class="details-category">
                ${category}
            </div>

            <h1 class="details-title">${name}</h1>

            <p class="details-description">
                ${description}
            </p>


            <div class="details-price-box">

                <div class="details-price-label">
                    Listed price
                </div>

                <div class="details-price">
                    ${price}
                    <span class="details-price-unit">
                        / ${unit}
                    </span>
                </div>

                ${stockMarkup}

            </div>


            <div class="details-facts">

                <div class="details-fact">
                    <span class="details-fact-icon">🌾</span>

                    <div>
                        <span class="details-fact-label">
                            Product category
                        </span>

                        <span class="details-fact-value">
                            ${category}
                        </span>
                    </div>
                </div>


                <div class="details-fact">
                    <span class="details-fact-icon">📦</span>

                    <div>
                        <span class="details-fact-label">
                            Selling unit
                        </span>

                        <span class="details-fact-value">
                            Per ${unit}
                        </span>
                    </div>
                </div>

            </div>


            <div class="details-farmer">

                <div class="details-farmer-avatar">
                    🌱
                </div>

                <div class="details-farmer-copy">

                    <span class="details-farmer-label">
                        SOLD BY
                    </span>

                    <span class="details-farmer-business">
                        ${farmerBusiness}
                    </span>

                    <span class="details-farmer-name">
                        ${farmerName}
                    </span>

                </div>

                <span class="details-farmer-arrow">↗</span>

            </div>


            <div class="details-purchase">

                <label
                    class="details-purchase-label"
                    for="productQuantity"
                >
                    Choose quantity
                </label>

                <div class="details-purchase-controls">

                    <div class="quantity-selector">

                        <button
                            type="button"
                            class="quantity-button"
                            id="decreaseQuantity"
                            aria-label="Decrease quantity"
                            ${isAvailable ? "" : "disabled"}
                        >
                            −
                        </button>

                        <input
                            type="number"
                            class="quantity-input"
                            id="productQuantity"
                            value="${isAvailable ? 1 : 0}"
                            min="${isAvailable ? 1 : 0}"
                            max="${quantity}"
                            step="1"
                            aria-label="Product quantity"
                            ${isAvailable ? "" : "disabled"}
                        >

                        <button
                            type="button"
                            class="quantity-button"
                            id="increaseQuantity"
                            aria-label="Increase quantity"
                            ${isAvailable ? "" : "disabled"}
                        >
                            +
                        </button>

                    </div>


                    <button
                        type="button"
                        class="details-add-cart"
                        id="detailsAddCart"
                        ${isAvailable ? "" : "disabled"}
                    >
                        <span>🛒</span>
                        ${isAvailable ? "Add to Cart" : "Out of Stock"}
                    </button>

                </div>

                ${contactMarkup}

                ${
                    phoneLink
                        ? `
                            <a
                                class="seller-contact-link"
                                href="${escapeHTML(phoneLink)}"
                                style="margin-top:10px"
                            >
                                📞 Call ${farmerName}
                            </a>
                          `
                        : ''
                }

                <p class="details-trust-note">
                    Browse freely. No buyer account required.
                    Ordering is a demonstration and is not a real payment.
                </p>

            </div>

        </div>
    `;

    breadcrumbProduct.textContent = product.name;

    document.title = product.name + " | HarvestHub";

    attachImageFallback();
    attachQuantityControls(product);
}

function attachQuantityControls(product) {
    const input = document.getElementById("productQuantity");
    const decreaseButton = document.getElementById("decreaseQuantity");
    const increaseButton = document.getElementById("increaseQuantity");
    const addButton = document.getElementById("detailsAddCart");

    if (!input || !decreaseButton || !increaseButton || !addButton) {
        return;
    }

    const maximum = Math.max(0, Number(product.quantity) || 0);

    function getValidQuantity() {
        let quantity = Math.floor(Number(input.value));

        if (!Number.isFinite(quantity)) {
            quantity = 1;
        }

        quantity = Math.max(1, Math.min(maximum, quantity));

        input.value = quantity;

        return quantity;
    }

    decreaseButton.addEventListener("click", function () {
        const current = Math.floor(Number(input.value)) || 1;

        input.value = Math.max(1, current - 1);
    });

    increaseButton.addEventListener("click", function () {
        const current = Math.floor(Number(input.value)) || 1;

        input.value = Math.min(maximum, current + 1);
    });

    input.addEventListener("change", function () {
        getValidQuantity();
    });

    addButton.addEventListener("click", function () {
        const quantity = getValidQuantity();

        const result = window.HarvestHub.addToCart(
            product.id,
            quantity
        );

        showToast(result.message);

        if (result.success) {
            addButton.innerHTML = "<span>✓</span> Added to Cart";

            setTimeout(function () {
                if (document.body.contains(addButton)) {
                    addButton.innerHTML = "<span>🛒</span> Add to Cart";
                }
            }, 1200);
        }
    });
}

function renderSeller(product) {
    const business = escapeHTML(
        product.farmerBusiness || "Independent Farmer"
    );

    const owner = escapeHTML(product.farmerName || "Farmer");

    const phone = formatPhone(product.farmerPhone);
    const phoneLink = getPhoneLink(phone);
    const whatsAppLink = getWhatsAppLink(phone, product.name);

    const phoneMarkup = phoneLink
        ? `
            <span>
                📞
                <a href="${escapeHTML(phoneLink)}">
                    ${escapeHTML(phone)}
                </a>
            </span>
          `
        : `
            <span>📞 Contact information not provided</span>
          `;

    const callButton = phoneLink
        ? `
            <a
                class="button button-primary"
                href="${escapeHTML(phoneLink)}"
            >
                📞 Call Farmer
            </a>
          `
        : "";

    const messageButton = whatsAppLink
        ? `
            <a
                class="seller-contact-link"
                href="${escapeHTML(whatsAppLink)}"
                target="_blank"
                rel="noopener noreferrer"
            >
                💬 Send Message
            </a>
          `
        : "";

    sellerCard.innerHTML = `
        <div class="seller-avatar">🌱</div>

        <div class="seller-information">

            <div class="seller-business-name">
                ${business}
            </div>

            <div class="seller-owner-name">
                Managed by ${owner}
            </div>

            <div class="seller-meta">

                <span>🌾 Agricultural business</span>

                ${phoneMarkup}

            </div>

        </div>

        <div class="seller-actions">

            ${callButton}

            ${messageButton}

        </div>
    `;

    sellerSection.hidden = false;
}

function renderRelatedProducts(product) {
    const related = getProducts()
        .filter(function (item) {
            return item.id !== product.id &&
                Number(item.quantity) > 0;
        })
        .sort(function (a, b) {
            const aSameCategory = a.category === product.category;
            const bSameCategory = b.category === product.category;

            return Number(bSameCategory) - Number(aSameCategory);
        })
        .slice(0, 4);

    if (related.length === 0) {
        relatedSection.hidden = true;
        return;
    }

    relatedContainer.innerHTML = related.map(function (item) {
        const name = escapeHTML(item.name);
        const category = escapeHTML(item.category || "Farm Produce");
        const business = escapeHTML(
            item.farmerBusiness || "Independent Farmer"
        );
        const emoji = escapeHTML(item.emoji || "🌾");
        const image = String(item.image || "").trim();

        const imageMarkup = image
            ? `
                <img
                    src="${escapeHTML(image)}"
                    alt="${name}"
                    loading="lazy"
                    data-fallback-emoji="${emoji}"
                >
              `
            : `
                <span class="related-product-emoji">${emoji}</span>
              `;

        return `
            <article class="related-product">

                <a href="product-details.html?id=${encodeURIComponent(item.id)}">

                    <div class="related-product-image">
                        ${imageMarkup}
                    </div>

                    <div class="related-product-body">

                        <div class="related-product-category">
                            ${category}
                        </div>

                        <h3 class="related-product-name">
                            ${name}
                        </h3>

                        <div class="related-product-price">
                            ${formatPrice(item.price)}
                            / ${escapeHTML(item.unit || "item")}
                        </div>

                        <div class="related-product-seller">
                            🌱 ${business}
                        </div>

                    </div>

                </a>

            </article>
        `;
    }).join("");

    relatedContainer.querySelectorAll(
        "img[data-fallback-emoji]"
    ).forEach(function (image) {
        image.addEventListener("error", function () {
            const fallback = document.createElement("span");

            fallback.className = "related-product-emoji";
            fallback.textContent = image.dataset.fallbackEmoji || "🌾";

            image.replaceWith(fallback);
        }, { once: true });
    });

    relatedSection.hidden = false;
}

function renderNotFound() {
    detailsContainer.hidden = true;
    sellerSection.hidden = true;
    relatedSection.hidden = true;
    notFoundSection.hidden = false;

    breadcrumbProduct.textContent = "Not Found";

    document.title = "Product Not Found | HarvestHub";
}

function initialize() {
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

    window.HarvestHub.updateCartCount();

    currentProduct = getProductFromURL();

    if (!currentProduct) {
        renderNotFound();
        return;
    }

    renderProduct(currentProduct);
    renderSeller(currentProduct);
    renderRelatedProducts(currentProduct);
}

initialize();


})();
