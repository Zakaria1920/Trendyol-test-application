// import cloudinary fn
import { uploadToCloudinary } from "./formatImgs.js";

// query selector fn
const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => document.querySelectorAll(selector);

// //***** for mobile *****//
// // function for all horizontal scrolling
function enableHorizontalScroll(listId) {
    const list = qs(`#${listId}`);
    let maxScroll = list.scrollWidth - list.offsetWidth;
    let startX = 0;
    let lastX = parseInt(sessionStorage.getItem(`lastX_${listId}`)) || 0;

    function startTouch(e) {
          startX = e.touches[0].clientX + lastX;
    }
  
    function moveTouch(e) {
      // prevent vertical scrolling
      e.preventDefault();
      const currentX = e.touches[0].clientX;
      let newScroll = startX - currentX;

      // Clamp within scroll range
      newScroll = Math.max(0, Math.min(newScroll, maxScroll));
      list.style.transform = `translateX(-${newScroll}px)`;
      lastX = newScroll;
      // save last scroll position
      sessionStorage.setItem(`lastX_${listId}`, newScroll);
    }
  
    list.addEventListener("touchstart", startTouch, { passive: false });
    list.addEventListener("touchmove", moveTouch, { passive: false });
}

if (qs("#product-selection-scroll")) {
enableHorizontalScroll("product-selection-scroll");
}

// add function for centering the clicked li
function centerLi(list, li) {
    let maxScroll = list.scrollWidth - list.offsetWidth;
    let offset = li.offsetLeft - list.offsetWidth / 2 + li.offsetWidth / 2;
    if (offset < 0) offset = 0;
    if (offset > maxScroll) offset = maxScroll;
    list.style.transform = `translateX(-${offset}px)`;
}

// select menu
const menu = qs(".side-menu");
const categoryGroups = ["shirt", "pant", "shoe", "bag", "watch", "jewelry", "accessories"];

if (menu) {
// show category groups function
async function showCategoryGroups(categoryName, categoryGroup) {
    menu.querySelector(".offcanvas-body").classList.add("d-none");
    try {
        const response = await fetch(`data/images.json`);
        const data = await response.json();
        const img = data[`${categoryName}-img`];
        document.documentElement.style.setProperty("--header-bg-img", `url(${img})`);
        let groups = document.createElement("div");
        groups.className = "menu-group";
        categoryGroup.forEach((category) => {
            const item = document.createElement("div");
            item.className = "menu-item";
            item.innerHTML = `
                <a href="#"> 
                ${category}
                <i class="fa-solid fa-chevron-right ms-auto"></i>
                </a>
            `;
            groups.appendChild(item);
        });
        const back = document.createElement("div");
        back.className = "back";
        back.innerHTML = `
            <i class="fa-solid fa-arrow-left me-2"></i>
        `;
        back.addEventListener("click", () => {
            document.documentElement.style.removeProperty("--header-bg-img");
            groups.style.transform = "translateX(-100%)";
            setTimeout(() => {
                groups.remove();
                menu.querySelector(".back").remove();
                menu.querySelector(".offcanvas-body").classList.remove("d-none");
            }, 400);
        });
        menu.appendChild(back);
        menu.appendChild(groups);
    } catch (error) {
        throw error;
    }
}

// apply showCategoryGroups function
qsa(".menu-item").forEach((menuItem) => {
    menuItem.addEventListener("click", () => {
        let categoryName = menuItem.innerText.toLowerCase();
        showCategoryGroups(categoryName, categoryGroups);
    });
})
}

// handling with horizontal scrolling for category
const list = qs(".category-container ul");

// fixed category
const categoryContainer = qs(".category-container");
const spacer = document.getElementById("category-spacer");
const lis = qsa(".category-container ul li");

if (qs(".category-container")) {
    // add active class to li
    lis.forEach((li) => {
        li.addEventListener("click", () => {
            let categoryName = li.innerText;
            updateURLAndLoad(categoryName)
            lis.forEach((li) => {
                li.classList.remove("active");
            });
            li.classList.add("active");
            // center the clicked li
            centerLi(list, li);
        });
    });
    // fixed category
    window.addEventListener("scroll", () => {
        if (window.scrollY > 111) {
            categoryContainer.classList.add("fixed");
            spacer.style.height = categoryContainer.offsetHeight + "px";
        } else {
            categoryContainer.classList.remove("fixed");
            spacer.style.height = "0px";
        }
    });
}


// product container
const productContainer = qs("#products-container");

// Read query params from URL
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        category: params.get("category") || "men",
        page: params.get("page") || "main",
        group: params.get("group") || "",
    };
}

