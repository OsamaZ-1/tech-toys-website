const form = document.getElementById('productForm');
const productTable = document.getElementById('productTable');

// Google Apps Script endpoint for your sheet
const WEB_APP_URL = "/.netlify/functions/proxy";

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const itemNo = document.getElementById('add-id').value;
  const name = document.getElementById('add-name').value;
  const category = document.getElementById('add-category').value;
  const price = document.getElementById('add-price').value;
  const priceBefore = document.getElementById('add-price-before').value;
  const age = document.getElementById('add-age-range').value;
  const gender = document.getElementById('add-gender').value;
  const quantity = document.getElementById('add-quantity').value;
  const tagTxt = document.getElementById('add-tag-text').value;
  const tagColor = document.getElementById('add-tag-color').value;
  const description = document.getElementById('add-description').value;
  const file = document.getElementById('add-imageFile').files[0];
  const featured = document.getElementById('add-featured').checked;

  if (!file) return alert("Select an image!");

  try {
    // 1️⃣ Upload image to ImgBB
    const imageUrl = await uploadImgToHost(file); // direct image URL

    // 2️⃣ Send product info + image URL to Google Sheet
    const sheetResponse = await fetch(WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        action: "add", 
        data: {
          itemNo,
          name,
          price,
          priceBefore,
          age,
          category,
          gender,
          description,
          images: imageUrl,
          quantity,
          tag: tagTxt,
          tagColor,
          featured
        }
      })
    });

    const result = await sheetResponse.json();
    if (result.success) {
      showToast("Product added successfully!", "success");
      form.reset();
      document.getElementById("imagePreview").classList.add("hidden");
      fetchProducts();
    } else {
      showToast("Failed to save product to sheet.", "failure");
    }

  } catch (err) {
    console.error(err);
    showToast("Error uploading image or saving data.", "failure");
  }
});


// 3️⃣ Fetch products and display in table
async function fetchProducts() {
  try {
        const response = await fetch(WEB_APP_URL);
        const data = await response.json();
        table.setData(data); // Tabulator automatically refreshes the table
    } catch (err) {
        console.error(err);
    }
}


// Update product
async function updateProduct(product) {
  try {
    const response = await fetch(WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update",
        itemNo: product.itemNo,
        data: product
      })
    });
    const result = await response.json();
    if (result.success) {
      showToast("Product updated successfully!", "success");
      fetchProducts(); // refresh table
    } else {
      showToast(`Failed to update product: ${result.error}`, "error");
    }
  } catch (err) {
    console.error(err);
    showToast("Error updating product.", "error");
  }
}

// Delete product
async function deleteProduct(productID) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  try {
    const response = await fetch(WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "delete",
        itemNo: productID
      })
    });
    const result = await response.json();
    if (result.success) {
      showToast("Product deleted successfully!", "success");
      fetchProducts(); // refresh table
    } else {
      showToast(`Failed to delete product: ${result.error}`, "error");
    }
  } catch (err) {
    console.error(err);
    showToast("Error deleting product.", "error");
  }
}

// Edit Modal Functions
function openEditModal(product){
    const modal = document.getElementById("editModal");
    modal.classList.remove("hidden");

    document.getElementById("edit-id").value = product.itemNo;
    document.getElementById("edit-name").value = product.name;
    document.getElementById("edit-price").value = product.price;
    document.getElementById("edit-price-before").value = product.priceBefore;
    document.getElementById("edit-age-range").value = product.age;
    document.getElementById("edit-category").value = product.category;
    document.getElementById("edit-gender").value = product.gender;
    document.getElementById("edit-quantity").value = product.quantity;
    document.getElementById("edit-tag-text").value = product.tag;
    document.getElementById("edit-tag-color").value = product.tagColor;
    document.getElementById("edit-description").value = product.description;
    document.getElementById("edit-imagePreview").src = product.images;
    document.getElementById("edit-featured").checked = product.featured === true;
}

function closeEditModal(){
    const modal = document.getElementById("editModal");
    modal.classList.add("hidden");
}

