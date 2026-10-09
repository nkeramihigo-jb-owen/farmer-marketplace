(function () {
"use strict";


const app = window.HarvestHub;

if (!app) {
    alert("HarvestHub data.js could not be loaded.");
    window.location.href = "farmer-login.html";
    return;
}

const keys = app.STORAGE_KEYS;

const farmer = app.readJSON(keys.currentFarmer, null);

if (!farmer || !farmer.id) {
    window.location.replace("farmer-login.html");
    return;
}

const form = document.getElementById("farmerProductForm");
const productList = document.getElementById("farmerProductList");
const emptyProducts = document.getElementById("emptyProducts");
const productImageInput = document.getElementById("productImage");
const imagePreview = document.getElementById("imagePreview");
const imagePreviewContainer = document.getElementById("imagePreviewContainer");

let selectedImageData = "";
let editingImage = "";

function getAllProducts() {
    const products = app.getProducts();
    return Array.isArray(products) ? products : [];
}

function saveAllProducts(products) {
    app.saveProducts(products);
}

function getFarmerProducts() {
    return getAllProducts().filter(function (product) {
        return belongsToFarmer(product);
    });
}

function belongsToFarmer(product) {
    if (product.farmerId) {
        return product.farmerId === farmer.id;
    }

    // Compatibility with older products that have no farmerId.
    // Only adopt a legacy product when both business and phone match.
    return (
        normalize(product.farmerBusiness) ===
            normalize(farmer.businessName) &&
        normalize(product.farmerPhone) === normalize(farmer.phone)
    );
}

function normalize(value) {
    return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function makeId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return "product-" + window.crypto.randomUUID();
    }

    return "product-" + Date.now() + "-" +
        Math.random().toString(36).slice(2, 10);
}

function showMessage(message, type) {
    const box = document.getElementById("productMessage");
    box.textContent = message;
    box.className = "auth-message " + type;
    box.hidden = false;

    box.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function hideMessage() {
    const box = document.getElementById("productMessage");
    box.hidden = true;
    box.textContent = "";
    box.className = "auth-message";
}

function setImagePreview(source) {
    if (!source) {
        imagePreviewContainer.hidden = true;
        imagePreview.removeAttribute("src");
        return;
    }

    imagePreview.src = source;
    imagePreviewContainer.hidden = false;
}

/*
 * Resize images before storing them as data URLs.
 * This is useful for a frontend demo but is not a substitute
 * for proper server-side image storage in production.
 */
function compressImage(file) {
    return new Promise(function (resolve, reject) {
        if (!file || !file.type.startsWith("image/")) {
            reject(new Error("Please choose a valid image file."));
            return;
        }

        if (file.size > 8 * 1024 * 1024) {
            reject(new Error("The image must be smaller than 8 MB."));
            return;
        }

        const reader = new FileReader();

        reader.onerror = function () {
            reject(new Error("The image could not be read."));
        };

        reader.onload = function () {
            const image = new Image();

            image.onerror = function () {
                reject(new Error("The selected image could not be opened."));
            };

            image.onload = function () {
                const maxDimension = 1000;
                const scale = Math.min(
                    1,
                    maxDimension / Math.max(image.width, image.height)
                );

                const canvas = document.createElement("canvas");

                canvas.width = Math.max(1, Math.round(image.width * scale));
                canvas.height = Math.max(1, Math.round(image.height * scale));

                const context = canvas.getContext("2d");

                if (!context) {
                    reject(new Error("Image processing is unavailable."));
                    return;
                }

                context.drawImage(image, 0, 0, canvas.width, canvas.height);

                try {
                    resolve(canvas.toDataURL("image/jpeg", 0.78));
                } catch (error) {
                    reject(new Error("The image could not be processed."));
                }
            };

            image.src = reader.result;
        };

        reader.readAsDataURL(file);
    });
}

productImageInput.addEventListener("change", async function () {
    hideMessage();

    const file = productImageInput.files[0];

    if (!file) {
        selectedImageData = "";
        setImagePreview(editingImage);
        return;
    }

    try {
        selectedImageData = await compressImage(file);
        setImagePreview(selectedImageData);
    } catch (error) {
        productImageInput.value = "";
        selectedImageData = "";
        setImagePreview(editingImage);
        showMessage(error.message, "error");
    }
});

function updateSummary(products) {
    const totalStock = products.reduce(function (sum, product) {
        return sum + Math.max(0, Number(product.quantity) || 0);
    }, 0);

    document.getElementById("totalProducts").textContent =
        products.length;

    document.getElementById("totalStock").textContent =
        totalStock.toLocaleString();

    document.getElementById("listingCount").textContent =
        products.length + (products.length === 1 ? " product" : " products");
}

function renderProducts() {
    const products = getFarmerProducts();

    updateSummary(products);

    productList.replaceChildren();
    emptyProducts.hidden = products.length > 0;

    products.forEach(function (product) {
        const card = document.createElement("article");
        card.className = "farmer-product-card";

        const image = document.createElement("img");
        image.className = "farmer-product-image";
        image.alt = product.name || "Farm product";
        image.loading = "lazy";
        image.src = product.image || "";

        image.addEventListener("error", function () {
            image.style.display = "none";
        });

        if (!product.image) {
            image.style.display = "none";
        }

        const body = document.createElement("div");
        body.className = "farmer-product-card-body";

        const category = document.createElement("span");
        category.className = "product-category-tag";
        category.textContent = product.category || "Other";

        const name = document.createElement("h3");
        name.textContent = product.name || "Unnamed Product";

        const description = document.createElement("p");
        description.className = "farmer-product-description";
        description.textContent = product.description || "";

        const price = document.createElement("div");
        price.className = "farmer-product-price";
        price.textContent =
            app.formatUGX(Number(product.price) || 0) +
            " / " + (product.unit || "unit");

        const stock = document.createElement("p");
        stock.className = "farmer-product-stock";
        stock.textContent =
            "Available stock: " +
            (Number(product.quantity) || 0) + " " +
            (product.unit || "units");

        if ((Number(product.quantity) || 0) <= 0) {
            stock.classList.add("out-of-stock");
        }

        const actions = document.createElement("div");
        actions.className = "farmer-product-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "edit-product-button";
        editButton.textContent = "✏️ Edit";
        editButton.addEventListener("click", function () {
            startEditing(product.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-product-button";
        deleteButton.textContent = "🗑️ Delete";
        deleteButton.addEventListener("click", function () {
            deleteProduct(product.id);
        });

        actions.append(editButton, deleteButton);

        body.append(category, name, description, price, stock, actions);
        card.append(image, body);
        productList.appendChild(card);
    });
}

function startEditing(productId) {
    const product = getFarmerProducts().find(function (item) {
        return item.id === productId;
    });

    if (!product) {
        showMessage("That product could not be found.", "error");
        return;
    }

    document.getElementById("editingProductId").value = product.id;
    document.getElementById("productName").value = product.name || "";
    document.getElementById("productCategory").value = product.category || "";
    document.getElementById("productPrice").value = product.price || "";
    document.getElementById("productUnit").value = product.unit || "kg";
    document.getElementById("productQuantity").value =
        Number(product.quantity) || 0;
    document.getElementById("productDescription").value =
        product.description || "";

    editingImage = product.image || "";
    selectedImageData = "";
    productImageInput.value = "";

    setImagePreview(editingImage);

    document.getElementById("formTitle").textContent = "Edit Product";
    document.getElementById("saveProductButton").textContent =
        "Save Product Changes →";
    document.getElementById("cancelEditButton").hidden = false;

    hideMessage();

    document.getElementById("productEditor").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function resetForm() {
    form.reset();

    document.getElementById("editingProductId").value = "";
    document.getElementById("formTitle").textContent = "Add a New Product";
    document.getElementById("saveProductButton").textContent =
        "Add Product to Marketplace →";
    document.getElementById("cancelEditButton").hidden = true;

    selectedImageData = "";
    editingImage = "";

    setImagePreview("");
    hideMessage();
}

function deleteProduct(productId) {
    const product = getFarmerProducts().find(function (item) {
        return item.id === productId;
    });

    if (!product) return;

    const confirmed = window.confirm(
        'Delete "' + product.name + '" from your listings?'
    );

    if (!confirmed) return;

    try {
        const products = getAllProducts().filter(function (item) {
            return item.id !== productId;
        });

        saveAllProducts(products);

        if (
            document.getElementById("editingProductId").value === productId
        ) {
            resetForm();
        }

        renderProducts();
        showMessage("Product deleted successfully.", "success");
    } catch (error) {
        console.error(error);
        showMessage(
            "The product could not be deleted. Browser storage may be full.",
            "error"
        );
    }
}

form.addEventListener("submit", async function (event) {
    event.preventDefault();
    hideMessage();

    const editingProductId =
        document.getElementById("editingProductId").value;

    const name = document.getElementById("productName").value.trim();
    const category = document.getElementById("productCategory").value;
    const price = Number(document.getElementById("productPrice").value);
    const unit = document.getElementById("productUnit").value;
    const quantity = Number(document.getElementById("productQuantity").value);
    const description =
        document.getElementById("productDescription").value.trim();

    if (!name || !category || !unit || !description) {
        showMessage("Please complete all required product details.", "error");
        return;
    }

    if (!Number.isFinite(price) || price <= 0) {
        showMessage("Enter a valid price greater than zero.", "error");
        return;
    }

    if (!Number.isInteger(quantity) || quantity < 0) {
        showMessage("Enter a whole-number quantity of zero or more.", "error");
        return;
    }

    const button = document.getElementById("saveProductButton");
    button.disabled = true;

    try {
        let image = selectedImageData || editingImage;

        if (!image && productImageInput.files[0]) {
            image = await compressImage(productImageInput.files[0]);
        }

        const products = getAllProducts();
        let updatedProducts;

        if (editingProductId) {
            const index = products.findIndex(function (product) {
                return product.id === editingProductId &&
                    belongsToFarmer(product);
            });

            if (index === -1) {
                showMessage(
                    "You can only edit products belonging to your farm.",
                    "error"
                );
                return;
            }

            const oldProduct = products[index];

            updatedProducts = products.slice();

            updatedProducts[index] = {
                ...oldProduct,
                name: name,
                category: category,
                price: price,
                unit: unit,
                quantity: quantity,
                description: description,
                image: image || "",
                emoji: oldProduct.emoji || "🌾",
                farmerId: farmer.id,
                farmerBusiness: farmer.businessName,
                farmerName: farmer.fullName,
                farmerPhone: farmer.phone,
                updatedAt: new Date().toISOString()
            };
        } else {
            const newProduct = {
                id: makeId(),
                name: name,
                category: category,
                price: price,
                unit: unit,
                quantity: quantity,
                description: description,
                image: image || "",
                emoji: "🌾",
                featured: false,
                demo: false,
                farmerId: farmer.id,
                farmerBusiness: farmer.businessName,
                farmerName: farmer.fullName,
                farmerPhone: farmer.phone,
                createdAt: new Date().toISOString()
            };

            updatedProducts = products.concat(newProduct);
        }

        saveAllProducts(updatedProducts);

        resetForm();
        renderProducts();

        showMessage(
            editingProductId
                ? "Your product has been updated."
                : "Your product has been added to the marketplace.",
            "success"
        );

    } catch (error) {
        console.error("Could not save product:", error);

        showMessage(
            "The product could not be saved. Browser storage may be full. " +
            "Try a smaller image.",
            "error"
        );
    } finally {
        button.disabled = false;
    }
});

document.getElementById("cancelEditButton").addEventListener(
    "click",
    resetForm
);

document.getElementById("farmerLogout").addEventListener(
    "click",
    function () {
        localStorage.removeItem(keys.currentFarmer);
        window.location.replace("farmer-login.html");
    }
);

renderProducts();


})();