// Update URL without reloading page
function updateURL(category) {
    const params = new URLSearchParams();
    params.set("category", category);
    params.set("page", "main");
    history.pushState(null, "", "?" + params.toString());
}

// Handle button click
function updateURLAndLoad(category) {
    updateURL(category);
    loadProducts(category);
}
// create placeholder products
function createPlaceholderProducts() {
    const productItems = document.createElement("div");
    productItems.className = "product-items";
    const productScroll = document.createElement("ul");
    productScroll.className = "nav product-scroll";
    // reset product scroll transform
    productScroll.style.transform = "translateX(0)";
    productScroll.innerHTML = "";
    for (let i = 0; i < 6; i++) {
        const li = document.createElement("li");
        li.classList.add("card");
        li.innerHTML = `
            <div class="card-body">
                <h5 class="card-title placeholder-glow">
                    <span style="height: 200px;" class="placeholder col-12 centering fs-3">trendyol</span>
                </h5>
                <p class="card-text placeholder-glow">
                    <span class="placeholder col-12"></span>
                </p>
                <p class="card-text placeholder-glow">
                    <span class="placeholder col-12"></span>
                </p>
                <p class="card-text placeholder-glow">
                    <span class="placeholder col-12"></span>
                </p>
            </div>
        `;
        productScroll.appendChild(li);
    }
    const options = document.createElement("div");
    options.className = "d-flex justify-content-between align-items-center mt-2";
    options.innerHTML = `
                <p class="card-text placeholder-glow col-6 mb-0">
                    <span class="placeholder col-6"></span>
                </p>
                <p class="card-text placeholder-glow col-6 text-end">
                    <span class="placeholder col-6"></span>
                </p>
    `;
    productItems.appendChild(productScroll);
    productItems.insertBefore(options, productScroll);
    productContainer.appendChild(productItems);
}

// add stars funciton 
function addStars(rate) {
    let rating = "";
    for (let i = 0; i < 5; i++) {
        let starIcon = "";
        if (i < Math.floor(rate)) {
            // Full star
            starIcon = "fa-star";
        } else if (i < rate) {
            // Half star
            starIcon = "fa-star-half-stroke";
        } else {
            // Empty star
            starIcon = "fa-star";
        }
        let iconClass = i < rate ? "fa-solid" : "fa-regular";
        rating += `<i class="${iconClass} ${starIcon} text-warning"></i>`;
    }
    return rating;
}

// see all products function
async function loadSeeAllProducts(category, categoryName) {
    const params = new URLSearchParams();
    params.set("category", category);
    params.set("group", categoryName);
    params.set("page", "see-all");
    history.pushState(null, "", "?" + params.toString());
    try {
        const response = await fetch(`data/${category}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load: ${response.statusText}`);
        }
        const data = await response.json();
        // empty product container
        productContainer.innerHTML = "";
        // get items
        const name = categoryName.replace(" ", "").toLowerCase();
        const willBeShown = Object.keys(data).find((item) => item === name);
        const items = data[willBeShown];
        // create category name
        const categoryNameElement = document.createElement("p");
        categoryNameElement.className = "text-center p-3";
        categoryNameElement.textContent = categoryName;
        categoryNameElement.style.textTransform = "capitalize";
        categoryNameElement.style.fontSize = "2rem";
        productContainer.appendChild(categoryNameElement);
        // create product item
        items.forEach((item) => {
            const productItem = document.createElement("a");
            productItem.className = "see-all card my-3";
            productItem.href = `product-page.html?id=${item.id}`;
            productItem.innerHTML = `
                <div class="row g-0">
                    <div class="col-4 p-3 text-center">
                    <img src="${item.image}" class="img-fluid rounded-start" alt="...">
                    </div>
                    <div class="col-8">
                    <div class="card-body">
                        <h5 class="card-title d-inline-block">${item.title}</h5>
                        <span class="card-text d-inline-block fs-7">${item.description}</span>
                        <div class="rate-container d-flex gap-1">
                            <div id="rate"></div>
                            <div>(${item.rating.count})</div>
                        </div>
                        <div class="price mt-auto text-danger">$${item.price}</div>
                    </div>
                    </div>
                </div>
            `;
            productItem.querySelector("#rate").innerHTML = addStars(item.rating.rate);
            productContainer.appendChild(productItem);
            qs(".category-container").style.display = "none";
        })
    } catch (err) {
        console.error(err);
    }
}

