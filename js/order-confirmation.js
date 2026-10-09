
/* =========================================
   HARVESTHUB ORDER CONFIRMATION
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const app = window.HarvestHub;

    const content = document.getElementById("confirmationContent");
    const errorPanel = document.getElementById("confirmationError");

    const referenceElement = document.getElementById("orderReference");
    const copyButton = document.getElementById("copyOrderReference");

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

    if (app && typeof app.updateCartCount === "function") {
        app.updateCartCount();
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

    function formatMoney(amount) {
        if (app && typeof app.formatUGX === "function") {
            return app.formatUGX(amount);
        }

        return "UGX " + Number(amount || 0).toLocaleString("en-UG");
    }

    function showError() {
        content.hidden = true;
        errorPanel.hidden = false;
        referenceElement.textContent = "Unavailable";
        copyButton.hidden = true;
    }

    function getOrder() {
        if (!app) {
            return null;
        }

        const orderId = sessionStorage.getItem("harvestHubLastOrderId");

        if (!orderId) {
            return null;
        }

        const ordersKey =
            app.STORAGE_KEYS?.orders || "harvestHubOrders";

        const orders = app.readJSON(ordersKey, []);

        if (!Array.isArray(orders)) {
            return null;
        }

        return orders.find((order) => order.id === orderId) || null;
    }

    function formatOrderDate(dateValue) {
        if (!dateValue) {
            return "Date unavailable";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "Date unavailable";
        }

        return new Intl.DateTimeFormat("en-UG", {
            dateStyle: "medium",
            timeStyle: "short"
        }).format(date);
    }

    function renderProducts(order) {
        const productsElement = document.getElementById("confirmedProducts");

        const items = Array.isArray(order.items) ? order.items : [];

        productsElement.innerHTML = items.map((item) => {
            const image = app.getProducts().find(
                (product) => product.id === item.productId
            )?.image || "";

            const emoji = app.getProducts().find(
                (product) => product.id === item.productId
            )?.emoji || "🌱";

            const imageMarkup = image
                ? `
                    <img
                        src="${escapeHTML(image)}"
                        alt="${escapeHTML(item.productName)}"
                        onerror="this.style.display='none'; this.nextElementSibling.hidden=false;"
                    >
                    <span class="confirmed-product-emoji" hidden>
                        ${escapeHTML(emoji)}
                    </span>
                `
                : `
                    <span class="confirmed-product-emoji">
                        ${escapeHTML(emoji)}
                    </span>
                `;

            return `
                <article class="confirmed-product">

                    <div class="confirmed-product-image">
                        ${imageMarkup}
                    </div>

                    <div class="confirmed-product-info">
                        <h3>${escapeHTML(item.productName)}</h3>

                        <p>
                            ${Number(item.quantity) || 0}
                            × ${formatMoney(item.price)}
                            / ${escapeHTML(item.unit || "unit")}
                        </p>

                        <div class="confirmed-product-farmer">
                            ${escapeHTML(item.farmerBusiness || "Local farmer")}
                        </div>
                    </div>

                    <strong class="confirmed-product-price">
                        ${formatMoney(item.subtotal)}
                    </strong>

                </article>
            `;
        }).join("");

        document.getElementById("confirmedSubtotal").textContent =
            formatMoney(order.subtotal);

        document.getElementById("confirmedTotal").textContent =
            formatMoney(order.total);
    }

    function renderCustomerDetails(order) {
        const customer = order.customer || {};
        const delivery = order.delivery || {};

        document.getElementById("confirmedCustomer").textContent =
            customer.name || "Not provided";

        document.getElementById("confirmedPhone").textContent =
            customer.phone || "Not provided";

        document.getElementById("confirmedDistrict").textContent =
            delivery.district || "Not provided";

        document.getElementById("confirmedArea").textContent =
            delivery.area || "Not provided";

        document.getElementById("confirmedAddress").textContent =
            delivery.address || "Not provided";

        const instructionsContainer =
            document.getElementById("instructionsContainer");

        if (delivery.instructions) {
            document.getElementById("confirmedInstructions").textContent =
                delivery.instructions;

            instructionsContainer.hidden = false;
        } else {
            instructionsContainer.hidden = true;
        }

        const notesContainer = document.getElementById("notesContainer");

        if (order.notes) {
            document.getElementById("confirmedNotes").textContent =
                order.notes;

            notesContainer.hidden = false;
        } else {
            notesContainer.hidden = true;
        }
    }

    function normalizePhoneForWhatsApp(phone) {
        // WhatsApp expects an international number without +, spaces or dashes.
        // This handles common Ugandan numbers entered with a leading 0.
        let digits = String(phone || "").replace(/\D/g, "");

        if (digits.startsWith("0")) {
            digits = "256" + digits.slice(1);
        }

        return digits;
    }

    function renderFarmers(order) {
        const farmerContactsElement =
            document.getElementById("farmerContacts");

        const items = Array.isArray(order.items) ? order.items : [];

        const farmers = new Map();

        items.forEach((item) => {
            const farmerName = item.farmerName || "Local farmer";
            const farmerBusiness = item.farmerBusiness || "Farm business";
            const farmerPhone = item.farmerPhone || "";

            const farmerKey = `${farmerBusiness}|${farmerPhone}`;

            if (!farmers.has(farmerKey)) {
                farmers.set(farmerKey, {
                    name: farmerName,
                    business: farmerBusiness,
                    phone: farmerPhone,
                    products: []
                });
            }

            farmers.get(farmerKey).products.push(item.productName);
        });

        farmerContactsElement.innerHTML = Array.from(farmers.values())
            .map((farmer) => {
                const phoneDigits = normalizePhoneForWhatsApp(farmer.phone);

                const message = [
                    `Hello ${farmer.name},`,
                    `I placed an order through HarvestHub.`,
                    `Order reference: ${order.id}.`,
                    `Products: ${farmer.products.join(", ")}.`,
                    `Please confirm availability, delivery arrangements and payment.`
                ].join(" ");

                const whatsappURL = phoneDigits
                    ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`
                    : "";

                const phoneHref = farmer.phone
                    ? `tel:${farmer.phone.replace(/[^\d+]/g, "")}`
                    : "";

                return `
                    <article class="farmer-contact-card">

                        <div class="farmer-contact-heading">
                            <div class="farmer-avatar">🌾</div>

                            <div>
                                <h3>${escapeHTML(farmer.business)}</h3>
                                <p>
                                    Contact: ${escapeHTML(farmer.name)}
                                    <br>
                                    ${escapeHTML(farmer.phone || "Phone not provided")}
                                </p>
                            </div>
                        </div>

                        <div class="farmer-contact-products">
                            <strong>Your products:</strong>
                            ${escapeHTML(farmer.products.join(", "))}
                        </div>

                        <div class="farmer-contact-actions">

                            ${
                                whatsappURL
                                    ? `
                                        <a
                                            href="${whatsappURL}"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            💬 WhatsApp Farmer
                                        </a>
                                    `
                                    : ""
                            }

                            ${
                                phoneHref
                                    ? `
                                        <a href="${phoneHref}">
                                            📞 Call Farmer
                                        </a>
                                    `
                                    : ""
                            }

                        </div>

                    </article>
                `;
            })
            .join("");
    }

    function renderOrder(order) {
        referenceElement.textContent = order.id;

        document.getElementById("orderDate").textContent =
            `Placed on ${formatOrderDate(order.createdAt)}`;

        document.getElementById("orderStatus").textContent =
            order.status || "Pending";

        document.getElementById("confirmationTitle").textContent =
            "Your order has been saved!";

        document.getElementById("confirmationMessage").textContent =
            "Thank you for supporting local farmers. Your order reference " +
            "is ready, and you can contact the farmers below to coordinate.";

        renderProducts(order);
        renderCustomerDetails(order);
        renderFarmers(order);
    }

    copyButton.addEventListener("click", async () => {
        const orderReference = referenceElement.textContent;

        try {
            await navigator.clipboard.writeText(orderReference);

            copyButton.textContent = "Copied!";

            setTimeout(() => {
                copyButton.textContent = "Copy";
            }, 1800);
        } catch (error) {
            // Fallback for browsers where Clipboard API is unavailable.
            window.prompt("Copy your order reference:", orderReference);
        }
    });

    const order = getOrder();

    if (!order) {
        showError();
        return;
    }

    renderOrder(order);
});

