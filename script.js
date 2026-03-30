// Cart management
let cart = [];

// Initialize cart from localStorage - single source of truth
function initCart() {
  try {
    const storedCart = localStorage.getItem("cart");
    if (storedCart && storedCart !== "null" && storedCart !== "undefined") {
      const parsedCart = JSON.parse(storedCart);
      // Ensure cart is a valid array
      if (Array.isArray(parsedCart) && parsedCart.length > 0) {
        // Validate cart items have required properties
        cart = parsedCart.filter(item =>
          item &&
          typeof item === 'object' &&
          item.product &&
          typeof item.product === 'string' &&
          typeof item.price === 'number' &&
          !isNaN(item.price)
        );
        // If validation removed items, save cleaned cart
        if (cart.length !== parsedCart.length) {
          localStorage.setItem("cart", JSON.stringify(cart));
        }
      } else {
        // Empty or invalid array - reset to empty
        cart = [];
        localStorage.setItem("cart", JSON.stringify(cart));
      }
    } else {
      // No stored cart or invalid - reset to empty
      cart = [];
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  } catch (e) {
    console.error("Error loading cart:", e);
    // On any error, reset cart to empty
    cart = [];
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  updateCartCount();
}

function updateCartCount() {
  // Always sync with the actual cart array
  const count = Array.isArray(cart) ? cart.length : 0;

  // Update all cart count elements on the page
  const cartCountElements = document.querySelectorAll("#cart-count");
  cartCountElements.forEach((element) => {
    element.textContent = count;
  });
}

function addToCart(product, price) {
  // Ensure cart is initialized
  if (!Array.isArray(cart)) {
    initCart();
  }

  cart.push({ product, price: parseFloat(price) });
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();

  // Show success notification
  showNotification(`${product} added to cart!`);
}

function showNotification(message) {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = "cart-notification";
  notification.textContent = message;
  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

function removeFromCart(index) {
  // Ensure cart is synced
  initCart();

  if (index >= 0 && index < cart.length) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    displayCart();

    // Show notification
    if (cart.length === 0) {
      showNotification("Cart is now empty");
    } else {
      showNotification("Item removed from cart");
    }
  }
}

function displayCart() {
  // Ensure cart is synced before displaying
  initCart();

  const cartItems = document.getElementById("cart-items");
  const totalPrice = document.getElementById("total-price");
  const totalContainer = document.getElementById("cart-total");
  const checkoutButton = document.querySelector(".checkout-button");
  const clearButton = document.querySelector(".clear-cart-button");

  if (cartItems) {
    cartItems.innerHTML = "";
    let total = 0;

    // Check if cart is actually empty
    if (!Array.isArray(cart) || cart.length === 0) {
      cart = []; // Ensure it's an empty array
      localStorage.setItem("cart", JSON.stringify(cart));
      cartItems.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
      // Hide checkout button and total when cart is empty
      if (checkoutButton) checkoutButton.style.display = "none";
      if (clearButton) clearButton.style.display = "none";
      if (totalContainer) totalContainer.style.display = "none";
    } else {
      cart.forEach((item, index) => {
        if (item && item.product && typeof item.price === 'number') {
          total += item.price;
          cartItems.innerHTML += `
            <div class="cart-item">
              <p>${item.product} - $${item.price.toFixed(2)}</p>
              <button onclick="removeFromCart(${index})">Remove</button>
            </div>
          `;
        }
      });
      // Show checkout button and total when cart has items
      if (checkoutButton) checkoutButton.style.display = "inline-block";
      if (clearButton) clearButton.style.display = "inline-block";
      if (totalContainer) totalContainer.style.display = "block";
    }
    if (totalPrice) totalPrice.textContent = total.toFixed(2);
  }
  // Update cart count when cart is displayed
  updateCartCount();
}

function clearCart() {
  if (confirm("Are you sure you want to clear your cart?")) {
    cart = [];
    localStorage.setItem("cart", JSON.stringify([]));
    updateCartCount();
    displayCart();
    showNotification("Cart cleared");
  }
}

function displayCheckout() {
  // Ensure cart is synced before displaying
  initCart();

  const checkoutItems = document.getElementById("checkout-items");
  const checkoutTotal = document.getElementById("checkout-total");
  if (checkoutItems) {
    checkoutItems.innerHTML = "";
    let total = 0;

    // Check if cart is actually empty
    if (!Array.isArray(cart) || cart.length === 0) {
      cart = []; // Ensure it's an empty array
      localStorage.setItem("cart", JSON.stringify(cart));
      checkoutItems.innerHTML = '<p style="color: rgba(255,255,255,0.6);">No items in cart</p>';
    } else {
      cart.forEach((item) => {
        if (item && item.product && typeof item.price === 'number') {
          total += item.price;
          checkoutItems.innerHTML += `<p>${item.product} - $${item.price.toFixed(2)}</p>`;
        }
      });
    }
    if (checkoutTotal) checkoutTotal.textContent = total.toFixed(2);
  }
  // Update cart count
  updateCartCount();
}

// Search functionality
function searchProducts() {
  const searchTerm = document.getElementById("search-bar").value.toLowerCase();
  const items = document.querySelectorAll(".product-container");
  const activeCategory = document.querySelector(".category-btn.active")?.getAttribute("data-category") || "all";

  items.forEach((item) => {
    const name = item.getAttribute("data-name").toLowerCase();
    const category = item.getAttribute("data-category");
    const matchesSearch = name.includes(searchTerm);
    const matchesCategory = activeCategory === "all" || category === activeCategory;

    if (matchesSearch && matchesCategory) {
      item.style.display = "block";
    } else {
      item.style.display = "none";
    }
  });
}

// Category filter functionality
function filterByCategory(category) {
  const items = document.querySelectorAll(".product-container");
  const searchTerm = document.getElementById("search-bar")?.value.toLowerCase() || "";

  items.forEach((item) => {
    const itemCategory = item.getAttribute("data-category");
    const name = item.getAttribute("data-name").toLowerCase();
    const matchesCategory = category === "all" || itemCategory === category;
    const matchesSearch = !searchTerm || name.includes(searchTerm);

    if (matchesCategory && matchesSearch) {
      item.style.display = "block";
    } else {
      item.style.display = "none";
    }
  });

  // Update active button
  document.querySelectorAll(".category-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  document.querySelector(`[data-category="${category}"]`).classList.add("active");
}

// Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const themeIcons = document.querySelectorAll(".theme-toggle i");
  themeIcons.forEach(icon => {
    if (theme === "dark") {
      icon.className = "fa-solid fa-sun";
    } else {
      icon.className = "fa-solid fa-moon";
    }
  });
}

// Logo click handler - refresh and go to home
function handleLogoClick() {
  // Determine the correct home path based on current location
  const currentPath = window.location.pathname;
  let homePath = "pages/home.html";

  // If we're already on index.html or in root, go to pages/home.html
  if (currentPath.includes("index.html") || currentPath.endsWith("/") || !currentPath.includes("pages/")) {
    homePath = "pages/home.html";
  } else {
    // If we're in pages directory, just use home.html
    homePath = "home.html";
  }

  // Refresh and navigate to home
  window.location.href = homePath;
}

// -----------------------------------------------------------
// Music Player Logic (منطق تشغيل الموسيقى الجديد)
// -----------------------------------------------------------
function initializeMusicPlayer() {
    const music = document.getElementById('background-music');
    const playPauseBtn = document.getElementById('play-pause-btn');

    // يتم تشغيل المنطق فقط إذا كان عنصرا الصوت والزر موجودين في الصفحة
    if (playPauseBtn && music) {
        playPauseBtn.addEventListener('click', () => {
            if (music.paused) {
                // محاولة تشغيل الموسيقى
                music.play()
                    .then(() => {
                        // نجاح: تغيير حالة الزر
                        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i> pause';
                    })
                    .catch(error => {
                        // فشل التشغيل التلقائي (بسبب قيود المتصفح)
                        console.error("Autoplay failed:", error);
                        alert("لأسباب تتعلق بخصوصية المتصفح، يجب عليك التفاعل مع الصفحة أولاً لتشغيل الموسيقى. يرجى محاولة مجدداً.");
                    });
            } else {
                // إيقاف الموسيقى
                music.pause();
                playPauseBtn.innerHTML = '<i class="fas fa-play"></i> play';
            }
        });
    }
}
// -----------------------------------------------------------


// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  // Initialize theme
  initTheme();

  // Initialize cart from localStorage - this will fix any corrupted data
  initCart();

  // Force update counter immediately
  updateCartCount();

  // Update cart display
  displayCart();
  displayCheckout();

  // Also update counter after a short delay to ensure DOM is ready
  setTimeout(() => {
    initCart();
    updateCartCount();
  }, 100);

  // Add to cart buttons - use event delegation for dynamically added buttons
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-to-cart")) {
      e.preventDefault();
      const product = e.target.getAttribute("data-product");
      const price = e.target.getAttribute("data-price");
      if (product && price) {
        addToCart(product, price);
      }
    }
  });

  // Search bar
  const searchBar = document.getElementById("search-bar");
  if (searchBar) {
    searchBar.addEventListener("input", searchProducts);
  }

  // Category filter buttons
  document.querySelectorAll(".category-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const category = btn.getAttribute("data-category");
      filterByCategory(category);
    });
  });

  // Contact form
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Message sent! We will get back to you soon.");
      contactForm.reset();
    });
  }

  // Checkout form
  const checkoutForm = document.getElementById("checkout-form");
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Order placed successfully!");
      cart = [];
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartCount();
      window.location.href = "home.html";
    });
  }

  // Theme toggle button
  const themeToggleButtons = document.querySelectorAll(".theme-toggle");
  themeToggleButtons.forEach(button => {
    button.addEventListener("click", toggleTheme);
  });

  // Logo click handlers
  const logoSections = document.querySelectorAll(".logo-section");
  logoSections.forEach(logo => {
    logo.addEventListener("click", handleLogoClick);
  });

  // Also handle header-logo clicks directly
  const headerLogos = document.querySelectorAll(".header-logo");
  headerLogos.forEach(logo => {
    logo.addEventListener("click", handleLogoClick);
  });

  // -----------------------------------------------------------
  // Initialize Music Player (تشغيل مشغل الموسيقى عند تشغيل الصفحة)
  // -----------------------------------------------------------
  if (window.location.pathname.includes('home.html') || window.location.pathname.includes('products.html')) {
    initializeMusicPlayer();
  }

  // -----------------------------------------------------------
  // Initialize Reviews System
  // -----------------------------------------------------------
  if (window.location.pathname.includes('reviews.html')) {
    initializeReviewsSystem();
  }

  // -----------------------------------------------------------
  // Initialize Product Ratings Display
  // -----------------------------------------------------------
  if (window.location.pathname.includes('products.html')) {
    initializeProductRatings();
  }
});