// Fetch & display products
async function loadProducts(mainCategory) {
    productContainer.innerHTML = "";
    for (let i = 0; i < 3; i++) {
        createPlaceholderProducts();
    }
    try {
        const response = await fetch(`data/${mainCategory}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load: ${response.statusText}`);
        }
        const data = await response.json();

        const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

        const nameMap = {
            mostpopular: "most popular",
            specialproduct: "special product",
            advantageous: "advantageous"
          };
          
          const categories = Object.entries(data).map(([key, items]) => ({
            name: nameMap[key],
            items: items,
          }));          
        // format images
        await Promise.all(categories.map(async (category) => {
            await Promise.all(category.items.map(async (item) => {
                item.image = await uploadToCloudinary(item.image, `${category.name}-image-${item.id}`,{
                    width: 150,
                    height: 220,
                    crop: "scale",
                    quality: "auto",
                    format: "auto",
                });
            }));
        }));

        // clear product items
        qs(".category-container").style.display = "block";
        productContainer.innerHTML = "";
        // loop for categories
        for (let ind = 0; ind < categories.length; ind++) {
            const category = categories[ind];
            const productItems = document.createElement("div");
            productItems.className = "product-items";
            const productScroll = document.createElement("ul");
            productScroll.className = "nav product-scroll";
            // loop for products
            for (let ind = 0; ind < category.items.length; ind++) {
                const product = category.items[ind];
                const productItem = document.createElement("li");
                productItem.classList.add("card");
                let favorited = favorites.includes(product.id) ? "fa-solid selected" : "";
                productItem.innerHTML = `
                <div class="badge">
                    <i class="fa-regular fa-heart fa-2xl ${favorited}"></i>
                </div>
                <a href="product-page.html?id=${product.id}">
                    <div class="img-container">
                        <img
                        src="${product.image}"
                        class="card-img-top img-fluid" alt="${product.title}">
                    </div>
                    <div class="hint">more than 100 TL</div>
                    <div class="card-body">
                        <h5 class="card-title d-inline-block">${product.title}</h5>
                        <span class="card-text d-inline-block">${product.description}</span>
                        <div class="rate-container d-flex gap-1">
                            <div id="rate"></div>
                            <div>(${product.rating.count})</div>
                        </div>
                        <div class="price">$${product.price}</div>
                    </div>
                </a>
                `;
                // add stars according to rating
                const rate = productItem.querySelector("#rate");
                rate.innerHTML = addStars(product.rating.rate);
                productScroll.appendChild(productItem);
                // heart icon click event
                const heartIcon = productItem.querySelector(".fa-heart");
                heartIcon.addEventListener("click", () => {
                    heartIcon.classList.toggle("fa-solid");
                    heartIcon.classList.toggle("selected");
                    // add to favorites
                    if (favorites.includes(product.id)) {
                        favorites.splice(favorites.indexOf(product.id), 1);
                    } else {
                        favorites.push(product.id);
                    }
                    localStorage.setItem("favorites", JSON.stringify(favorites));
                    // remove previous alert
                    if (qs(".favorite-alert")) qs(".favorite-alert").remove();
                    // show favorite alert
                    const favoriteAlert = document.createElement("div");
                    favoriteAlert.classList.add("favorite-alert");
                    let text = heartIcon.classList.contains("selected") ? "Product added to favorites!" : "Product removed from favorites!";
                    favoriteAlert.textContent = text;
                    document.body.appendChild(favoriteAlert);
                    setTimeout(() => {
                        favoriteAlert.remove();
                    }, 3000);   
                });
                // add "see all" button
                if (ind === 6) {
                    const seeAll = document.createElement("div");
                    seeAll.classList.add("see-all");
                    seeAll.innerHTML = `
                    <div id="see-all-card">
                        See All
                        <i class="fa-solid fa-chevron-right"></i>
                    </div>
                    `;
                    productItem.appendChild(seeAll);
                    productItem.classList.add("blur");
                    seeAll.querySelector("#see-all-card").addEventListener("click", async () => {
                        productContainer.innerHTML = "";
                        await loadSeeAllProducts(mainCategory, category.name);
                    });
                    break; // stops the loop
                }
            }
            // add product scroll to product items
            productItems.appendChild(productScroll)
            // create product options
            const options = document.createElement("div");
            options.classList.add("options");
            options.innerHTML = `
                <div>${category.name}</div>
                <div class="see-all-options">
                    See All
                    <i class="fa-solid fa-chevron-right ms-1"></i>
                </div>
            `;
            options.querySelector(".see-all-options").addEventListener("click", async () => {
                productContainer.innerHTML = "";
                await loadSeeAllProducts(mainCategory, category.name);
            });
            // check if options already exists
            if (productItems.querySelector(".options")) {
                productItems.querySelector(".options").remove();
            }
            productItems.insertBefore(options, productScroll);
            productContainer.appendChild(productItems);
        }
    // add id for all product-scrolling and handling with horizontal scrolling for all product scrolling
    const productLists = productContainer.querySelectorAll(".product-scroll");
    productLists.forEach((el, i) => {
        el.id = `product-scroll-${i}`;
        enableHorizontalScroll(el.id);
    }) 
    } catch (err) {
    productContainer.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
    throw err;
}
}

