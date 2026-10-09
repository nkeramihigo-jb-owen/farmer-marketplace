(function () {
"use strict";


const app = window.HarvestHub;

if (!app) {
    console.error("HarvestHub data.js failed to load.");
    window.location.href = "farmer-login.html";
    return;
}

const STORAGE_KEYS = app.STORAGE_KEYS;

const farmer = app.readJSON(
    STORAGE_KEYS.currentFarmer,
    null
);

if (!farmer || !farmer.id) {
    window.location.replace("farmer-login.html");
    return;
}

document.getElementById("dashboardFarmerName").textContent =
    farmer.fullName || farmer.businessName || "Farmer";

document.getElementById("dashboardBusinessName").textContent =
    farmer.businessName || "Your Business";

document.getElementById("dashboardBusinessType").textContent =
    farmer.businessType || "Farm business";

document.getElementById("dashboardFullName").textContent =
    farmer.fullName || "Not provided";

document.getElementById("dashboardPhone").textContent =
    farmer.phone || "Not provided";

document.getElementById("farmerLogout").addEventListener(
    "click",
    function () {
        try {
            localStorage.removeItem(STORAGE_KEYS.currentFarmer);
        } finally {
            window.location.replace("farmer-login.html");
        }
    }
);


})();
