document.addEventListener("DOMContentLoaded", function () {
  const API_BASE =
    window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://render-z7ii.onrender.com";

  const productSet = new Map();
  let allBrands = [];

  function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("open");
  }

  async function fetchCategories() {
    try {
      const spinnerEl = document.getElementById("category-spinner");
      if (spinnerEl) spinnerEl.style.display = "flex";

      showCategoryPlaceholders(19);

      const response = await fetch(`${API_BASE}/categories`);
      if (!response.ok) throw new Error("Failed to fetch categories.");

      const data = await response.json();

      renderCategories(data.categories || []);
    } catch (error) {
      console.error("❌ Error fetching categories:", error);
    } finally {
      const spinnerEl = document.getElementById("category-spinner");
      if (spinnerEl) spinnerEl.style.display = "none";
    }
  }

  function renderCategories(categories) {
    const categoryList = document.getElementById("category-list");

    categoryList.innerHTML = categories
      .map((category) => {
        const categoryName = category.name || category;

        return `
          <button onclick="filterByCategory('${categoryName}')">${categoryName}</button>
        `;
      })
      .join("");
  }

  function typeMessage(text, elementId, speed = 50) {
    const el = document.getElementById(elementId);
    el.textContent = "";

    let i = 0;

    const interval = setInterval(() => {
      el.textContent += text.charAt(i);
      i++;

      if (i >= text.length) clearInterval(interval);
    }, speed);
  }

  function showPlaceholderCards(count = 8) {
    const productList = document.getElementById("product-list");
    productList.innerHTML = "";

    for (let i = 0; i < count; i++) {
      productList.innerHTML += `
        <div class="product-item placeholder-card">
          <div class="placeholder-image"></div>
          <div class="placeholder-line" style="width: 60%;"></div>
          <div class="placeholder-line" style="width: 40%;"></div>
          <div class="placeholder-line" style="width: 50%;"></div>
        </div>
      `;
    }
  }

  async function fetchProducts(brandId, brandName) {
    try {
      const productList = document.getElementById("product-list");
      const brandTitle = document.getElementById("brand-title");

      productList.innerHTML = "";
      productSet.clear();

      brandTitle.textContent = `Products from ${brandName}`;
      document.getElementById("loading-message").textContent = "";

      showPlaceholderCards(18);

      typeMessage(
        "✨ Polishing up the finest fashion just for you...From the greatest catalog ever...",
        "loading-message",
        100
      );

      collapseBrandCards();

      const response = await fetch(`${API_BASE}/products/${brandId}`);
      if (!response.ok) throw new Error("Failed to fetch products.");

      const data = await response.json();
      console.log("✅ API Response for Products:", data);

      addUniqueProducts(data.products);
    } catch (error) {
      console.error("❌ Error fetching products:", error);
    } finally {
      document.getElementById("spinner").style.display = "none";
    }
  }

  async function fetchBrands() {
    try {
      const response = await fetch(`${API_BASE}/brands`);
      if (!response.ok) throw new Error("Failed to fetch brands.");

      const data = await response.json();

      allBrands = data.brands;
      renderBrands(allBrands);
    } catch (error) {
      console.error("❌ Error fetching brands:", error);
    }
  }

  function renderBrands(brands) {
    const brandList = document.getElementById("brand-list");

    brandList.classList.remove("stacked");
    brandList.innerHTML = brands
      .map(
        (brand) => `
          <div class="brand-card" onclick="fetchProducts('${brand.brandID}', '${brand.name}')">
            ${
              brand.image
                ? `<img src="https://www.ssactivewear.com/${brand.image}" alt="${brand.name}">`
                : `<span>${brand.name}</span>`
            }
          </div>
        `
      )
      .join("");
  }

  function collapseBrandCards() {
    const brandList = document.getElementById("brand-list");

    brandList.classList.add("transitioning");
    brandList.classList.remove("transitioned");

    setTimeout(() => {
      brandList.classList.add("stacked");

      brandList.innerHTML = `
        <button class="stacked-card brands-keep-shopping" type="button" onclick="expandBrandCards()">
          Brands / Keep Shopping
        </button>
      `;

      requestAnimationFrame(() => {
        brandList.classList.remove("transitioning");
        brandList.classList.add("transitioned");
      });
    }, 300);
  }

  function expandBrandCards() {
    const brandList = document.getElementById("brand-list");

    brandList.classList.add("transitioning");
    brandList.classList.remove("transitioned");

    setTimeout(() => {
      renderBrands(allBrands);

      requestAnimationFrame(() => {
        brandList.classList.remove("transitioning");
        brandList.classList.add("transitioned");
      });
    }, 300);
  }

  function showCategoryPlaceholders(count = 10) {
    const categoryList = document.getElementById("category-list");

    categoryList.innerHTML = `
      <div style="text-align:center; color:#ccc; font-size: 0.85rem; margin-bottom: 10px;">
        Loading categories...
      </div>
    `;

    for (let i = 0; i < count; i++) {
      const skeleton = document.createElement("div");
      skeleton.classList.add("category-placeholder");
      categoryList.appendChild(skeleton);
    }
  }

  async function filterByCategory(category) {
    try {
      document.getElementById("product-list").innerHTML =
        "<p>Loading products...</p>";

      document.getElementById(
        "brand-title"
      ).textContent = `Products in category: ${category}`;

      document.getElementById("loading-message").textContent = "";

      showPlaceholderCards(12);
      collapseBrandCards();

      const response = await fetch(
        `${API_BASE}/styles/category/${encodeURIComponent(category)}`
      );

      if (!response.ok) throw new Error("Failed to fetch category styles.");

      const data = await response.json();

      addUniqueProducts(data.styles || []);
    } catch (error) {
      console.error("❌ Error fetching category styles:", error);
    }
  }

  function addUniqueProducts(products) {
    const productList = document.getElementById("product-list");

    productList.innerHTML = "";
    productSet.clear();

    products.forEach((product) => {
      if (!productSet.has(product.styleID)) {
        productSet.set(product.styleID, product);
      }
    });

    renderProducts();
  }

  function escapeHTML(str) {
    return (
      str?.replace(/[&<>"']/g, function (match) {
        const escape = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;",
        };

        return escape[match];
      }) ?? ""
    );
  }

  function renderProducts() {
  const productList = document.getElementById("product-list");
  productList.innerHTML = "";

  productSet.forEach((product) => {
    const variantWithPrice = product.variants?.find(
      (variant) =>
        variant.piecePrice &&
        !isNaN(parseFloat(variant.piecePrice))
    );

    const rawPrice =
      product.piecePrice ||
      variantWithPrice?.piecePrice ||
      null;
console.log("PRICE CHECK:", {
  parent: product.piecePrice,
  firstVariant: product.variants?.[0]?.piecePrice,
  product,
});
    let price = "N/A";

    if (rawPrice && !isNaN(parseFloat(rawPrice))) {
      price = `$${(parseFloat(rawPrice) * 2).toFixed(2)}`;
    }

    const imageUrl = product.colorFrontImage || product.styleImage || "";

    const cleanBrand = escapeHTML(product.brandName);
    const cleanStyle = escapeHTML(product.styleName);
    const cleanSize = escapeHTML(product.sizeName || "Varies");
    const cleanImageUrl = escapeHTML(imageUrl);
    const encodedProductData = JSON.stringify(product).replace(
      /'/g,
      "&apos;"
    );

    productList.innerHTML += `
      <div class="product-item" data-product='${encodedProductData}'>
        ${cleanBrand} - ${cleanStyle}
        <img src="https://www.ssactivewear.com/${cleanImageUrl}" alt="${cleanStyle}">
        <p>Size: ${cleanSize}</p>
        <p>Price: ${price}</p>
      </div>
    `;
  });

  document.querySelectorAll(".product-item").forEach((item) => {
    item.addEventListener("click", function () {
      console.log("✅ Product Clicked! Opening Modal...");

      const productData = JSON.parse(this.getAttribute("data-product"));

      console.log("🔍 Product Data Sent to Modal:", productData);

      openModal(productData);
    });
  });

    document.querySelectorAll(".product-item").forEach((item) => {
      item.addEventListener("click", function () {
        console.log("✅ Product Clicked! Opening Modal...");

        const productData = JSON.parse(this.getAttribute("data-product"));

        console.log("🔍 Product Data Sent to Modal:", productData);

        openModal(productData);
      });
    });
  }

  async function openModal(product) {
    try {
      console.log("🔍 Product Data Received in Modal:", product);

      if (!product) return;

      const modal = document.getElementById("product-modal");
      if (!modal) return;

      document.getElementById("modal-title").textContent =
        product.styleName || "Unknown Product";

      document.getElementById("modal-brand").textContent =
        product.brandName || "Unknown Brand";

      document.getElementById("modal-sku").textContent =
        "Select size & color";

      const defaultImage = product.colorFrontImage || product.styleImage || "";

      document.getElementById(
        "modal-image"
      ).src = `https://www.ssactivewear.com/${defaultImage}`;

      const originalPrice = product.piecePrice
        ? parseFloat(product.piecePrice)
        : 0;

      const updatedPrice = originalPrice * 2;

      document.getElementById("modal-price").textContent =
        updatedPrice.toFixed(2);

      const descRes = await fetch(`${API_BASE}/styles/${product.styleID}`);
      const contentType = descRes.headers.get("content-type");

      if (!descRes.ok || contentType.includes("text/html")) {
        throw new Error("Invalid JSON response from server");
      }

      const fullData = await descRes.json();
      const style = Array.isArray(fullData) ? fullData[0] : fullData;
      const variants = style.variants || [];

      const description = style.description || "No description available.";

      document.getElementById("modal-description").innerHTML = description;

      const thumbnailContainer = document.getElementById("thumbnail-column");
      thumbnailContainer.innerHTML = "";

      const imageFields = [
        product.colorOnModelFrontImage,
        product.colorOnModelSideImage,
        product.colorOnModelBackImage,
        product.colorFrontImage,
        product.colorSideImage,
        product.colorBackImage,
        product.styleImage,
      ];

      const imagePaths = [...new Set(imageFields.filter(Boolean))];

      imagePaths.slice(0, 5).forEach((path) => {
        const thumb = document.createElement("img");

        thumb.src = `https://www.ssactivewear.com/${path}`;
        thumb.alt = "Thumbnail";
        thumb.classList.add("thumbnail-img");

        thumb.onclick = () => {
          document.getElementById("modal-image").src = thumb.src;
        };

        thumbnailContainer.appendChild(thumb);
      });

      let selectedColor = null;
      let selectedSize = null;

      function updateSkuFromSelection() {
        const skuSpan = document.getElementById("modal-sku");

        if (!selectedColor || !selectedSize) {
          skuSpan.textContent = "Select size & color";
          return;
        }

        const match = variants.find(
          (v) =>
            v.colorName === selectedColor && v.sizeName === selectedSize
        );

        skuSpan.textContent = match?.sku || "SKU not found";
      }

      const colorContainer = document.getElementById("color-options");
      colorContainer.innerHTML = "";

      if (variants.length > 0) {
        const seenColors = new Set();

        variants.forEach((variant) => {
          if (!variant.colorName || seenColors.has(variant.colorName)) return;

          seenColors.add(variant.colorName);

          const colorImageUrl = variant.colorFrontImage
            ? `https://www.ssactivewear.com/${variant.colorFrontImage}`
            : `https://www.ssactivewear.com/${product.styleImage || ""}`;

          const colorSwatch = document.createElement("div");
          colorSwatch.classList.add("color-swatch");

          if (variant.colorSwatchImage) {
            colorSwatch.style.backgroundImage = `url(https://www.ssactivewear.com/${variant.colorSwatchImage})`;
          } else {
            colorSwatch.style.backgroundColor =
              variant.color1 || getColorHex(variant.colorName, style);
          }

          colorSwatch.setAttribute("data-color", variant.colorName);
          colorSwatch.setAttribute("data-image", colorImageUrl);

          colorSwatch.onclick = function (event) {
            selectedColor = variant.colorName;

            document.getElementById("modal-image").src = colorImageUrl;

            document
              .querySelectorAll(".color-swatch")
              .forEach((el) => el.classList.remove("selected-color"));

            event.target.classList.add("selected-color");

            const imageSet = [
              variant.colorOnModelFrontImage,
              variant.colorOnModelSideImage,
              variant.colorOnModelBackImage,
              variant.colorFrontImage,
              variant.colorSideImage,
              variant.colorBackImage,
              product.styleImage,
            ];

            const images = [...new Set(imageSet.filter(Boolean))];

            thumbnailContainer.innerHTML = "";

            images.slice(0, 5).forEach((imgPath) => {
              const thumb = document.createElement("img");

              thumb.src = `https://www.ssactivewear.com/${imgPath}`;
              thumb.classList.add("thumbnail-img");

              thumb.onclick = () => {
                document.getElementById("modal-image").src = thumb.src;
              };

              thumbnailContainer.appendChild(thumb);
            });

            updateSkuFromSelection();
          };

          colorContainer.appendChild(colorSwatch);
        });
      } else {
        colorContainer.innerHTML = `<p style="color: #ddd;">No Colors Available</p>`;
      }

      const sizeContainer = document.getElementById("modal-sizes");
      sizeContainer.innerHTML = "";

      if (variants.length > 0) {
        const uniqueSizes = [
          ...new Set(variants.map((v) => v.sizeName)),
        ].filter(Boolean);

        if (uniqueSizes.length > 0) {
          const label = document.createElement("div");

          label.textContent = "Available Sizes:";
          label.style.fontWeight = "bold";
          label.style.marginTop = "1rem";

          sizeContainer.appendChild(label);

          uniqueSizes.forEach((size) => {
            const sizeTag = document.createElement("span");

            sizeTag.textContent = size;
            sizeTag.classList.add("size-tag");
            sizeTag.style.cursor = "pointer";

            sizeTag.onclick = () => {
              selectedSize = size;

              const matched = variants.find(
                (v) =>
                  v.sizeName === size &&
                  (!selectedColor || v.colorName === selectedColor)
              );

              if (matched && matched.piecePrice) {
                const updated = parseFloat(matched.piecePrice) * 2;

                document.getElementById("modal-price").textContent =
                  updated.toFixed(2);
              }

              document
                .querySelectorAll(".size-tag")
                .forEach((el) => el.classList.remove("selected-size"));

              sizeTag.classList.add("selected-size");

              updateSkuFromSelection();
            };

            sizeContainer.appendChild(sizeTag);
          });
        } else {
          sizeContainer.innerHTML = `<p style="color: #ccc;">Sizes not listed</p>`;
        }
      }

      modal.style.display = "flex";

      console.log("✅ Modal should be visible now!");
    } catch (error) {
      console.error("❌ ERROR in openModal():", error);
    }
  }

  function closeModal() {
    document.getElementById("product-modal").style.display = "none";
  }

  window.expandBrandCards = expandBrandCards;
  window.filterByCategory = filterByCategory;
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.fetchProducts = fetchProducts;
  window.toggleSidebar = toggleSidebar;

  fetchCategories();
  fetchBrands();
});

function getColorHex(colorName, product) {
  if (!product || !product.variants) {
    console.warn(
      `⚠️ No variants available for ${colorName}, using fallback color.`
    );

    return "#CCCCCC";
  }

  const variant = product.variants.find((v) => v.colorName === colorName);

  if (variant) {
    if (variant.colorSwatchImage) {
      console.log(
        `🖼️ Using Swatch Image for ${colorName}: https://www.ssactivewear.com/${variant.colorSwatchImage}`
      );

      return `url(https://www.ssactivewear.com/${variant.colorSwatchImage})`;
    }

    if (variant.color1) {
      console.log(`✅ Using API HEX for ${colorName}: ${variant.color1}`);

      return variant.color1;
    }
  }

  console.warn(
    `⚠️ No color1 or swatch image found for ${colorName}, using fallback.`
  );

  return "#CCCCCC";
}