if (qs(".category-container")) {
// On page load, read URL and load products
window.addEventListener("DOMContentLoaded", () => {
    const { category, group, page } = getQueryParams();
    switch (page) {
        case "main":
            loadProducts(category);
            lis.forEach((li) => {
                li.classList.remove("active");
            })
            lis.forEach((li) => {
                if (li.innerText === category) {
                    li.classList.add("active");
                    // center selected li
                    centerLi(list, li);
                }
            })
            break;
        case "see-all":
            loadSeeAllProducts(category, group);
            break;
    }
});
// handle with all popstate events
window.addEventListener("popstate", () => {
    const { category, group, page } = getQueryParams();
    switch (page) {
        case "main":
            loadProducts(category);
            lis.forEach((li) => {
                li.classList.remove("active");
            })
            lis.forEach((li) => {
                if (li.innerText === category) {
                    li.classList.add("active");
                    // center selected li
                    centerLi(list, li);
                }
            })
            break;
        case "see-all":
            loadSeeAllProducts(category, group);
            break;
    }
});
}

// login and register page //
const hidePasswordIcons = qsa(".hide-password");
if (hidePasswordIcons) {
    hidePasswordIcons.forEach((icon) => {
        icon.addEventListener("click", () => {
            const passwordInput = qs("#exampleInputPassword1");
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                icon.classList.add("fa-eye");
                icon.classList.remove("fa-eye-slash");
            } else {
                passwordInput.type = "password";
                icon.classList.remove("fa-eye");
                icon.classList.add("fa-eye-slash");
            }
        })
    })
    
    const loginPageCloseBtn = qs(".login-header .btn-close");
    if (loginPageCloseBtn) {
        loginPageCloseBtn.addEventListener("click", () => {
            if (window.history.length > 1) {
                window.history.back(); // go back to the previous page
            } else {
                window.location.href = "/"; // fallback if no history
            }
        })
    }
}

const loginControlBtns = qsa(".login-control .btn-check");
const loginBtn = qs("#login-btn");
const loginContent = qs("#login-content");
const registerBtn = qs("#register-btn");
const registerContent = qs("#register-content");

function toggleForms() {

    if (loginBtn) {
        if (loginBtn.checked) {
            loginContent.style.display = "block";
            registerContent.style.display = "none";
        } else {
            loginContent.style.display = "none";
            registerContent.style.display = "block";
        }
    }
}

if (loginControlBtns) {
    loginControlBtns.forEach((btn) => {
        btn.addEventListener("click", toggleForms);
    });
    // run once on load
    toggleForms();
}

// show content according to url
window.addEventListener("load", () => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get("view");
    if (view === "login") {
        loginBtn.checked = true;
        loginContent.style.display = "block";
        registerContent.style.display = "none";
    } else if (view === "signup") {
        registerBtn.checked = true;
        loginContent.style.display = "none";
        registerContent.style.display = "block";
    }
})
// end login and register page //

// favorites page //
const favContent = qs("#fav-content");

async function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    // sort favorites by last added
    favorites.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    })
    // if no favorites found
    if (favorites.length === 0) {
        favContent.innerHTML = "<p class='text-center'>No favorites found</p>";
        return;
    }
    // regular expression to get id names
    const regex = /(\w+)-/i;
    favContent.innerHTML = "";
    try {
        favorites.forEach(async (idName) => {
            // get pure id name
            const pureIdName = idName.match(regex)[1];
            const response = await fetch(`data/${pureIdName}.json`);
            const data = await response.json();
            // put all products in one array
            let allProducts = [];
            Object.values(data).forEach((product) => {
                allProducts.push(...product);
            })
            // get product
            const product = allProducts.find((product) => (product.id === idName));
            // create product item
            const productItem = document.createElement("a");
            productItem.className = "card mb-3";
            productItem.href = `product-page.html?id=${idName}`;
            productItem.innerHTML = `
                <div class="row g-0">
                    <div class="col-4 p-3 text-center">
                    <img src="${product.image}" class="img-fluid rounded-start" alt="...">
                    </div>
                    <div class="col-8">
                    <div class="card-body">
                        <h5 class="card-title d-inline-block">${product.title}</h5>
                        <span class="card-text d-inline-block fs-7">${product.description}</span>
                        <div class="rate-container d-flex gap-1">
                            <div id="rate"></div>
                            <div>(${product.rating.count})</div>
                        </div>
                        <div class="price mt-auto text-danger">$${product.price}</div>
                    </div>
                    </div>
                </div>
            `;
            productItem.querySelector("#rate").innerHTML = addStars(product.rating.rate);
            favContent.appendChild(productItem);
        })
    } catch (err) {
        console.log(err);
    }
}
if (favContent) {
    loadFavorites();
}

