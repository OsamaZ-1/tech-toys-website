// 3️⃣ Fetch products
const WEB_APP_URL = "/.netlify/functions/proxy";
async function fetchProducts() {
  try {
    const response = await fetch(WEB_APP_URL);
    const data = await response.json();

    // Map the API fields to the format used in our grid
    const formattedData = data.reverse().map(item => ({
      itemNo: item.itemNo,
      name: item.nameAR,
      price: item.price, // add $ sign
      images: item.images,
      category: item.categoryAR,
      age: item.ageAR,
      gender: item.genderAR,
      tag: item.tagAR,
      tagColor: item.tagColor,
      qty: item.quantity
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

let infiniteObserver;
let loader;

async function initProducts() {
  allProducts = await fetchProducts();
  displayedProducts = allProducts;
  lastLoadedIndex = 0;

  document.getElementById("product-grid").innerHTML = "";
  document.getElementById("infinite-loader").style.display = "flex";

  applyFiltersFromQuery();

  resetInfiniteScroll();

  // loadMoreProducts(); // first batch
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
          src="${product.images.split("|||")[0] || ''}"
          alt="${product.name}"
          loading="lazy"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
          onclick="window.location.href='/ar/item.html?itemNo=${product.itemNo}'"
          onerror="
            if(!this.retries) this.retries = 7;
            if(this.retries-- > 0){
              setTimeout(() => { this.src='${product.image}'; }, 5000);
            }
          "
        />

        ${
          product.qty === 0
            ? `
              <div
                class="absolute top-2 left-2 px-2 py-1 rounded-lg backdrop-blur-sm text-xs font-bold uppercase tracking-wider bg-red-500 text-white"
              >
                نفذت الكمية
              </div>`
            : product.tag
              ? `
                <div
                  class="absolute top-2 left-2 px-2 py-1 rounded-lg backdrop-blur-sm text-xs font-bold uppercase tracking-wider"
                  style="
                    background: ${product.tagColor || "#ffffffcc"};
                    color: ${getTextColorForBg(product.tagColor)};
                  "
                >
                  ${product.tag}
                </div>`
              : `
                <div
                  class="hidden absolute top-2 left-2 px-2 py-1 rounded-lg backdrop-blur-sm text-xs font-bold uppercase tracking-wider bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                >
                  موجود
                </div>`
        }

      </div>

      <div class="flex flex-col flex-grow">
        <h3 class="text-slate-900 dark:text-white font-medium text-base leading-tight mb-1 line-clamp-2">
          ${product.name}
        </h3>

        <div class="flex items-center gap-1 mb-2">
          <span class="text-[11px] text-slate-500">العمر:</span>
          <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">
            ${product.age || "—"}
          </span>
        </div>

        <div class="mt-auto flex items-center justify-between">
          <span class="text-slate-900 dark:text-white font-extrabold text-lg">
            $${product.price}
          </span>

          <button
            class="flex items-center justify-center w-9 h-9 bg-primary hover:bg-primary-dark rounded-full text-white shadow-lg shadow-primary/30 transition-transform active:scale-90"
            onclick="window.location.href='/ar/item.html?itemNo=${product.itemNo}'"
          >
            <span class="material-symbols-outlined text-[20px]">add</span>
          </button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

let isLoading = false;

function loadMoreProducts() {
  if (isLoading) return;

  isLoading = true;

  const nextProducts = displayedProducts.slice(
    lastLoadedIndex,
    lastLoadedIndex + productsPerLoad
  );

  if (nextProducts.length === 0) {
    // No more products → hide loader
    document.getElementById("infinite-loader").style.display = "none";
    isLoading = false;
    return;
  }

  setTimeout(() => {
      renderProducts(nextProducts);
      lastLoadedIndex += nextProducts.length;
      isLoading = false;
    }, 500); // 500ms delay to show loading
}


// Infinite Loader Fuction
document.addEventListener("DOMContentLoaded", async () => {
  loader = document.getElementById("infinite-loader");
  if (!loader) return;

  infiniteObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadMoreProducts();
      }
    });
  },
  {
    root: null,
    rootMargin: "200px",
    threshold: 0
  }
);

  await initProducts(); // first batch loads

  infiniteObserver.observe(loader);
});

// ---------------------------------------------------------------------------------------------

// Filter Categories Modal
const filterModal = document.getElementById("filterModal");
document.getElementById("openFilters").onclick = () => {
  filterModal.classList.remove("hidden");
};

document.getElementById("closeFilters").onclick = () => {
  filterModal.classList.add("hidden");
};

// Close when clicking overlay
filterModal.addEventListener("click", e => {
  if (e.target === filterModal) {
    filterModal.classList.add("hidden");
  }
});

function applyFilters() {
  const maxPrice = parseFloat(document.getElementById("filter-price").value);
  const age = document.getElementById("filter-age").value;
  const category = document.getElementById("filter-category").value;
  const gender = document.getElementById("filter-gender").value;

  displayedProducts = allProducts.filter(p => {
    if (maxPrice && parseFloat(p.price) > maxPrice) return false;
    if (age && p.age !== age) return false;
    if (category && p.category !== category) return false;
    if (gender && p.gender !== gender) return false;
    return true;
  });

  // Reset and reload
  document.getElementById("product-grid").innerHTML = "";
  lastLoadedIndex = 0;

  resetInfiniteScroll();

  // loadMoreProducts();

  filterModal.classList.add("hidden");
}

// Clear Filters
document.getElementById("clearFilters").onclick = () => {
  document.getElementById("filter-price").value = "";
  document.getElementById("filter-age").value = "";
  document.getElementById("filter-category").value = "";
  document.getElementById("filter-gender").value = "";

  displayedProducts = allProducts;
  lastLoadedIndex = 0;
  isLoading = false;
  
  document.getElementById("product-grid").innerHTML = "";
  
  resetInfiniteScroll();

  // loadMoreProducts();

  filterModal.classList.add("hidden");
};

// Open Sort Modal
const sortModal = document.getElementById("sortModal");

document.getElementById("openSort").onclick = () => {
  sortModal.classList.remove("hidden");
};

document.getElementById("closeSort").onclick = () => {
  sortModal.classList.add("hidden");
};

// Close on overlay click
sortModal.addEventListener("click", e => {
  if (e.target === sortModal) {
    sortModal.classList.add("hidden");
  }
});

// Sorting Functionality
document.querySelectorAll(".sort-option").forEach(btn => {
  btn.addEventListener("click", () => {
    const type = btn.dataset.sort;

    displayedProducts.sort((a, b) => {
      const priceA = parseFloat(a.price);
      const priceB = parseFloat(b.price);

      return type === "price-asc"
        ? priceA - priceB
        : priceB - priceA;
    });

    // Reset grid + infinite scroll index
    document.getElementById("product-grid").innerHTML = "";
    lastLoadedIndex = 0;

    resetInfiniteScroll();

    // loadMoreProducts();

    sortModal.classList.add("hidden");
  });
});

function resetInfiniteScroll() {
  // FORCE intersection reset
  loader.style.display = "none";

  requestAnimationFrame(() => {
    loader.style.display = "flex";

    infiniteObserver.unobserve(loader);
    infiniteObserver.observe(loader);
  });
}

function openWhatsApp(message = "") {
  const phoneNumber = "96171146695"; // WhatsApp number (no spaces or symbols)
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

function getTextColorForBg(hexColor) {
  if (!hexColor) return "#111";

  // Remove #
  const hex = hexColor.replace("#", "");

  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Perceived brightness (WCAG)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // Light bg → dark text, Dark bg → white text
  return brightness > 155 ? "#111" : "#fff";
}

// Call this on page load
function applyFiltersFromQuery() {
  const params = new URLSearchParams(window.location.search);

  // Example filters
  const age = params.get("age");
  const category = params.get("category");

  // Set inputs if they exist
  if (age) {
    const ageInput = document.getElementById("filter-age");
    if (ageInput) ageInput.value = age;
  }

  if (category) {
    const categoryInput = document.getElementById("filter-category");
    if (categoryInput) categoryInput.value = category;
  }

  // Apply the filtering logic
  applyFilters();
}
