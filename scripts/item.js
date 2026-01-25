// 3️⃣ Fetch products
const WEB_APP_URL = "/.netlify/functions/proxy";
async function fetchProducts() {
  try {
    const params = new URLSearchParams(window.location.search);
    const itemNo = params.get("itemNo");

    const response = await fetch(`${WEB_APP_URL}?itemNo=${encodeURIComponent(itemNo)}`);
    const data = await response.json();

    return data;
  } catch (err) {
    console.error("Failed to fetch products:", err);
    return null;
  }
}

let theItem = undefined;
async function renderProduct() {
    const item = await fetchProducts();
    theItem = item;

    const scroller = document.getElementById("imageScroller");

    // Clear previous images (important if reused)
    scroller.innerHTML = "";

    // Split image URLs
    const images = item.images ? item.images.split("|||") : [];

    // Fallback if no images
    if (!images.length) {
      images.push(""); // empty placeholder
    }

    images.forEach(url => {
      const slide = document.createElement("div");
      slide.className =
        "snap-center shrink-0 w-full p-6 flex items-center justify-center";

      slide.innerHTML = `
        <div class="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/50">
          
          <!-- Loading skeleton -->
          <div class="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-700"></div>

          <!-- Image -->
          <div
            class="absolute inset-0 bg-cover bg-center bg-retry"
            data-src="${url}"
            data-retries="7"
          ></div>

        </div>
      `;

      const bgEl = slide.querySelector(".bg-retry");
      const skeleton = slide.querySelector(".animate-pulse");

      applyBgRetry(bgEl, skeleton);

      scroller.appendChild(slide);
    });




    document.getElementById("item-name").textContent = item.name;
    document.getElementById("item-price").textContent = `$${item.price}`;
    document.getElementById("item-price-before").textContent = item.priceBefore !== "" ? `$${item.priceBefore}` : "";
    document.getElementById("item-age").textContent = item.age;
    document.getElementById("item-category").textContent = item.category;
    document.getElementById("item-gender").textContent = item.gender;
    document.getElementById("item-desc").textContent = item.description;
    
    // Tag Fuctionality
    const tagEl = document.getElementById("item-tag");
    // SOLD OUT takes priority
    if (Number(item.quantity) === 0) {
        tagEl.textContent = "Sold Out!";
        tagEl.style.backgroundColor = "#fee2e2"; // red-100
        tagEl.style.color = "#991b1b"; // red-800

        // disable order button
        document.getElementById("orderBtn").disabled = true;
        document.getElementById("orderBtn").style.backgroundColor = "grey";
        document.getElementById("item-quantity").textContent = "0";
    }

    // Custom tag
    else if (item.tag) {
        tagEl.textContent = item.tag;
        tagEl.style.backgroundColor = item.tagColor || "#e5e7eb"; // fallback gray
        tagEl.style.color = getTextColorForBg(item.tagColor || "#e5e7eb");
    }

    // Default: In stock
    else{
        tagEl.textContent = "In stock";
        tagEl.style.backgroundColor = "#dcfce7"; // green-100
        tagEl.style.color = "#166534"; // green-800
    }
}

renderProduct();

function applyBgRetry(el, skeleton) {
  let retries = parseInt(el.dataset.retries || "7", 10);
  const primary = el.dataset.src;
  const fallback = el.dataset.fallback;

  function tryLoad(src) {
    const img = new Image();

    img.onload = () => {
      el.style.backgroundImage = `url('${src}')`;

      // hide loading animation
      if (skeleton) skeleton.style.display = "none";
    };

    img.onerror = () => {
      if (retries-- > 0) {
        setTimeout(() => tryLoad(fallback), 5000);
      } else {
        // optional: keep skeleton or show error color
        if (skeleton) {
          skeleton.classList.remove("animate-pulse");
          skeleton.classList.add("bg-red-100", "dark:bg-red-900/30");
        }
      }
    };

    img.src = src;
  }

  tryLoad(primary);
}

function minusQty(){
    let qtyDisplay = document.getElementById("item-quantity");
    let qty = Number(document.getElementById("item-quantity").textContent);

    if (qty - 1 < 0)
        qtyDisplay.textContent = "" + 0;
    else
        qtyDisplay.textContent = "" + (qty - 1);
}

function plusQty(){
    let qtyDisplay = document.getElementById("item-quantity");
    let qty = Number(document.getElementById("item-quantity").textContent);
    
    if (qty + 1 > theItem.quantity)
        qtyDisplay.textContent = "" + theItem.quantity;
    else
        qtyDisplay.textContent = "" + (qty + 1);
}

function openWhatsApp() {
  const phoneNumber = "96171146695"; // WhatsApp number (no spaces or symbols)
  let url = `https://wa.me/${phoneNumber}`;

  let message = `Hello, I would like to order ${document.getElementById("item-quantity").textContent} of ${theItem.name} if you please.`;

  // If message is provided, encode it and add to the URL
  if (message.trim() !== "") {
    const encodedMessage = encodeURIComponent(message);
    url += `?text=${encodedMessage}`;
  }

  window.open(url, "_blank"); // Opens WhatsApp in a new tab/window
}

function toggleHeart() {
    const heartBtn = document.getElementById("heartBtn");
    heartBtn.classList.toggle("text-slate-400");
    heartBtn.classList.toggle("text-red-500");
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

enableHorizontalDragScroll("badges");