// product page //
window.addEventListener("load", async () => {
    const productPageCard = qs("#product-page .card");
    if (productPageCard) {
        const params = new URLSearchParams(window.location.search);
        const regex = /(\w+)-/i;
        const category = params.get("id").match(regex)[1];
        const id = params.get("id");
        await loadProductPage(id, category, productPageCard);
        const cart = JSON.parse(localStorage.getItem("addToPageCart")) || [];
        if (cart.includes(id)) {
            qs(".add-to-cart button").innerText = "Added to Cart";
            qs(".add-to-cart button").style.backgroundColor = "gray";
            qs(".add-to-cart button").style.cursor = "not-allowed";
        }
    }
})

// load product page
async function loadProductPage(id, category, productPageCard) {
    try {
        const response = await fetch(`data/${category}.json`);
        const product = await response.json();
        let allProducts = [];
        Object.values(product).forEach((product) => {
            allProducts.push(...product);
        })
        const selectedProduct = allProducts.find((product) => product.id === id);
        productPageCard.innerHTML = `
            <div class="img-container text-center">
                <img src="${selectedProduct.image}" class="card-img-top img-fluid" alt="${selectedProduct.title}">
            </div>
            <hr>
            <div class="card-body">
                <h5 class="card-title d-inline-block">${selectedProduct.title}</h5>
                <span class="card-text d-inline-block">${selectedProduct.description}</span>
                <div class="rate-container d-flex gap-1">
                    <div id="rate">${addStars(selectedProduct.rating.rate)}</div>
                    <div>(${selectedProduct.rating.count})</div>
                </div>
            </div>
        `;
        const addToCart = document.createElement("div");
        addToCart.className = "add-to-cart";
        addToCart.innerHTML = `
            <div class="info">
                <div class="state fs-8">lowest price in the last 24 hours</div>
                <div class="price fs-5">$${selectedProduct.price}</div>
                <div class="shipping-state fs-8">free shipping</div>
            </div>
            <button style="background-color: var(--main-color);" class="btn text-light p-3">Add to Cart</button>
        `;
        addToCart.querySelector("button").addEventListener("click", () => {
            // add to cart to handle cart page
            const cart = JSON.parse(localStorage.getItem("addToPageCart")) || [];
            if (!cart.includes(id)) {
                addToCart.querySelector("button").innerText = "Added to Cart";
                addToCart.querySelector("button").style.backgroundColor = "gray";
                addToCart.querySelector("button").style.cursor = "not-allowed";
                cart.push(id);
                localStorage.setItem("addToPageCart", JSON.stringify(cart));
            }
        })
        productPageCard.parentElement.appendChild(addToCart);
    } catch (err) {
        throw err;
    }
}

// cart page //
const cartContent = qs("#cart-content");

