const form = document.getElementById('productForm');
const productTable = document.getElementById('productTable');

// Google Apps Script endpoint for your sheet
const WEB_APP_URL = "/.netlify/functions/proxy";

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const itemNo = document.getElementById('add-id').value;
  const name = document.getElementById('add-name').value;
  const nameAR = document.getElementById('add-nameAR').value;
  const category = document.getElementById('add-category').value;
  const categoryAR = document.getElementById('add-categoryAR').value;
  const price = document.getElementById('add-price').value;
  const priceBefore = document.getElementById('add-price-before').value;
  const age = document.getElementById('add-age-range').value;
  const ageAR = document.getElementById('add-age-rangeAR').value;
  const gender = document.getElementById('add-gender').value;
  const genderAR = document.getElementById('add-genderAR').value;
  const quantity = document.getElementById('add-quantity').value;
  const tagTxt = document.getElementById('add-tag-text').value;
  const tagTxtAR = document.getElementById('add-tag-textAR').value;
  const tagColor = document.getElementById('add-tag-color').value;
  const description = document.getElementById('add-description').value;
  const descriptionAR = document.getElementById('add-descriptionAR').value;
  const file = document.getElementById('add-imageFile').files[0];
  const featured = document.getElementById('add-featured').checked;

  if (!file) return alert("Select an image!");

  // Multiple Image Selection
  let selectedImages = [];

  const input = document.getElementById("add-imageFile");
  const previewContainer = document.getElementById("imagePreviewContainer");

  input.addEventListener("change", function () {
    const files = Array.from(this.files);

    files.forEach(file => {
      selectedImages.push(file);
      renderPreview(file);
    });

    // reset input so same file can be selected again if removed
    input.value = "";
  });

  try {
    // 1️⃣ Upload image to ImgBB
    const imageUrl = await uploadMultipleImages(selectedImages); // direct image URL

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
          featured,
          nameAR,
          categoryAR,
          ageAR,
          genderAR,
          descriptionAR,
          tagAR: tagTxtAR
        }
      })
    });

    const result = await sheetResponse.json();
    if (result.success) {
      showToast("Product added successfully!", "success");
      form.reset();
      document.getElementById("imagePreviewContainer").classList.add("hidden");
      fetchProducts();
    } else {
      showToast("Failed to save product to sheet.", "failure");
    }

  } catch (err) {
    console.error(err);
    showToast("Error uploading image or saving data.", "failure");
  }
});

function renderPreview(file) {
  const wrapper = document.createElement("div");
  wrapper.className = "relative";

  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);
  img.className = "h-24 w-24 object-cover rounded-lg border";

  const removeBtn = document.createElement("button");
  removeBtn.innerHTML = "✕";
  removeBtn.className =
    "absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-sm flex items-center justify-center";

  removeBtn.onclick = () => {
    selectedImages = selectedImages.filter(f => f !== file);
    wrapper.remove();
  };

  wrapper.appendChild(img);
  wrapper.appendChild(removeBtn);
  previewContainer.appendChild(wrapper);
}

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
    document.getElementById("edit-nameAR").value = product.nameAR;
    document.getElementById("edit-price").value = product.price;
    document.getElementById("edit-price-before").value = product.priceBefore;
    document.getElementById("edit-age-range").value = product.age;
    document.getElementById("edit-age-rangeAR").value = product.ageAR;
    document.getElementById("edit-category").value = product.category;
    document.getElementById("edit-categoryAR").value = product.categoryAR;
    document.getElementById("edit-gender").value = product.gender;
    document.getElementById("edit-genderAR").value = product.genderAR;
    document.getElementById("edit-quantity").value = product.quantity;
    document.getElementById("edit-tag-text").value = product.tag;
    document.getElementById("edit-tag-textAR").value = product.tagAR;
    document.getElementById("edit-tag-color").value = product.tagColor;
    document.getElementById("edit-description").value = product.description;
    document.getElementById("edit-descriptionAR").value = product.descriptionAR;
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
    nameAR: document.getElementById("edit-nameAR").value,
    price: document.getElementById("edit-price").value,
    priceBefore: document.getElementById("edit-price-before").value,
    age: document.getElementById("edit-age-range").value,
    ageAR: document.getElementById("edit-age-rangeAR").value,
    category: document.getElementById("edit-category").value,
    categoryAR: document.getElementById("edit-categoryAR").value,
    gender: document.getElementById("edit-gender").value,
    genderAR: document.getElementById("edit-genderAR").value,
    quantity: document.getElementById("edit-quantity").value,
    tag: document.getElementById("edit-tag-text").value,
    tagAR: document.getElementById("edit-tag-textAR").value,
    tagColor: document.getElementById("edit-tag-color").value,
    description: document.getElementById("edit-description").value,
    descriptionAR: document.getElementById("edit-descriptionAR").value,
    images: imgURL,
    featured: document.getElementById("edit-featured").checked === true
  };

  // Call the update function
  await updateProduct(updatedProduct);

  // Close modal
  document.getElementById("editModal").classList.add("hidden");
});