// Edit Modal Submit
const editForm = document.getElementById("editModal");
editForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // get image for update
  const imgFile = document.getElementById("edit-imageFile").files[0];
  const editPreview = document.getElementById("edit-imagePreview");

  imgURL = undefined;
  if (!imgFile) {
    imgURL = editPreview.src;
  }
  else{
    imgURL = await uploadImgToHost(imgFile);
  }

  // Gather updated values
  const updatedProduct = {
    itemNo: document.getElementById("edit-id").value,
    name: document.getElementById("edit-name").value,
    price: document.getElementById("edit-price").value,
    priceBefore: document.getElementById("edit-price-before").value,
    age: document.getElementById("edit-age-range").value,
    category: document.getElementById("edit-category").value,
    gender: document.getElementById("edit-gender").value,
    quantity: document.getElementById("edit-quantity").value,
    tag: document.getElementById("edit-tag-text").value,
    tagColor: document.getElementById("edit-tag-color").value,
    description: document.getElementById("edit-description").value,
    images: imgURL,
    featured: document.getElementById("edit-featured").checked === true
  };

  // Call the update function
  await updateProduct(updatedProduct);

  // Close modal
  document.getElementById("editModal").classList.add("hidden");
});

// Upload image to ImgBB
async function uploadImgToHost(file){
    const formData = new FormData();
    formData.append("image", file); // key is 'image'
    formData.append("key", "9d3fdcc4c4819328a472cde28eec0134"); // your API key

    const imgbbResponse = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData
    });

    const imgData = await imgbbResponse.json();

    if (!imgData || !imgData.data || !imgData.data.url) {
      return alert("Image upload failed!");
    }

    return imgData.data.url; // direct image URL
}

// Handle File Box
document.getElementById("add-imageFile").addEventListener("change", function () {
  const file = this.files[0];
  const preview = document.getElementById("imagePreview");

  if (file) {
    preview.src = URL.createObjectURL(file);
    preview.classList.remove("hidden");
  }
});

document.getElementById("edit-imageFile").addEventListener("change", function () {
  const file = this.files[0];
  const preview = document.getElementById("edit-imagePreview");

  if (file) {
    preview.src = URL.createObjectURL(file);
  }
});

// Tabulator JS Table Init

const table = new Tabulator("#productTable", {
  height: "600px",
  layout: "fitColumns",
  pagination: "local",
  paginationSize: 20,
  movableColumns: true,
  resizableRows: true,
  placeholder: "No products found",

  columns: [
    {
      title: "Image",
      field: "images",
      formatter: "image",
      formatterParams: {
        height: "50px",
        width: "50px"
      }
    },

    { title: "ID", field: "itemNo", width: 90 },

    { title: "Name", field: "name", headerFilter: "input" },

    { title: "Price", field: "price", headerFilter: "input" },

    { title: "Before", field: "priceBefore", headerFilter: "input" },

    {
      title: "Category",
      field: "category",
      headerFilter: "select",
      headerFilterParams: {
        values: {
          "": "All",
          "STEM Toys": "STEM Toys",
          "Educational & Learning": "Educational & Learning",
          "Robotics & Coding": "Robotics & Coding",
          "Smart Toys": "Smart Toys",
          "Building & Construction": "Building & Construction",
          "Science Kits": "Science Kits",
          "Electronics & Gadgets": "Electronics & Gadgets",
          "Remote Control Toys": "Remote Control Toys",
          "Puzzles & Brain Games": "Puzzles & Brain Games",
          "Creative & DIY Kits": "Creative & DIY Kits",
          "Montessori Toys": "Montessori Toys",
          "Outdoor Tech Toys": "Outdoor Tech Toys",
          "Gaming & Interactive": "Gaming & Interactive",
          "Wearable Tech for Kids": "Wearable Tech for Kids"
        }
      }
    },

    { title: "Age", field: "age", width: 90 },

    { title: "Gender", field: "gender", width: 100 },

    { title: "Qty", field: "quantity", width: 80 },

    {
      title: "Featured",
      field: "featured",
      hozAlign: "center",
      formatter: "tickCross"
    },

    {
      title: "Actions",
      hozAlign: "center",
      width: 130,
      formatter: function (cell) {
        const rowData = cell.getRow().getData();

        return `
          <button class="edit-btn bg-green-500/10 text-green-600 py-1 px-2 rounded-md hover:bg-green-500/20"
                  data-id="${rowData.itemNo}" title="Edit">
            <span class="material-symbols-outlined">edit</span>
          </button>

          <button class="delete-btn bg-red-500/10 text-red-600 py-1 px-2 rounded-md hover:bg-red-500/20"
                  data-id="${rowData.itemNo}" title="Delete">
            <span class="material-symbols-outlined">delete</span>
          </button>
        `;
      },

      cellClick: function (e, cell) {
        const target = e.target.closest("button");
        if (!target) return;

        const rowData = cell.getRow().getData();
        const itemNo = rowData.itemNo;

        if (target.classList.contains("edit-btn")) {
          openEditModal(rowData);
        }

        if (target.classList.contains("delete-btn")) {
          deleteProduct(itemNo);
        }
      }
    }
  ]
});