async function loadCartProducts() {
    const cart = JSON.parse(localStorage.getItem("addToPageCart")) || [];
    try {
        cartContent.innerHTML = "";
        cart.forEach(async (id, index) => {
            const category = id.match(/(\w+)-/i)[1];
            const response = await fetch(`data/${category}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load: ${response.statusText}`);
            }
            const data = await response.json();
            // empty product container
            // get selected item
            let allItems = [];
            Object.values(data).forEach((item) => {
                allItems.push(...item);
            });
            const selectedItem = allItems.find((item) => item.id === id);
            // get unit price from local storage
            const unitPrice = JSON.parse(localStorage.getItem("cartData"))?.[id]?.quantity || 1;
            const totalPrice = +selectedItem.price * +unitPrice;
            // get checked state from local storage
            const isChecked = JSON.parse(localStorage.getItem("isChecked"))?.[id]?.checked ? "checked" : "";
            // create product item
            const productItem = document.createElement("div");
            productItem.className = "card row py-3 px-1 flex-row";
            productItem.innerHTML = `
                    <div class="checkbox col-2">
                        <input type="checkbox" name="checkItem" id="checkItem-${index}" data-check-price="${totalPrice}" data-id="${id}" ${isChecked}>
                        <label for="checkItem-${index}"></label>
                    </div>
                    <div class="col-8 row g-0">
                        <div class="col-4 p-3 d-flex align-items-center">
                            <img src="${selectedItem.image}" class="img-fluid rounded-start" alt="...">
                        </div>
                        <div class="col-8">
                            <div class="card-body">
                                <h5 class="card-title d-inline-block">${selectedItem.title}</h5>
                                <span class="card-text d-inline-block fs-7">${selectedItem.description}</span>
                                <div class="rate-container d-flex gap-1">
                                    <div id="rate"></div>
                                    <div>${selectedItem.rating.count}</div>
                                </div>
                                <div class="price mt-auto text-danger">$${totalPrice.toFixed(2)}</div>
                                <div id="rate"></div>
                            </div>
                        </div>
                    </div>
                    <div class="col-2 d-flex flex-column justify-content-between align-items-center">
                        <div id="delete">
                            <i class="fa-solid fa-trash"></i>
                        </div>
                        <div id="quantity" class="btn-group-vertical justify-content-center w-75" role="group" aria-label="Basic example">
                            <button class="btn btn-outline-secondary col-4 p-0" data-price="${selectedItem.price}">-</button>
                            <span id="quantity-${index}" class="col-4 text-center w-100">${unitPrice}</span>
                            <button class="btn btn-outline-secondary col-4 p-0" data-price="${selectedItem.price}">+</button>
                        </div>
                    </div>
                `;
                productItem.querySelector("#rate").innerHTML = addStars(selectedItem.rating.rate);
                cartContent.appendChild(productItem);
                // calling directly to update total price
                handleCheckBox();
                // add event listener to check box
                productItem.querySelector("[type='checkbox']").addEventListener("change", () => handleCheckBox())            
                // remove click event
                productItem.querySelector("#delete").addEventListener("click", () => {
                    const cart = JSON.parse(localStorage.getItem("addToPageCart")) || [];
                    cart.splice(cart.indexOf(id), 1);
                    localStorage.setItem("addToPageCart", JSON.stringify(cart));
                    loadCartProducts();
                })
                // quantity click event
                productItem.querySelector("#quantity").addEventListener("click", (e) => {
                    const quantity = productItem.querySelector("#quantity span");
                    const unitPrice = +e.target.dataset.price; // use container's data-price
                    
                    if (e.target.tagName === "BUTTON") {
                        if (e.target.textContent === "+") {
                            if (quantity.textContent == 10) return;
                            quantity.textContent++;
                        } else {
                            if (quantity.textContent == 1) return;
                            quantity.textContent--;
                        }
                        const totalPrice = +quantity.textContent * unitPrice;
                        productItem.querySelector(".price").innerText = `$${totalPrice.toFixed(2)}`;
    
                        const cartData = JSON.parse(localStorage.getItem("cartData")) || {};
                        cartData[id] = {
                            quantity: quantity.textContent
                        }
                        // set total price to local storage
                        localStorage.setItem("cartData", JSON.stringify(cartData));
                        // call handleCheckBox to update total price
                        handleCheckBox();
                    }
                    
                });  
            })
            // function to handle with changes of check box to add to total price
            function handleCheckBox() {
                const isChecked = JSON.parse(localStorage.getItem("isChecked")) || {};
                const checkedItems = [...qsa("[type='checkbox']")].filter((item) => {
                    if (item.checked) {
                        isChecked[item.dataset.id] = {
                            checked: true,
                        };
                        return item;
                    }
                    if (!item.checked) {
                        isChecked[item.dataset.id] = {
                            checked: false,
                        };
                    }
                });
                localStorage.setItem("isChecked", JSON.stringify(isChecked));
                
                const allProductItems = [...qsa(".card")];
                const itemsPrices = checkedItems.map((item) => {
                    const productItem = allProductItems.find((product) => product.querySelector(".checkbox input").id === item.id);
                    return +productItem.querySelector(".price").textContent.replace("$", "");
                });

                const totalPrice = itemsPrices.reduce((total, price) => total + +price, 0);
                footer.querySelector("#totalPrice").innerHTML = `$${totalPrice.toFixed(2)}`;
            }
            // create footer
            const footer = document.createElement("div");
            footer.className = "footer";
            footer.innerHTML = `
            <div>Total Price: <span id="totalPrice">$0.00</span></div>
            <a href="user-information.html" class="btn btn-primary">Checkout</a>
            `;
            cartContent.parentElement.appendChild(footer);          
        } catch (err) {
        console.error(err);
    }
}

if (cartContent) {
    loadCartProducts();
}

// phone input //
const input = qs("#phone");
const selectedItem = qs(".selected-phone-code");
const phoneSelect = qs(".phone-code-select-container");

