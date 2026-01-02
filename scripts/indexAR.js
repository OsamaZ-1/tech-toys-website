// Add header category buttons ------------------------------------
const options = [
    "ألعاب STEM",
    "ألعاب تعليمية",
    "الروبوتات والبرمجة",
    "ألعاب ذكية",
    "ألعاب البناء والتشييد",
    "مجموعات العلوم",
    "إلكترونيات وأدوات ذكية",
    "ألعاب التحكم عن بُعد",
    "ألغاز وألعاب تنمية الذكاء",
    "مجموعات إبداعية وأعمال يدوية",
    "ألعاب مونتيسوري",
    "ألعاب تقنية للأنشطة الخارجية",
    "ألعاب تفاعلية وألعاب الفيديو",
    "تقنيات قابلة للارتداء للأطفال"
];

const container = document.getElementById("header-buttons");

options.forEach((opt, index) => {
    const btn = document.createElement("button");

    // First button (active/default) style
    if (index === 0) {
        btn.className = "flex shrink-0 items-center justify-center gap-x-1.5 rounded-full bg-[#913435] dark:bg-white px-4 py-1.5 transition-transform active:scale-95";
    } else {
        btn.className = "flex shrink-0 items-center justify-center gap-x-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-1.5 transition-transform active:scale-95";
    }

    const span = document.createElement("span");
    span.className = index === 0 ? "text-white dark:text-slate-900 text-sm font-bold" : "text-slate-700 dark:text-slate-200 text-sm font-medium";
    span.textContent = opt;

    btn.appendChild(span);

    // Click navigates to /shop.html?category=...
    btn.addEventListener("click", () => {
        window.location.href = `/shop.html?category=${encodeURIComponent(opt)}`;
    });

    container.appendChild(btn);
});

// ---------------------------------------------------------

// Get Featured Products
const WEB_APP_URL = "/.netlify/functions/proxy";
async function fetchProducts() {
  try {
    const response = await fetch(WEB_APP_URL);
    const data = await response.json();

    // Map the API fields to the format used in our grid
    const formattedData = data
        .filter(item => item.featured === true)
        .reverse()
        .map(item => ({
            itemNo: item.itemNo,
            name: item.nameAR,
            price: item.price,
            images: item.images,
            age: item.ageAR,
        }));

    return formattedData;
  } catch (err) {
    console.error("Failed to fetch products:", err);
    return [];
  }
}

async function renderFeaturedProds() {
    const featuredProducts = await fetchProducts();

    // Assuming `featuredProducts` is your filtered array
    const container = document.getElementById("featured-cards");

    featuredProducts.forEach(item => {
        const card = document.createElement("div");
        card.className = "flex-none w-[180px] snap-start group cursor-pointer";
        card.onclick = () => {
            window.location.href = `/ar/item.html?itemNo=${encodeURIComponent(item.itemNo)}`;
        };

        card.innerHTML = `
            <div class="relative w-full aspect-square bg-white dark:bg-slate-800 rounded-2xl overflow-hidden mb-3 border border-slate-100 dark:border-slate-700 shadow-sm">
            <img
                alt="${item.name}"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                data-alt="${item.name}"
                src="${item.images || ''}"
                onerror="
                  if(!this.retries) this.retries = 7;
                  if(this.retries-- > 0){
                    setTimeout(() => { this.src = this.dataset.src; }, 5000);
                  }
                "
            />
            <div class="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-sm text-[10px] font-bold text-white uppercase tracking-wider">
                ${item.age || '—'}
            </div>
            </div>

            <div class="flex flex-col gap-1">
            <h3 class="font-bold text-slate-900 dark:text-white truncate">
                ${item.name}
            </h3>
            <div class="flex items-center justify-between mt-1">
                <span class="text-lg font-black text-slate-900 dark:text-white">
                $${item.price}
                </span>
                <button
                class="h-8 w-8 rounded-full bg-primary hover:bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-primary/20 transition-transform active:scale-90"
                >
                <span class="material-symbols-outlined text-[20px]">add</span>
                </button>
            </div>
            </div>
        `;

        container.appendChild(card);
    });
}

renderFeaturedProds();

function enableHorizontalDragScroll(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let isDown = false;
  let startX;
  let scrollLeft;
  let isDragging = false;

  container.style.cursor = "grab";
  container.style.overflowX = "auto";
  container.style.userSelect = "none";

  container.addEventListener("mousedown", (e) => {
    isDown = true;
    isDragging = false;
    container.style.cursor = "grabbing";
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
  });

  container.addEventListener("mouseleave", () => {
    isDown = false;
    container.style.cursor = "grab";
  });

  container.addEventListener("mouseup", () => {
    isDown = false;
    container.style.cursor = "grab";
    setTimeout(() => isDragging = false, 0); // reset after click event
  });

  container.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX);
    if (Math.abs(walk) > 2) isDragging = true;
    container.scrollLeft = scrollLeft - walk;
  });

  container.addEventListener("click", (e) => {
    if (isDragging) {
      e.stopPropagation();
      e.preventDefault();
    }
  }, true); // useCapture=true so it triggers before child clicks

  // Touch support
  container.addEventListener("touchstart", (e) => {
    isDown = true;
    isDragging = false;
    startX = e.touches[0].pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
  });

  container.addEventListener("touchmove", (e) => {
    if (!isDown) return;
    const x = e.touches[0].pageX - container.offsetLeft;
    const walk = (x - startX);
    if (Math.abs(walk) > 2) isDragging = true;
    container.scrollLeft = scrollLeft - walk;
  });

  container.addEventListener("touchend", () => {
    isDown = false;
    setTimeout(() => isDragging = false, 0);
  });
}

enableHorizontalDragScroll("header-buttons");
enableHorizontalDragScroll("featured-cards");