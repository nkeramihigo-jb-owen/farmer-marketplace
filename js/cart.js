
/* =========================================
   HARVESTHUB SHOPPING CART
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    const app = window.HarvestHub;

    const cartItemsElement = document.getElementById("cartItems");
    const emptyCartElement = document.getElementById("emptyCart");
    const cartItemCountElement = document.getElementById("cartItemCount");

    const subtotalElement = document.getElementById("cartSubtotal");
    const totalElement = document.getElementById("cartTotal");
    const checkoutButton = document.getElementById("checkoutButton");

    const currentYearElement = document.getElementById("currentYear");

    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    // Keep the mobile navigation consistent with the other pages.
    const mobileMenuButton = document.getElementById("mobileMenuButton");
    const mainNav = document.getElementById("mainNav");

    if (mobileMenuButton && mainNav) {
        mobileMenuButton.addEventListener("click", () => {
            const isOpen = mainNav.classList.toggle("nav-open");

            mobileMenuButton.setAttribute(
                "aria-expanded",
                String(isOpen)
            );
        });
    }

    if (!app || typeof app.getProducts !== "function") {
        cartItemsElement.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">⚠️</div>
                <h2>We couldn't load your cart</h2>
                <p>
                    Please check that js/data.js is loaded correctly,
                    then refresh this page.
                </p>
            </div>
        `;

        checkoutButton.disabled = true;
        return;
    }

    /*
     * This page uses the cart stored by data.js.
     * We intentionally do not create a second cart storage system.
     */

   
    function getCartItems() {
        const products = app.getProducts();
        const cart = app.getCart();

        return cart
            .map((entry) => {
                const product = products.find(
                    (item) => String(item.id) === String(entry.productId)
                );

                if (!product) {
                    return null;
                }

                return {
                    product: product,
                    quantity: Math.max(
                        1,
                        Math.floor(Number(entry.quantity) || 1)
                    )
                };
            })
            .filter(Boolean);
    }


    function normalizeCart(cart, products) {
        if (!Array.isArray(cart)) {
            return [];
        }

        return cart
            .map((entry) => {
                // Support carts storing full product objects.
                if (entry && entry.product && entry.product.id) {
                    return {
                        product: entry.product,
                        quantity: Math.max(
                            1,
                            Number(entry.quantity) || 1
                        )
                    };
                }

                // Support carts storing product IDs and quantities.
                const productId = entry?.productId ?? entry?.id;
                const product = products.find(
                    (item) => String(item.id) === String(productId)
                );

                if (!product) {
                    return null;
                }

                return {
                    product,
                    quantity: Math.max(
                        1,
                        Number(entry.quantity) || 1
                    )
                };
            })
            .filter(Boolean);
    }

    function formatMoney(amount) {
        if (typeof app.formatUGX === "function") {
            return app.formatUGX(amount);
        }

        return new Intl.NumberFormat("en-UG", {
            style: "currency",
            currency: "UGX",
            maximumFractionDigits: 0
        }).format(amount);
    }

    function getImageMarkup(product) {
        if (product.image) {
            return `
                <img
                    src="${escapeHTML(product.image)}"
                    alt="${escapeHTML(product.name)}"
                    onerror="this.style.display='none'; this.nextElementSibling.hidden=false;"
                >
                <span class="cart-item-emoji" hidden>
                    ${escapeHTML(product.emoji || "🌱")}
                </span>
            `;
        }

        return `
            <span class="cart-item-emoji">
                ${escapeHTML(product.emoji || "🌱")}
            </span>
        `;
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, (character) => {
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

    function renderCart() {
        const cart = getCartItems();

        const totalQuantity = cart.reduce(
            (sum, item) => sum + item.quantity,
            0
        );

        const subtotal = cart.reduce(
            (sum, item) => sum + Number(item.product.price) * item.quantity,
            0
        );

        cartItemCountElement.textContent =
            `${totalQuantity} ${totalQuantity === 1 ? "item" : "items"} in your cart`;

        subtotalElement.textContent = formatMoney(subtotal);
        totalElement.textContent = formatMoney(subtotal);

        const isEmpty = cart.length === 0;

        emptyCartElement.hidden = !isEmpty;
        cartItemsElement.hidden = isEmpty;
        checkoutButton.disabled = isEmpty;

        if (typeof app.updateCartCount === "function") {
            app.updateCartCount();
        }

        if (isEmpty) {
            cartItemsElement.innerHTML = "";
            return;
        }

        cartItemsElement.innerHTML = cart.map(({ product, quantity }) => {
            const lineTotal = Number(product.price) * quantity;

            return `
                <article class="cart-item" data-product-id="${escapeHTML(product.id)}">

                    <div class="cart-item-image">
                        ${getImageMarkup(product)}
                    </div>

                    <div class="cart-item-content">

                        <div class="cart-item-top">

                            <div>
                                <span class="cart-item-category">
                                    ${escapeHTML(product.category || "Farm product")}
                                </span>

                                <h3 class="cart-item-name">
                                    ${escapeHTML(product.name)}
                                </h3>

                                <p class="cart-item-farmer">
                                    🌾 ${escapeHTML(product.farmerBusiness || "Local farmer")}
                                </p>

                                <p class="cart-item-price">
                                    ${formatMoney(Number(product.price))}
                                    <span>/ ${escapeHTML(product.unit || "unit")}</span>
                                </p>
                            </div>

                            <button
                                type="button"
                                class="remove-item"
                                data-action="remove"
                                data-product-id="${escapeHTML(product.id)}"
                                aria-label="Remove ${escapeHTML(product.name)} from cart"
                                title="Remove product"
                            >
                                ✕
                            </button>

                        </div>

                        <div class="cart-item-bottom">

                            <div
                                class="quantity-control"
                                aria-label="Quantity controls for ${escapeHTML(product.name)}"
                            >

                                <button
                                    type="button"
                                    class="quantity-button"
                                    data-action="decrease"
                                    data-product-id="${escapeHTML(product.id)}"
                                    aria-label="Decrease quantity"
                                >
                                    −
                                </button>

                                <span class="quantity-value">
                                    ${quantity}
                                </span>

                                <button
                                    type="button"
                                    class="quantity-button"
                                    data-action="increase"
                                    data-product-id="${escapeHTML(product.id)}"
                                    aria-label="Increase quantity"
                                >
                                    +
                                </button>

                            </div>

                            <strong class="cart-item-subtotal">
                                ${formatMoney(lineTotal)}
                            </strong>

                        </div>

                    </div>

                </article>
            `;
        }).join("");
    }

    /*
     * Prefer the cart-management functions from data.js.
     * These wrappers intentionally stop rather than silently
     * creating a second, disconnected cart.
     */

    
    function updateQuantity(productId, change) {
        const cart = app.getCart();
        const products = app.getProducts();

        const cartItem = cart.find(
            (item) => String(item.productId) === String(productId)
        );

        const product = products.find(
            (item) => String(item.id) === String(productId)
        );

        if (!cartItem || !product) {
            return;
        }

        const currentQuantity = Number(cartItem.quantity) || 1;
        const newQuantity = currentQuantity + change;
        const availableQuantity = Math.max(
            0,
            Number(product.quantity) || 0
        );

        // Never allow the quantity to drop below one.
        if (newQuantity < 1) {
            return;
        }

        // Prevent buyers from ordering more than the available stock.
        if (newQuantity > availableQuantity) {
            alert(
                `Only ${availableQuantity} ${product.unit} of ` +
                `${product.name} are available.`
            );
            return;
        }

        cartItem.quantity = newQuantity;

        if (app.saveCart(cart)) {
            app.updateCartCount();
            renderCart();
        } else {
            alert("Your cart could not be updated. Please try again.");
        }
    }



    function removeItem(productId) {
        const cart = app.getCart();

        const updatedCart = cart.filter(
            (item) => String(item.productId) !== String(productId)
        );

        if (app.saveCart(updatedCart)) {
            app.updateCartCount();
            renderCart();
        } else {
            alert("The product could not be removed. Please try again.");
        }
    }



    function readRawCart() {
        try {
            return JSON.parse(
                localStorage.getItem("harvestHubCart") || "[]"
            );
        } catch (error) {
            return [];
        }
    }

    function saveRawCart(cart) {
        localStorage.setItem("harvestHubCart", JSON.stringify(cart));

        if (typeof app.updateCartCount === "function") {
            app.updateCartCount();
        }
    }

    cartItemsElement.addEventListener("click", (event) => {
        const button = event.target.closest("[data-action]");

        if (!button) {
            return;
        }

        const productId = button.dataset.productId;
        const action = button.dataset.action;

        if (action === "increase") {
            updateQuantity(productId, 1);
        } else if (action === "decrease") {
            const item = getCartItems().find(
                (entry) => String(entry.product.id) === String(productId)
            );

            if (item && item.quantity > 1) {
                updateQuantity(productId, -1);
            }
        } else if (action === "remove") {
            removeItem(productId);
        }
    });

    checkoutButton.addEventListener("click", () => {
        const cart = getCartItems();

        if (cart.length === 0) {
            return;
        }

        window.location.href = "checkout.html";
    });

    // Keep totals in sync if another page updates the cart in this tab.
    window.addEventListener("storage", renderCart);

    renderCart();
});