async function loadPhoneCodes() {
    try {
        const response = await fetch("data/Countries.json");
        const data = await response.json();
        const countries = data;
        const phoneList = document.createElement("ul");
        phoneList.className = "phone-list";
        let currentPrefix = "+90";
        countries.forEach((country) => {
            const phoneItem = document.createElement("li");
            phoneItem.innerHTML = `
            <img src="../assets/svg/${country.image}" alt="${country.name}">
            <span>${country.code}</span>
            `;
            phoneList.appendChild(phoneItem);
            // add click event
            phoneItem.addEventListener("click", () => {
                phoneSelect.querySelectorAll("li").forEach((li) => li.classList.remove("active"));
                phoneItem.classList.add("active");
                const prefix = country.dial_code;
                currentPrefix = prefix;
                selectedItem.querySelector("img").src = `assets/svg/${country.image}`;
                selectedItem.querySelector("span").textContent = country.code;
                phoneSelect.classList.remove("active");
                selectedItem.querySelector("i").classList.toggle("fa-chevron-down");
                input.value = prefix + " ";
            })
        })
        phoneSelect.appendChild(phoneList);
        input.addEventListener("input", () => handleInput(currentPrefix));
        // Prevent deleting prefix or moving before it
        input.addEventListener("keydown", (e) => preventDeletingPrefix(e, currentPrefix));
        // Keep cursor after prefix on click
        input.addEventListener("click", () => {
            if (input.selectionStart < currentPrefix.length + 1) {
                input.setSelectionRange(currentPrefix.length , currentPrefix.length + 1);
            }
        });
    } catch (err) {
        console.error(err);
    }
}
// handle input function
function handleInput(phoneCode) {
    let prefix = phoneCode + " ";
    // Keep prefix intact
    if (!input.value.startsWith(prefix)) {
        input.value = prefix;
    }
    // Get digits only after prefix
    let value = input.value.replace(prefix, "").replace(/\D/g, "");

    // insert spaces: 3-3-2-2 pattern
    const parts = [];
    if (value.length > 0) parts.push(value.substring(0, 3));
    if (value.length > 3) parts.push(value.substring(3, 6));
    if (value.length > 6) parts.push(value.substring(6, 8));
    if (value.length > 8) parts.push(value.substring(8, 10));

    input.value = prefix + parts.join(" ");
}
// Prevent deleting prefix or moving before it
function preventDeletingPrefix(e, prefix) {
        if (
            input.selectionStart <= prefix.length + 1 &&
            (e.key === "Backspace" || e.key === "ArrowLeft")
        ) {
            e.preventDefault();
        }
}
if (input) {
    // load phone codes
    loadPhoneCodes();
    // show and hide select list
    selectedItem.querySelector("i").addEventListener("click", () => {
        phoneSelect.classList.toggle("active");
        selectedItem.querySelector("i").classList.toggle("fa-chevron-down");
    })
    // close select list when click outside
    document.addEventListener("click", (e) => {
        if (!selectedItem.contains(e.target) && phoneSelect.classList.contains("active")) {
            phoneSelect.classList.remove("active");
            selectedItem.querySelector("i").classList.toggle("fa-chevron-down");
        }
    })
}
// phone input end //

// country select //
const selectedCountry = qs(".selected-country-name");
const countrySelect = qs(".country-select-container");
async function loadCountries() {
    try {
        const response = await fetch("../data/Countries-and-Cities.json");
        const data = await response.json();
        const countries = Object.keys(data);
        const countryList = document.createElement("ul");
        countryList.className = "country-list";
        countries.forEach((country) => {
            const countryItem = document.createElement("li");
            countryItem.innerHTML = `<span>${country}</span>`;
            countryList.appendChild(countryItem);
            // add click event
            countryItem.addEventListener("click",async () => {
                countrySelect.querySelectorAll("li").forEach((li) => li.classList.remove("active"));
                countryItem.classList.add("active");
                selectedCountry.querySelector("input").value = country;
                countrySelect.classList.remove("active");
                selectedCountry.querySelector("i").classList.toggle("fa-chevron-down");
                // set performance measure to calculate loadCities time
                performance.mark("measure-start");
                await loadCities(country);
                performance.mark("measure-end");
                let time = performance.measure("measure", "measure-start", "measure-end");
                setTimeout(() => {
                    qs(".city-select-container").scrollTo({
                        top: 0,
                        behavior: "smooth",
                    })
                    // remove performance measure
                    performance.clearMarks();
                    performance.clearMeasures();
                // increase 1 second to avoid delays
                }, time.duration + 1000);
            })
        })
        countrySelect.appendChild(countryList);
    } catch (err) {
        console.error(err);
    }
}
if (selectedCountry) {
    // load countries
    loadCountries();
    // show and hide select list
    selectedCountry.querySelector("i").addEventListener("click", () => {
        countrySelect.classList.toggle("active");
        selectedCountry.querySelector("i").classList.toggle("fa-chevron-down");
    })
    // close select list when click outside
    document.addEventListener("click", (e) => {
        if (!selectedCountry.contains(e.target) && countrySelect.classList.contains("active")) {
            countrySelect.classList.remove("active");
            selectedCountry.querySelector("i").classList.toggle("fa-chevron-down");
        }
    })
}
// country select end //