// ==================== REVIEWS & RATINGS SYSTEM ====================

// Initialize Reviews System
function initializeReviewsSystem() {
  loadReviews();
  setupStarRating();
  setupReviewForm();
}

// Load reviews from localStorage
function loadReviews() {
  const reviews = getReviewsFromStorage();
  displayReviews(reviews);
  updateOverallRating(reviews);
}

// Get reviews from localStorage
function getReviewsFromStorage() {
  const reviewsData = localStorage.getItem('gymPowerReviews');
  return reviewsData ? JSON.parse(reviewsData) : [];
}

// Save reviews to localStorage
function saveReviewsToStorage(reviews) {
  localStorage.setItem('gymPowerReviews', JSON.stringify(reviews));
}

// Display reviews
function displayReviews(reviews) {
  const container = document.getElementById('reviews-container');

  if (!container) return;

  if (reviews.length === 0) {
    container.innerHTML = `
      <div class="empty-reviews">
        <i class="fa-solid fa-comments"></i>
        <p>No reviews yet. Be the first to share your experience!</p>
      </div>
    `;
    return;
  }

  // Sort reviews by date (newest first)
  reviews.sort((a, b) => new Date(b.date) - new Date(a.date));

  container.innerHTML = reviews.map(review => `
    <div class="review-card">
      <div class="review-header">
        <div class="reviewer-info">
          <span class="reviewer-name">${escapeHtml(review.name)}</span>
          <span class="review-product">${escapeHtml(review.product)}</span>
          <span class="review-date">${formatDate(review.date)}</span>
        </div>
        <div class="review-stars">
          ${generateStars(review.rating)}
        </div>
      </div>
      <p class="review-text">${escapeHtml(review.text)}</p>
    </div>
  `).join('');
}

