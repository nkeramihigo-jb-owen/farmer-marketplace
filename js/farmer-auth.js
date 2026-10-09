(function () {
"use strict";


const app = window.HarvestHub;

if (!app) {
    console.error(
        "HarvestHub data.js must load before farmer-auth.js."
    );
    return;
}

const STORAGE_KEYS = app.STORAGE_KEYS;

function getFarmers() {
    const farmers = app.readJSON(STORAGE_KEYS.farmers, []);
    return Array.isArray(farmers) ? farmers : [];
}

function showMessage(message, type) {
    const box = document.getElementById("authMessage");

    if (!box) return;

    box.textContent = message;
    box.className = "auth-message " + type;
    box.hidden = false;
}

function normalizeBusinessName(name) {
    return name.trim().replace(/\s+/g, " ").toLowerCase();
}

function createFarmerId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return "farmer-" + window.crypto.randomUUID();
    }

    return "farmer-" + Date.now() + "-" +
        Math.random().toString(36).slice(2, 10);
}

function registerFarmer(event) {
    event.preventDefault();

    const form = event.currentTarget;

    const businessName = form.businessName.value
        .trim()
        .replace(/\s+/g, " ");

    const fullName = form.fullName.value.trim();
    const phone = form.phone.value.trim();
    const businessType = form.businessType.value;
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    if (
        !businessName ||
        !fullName ||
        !phone ||
        !businessType ||
        !password
    ) {
        showMessage("Please complete all the required fields.", "error");
        return;
    }

    if (password.length < 8) {
        showMessage(
            "Your password must contain at least 8 characters.",
            "error"
        );
        return;
    }

    if (password !== confirmPassword) {
        showMessage(
            "Your passwords do not match. Please try again.",
            "error"
        );
        return;
    }

    const farmers = getFarmers();
    const normalizedName = normalizeBusinessName(businessName);

    const alreadyRegistered = farmers.some(function (farmer) {
        return normalizeBusinessName(farmer.businessName || "") ===
            normalizedName;
    });

    if (alreadyRegistered) {
        showMessage(
            "That business name is already registered. " +
            "Try logging in or choose another name.",
            "error"
        );
        return;
    }

    const farmer = {
        id: createFarmerId(),
        businessName: businessName,
        fullName: fullName,
        phone: phone,
        businessType: businessType,
        password: password,
        createdAt: new Date().toISOString()
    };

    farmers.push(farmer);

    try {
        app.writeJSON(STORAGE_KEYS.farmers, farmers);

        showMessage(
            "Your account has been created! Redirecting you to login...",
            "success"
        );

        form.reset();

        window.setTimeout(function () {
            window.location.href = "farmer-login.html";
        }, 1200);

    } catch (error) {
        console.error("Farmer registration failed:", error);

        showMessage(
            "We couldn't save your account. Check browser storage " +
            "and try again.",
            "error"
        );
    }
}

function loginFarmer(event) {
    event.preventDefault();

    const form = event.currentTarget;

    const businessName = form.businessName.value.trim();
    const password = form.password.value;

    if (!businessName || !password) {
        showMessage(
            "Enter your business name and password.",
            "error"
        );
        return;
    }

    const farmers = getFarmers();

    const farmer = farmers.find(function (item) {
        return normalizeBusinessName(item.businessName || "") ===
                normalizeBusinessName(businessName) &&
            item.password === password;
    });

    if (!farmer) {
        showMessage(
            "Incorrect business name or password. " +
            "Please check your details and try again.",
            "error"
        );
        return;
    }

    /*
     * Keep the signed-in farmer separate from the farmer
     * registration list. Do not put the password in the
     * current-session record.
     */
    const currentFarmer = {
        id: farmer.id,
        businessName: farmer.businessName,
        fullName: farmer.fullName,
        phone: farmer.phone,
        businessType: farmer.businessType,
        createdAt: farmer.createdAt
    };

    try {
        app.writeJSON(STORAGE_KEYS.currentFarmer, currentFarmer);

        showMessage(
            "Welcome back, " + farmer.businessName + "! Opening your dashboard...",
            "success"
        );

        form.reset();

        window.setTimeout(function () {
            window.location.href = "farmer-dashboard.html";
        }, 700);

    } catch (error) {
        console.error("Farmer login failed:", error);

        showMessage(
            "We couldn't save your login session. Please try again.",
            "error"
        );
    }
}

const signupForm = document.getElementById("farmerSignupForm");
const loginForm = document.getElementById("farmerLoginForm");

if (signupForm) {
    signupForm.addEventListener("submit", registerFarmer);
}

if (loginForm) {
    loginForm.addEventListener("submit", loginFarmer);
}


})();