// city select //
const selectedCity = qs(".selected-city-name");
const citySelect = qs(".city-select-container");
async function loadCities(country) {
    citySelect.innerHTML = "";
    try {
        const response = await fetch("../data/Countries-and-Cities.json");
        const data = await response.json();
        const cities = data[country];
        const cityList = document.createElement("ul");
        cityList.className = "city-list";
        cities.forEach((city, ind) => {
            // fill selected city name
            if (ind === 0 ) selectedCity.querySelector("input").value = city;
            const cityItem = document.createElement("li");
            cityItem.innerHTML = `<span>${city}</span>`;
            cityList.appendChild(cityItem);
            // add click event
            cityItem.addEventListener("click",async () => {
                citySelect.querySelectorAll("li").forEach((li) => li.classList.remove("active"));
                cityItem.classList.add("active");
                selectedCity.querySelector("input").value = city;
                citySelect.classList.remove("active");
                selectedCity.querySelector("i").classList.toggle("fa-chevron-down");
            })
        })
        citySelect.appendChild(cityList);
    } catch (err) {
        console.error(err);
    }
}
if (selectedCity) {
    // load cities
    loadCities("Türkiye");
    // show and hide select list
    selectedCity.querySelector("i").addEventListener("click", () => {
        citySelect.classList.toggle("active");
        selectedCity.querySelector("i").classList.toggle("fa-chevron-down");
    })
    // close select list when click outside
    document.addEventListener("click", (e) => {
        if (!selectedCity.contains(e.target) && citySelect.classList.contains("active")) {
            citySelect.classList.remove("active");
            selectedCity.querySelector("i").classList.toggle("fa-chevron-down");
        }
    })
}
// city select end //

// date picker //
const monthPicker = document.getElementById('month-picker');
const yearPicker = document.getElementById('year-picker');
const expirationInput = document.getElementById("card-expiration-date");
const closeBtn = document.getElementById("close-btn");

if (expirationInput) {
closeBtn.addEventListener("click", () => {
    const month = monthPicker.querySelector(".active").textContent;
    const year = yearPicker.querySelector(".active").textContent.slice(2);

    expirationInput.value = [month, year].join("/");
})

// Fill months
for (let m = 0; m <= 13; m++) {
    const div = document.createElement('div');
    if (m === 0) {
        div.textContent = "";
    } else if (m === 13) {
        div.textContent = "";
    } else {
        div.textContent = m.toString().padStart(2, '0');
    }
    monthPicker.appendChild(div);
}

// Fill years
const currentYear = new Date().getFullYear();
for (let y = currentYear - 1; y <= currentYear + 11; y++) {
    const div = document.createElement('div');
    if (y === currentYear - 1) {
        div.textContent = "";
    } else if (y === currentYear + 11) {
        div.textContent = "";
    } else {
        div.textContent = y;
    }
    yearPicker.appendChild(div);
}

function updateActive(picker) {
    const items = picker.querySelectorAll('div');
    const scrollMid = picker.scrollTop + picker.offsetHeight / 2;
    items.forEach(div => {
        const divMid = div.offsetTop + div.offsetHeight / 2;
        div.classList.toggle('active', Math.abs(divMid - scrollMid) < 20);
    });
}

// Add focus effect
function setFocused(picker, isFocused) {
    if (isFocused) {
        picker.classList.add('focused');
    } else {
        picker.classList.remove('focused');
    }
}

[monthPicker, yearPicker].forEach(picker => {
    picker.addEventListener('scroll', () => {
        requestAnimationFrame(() => updateActive(picker));
    });

    picker.addEventListener('focusin', () => setFocused(picker, true));
    picker.addEventListener('focusout', () => setFocused(picker, false));
    picker.addEventListener('mouseenter', () => setFocused(picker, true));
    picker.addEventListener('mouseleave', () => setFocused(picker, false));

    updateActive(picker);
});
};
// date picker end //

// form validation
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()


//***** end for mobile *****//
 
