(function () {
"use strict";


const STORAGE_KEYS = {
    products: "harvestHubProducts",
    cart: "harvestHubCart",
    farmers: "harvestHubFarmers",
    orders: "harvestHubOrders",
    currentFarmer: "harvestHubCurrentFarmer"
};

// Demo products use image files stored in assets/images/.
// Keep these filenames consistent with the actual files in that folder.
const starterProducts = [
    {
        id: "demo-tomatoes",
        name: "Fresh Tomatoes",
        category: "Vegetables",
        price: 3000,
        unit: "kg",
        quantity: 80,
        farmerBusiness: "Green Valley Farms",
        farmerName: "John Mukasa",
        farmerPhone: "+256700000001",
        description: "Fresh tomatoes suitable for everyday cooking.",
        image: "assets/images/tomatoes.jfif",
        emoji: "🍅",
        featured: true,
        demo: true
    },
    {
        id: "demo-maize",
        name: "Dry Maize",
        category: "Grains & Cereals",
        price: 120000,
        unit: "bag",
        quantity: 25,
        farmerBusiness: "Golden Harvest Cooperative",
        farmerName: "Sarah Namusoke",
        farmerPhone: "+256700000002",
        description: "Quality dry maize offered by a farming cooperative.",
        image: "assets/images/maize.jfif",
        emoji: "🌽",
        featured: true,
        demo: true
    },
    {
        id: "demo-potatoes",
        name: "Irish Potatoes",
        category: "Root Crops",
        price: 2800,
        unit: "kg",
        quantity: 100,
        farmerBusiness: "Highland Farm Produce",
        farmerName: "Peter Kato",
        farmerPhone: "+256700000003",
        description: "Freshly harvested Irish potatoes.",
        image: "assets/images/potatoes.jfif",
        emoji: "🥔",
        featured: true,
        demo: true
    },
    {
        id: "demo-bananas",
        name: "Yellow Bananas",
        category: "Fruits",
        price: 2500,
        unit: "bunch",
        quantity: 35,
        farmerBusiness: "Sunrise Agricultural Farm",
        farmerName: "Mary Akello",
        farmerPhone: "+256700000004",
        description: "Fresh bananas offered by a local farming business.",
        image: "assets/images/bananas.jfif",
        emoji: "🍌",
        featured: true,
        demo: true
    },
    {
        id: "demo-cabbage",
        name: "Fresh Cabbage",
        category: "Vegetables",
        price: 2500,
        unit: "head",
        quantity: 45,
        farmerBusiness: "Green Valley Farms",
        farmerName: "John Mukasa",
        farmerPhone: "+256700000001",
        description: "Fresh cabbage for family meals and food businesses.",
        image: "assets/images/cabbage.jfif",
        emoji: "🥬",
        featured: false,
        demo: true
    },
    {
        id: "demo-beans",
        name: "Dry Beans",
        category: "Grains & Cereals",
        price: 4500,
        unit: "kg",
        quantity: 60,
        farmerBusiness: "Golden Harvest Cooperative",
        farmerName: "Sarah Namusoke",
        farmerPhone: "+256700000002",
        description: "Dry beans offered by a farming cooperative.",
        image: "assets/images/beans.jfif",
        emoji: "🫘",
        featured: false,
        demo: true
    },
    {
        id: "demo-pineapple",
        name: "Fresh Pineapples",
        category: "Fruits",
        price: 4000,
        unit: "piece",
        quantity: 30,
        farmerBusiness: "Sunrise Agricultural Farm",
        farmerName: "Mary Akello",
        farmerPhone: "+256700000004",
        description: "Fresh pineapples available from a local farm.",
        image: "assets/images/pineapples.jfif",
        emoji: "🍍",
        featured: false,
        demo: true
    },
    {
        id: "demo-milk",
        name: "Fresh Milk",
        category: "Dairy Products",
        price: 2500,
        unit: "litre",
        quantity: 40,
        farmerBusiness: "Green Pastures Dairy",
        farmerName: "David Ssemanda",
        farmerPhone: "+256700000005",
        description: "Fresh milk advertised by a dairy farming business.",
        image: "assets/images/milk.jfif",
        emoji: "🥛",
        featured: false,
        demo: true
    },
    {
        id: "demo-eggs",
        name: "Fresh Eggs",
        category: "Poultry & Livestock",
        price: 15000,
        unit: "tray",
        quantity: 20,
        farmerBusiness: "Happy Hen Poultry",
        farmerName: "Grace Nambi",
        farmerPhone: "+256700000006",
        description: "Fresh eggs offered by a poultry farming business.",
        image: "assets/images/eggs.jfif",
        emoji: "🥚",
        featured: false,
        demo: true
    },
    {
        id: "demo-sweet-potatoes",
        name: "Sweet Potatoes",
        category: "Root Crops",
        price: 2000,
        unit: "kg",
        quantity: 55,
        farmerBusiness: "Highland Farm Produce",
        farmerName: "Peter Kato",
        farmerPhone: "+256700000003",
        description: "Fresh sweet potatoes harvested by a local farm.",
        image: "assets/images/sweet-potatoes.jfif",
        emoji: "🍠",
        featured: false,
        demo: true
    },
    {
        id: "demo-onions",
        name: "Red Onions",
        category: "Vegetables",
        price: 3500,
        unit: "kg",
        quantity: 45,
        farmerBusiness: "Green Valley Farms",
        farmerName: "John Mukasa",
        farmerPhone: "+256700000001",
        description: "Red onions for household and commercial cooking.",
        image: "assets/images/onions.jfif",
        emoji: "🧅",
        featured: false,
        demo: true
    },
    {
        id: "demo-chicken",
        name: "Local Chicken",
        category: "Poultry & Livestock",
        price: 30000,
        unit: "bird",
        quantity: 12,
        farmerBusiness: "Happy Hen Poultry",
        farmerName: "Grace Nambi",
        farmerPhone: "+256700000006",
        description: "Local chicken offered by a poultry farming business.",
        image: "assets/images/chicken.jfif",
        emoji: "🐔",
        featured: false,
        demo: true
    }
];

function readJSON(key, fallback) {
    try {
        const value = localStorage.getItem(key);

        if (value === null) {
            return fallback;
        }

        return JSON.parse(value);
    } catch (error) {
        console.error("Could not read browser storage:", error);
        return fallback;
    }
}

function writeJSON(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error("Could not save browser storage:", error);
        return false;
    }
}

function initializeProducts() {
    const saved = readJSON(STORAGE_KEYS.products, null);

    if (!Array.isArray(saved)) {
        writeJSON(STORAGE_KEYS.products, starterProducts);
        return;
    }

    // Update image paths for existing demo products without
    // overwriting farmer-created products or other saved data.
    const imageUpdates = {
        "demo-tomatoes": "assets/images/tomatoes.jfif",
        "demo-maize": "assets/images/maize.jfif",
        "demo-potatoes": "assets/images/potatoes.jfif",
        "demo-bananas": "assets/images/bananas.jfif",
        "demo-cabbage": "assets/images/cabbage.jfif",
        "demo-beans": "assets/images/beans.jfif",
        "demo-pineapple": "assets/images/pineapples.jfif",
        "demo-milk": "assets/images/milk.jfif",
        "demo-eggs": "assets/images/eggs.jfif",
        "demo-sweet-potatoes": "assets/images/sweet-potatoes.jfif",
        "demo-onions": "assets/images/onions.jfif",
        "demo-chicken": "assets/images/chicken.jfif"
    };

    let changed = false;

    const updatedProducts = saved.map(function (product) {
        if (
            product.demo === true &&
            imageUpdates[product.id] &&
            product.image !== imageUpdates[product.id]
        ) {
            changed = true;

            return {
                ...product,
                image: imageUpdates[product.id]
            };
        }

        return product;
    });

    if (changed) {
        writeJSON(STORAGE_KEYS.products, updatedProducts);
    }

    }

function getProducts() {
    initializeProducts();

    const saved = readJSON(STORAGE_KEYS.products, []);

    return Array.isArray(saved) ? saved : [];
}

function saveProducts(products) {
    return writeJSON(STORAGE_KEYS.products, products);
}

function getCart() {
    const cart = readJSON(STORAGE_KEYS.cart, []);

    return Array.isArray(cart) ? cart : [];
}

function saveCart(cart) {
    return writeJSON(STORAGE_KEYS.cart, cart);
}

function formatUGX(amount) {
    return "UGX " + Number(amount || 0).toLocaleString("en-UG");
}

function getCartCount() {
    return getCart().reduce(function (total, item) {
        return total + Math.max(0, Number(item.quantity) || 0);
    }, 0);
}

function updateCartCount() {
    const count = getCartCount();

    document.querySelectorAll("#cartCount").forEach(function (element) {
        element.textContent = count;
    });
}

function addToCart(productId, requestedQuantity) {
    const products = getProducts();

    const product = products.find(function (item) {
        return item.id === productId;
    });

    if (!product) {
        return {
            success: false,
            message: "This product could not be found."
        };
    }

    const quantity = Math.floor(Number(requestedQuantity) || 1);

    if (quantity < 1) {
        return {
            success: false,
            message: "Please choose a valid quantity."
        };
    }

    const available = Math.max(0, Number(product.quantity) || 0);

    if (available < 1) {
        return {
            success: false,
            message: "This product is currently out of stock."
        };
    }

    const cart = getCart();

    const existing = cart.find(function (item) {
        return item.productId === productId;
    });

    const currentQuantity = existing
        ? Number(existing.quantity) || 0
        : 0;

    if (currentQuantity + quantity > available) {
        return {
            success: false,
            message: "Only " + available + " " + product.unit +
                " available in this demo."
        };
    }

    if (existing) {
        existing.quantity = currentQuantity + quantity;
    } else {
        cart.push({
            productId: productId,
            quantity: quantity
        });
    }

    if (!saveCart(cart)) {
        return {
            success: false,
            message: "The cart could not be saved in this browser."
        };
    }

    updateCartCount();

    return {
        success: true,
        message: product.name + " added to your cart."
    };
}

window.HarvestHub = {
    STORAGE_KEYS: STORAGE_KEYS,
    getProducts: getProducts,
    saveProducts: saveProducts,
    getCart: getCart,
    saveCart: saveCart,
    getCartCount: getCartCount,
    updateCartCount: updateCartCount,
    addToCart: addToCart,
    formatUGX: formatUGX,
    readJSON: readJSON,
    writeJSON: writeJSON
};

initializeProducts();


})();