// Set Data
fetchProducts();

// Toast Function for Success

function showToast(message, type = "success", duration = 3000) {
  const container = document.getElementById("toast-container");

  // Create toast element
  const toast = document.createElement("div");
  toast.className = `
    px-4 py-2 rounded-lg shadow-lg text-white
    ${type === "success" ? "bg-green-500" : "bg-red-500"}
    animate-slide-in
  `;
  toast.textContent = message;

  container.appendChild(toast);

  // Remove after duration
  setTimeout(() => {
    toast.classList.add("animate-slide-out");
    toast.addEventListener("animationend", () => toast.remove());
  }, duration);
}

// Login Logic
// Add your allowed emails here
const ALLOWED_EMAILS = [
  "zammarosama@gmail.com"
];

// Wait for Identity to initialize
document.addEventListener("DOMContentLoaded", () => {
  if (window.netlifyIdentity) {
    window.netlifyIdentity.on("init", user => {
      if (user) checkAccess(user);
    });

    window.netlifyIdentity.on("login", user => {
      checkAccess(user);
    });

    window.netlifyIdentity.on("logout", () => {
      showLogin();
    });
  }
});

function checkAccess(user) {
  // Collect all possible email sources
  const possibleEmails = [
    user.email,
    user.user_metadata?.email,
    user.identities?.[0]?.email
  ].filter(Boolean);

  // console.log("Found user emails:", possibleEmails);

  // Is any email allowed?
  const isAllowed = possibleEmails.some(email =>
    ALLOWED_EMAILS.includes(email)
  );

  if (isAllowed) {
    hideLogin();
    showAdminContent();
  } else {
    alert("You do not have permission to access this page.");
    netlifyIdentity.logout();
  }
}

function showLogin() {
  document.getElementById("login-section").classList.remove("hidden");
  document.getElementById("admin-section").classList.add("hidden");
}

function hideLogin() {
  document.getElementById("login-section").classList.add("hidden");
}

function showAdminContent() {
  document.getElementById("admin-section").classList.remove("hidden");
}

document.getElementById("login-btn").addEventListener("click", () => {
  if (window.netlifyIdentity) {
    try{
      // Always log out first to clear any previous session
      netlifyIdentity.logout().then(() => {
        netlifyIdentity.open("login");
      });
    }
    catch(e){
      netlifyIdentity.open("login");
    }
  }
});

// Auto logout on URL change / page unload
window.addEventListener("beforeunload", () => {
  if (window.netlifyIdentity) {
    netlifyIdentity.logout();
  }
});

// Optional: also handle SPA-like navigation (back/forward)
window.addEventListener("popstate", () => {
  if (window.netlifyIdentity) {
    netlifyIdentity.logout();
  }
});