// Generate star icons based on rating
function generateStars(rating) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars += '<i class="fa-solid fa-star"></i>';
    } else {
      stars += '<i class="fa-regular fa-star"></i>';
    }
  }
  return stars;
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Update overall rating
function updateOverallRating(reviews) {
  const totalReviewsElement = document.getElementById('total-reviews');
  const overallRatingElement = document.getElementById('overall-rating');
  const overallStarsElement = document.getElementById('overall-stars');

  if (!totalReviewsElement || !overallRatingElement || !overallStarsElement) return;

  totalReviewsElement.textContent = reviews.length;

  if (reviews.length === 0) {
    overallRatingElement.textContent = '0.0';
    overallStarsElement.innerHTML = generateStars(0);
    return;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const avgRating = (totalRating / reviews.length).toFixed(1);

  overallRatingElement.textContent = avgRating;

  // Generate stars for average rating
  const fullStars = Math.floor(avgRating);
  const hasHalfStar = avgRating % 1 >= 0.5;
  let starsHtml = '';

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      starsHtml += '<i class="fa-solid fa-star"></i>';
    } else if (i === fullStars + 1 && hasHalfStar) {
      starsHtml += '<i class="fa-solid fa-star-half-stroke"></i>';
    } else {
      starsHtml += '<i class="fa-regular fa-star"></i>';
    }
  }

  overallStarsElement.innerHTML = starsHtml;
}

