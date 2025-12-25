// 3️⃣ Fetch products
const WEB_APP_URL = "/.netlify/functions/proxy";
async function fetchProducts() {
  try {
    const response = await fetch(WEB_APP_URL);
    const data = await response.json();

    // Map the API fields to the format used in our grid
    const formattedData = data.reverse().map(item => ({
      name: item.name,
      price: `$${item.price}`, // add $ sign
      image: item.images,
      category: item.category,
      age: item.age,
      tag: item.tag,
      tagColor: item.tagColor
    }));

    return formattedData;
  } catch (err) {
    console.error("Failed to fetch products:", err);
    return [];
  }
}


// Code to Load image batches for all available products ---------------------------------------------
let allProducts = [];   // store all fetched products
let displayedProducts = []; // currently shown products
let productsPerLoad = 10;
let lastLoadedIndex = 0;

async function initProducts() {
    allProducts = await fetchProducts(); // fetch from API
    displayedProducts = allProducts;     // initially show all
    lastLoadedIndex = 0;
    loadMoreProducts();                  // load first batch
}

// Function to render products
function renderProducts(products) {
  const grid = document.getElementById("product-grid");

  products.forEach(product => {
    const card = document.createElement("div");

    card.className =
      "group bg-card-light dark:bg-card-dark rounded-2xl p-3 shadow-card hover:shadow-soft transition-all duration-300 flex flex-col h-full";

    card.innerHTML = `
      <div class="relative w-full aspect-square rounded-lg overflow-hidden mb-3 bg-gray-100 dark:bg-gray-800">
        <img
          src="${product.images || ''}"
          alt="${product.name}"
          loading="lazy"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
          onclick="openImageModal?.(this.src)"
        />

        ${
          product.tag
            ? `
          <div
            class="absolute top-2 left-2 px-2 py-1 rounded-lg backdrop-blur-sm text-xs font-bold uppercase tracking-wider"
            style="background:${product.tagColor || '#ffffffcc'}; color:#111;"
          >
            ${product.tag}
          </div>`
            : ""
        }
      </div>

      <div class="flex flex-col flex-grow">
        <h3 class="text-slate-900 dark:text-white font-medium text-base leading-tight mb-1 line-clamp-2">
          ${product.name}
        </h3>

        <div class="flex items-center gap-1 mb-2">
          <span class="text-[11px] text-slate-500">Age:</span>
          <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">
            ${product.age || "—"}
          </span>
        </div>

        <div class="mt-auto flex items-center justify-between">
          <span class="text-slate-900 dark:text-white font-extrabold text-lg">
            ${product.price}
          </span>

          <button
            class="flex items-center justify-center w-9 h-9 bg-primary hover:bg-primary-dark rounded-full text-white shadow-lg shadow-primary/30 transition-transform active:scale-90"
            onclick="openWhatsApp('Hi TechToys! I want this toy: ${product.name}')"
          >
            <span class="material-symbols-outlined text-[20px]">add</span>
          </button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}


function loadMoreProducts() {
  const nextProducts = displayedProducts.slice(
    lastLoadedIndex,
    lastLoadedIndex + productsPerLoad
  );

  if (nextProducts.length === 0) {
    document.getElementById("infinite-loader").style.display = "none";
    return;
  }

  renderProducts(nextProducts);
  lastLoadedIndex += nextProducts.length;
}

// Initiate
initProducts();

const loader = document.getElementById("infinite-loader");

const observer = new IntersectionObserver(
  entries => {
    if (entries[0].isIntersecting) {
      loadMoreProducts();
    }
  },
  {
    root: null,
    rootMargin: "200px",
    threshold: 0
  }
);

observer.observe(loader);

// ---------------------------------------------------------------------------------------------

// Filter Categories function
function filterCategories(category, event) {
    // Reset load state
    lastLoadedIndex = 0;

    // Filter products
    if (category === "All") {
        displayedProducts = allProducts;
    } else {
        displayedProducts = allProducts.filter(p => p.category === category);
    }

    // Clear grid
    const grid = document.getElementById("product-grid");
    grid.innerHTML = "";

    // Load first batch of filtered products
    loadMoreProducts();

    // Update button styles
    const buttons = document.querySelectorAll("#shop-section .flex.cursor-pointer");
    buttons.forEach(btn => {
        btn.classList.remove("bg-secondary/20", "text-secondary-darker");
        btn.classList.add("bg-subtle-light", "dark:bg-subtle-dark");
    });

    // Highlight the clicked button
    const clickedBtn = event.currentTarget;
    clickedBtn.classList.remove("bg-subtle-light", "dark:bg-subtle-dark");
    clickedBtn.classList.add("bg-secondary/20", "text-secondary-darker");
}


function openWhatsApp(message = "") {
  const phoneNumber = "96181006103"; // WhatsApp number (no spaces or symbols)
  let url = `https://wa.me/${phoneNumber}`;

  // If message is provided, encode it and add to the URL
  if (message.trim() !== "") {
    const encodedMessage = encodeURIComponent(message);
    url += `?text=${encodedMessage}`;
  }

  window.open(url, "_blank"); // Opens WhatsApp in a new tab/window
}

function scrollToElement(id, offset = 0) {
  const element = document.getElementById(id);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const scrollPosition = elementPosition - offset; // scroll a bit above
    window.scrollTo({
      top: scrollPosition,
      behavior: "smooth"
    });
  }
}

// Open Larger item image
// function openImageModal(imgSrc) {
//   const modal = document.getElementById("imageModal");
//   const modalImg = document.getElementById("modalImage");

//   modalImg.src = imgSrc;
//   modal.classList.remove("hidden");
//   modal.classList.add("flex");
// }

// function closeImageModal() {
//   const modal = document.getElementById("imageModal");
//   modal.classList.add("hidden");
//   modal.classList.remove("flex");
// }


// // Scroll Filter Buttons with mouse
// const slider = document.getElementById("chips-scroll");
// let isDown = false;
// let startX;
// let scrollLeft;

// slider.addEventListener("mousedown", (e) => {
//   isDown = true;
//   slider.classList.add("cursor-grabbing");
//   startX = e.pageX - slider.offsetLeft;
//   scrollLeft = slider.scrollLeft;
// });

// slider.addEventListener("mouseleave", () => {
//   isDown = false;
//   slider.classList.remove("cursor-grabbing");
//   document.body.style.userSelect = ""; // ✅ restore
// });

// slider.addEventListener("mouseup", () => {
//   isDown = false;
//   slider.classList.remove("cursor-grabbing");
//   document.body.style.userSelect = ""; // ✅ restore
// });

// slider.addEventListener("mousemove", (e) => {
//   if (!isDown) return;
//   const x = e.pageX - slider.offsetLeft;
//   const walk = (x - startX) * 2; // drag speed
//   slider.scrollLeft = scrollLeft - walk;
// });
