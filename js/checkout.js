
/* =========================================
   HARVESTHUB CHECKOUT
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const app = window.HarvestHub;

    const form = document.getElementById("checkoutForm");
    const productsElement = document.getElementById("checkoutProducts");
    const itemCountElement = document.getElementById("summaryItemCount");

    const subtotalElement = document.getElementById("checkoutSubtotal");
    const totalElement = document.getElementById("checkoutTotal");

    const placeOrderButton = document.getElementById("placeOrderButton");
    const checkoutError = document.getElementById("checkoutError");

    const currentYearElement = document.getElementById("currentYear");

    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    // Mobile navigation
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

    if (!app) {
        showCheckoutError(
            "HarvestHub could not load. Please refresh the page."
        );

        placeOrderButton.disabled = true;
        return;
    }

    let cartItems = [];
    let cartSubtotal = 0;

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

    function formatMoney(amount) {
        return app.formatUGX(amount);
    }

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

    function showCheckoutError(message) {
        checkoutError.textContent = message;
        checkoutError.hidden = false;

        checkoutError.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }

    function clearCheckoutError() {
        checkoutError.textContent = "";
        checkoutError.hidden = true;
    }

    function renderProducts() {
        cartItems = getCartItems();

        const totalQuantity = cartItems.reduce(
            (sum, item) => sum + item.quantity,
            0
        );

        cartSubtotal = cartItems.reduce(
            (sum, item) =>
                sum + Number(item.product.price) * item.quantity,
            0
        );

        itemCountElement.textContent =
            `${totalQuantity} ${totalQuantity === 1 ? "item" : "items"} in your order`;

        subtotalElement.textContent = formatMoney(cartSubtotal);
        totalElement.textContent = formatMoney(cartSubtotal);

        if (typeof app.updateCartCount === "function") {
            app.updateCartCount();
        }

        if (cartItems.length === 0) {
            productsElement.innerHTML = `
                <div class="checkout-empty">
                    <p>Your cart is empty.</p>
                    <a href="marketplace.html">Browse farm products</a>
                </div>
            `;

            placeOrderButton.disabled = true;
            return;
        }

        placeOrderButton.disabled = false;

        productsElement.innerHTML = cartItems.map(({ product, quantity }) => {
            const imageMarkup = product.image
                ? `
                    <img
                        src="${escapeHTML(product.image)}"
                        alt="${escapeHTML(product.name)}"
                        onerror="this.style.display='none'; this.nextElementSibling.hidden=false;"
                    >
                    <span class="checkout-product-emoji" hidden>
                        ${escapeHTML(product.emoji || "🌱")}
                    </span>
                `
                : `
                    <span class="checkout-product-emoji">
                        ${escapeHTML(product.emoji || "🌱")}
                    </span>
                `;

            return `
                <article class="checkout-product">

                    <div class="checkout-product-image">
                        ${imageMarkup}
                    </div>

                    <div class="checkout-product-info">

                        <h3>${escapeHTML(product.name)}</h3>

                        <p>
                            ${quantity} × ${formatMoney(product.price)}
                            / ${escapeHTML(product.unit || "unit")}
                        </p>

                        <div class="checkout-product-price">
                            ${formatMoney(Number(product.price) * quantity)}
                        </div>

                    </div>

                </article>
            `;
        }).join("");
    }


    // Field validation
    function setFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const error = document.getElementById(`${fieldId}Error`);

        if (field) {
            field.classList.toggle("invalid", Boolean(message));
            field.setAttribute("aria-invalid", String(Boolean(message)));
        }

        if (error) {
            error.textContent = message || "";
        }
    }

    function validateForm() {
        let valid = true;

        const customerName = document
            .getElementById("customerName").value.trim();

        const customerPhone = document
            .getElementById("customerPhone").value.trim();

        const customerEmail = document
            .getElementById("customerEmail").value.trim();

        const district = document
            .getElementById("district").value.trim();

        const area = document
            .getElementById("area").value.trim();

        const deliveryAddress = document
            .getElementById("deliveryAddress").value.trim();

        const nameIsValid = customerName.length >= 2;

        setFieldError(
            "customerName",
            nameIsValid ? "" : "Please enter your full name."
        );

        if (!nameIsValid) {
            valid = false;
        }

        // Allow international numbers and common formatting characters.
        const phoneDigits = customerPhone.replace(/\D/g, "");
        const phoneIsValid =
            phoneDigits.length >= 9 && phoneDigits.length <= 15;

        setFieldError(
            "customerPhone",
            phoneIsValid ? "" : "Enter a valid phone number."
        );

        if (!phoneIsValid) {
            valid = false;
        }

        const emailIsValid =
            customerEmail === "" ||
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail);

        setFieldError(
            "customerEmail",
            emailIsValid ? "" : "Enter a valid email address."
        );

        if (!emailIsValid) {
            valid = false;
        }

        const districtIsValid = district.length >= 2;

        setFieldError(
            "district",
            districtIsValid ? "" : "Please enter your district or city."
        );

        if (!districtIsValid) {
            valid = false;
        }

        const areaIsValid = area.length >= 2;

        setFieldError(
            "area",
            areaIsValid ? "" : "Please enter your area or neighbourhood."
        );

        if (!areaIsValid) {
            valid = false;
        }

        const addressIsValid = deliveryAddress.length >= 5;

        setFieldError(
            "deliveryAddress",
            addressIsValid
                ? ""
                : "Please provide a more detailed delivery address."
        );

        if (!addressIsValid) {
            valid = false;
        }

        return valid;
    }


    function validateStock() {
        const products = app.getProducts();

        for (const cartItem of cartItems) {
            const currentProduct = products.find(
                (product) =>
                    String(product.id) === String(cartItem.product.id)
            );

            if (!currentProduct) {
                return `${cartItem.product.name} is no longer available.`;
            }

            const available = Math.max(
                0,
                Number(currentProduct.quantity) || 0
            );

            if (cartItem.quantity > available) {
                return (
                    `Only ${available} ${currentProduct.unit} of ` +
                    `${currentProduct.name} are available. ` +
                    "Please update your cart."
                );
            }

            if (available < 1) {
                return `${currentProduct.name} is currently out of stock.`;
            }
        }

        return "";
    }


    function generateOrderId() {
        const timestamp = Date.now().toString(36).toUpperCase();

        const randomPart = Math.random()
            .toString(36)
            .slice(2, 7)
            .toUpperCase();

        return `HH-${timestamp}-${randomPart}`;
    }


    function createOrder() {
        const ordersKey =
            app.STORAGE_KEYS?.orders || "harvestHubOrders";

        const orders = app.readJSON(ordersKey, []);

        if (!Array.isArray(orders)) {
            throw new Error("The saved order list is invalid.");
        }

        const customer = {
            name: document.getElementById("customerName").value.trim(),
            phone: document.getElementById("customerPhone").value.trim(),
            email: document.getElementById("customerEmail").value.trim()
        };

        const delivery = {
            district: document.getElementById("district").value.trim(),
            area: document.getElementById("area").value.trim(),
            address: document.getElementById("deliveryAddress").value.trim(),
            instructions: document
                .getElementById("deliveryInstructions").value.trim()
        };

        const items = cartItems.map(({ product, quantity }) => ({
            productId: product.id,
            productName: product.name,
            category: product.category,
            price: Number(product.price),
            unit: product.unit,
            quantity: quantity,
            subtotal: Number(product.price) * quantity,
            farmerBusiness: product.farmerBusiness,
            farmerName: product.farmerName,
            farmerPhone: product.farmerPhone
        }));

        const order = {
            id: generateOrderId(),
            createdAt: new Date().toISOString(),
            status: "Pending",
            customer: customer,
            delivery: delivery,
            notes: document.getElementById("orderNotes").value.trim(),
            items: items,
            subtotal: cartSubtotal,
            deliveryFee: null,
            total: cartSubtotal,
            paymentStatus: "Not processed",
            demo: true
        };

        orders.push(order);

        if (!app.writeJSON(ordersKey, orders)) {
            throw new Error(
                "Your order could not be saved. Please try again."
            );
        }

        // Clear the cart only after the order has been saved successfully.
        if (!app.saveCart([])) {
            // Keep the saved order, but warn the buyer that the cart remains.
            console.warn(
                "The order was saved, but the cart could not be cleared."
            );
        }

        if (typeof app.updateCartCount === "function") {
            app.updateCartCount();
        }

        // Store the ID so the confirmation page can retrieve this order.
        sessionStorage.setItem("harvestHubLastOrderId", order.id);

        window.location.href = "order-confirmation.html";
    }


    // Remove a field's error as the buyer corrects it.
    [
        "customerName",
        "customerPhone",
        "customerEmail",
        "district",
        "area",
        "deliveryAddress"
    ].forEach((fieldId) => {
        const field = document.getElementById(fieldId);

        field.addEventListener("input", () => {
            setFieldError(fieldId, "");
        });
    });


    form.addEventListener("submit", (event) => {
        event.preventDefault();

        clearCheckoutError();

        if (cartItems.length === 0) {
            showCheckoutError(
                "Your cart is empty. Please add products before checking out."
            );
            return;
        }

        if (!validateForm()) {
            const firstInvalidField = form.querySelector(".invalid");

            if (firstInvalidField) {
                firstInvalidField.focus();
            }

            return;
        }

        // Refresh cart and prices immediately before creating the order.
        renderProducts();

        if (cartItems.length === 0) {
            showCheckoutError(
                "Your cart is empty. Please return to the marketplace."
            );
            return;
        }

        const stockError = validateStock();

        if (stockError) {
            showCheckoutError(
                `${stockError} Return to your cart to make changes.`
            );
            return;
        }

        placeOrderButton.disabled = true;
        placeOrderButton.querySelector("span").textContent = "Placing Order...";

        try {
            createOrder();
        } catch (error) {
            console.error("Checkout error:", error);

            placeOrderButton.disabled = false;
            placeOrderButton.querySelector("span").textContent =
                "Place My Order";

            showCheckoutError(
                error.message ||
                "Something went wrong while saving your order."
            );
        }
    });


    // Refresh if another tab changes the cart.
    window.addEventListener("storage", renderProducts);

    renderProducts();
});