// Setup star rating input
function setupStarRating() {
  const starRating = document.getElementById('star-rating');
  const ratingValue = document.getElementById('rating-value');

  if (!starRating || !ratingValue) return;

  const stars = starRating.querySelectorAll('i');

  stars.forEach((star, index) => {
    star.addEventListener('click', () => {
      const rating = index + 1;
      ratingValue.value = rating;

      // Update star display
      stars.forEach((s, i) => {
        if (i < rating) {
          s.classList.remove('fa-regular');
          s.classList.add('fa-solid', 'active');
        } else {
          s.classList.remove('fa-solid', 'active');
          s.classList.add('fa-regular');
        }
      });
    });

    // Hover effect
    star.addEventListener('mouseenter', () => {
      const rating = index + 1;
      stars.forEach((s, i) => {
        if (i < rating) {
          s.classList.add('active');
        } else {
          s.classList.remove('active');
        }
      });
    });
  });

  // Reset on mouse leave
  starRating.addEventListener('mouseleave', () => {
    const currentRating = parseInt(ratingValue.value) || 0;
    stars.forEach((s, i) => {
      if (i < currentRating) {
        s.classList.add('active');
      } else {
        s.classList.remove('active');
      }
    });
  });
}


// Setup review form submission
function setupReviewForm() {
  const form = document.getElementById('review-form');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('reviewer-name').value.trim();
    const product = document.getElementById('product-select').value;
    const rating = parseInt(document.getElementById('rating-value').value);
    const text = document.getElementById('review-text').value.trim();

    // Validation
    if (!name || !product || !rating || !text) {
      alert('Please fill in all fields and select a rating.');
      return;
    }

    if (rating < 1 || rating > 5) {
      alert('Please select a rating between 1 and 5 stars.');
      return;
    }

    // Create review object
    const review = {
      id: Date.now(),
      name: name,
      product: product,
      rating: rating,
      text: text,
      date: new Date().toISOString()
    };

    // Save review
    const reviews = getReviewsFromStorage();
    reviews.push(review);
    saveReviewsToStorage(reviews);

    // Update display
    displayReviews(reviews);
    updateOverallRating(reviews);

    // Reset form
    form.reset();
    document.getElementById('rating-value').value = '0';

    // Reset stars
    const stars = document.querySelectorAll('#star-rating i');
    stars.forEach(star => {
      star.classList.remove('fa-solid', 'active');
      star.classList.add('fa-regular');
    });

    // Show success message
    alert('Thank you for your review! It has been submitted successfully.');

    // Scroll to reviews
    document.getElementById('reviews-container').scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  });
}

// Get product rating (for use on product pages)
function getProductRating(productName) {
  const reviews = getReviewsFromStorage();
  const productReviews = reviews.filter(r => r.product === productName);

  if (productReviews.length === 0) {
    return { rating: 0, count: 0 };
  }

  const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
  const avgRating = (totalRating / productReviews.length).toFixed(1);

  return {
    rating: parseFloat(avgRating),
    count: productReviews.length
  };
}

// Initialize product ratings display on products page
function initializeProductRatings() {
  const productContainers = document.querySelectorAll('.product-container');

  productContainers.forEach(container => {
    const productName = container.getAttribute('data-name');
    if (productName) {
      displayProductRating(container, productName);
    }
  });
}

// Display rating for a specific product
function displayProductRating(container, productName) {
  const ratingDiv = container.querySelector('.product-rating');
  const starsDiv = container.querySelector('.product-stars');
  const textSpan = container.querySelector('.rating-text');

  if (!ratingDiv || !starsDiv || !textSpan) return;

  const { rating, count } = getProductRating(productName);

  // Generate stars
  starsDiv.innerHTML = generateStars(rating);

  // Generate rating text
  if (count === 0) {
    textSpan.textContent = 'No reviews yet';
  } else if (count === 1) {
    textSpan.textContent = `${count} review`;
  } else {
    textSpan.textContent = `${count} reviews`;
  }
}
