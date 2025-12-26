// 3️⃣ Fetch products
const WEB_APP_URL = "/.netlify/functions/proxy";
async function fetchProducts() {
  try {
    const params = new URLSearchParams(window.location.search);
    const itemNo = params.get("itemNo");

    const response = await fetch(`${WEB_APP_URL}?action=getOne&itemNo=${encodeURIComponent(itemNo)}`);
    const data = await response.json();

    return data;
  } catch (err) {
    console.error("Failed to fetch products:", err);
    return [];
  }
}

let theItem = undefined;
async function renderProduct() {
    const item = await fetchProducts();
    theItem = item;

    document.getElementById("item-img").style.backgroundImage = `url('${item.images}')`;
    document.getElementById("item-name").textContent = item.name;
    document.getElementById("item-price").textContent = `$${item.price}`;
    document.getElementById("item-price-before").textContent = `$${item.priceBefore}`;
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
        document.getElementById("orderBtn").disabled = true;
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

function minusQty(){
    let qty = document.getElementById("item-quantity").textContent;
    document.getElementById("item-quantity").textContent = "" + (Number(qty) - 1);
}

function plusQty(){
    let qty = document.getElementById("item-quantity").textContent;
    document.getElementById("item-quantity").textContent = "" + (Number(qty) + 1);
}

function openWhatsApp() {
  const phoneNumber = "96171468381"; // WhatsApp number (no spaces or symbols)
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
