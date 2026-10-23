
const buttons = document.querySelectorAll(".details-btn");

buttons.forEach(function(button) {

    button.addEventListener("click", function() {

        const card = this.closest(".product-card");

        const info = card.querySelector(".product-info");

        info.hidden = !info.hidden;

        if (info.hidden) {
            this.textContent = "Дэлгэрэнгүй";
        } else {
            this.textContent = "Хаах";
        }

    });

});


// Хайлтын талбар
const searchInput = document.getElementById("searchInput");

// Бүтээгдэхүүнүүд
const productCards = document.querySelectorAll(".product-card");

// Ангиллын товчлуурууд
const categoryButtons = document.querySelectorAll(".category-btn");

// Олдсонгүй гэсэн текст
const noResults = document.getElementById("noResults");

// Эхэндээ бүх ангилал сонгогдсон
let selectedCategory = "all";

// Бүтээгдэхүүн шүүх функц
function filterProducts() {

    const searchText = searchInput.value.toLowerCase().trim();

    let foundCount = 0;

    productCards.forEach(function(card) {

        const productName = card.querySelector("h3").textContent.toLowerCase();

        const productCategory = card.dataset.category;

        // Хайлтын үг тохирч байна уу?
        const matchesSearch = productName.includes(searchText);

        // Ангилал тохирч байна уу?
        const matchesCategory =
            selectedCategory === "all" ||
            productCategory === selectedCategory;

        // Хоёр нөхцөл хоёулаа биелсэн үү?
        const shouldShow = matchesSearch && matchesCategory;

        card.hidden = !shouldShow;

        if (shouldShow) {
            foundCount++;
        }

    });

    noResults.hidden = foundCount > 0;
}

// Хайлтын талбарт бичихэд шүүх
searchInput.addEventListener("input", filterProducts);

// Ангиллын товчлууруудыг ажиллуулах
categoryButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        // Сонгосон ангиллыг авах
        selectedCategory = this.dataset.filter;

        // Өмнөх active төлөвийг арилгах
        categoryButtons.forEach(function(btn) {
            btn.classList.remove("active");
        });

        // Шинэ сонгосон товчийг идэвхжүүлэх
        this.classList.add("active");

        // Бүтээгдэхүүнүүдийг дахин шүүх
        filterProducts();

    });

});


// Сагсны мэдээллийг хадгалах массив
let cart = [];

// HTML элементүүд
const addCartButtons = document.querySelectorAll(".add-cart-btn");
const cartItems = document.getElementById("cartItems");
const cartCountText = document.getElementById("cartCount");
const cartTotalText = document.getElementById("cartTotal");

// Сагсны мэдээллийг хадгалсан байвал унших
try {
    const savedCart = JSON.parse(localStorage.getItem("urbanCart"));

    if (Array.isArray(savedCart)) {
        cart = savedCart;
    }
} catch (error) {
    console.log("Сагсны мэдээллийг уншиж чадсангүй.");
}

// Сагсыг дэлгэц дээр харуулах
function renderCart() {

    cartItems.innerHTML = "";

    let totalCount = 0;
    let totalPrice = 0;

    cart.forEach(function(item, index) {

        totalCount += item.quantity;
        totalPrice += item.price * item.quantity;

        const row = document.createElement("div");
        row.className = "cart-item";

        const name = document.createElement("strong");
        name.textContent = item.name;

        const price = document.createElement("p");
        price.textContent =
            (item.price * item.quantity).toLocaleString("en-US") + "₮";

        const controls = document.createElement("div");
        controls.className = "cart-controls";

        const minus = document.createElement("button");
        minus.textContent = "−";
        minus.addEventListener("click", function() {
            changeQuantity(index, -1);
        });

        const quantity = document.createElement("span");
        quantity.textContent = item.quantity;

        const plus = document.createElement("button");
        plus.textContent = "+";
        plus.addEventListener("click", function() {
            changeQuantity(index, 1);
        });

        const remove = document.createElement("button");
        remove.textContent = "Устгах";
        remove.addEventListener("click", function() {
            removeItem(index);
        });

        controls.append(minus, quantity, plus, remove);
        row.append(name, price, controls);
        cartItems.appendChild(row);
    });

    if (cart.length === 0) {
        cartItems.textContent = "Сагс хоосон байна.";
    }

    cartCountText.textContent = totalCount;
    cartTotalText.textContent =
        totalPrice.toLocaleString("en-US") + "₮";
}

// Сагсны мэдээллийг хадгалах
function saveCart() {
    localStorage.setItem("urbanCart", JSON.stringify(cart));
}

// Сагсыг шинэчлэх
function updateCart() {
    saveCart();
    renderCart();
}

// Сагсанд нэмэх
addCartButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        const name = this.dataset.name;
        const price = Number(this.dataset.price);

        const existingItem = cart.find(function(item) {
            return item.name === name;
        });

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                name: name,
                price: price,
                quantity: 1
            });
        }

        updateCart();
    });
});

// Тоо ширхэг нэмэх, хасах
function changeQuantity(index, amount) {

    cart[index].quantity += amount;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    updateCart();
}

// Бүтээгдэхүүн устгах
function removeItem(index) {
    cart.splice(index, 1);
    updateCart();
}

// Сайт нээгдэх үед сагсыг харуулах
renderCart();

// Checkout form-ийг олох
const checkoutForm = document.getElementById("checkoutForm");

// Захиалгын үр дүн харагдах хэсэг
const orderResult = document.getElementById("orderResult");

// Form илгээх үед ажиллах
checkoutForm.addEventListener("submit", function(event) {

    // Browser хуудсыг автоматаар шинэчлэхээс сэргийлэх
    event.preventDefault();

    // Сагс хоосон эсэхийг шалгах
    if (cart.length === 0) {
        alert("Эхлээд сагсандаа бүтээгдэхүүн нэмнэ үү!");
        return;
    }

    // Хэрэглэгчийн оруулсан мэдээллийг авах
    const name = document.getElementById("customerName").value.trim();
    const phone = document.getElementById("customerPhone").value.trim();
    const address = document.getElementById("customerAddress").value.trim();

    // Сагсны нийт үнийг бодох
    let totalPrice = 0;

    cart.forEach(function(item) {
        totalPrice += item.price * item.quantity;
    });

    // Өмнөх үр дүнг цэвэрлэх
    orderResult.replaceChildren();

    // Гарчиг үүсгэх
    const title = document.createElement("h3");
    title.textContent = "Захиалгын мэдээлэл";

    // Мэдээлэл нэмэх туслах функц
    function addLine(text) {
        const p = document.createElement("p");
        p.textContent = text;
        orderResult.appendChild(p);
    }

    orderResult.appendChild(title);

    addLine("Нэр: " + name);
    addLine("Утас: " + phone);
    addLine("Хаяг: " + address);

    // Захиалсан бүтээгдэхүүнүүдийг харуулах
    cart.forEach(function(item) {
        addLine(
            item.name + " × " + item.quantity +
            " — " +
            (item.price * item.quantity).toLocaleString("en-US") +
            "₮"
        );
    });

    addLine(
        "Нийт үнэ: " +
        totalPrice.toLocaleString("en-US") + "₮"
    );

    addLine("Энэ бол туршилтын захиалга. Бодит захиалга илгээгдээгүй.");

    // Нуугдсан үр дүнг харуулах
    orderResult.hidden = false;
});

