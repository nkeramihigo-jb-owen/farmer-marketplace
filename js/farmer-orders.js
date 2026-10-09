(function () {
"use strict";


const app = window.HarvestHub;

if (!app) {
    window.location.replace("farmer-login.html");
    return;
}

const keys = app.STORAGE_KEYS;
const farmer = app.readJSON(keys.currentFarmer, null);

if (!farmer || !farmer.id) {
    window.location.replace("farmer-login.html");
    return;
}

const ordersList = document.getElementById("farmerOrdersList");
const emptyState = document.getElementById("emptyFarmerOrders");

function normalize(value) {
    return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function getOrders() {
    const orders = app.readJSON(keys.orders, []);
    return Array.isArray(orders) ? orders : [];
}

function belongsToFarmer(item) {
    if (item.farmerId) {
        return item.farmerId === farmer.id;
    }

    return (
        normalize(item.farmerBusiness) === normalize(farmer.businessName) &&
        normalize(item.farmerPhone) === normalize(farmer.phone)
    );
}

function safeText(value, fallback) {
    return value === undefined || value === null || value === ""
        ? (fallback || "Not provided")
        : String(value);
}

function addDetail(parent, labelText, valueText) {
    const row = document.createElement("div");
    row.className = "farmer-order-detail";

    const label = document.createElement("span");
    label.textContent = labelText;

    const value = document.createElement("strong");
    value.textContent = valueText;

    row.append(label, value);
    parent.appendChild(row);
}

function createLink(label, href, className) {
    const link = document.createElement("a");
    link.textContent = label;
    link.href = href;
    link.className = className;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    return link;
}

function getFarmerOrderRecords() {
    const orders = getOrders();
    const records = [];

    orders.forEach(function (order) {
        const items = Array.isArray(order.items) ? order.items : [];

        const farmerItems = items.filter(belongsToFarmer);

        if (farmerItems.length > 0) {
            records.push({
                order: order,
                items: farmerItems
            });
        }
    });

    return records.sort(function (a, b) {
        return new Date(b.order.createdAt || 0) -
            new Date(a.order.createdAt || 0);
    });
}

function renderOrders() {
    const records = getFarmerOrderRecords();

    ordersList.replaceChildren();
    emptyState.hidden = records.length > 0;

    let totalItems = 0;
    let totalValue = 0;

    records.forEach(function (record) {
        record.items.forEach(function (item) {
            const quantity = Number(item.quantity) || 0;
            const price = Number(item.price) || 0;
            const subtotal = Number.isFinite(Number(item.subtotal))
                ? Number(item.subtotal)
                : price * quantity;

            totalItems += quantity;
            totalValue += subtotal;
        });
    });

    document.getElementById("farmerOrderCount").textContent =
        records.length;

    document.getElementById("farmerItemsCount").textContent =
        totalItems.toLocaleString();

    document.getElementById("farmerSalesValue").textContent =
        app.formatUGX(totalValue);

    records.forEach(function (record) {
        const order = record.order;

        const card = document.createElement("article");
        card.className = "farmer-order-card";

        const heading = document.createElement("div");
        heading.className = "farmer-order-heading";

        const titleGroup = document.createElement("div");

        const title = document.createElement("h2");
        title.textContent = "Order " + safeText(order.id, "Reference unavailable");

        const date = document.createElement("p");

        const parsedDate = new Date(order.createdAt || "");

        date.textContent = Number.isNaN(parsedDate.getTime())
            ? "Date unavailable"
            : parsedDate.toLocaleString();

        titleGroup.append(title, date);

        const status = document.createElement("span");
        status.className = "farmer-order-status";
        status.textContent = safeText(order.status, "Pending");

        heading.append(titleGroup, status);

        const customer = order.customer || {};
        const delivery = order.delivery || {};

        const details = document.createElement("div");
        details.className = "farmer-order-customer";

        const customerHeading = document.createElement("h3");
        customerHeading.textContent = "Buyer & Delivery Details";

        details.appendChild(customerHeading);

        addDetail(details, "Buyer", safeText(customer.name));
        addDetail(details, "Phone", safeText(customer.phone));
        addDetail(details, "District", safeText(delivery.district));
        addDetail(details, "Area", safeText(delivery.area));
        addDetail(details, "Address", safeText(delivery.address));

        const itemsHeading = document.createElement("h3");
        itemsHeading.className = "farmer-order-items-heading";
        itemsHeading.textContent = "Your Products in This Order";

        const itemsList = document.createElement("div");
        itemsList.className = "farmer-order-items";

        let orderFarmerTotal = 0;

        record.items.forEach(function (item) {
            const quantity = Number(item.quantity) || 0;
            const price = Number(item.price) || 0;
            const subtotal = Number.isFinite(Number(item.subtotal))
                ? Number(item.subtotal)
                : price * quantity;

            orderFarmerTotal += subtotal;

            const itemRow = document.createElement("div");
            itemRow.className = "farmer-order-item";

            const itemInfo = document.createElement("div");

            const itemName = document.createElement("strong");
            itemName.textContent = safeText(item.productName || item.name);

            const itemMeta = document.createElement("p");
            itemMeta.textContent =
                quantity + " × " + app.formatUGX(price) +
                " / " + safeText(item.unit, "unit");

            itemInfo.append(itemName, itemMeta);

            const itemSubtotal = document.createElement("strong");
            itemSubtotal.className = "farmer-order-item-price";
            itemSubtotal.textContent = app.formatUGX(subtotal);

            itemRow.append(itemInfo, itemSubtotal);
            itemsList.appendChild(itemRow);
        });

        const total = document.createElement("div");
        total.className = "farmer-order-total";

        const totalLabel = document.createElement("span");
        totalLabel.textContent = "Value of your items";

        const totalValueElement = document.createElement("strong");
        totalValueElement.textContent = app.formatUGX(orderFarmerTotal);

        total.append(totalLabel, totalValueElement);

        card.append(
            heading,
            details,
            itemsHeading,
            itemsList,
            total
        );

        const contactActions = document.createElement("div");
        contactActions.className = "farmer-order-contact-actions";

        const phone = String(customer.phone || "").trim();
        const cleanedPhone = phone.replace(/[^\d+]/g, "");

        if (cleanedPhone) {
            contactActions.appendChild(
                createLink("☎ Call Buyer", "tel:" + cleanedPhone, "order-contact-link")
            );

            const whatsappPhone = phone.replace(/\D/g, "");

            if (whatsappPhone) {
                const message = encodeURIComponent(
                    "Hello " + safeText(customer.name, "there") +
                    ", this is " + farmer.businessName +
                    " regarding your HarvestHub order " + safeText(order.id) + "."
                );

                contactActions.appendChild(
                    createLink(
                        "WhatsApp Buyer",
                        "https://wa.me/" + whatsappPhone + "?text=" + message,
                        "order-whatsapp-link"
                    )
                );
            }
        }

        if (contactActions.childElementCount > 0) {
            card.appendChild(contactActions);
        }

        ordersList.appendChild(card);
    });
}

document.getElementById("farmerLogout").addEventListener(
    "click",
    function () {
        localStorage.removeItem(keys.currentFarmer);
        window.location.replace("farmer-login.html");
    }
);

renderOrders();


})();