// Upload Image to host
async function uploadMultipleImages(files) {
  const uploadPromises = files.map(file => uploadImgToHost(file));
  const urls = await Promise.all(uploadPromises);
  return urls.join("|||");
}

// Handle File Box
document.getElementById("add-imageFile").addEventListener("change", function () {
  const file = this.files[0];
  const preview = document.getElementById("imagePreviewContainer");

  if (file) {
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
      formatter: function (cell) {
        const value = cell.getValue();
        if (!value) return "";

        // Get first image URL
        const firstImage = value.split("|||")[0];

        return `
          <img
            src="${firstImage}"
            style="width:50px;height:50px;object-fit:cover;border-radius:6px"
          />
        `;
      }
    },

    { title: "ID", field: "itemNo", width: 90 },

    { title: "Name", field: "name", headerFilter: "input" },

    { title: "Name AR", field: "nameAR", headerFilter: "input" },

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

    {
      title: "Category AR",
      field: "categoryAR",
      headerFilter: "select",
      headerFilterParams: {
        values: {
          "": "الكل",
          "ألعاب STEM": "ألعاب STEM",
          "ألعاب تعليمية": "ألعاب تعليمية",
          "الروبوتات والبرمجة": "الروبوتات والبرمجة",
          "ألعاب ذكية": "ألعاب ذكية",
          "ألعاب البناء والتشييد": "ألعاب البناء والتشييد",
          "مجموعات العلوم": "مجموعات العلوم",
          "إلكترونيات وأدوات ذكية": "إلكترونيات وأدوات ذكية",
          "ألعاب التحكم عن بُعد": "ألعاب التحكم عن بُعد",
          "ألغاز وألعاب تنمية الذكاء": "ألغاز وألعاب تنمية الذكاء",
          "مجموعات إبداعية وأعمال يدوية": "مجموعات إبداعية وأعمال يدوية",
          "ألعاب مونتيسوري": "ألعاب مونتيسوري",
          "ألعاب تقنية للأنشطة الخارجية": "ألعاب تقنية للأنشطة الخارجية",
          "ألعاب تفاعلية وألعاب الفيديو": "ألعاب تفاعلية وألعاب الفيديو",
          "تقنيات قابلة للارتداء للأطفال": "تقنيات قابلة للارتداء للأطفال"
        }
      }
    },

    { title: "Age", field: "age", 
      headerFilter: "select",
      headerFilterParams: {
       values: {
        "": "All",
        "0-2 Years": "0-2 Years",
        "3-5 Years": "3-5 Years",
        "6-8 Years": "6-8 Years",
        "9+ Years": "9+ Years"
       }
      }
    },

    { title: "Age AR", field: "ageAR",
      headerFilter: "select",
      headerFilterParams: {
        values: {
          "": "الكل",
          "0-2 سنوات": "0-2 سنوات",
          "3-5 سنوات": "3-5 سنوات",
          "6-8 سنوات": "6-8 سنوات",
          "9+ سنوات": "9+ سنوات"
        }
      }
    },

    { title: "Gender", field: "gender",
      headerFilter: "select",
      headerFilterParams: {
        values: {
          "": "All",
          "Unisex": "Unisex",
          "Boys": "Boys",
          "Girls": "Girls"
        }
      }
    },

    { title: "Gender AR", field: "genderAR",
      headerFilter: "select",
      headerFilterParams: {
        values: {
          "": "الكل",
          "للجنسين": "للجنسين",
          "الصبيان": "الصبيان",
          "البنات": "البنات"
        }
      }
    },

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
