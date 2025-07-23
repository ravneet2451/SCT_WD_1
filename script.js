// DOM Elements
const navbar = document.getElementById('navbar');
const navMenu = document.getElementById('navMenu');
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelectorAll('.nav-link');
const cartIcon = document.getElementById('cartIcon');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const closeCart = document.getElementById('closeCart');
const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModal = document.getElementById('checkoutModal');
const closeModal = document.getElementById('closeModal');

// Cart functionality
let cart = [];

// Load cart from localStorage on page load
function loadCart() {
    const savedCart = localStorage.getItem('coffeecraft_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    updateCartUI();
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('coffeecraft_cart', JSON.stringify(cart));
}

// Add to cart function
function addToCart(name, price, image) {
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: name,
            price: parseFloat(price),
            image: image,
            quantity: 1
        });
    }
    
    saveCart(); // Save to localStorage
    updateCartUI();
    showNotification(`${name} added to cart!`, 'success');
}

// Remove from cart function
function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    saveCart(); // Save to localStorage
    updateCartUI();
    showNotification('Item removed from cart', 'success');
}

// Update quantity function
function updateQuantity(name, change) {
    const item = cart.find(item => item.name === name);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(name);
        } else {
            saveCart(); // Save to localStorage
            updateCartUI();
        }
    }
}

// Update cart UI
function updateCartUI() {
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total.toFixed(0);
    
    // Update cart items display
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
            </div>
        `;
        checkoutBtn.disabled = true;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">₹${item.price.toFixed(0)}</div>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity('${item.name}', -1)">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity('${item.name}', 1)">+</button>
                    </div>
                </div>
                <button class="remove-item" onclick="removeFromCart('${item.name}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
        checkoutBtn.disabled = false;
    }
    
    updateCheckoutSummary();
}

// Update checkout summary
function updateCheckoutSummary() {
    const orderItems = document.getElementById('orderItems');
    const subtotalEl = document.getElementById('subtotal');
    const taxEl = document.getElementById('tax');
    const deliveryEl = document.getElementById('delivery');
    const finalTotalEl = document.getElementById('finalTotal');
    
    if (orderItems) {
        if (cart.length === 0) {
            orderItems.innerHTML = '<p>No items in cart</p>';
            subtotalEl.textContent = '0';
            taxEl.textContent = '0';
            finalTotalEl.textContent = '50';
        } else {
            orderItems.innerHTML = cart.map(item => `
                <div class="order-item">
                    <div class="order-item-info">
                        <img src="${item.image}" alt="${item.name}" class="order-item-image">
                        <div class="order-item-details">
                            <h5>${item.name}</h5>
                            <div class="order-item-quantity">Quantity: ${item.quantity}</div>
                        </div>
                    </div>
                    <div class="order-item-price">₹${(item.price * item.quantity).toFixed(0)}</div>
                </div>
            `).join('');
            
            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const tax = subtotal * 0.18; // 18% GST in India
            const delivery = 50;
            const finalTotal = subtotal + tax + delivery;
            
            subtotalEl.textContent = subtotal.toFixed(0);
            taxEl.textContent = tax.toFixed(0);
            finalTotalEl.textContent = finalTotal.toFixed(0);
        }
    }
}

// Mobile Menu Toggle
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Cart event listeners
cartIcon.addEventListener('click', () => {
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('active');
});

closeCart.addEventListener('click', () => {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('active');
});

cartOverlay.addEventListener('click', () => {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('active');
});

checkoutBtn.addEventListener('click', () => {
    if (cart.length > 0) {
        checkoutModal.classList.add('active');
        updateCheckoutSummary();
    }
});

closeModal.addEventListener('click', () => {
    checkoutModal.classList.remove('active');
});

checkoutModal.addEventListener('click', (e) => {
    if (e.target === checkoutModal) {
        checkoutModal.classList.remove('active');
    }
});

// Add to cart button event listeners
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart-btn')) {
        const name = e.target.getAttribute('data-name');
        const price = e.target.getAttribute('data-price');
        const image = e.target.getAttribute('data-image');
        addToCart(name, price, image);
        
        // Add visual feedback
        e.target.style.transform = 'scale(0.95)';
        setTimeout(() => {
            e.target.style.transform = '';
        }, 150);
    }
});

// Payment form handling
const paymentForm = document.getElementById('paymentForm');
const cardDetails = document.getElementById('cardDetails');
const upiDetails = document.getElementById('upiDetails');
const cardNumber = document.getElementById('cardNumber');
const expiry = document.getElementById('expiry');
const cvv = document.getElementById('cvv');
const upiId = document.getElementById('upiId');

// Payment method toggle
document.addEventListener('change', (e) => {
    if (e.target.name === 'payment') {
        if (e.target.value === 'card') {
            cardDetails.style.display = 'block';
            upiDetails.style.display = 'none';
        } else if (e.target.value === 'upi') {
            cardDetails.style.display = 'none';
            upiDetails.style.display = 'block';
        } else {
            cardDetails.style.display = 'none';
            upiDetails.style.display = 'none';
        }
    }
});

// Card number formatting
if (cardNumber) {
    cardNumber.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        if (formattedValue.length <= 19) {
            e.target.value = formattedValue;
        }
    });
}

// Expiry date formatting
if (expiry) {
    expiry.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
    });
}

// CVV formatting
if (cvv) {
    cvv.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
    });
}

// UPI ID validation
if (upiId) {
    upiId.addEventListener('input', (e) => {
        // Basic UPI ID format validation
        const value = e.target.value.toLowerCase();
        // Remove any spaces and special characters except @ and .
        e.target.value = value.replace(/[^a-zA-Z0-9@.]/g, '');
    });

    upiId.addEventListener('blur', (e) => {
        const value = e.target.value;
        const upiPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+$/;
        
        if (value && !upiPattern.test(value)) {
            e.target.style.borderColor = '#e74c3c';
            e.target.title = 'Please enter a valid UPI ID (e.g., name@paytm)';
        } else {
            e.target.style.borderColor = '#D4A574';
            e.target.title = '';
        }
    });
}

// Payment form submission
if (paymentForm) {
    paymentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get selected payment method
        const selectedPayment = document.querySelector('input[name="payment"]:checked');
        const paymentMethod = selectedPayment ? selectedPayment.value : 'card';
        
        // Validate payment method specific fields
        if (paymentMethod === 'upi') {
            const upiIdValue = upiId.value.trim();
            const upiPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+$/;
            
            if (upiIdValue && !upiPattern.test(upiIdValue)) {
                showNotification('Please enter a valid UPI ID or use QR code payment', 'error');
                return;
            }
        }
        
        // Simulate payment processing
        const submitBtn = paymentForm.querySelector('.place-order-btn');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            // Clear cart
            cart = [];
            saveCart(); // Clear localStorage
            updateCartUI();
            
            // Close modals
            checkoutModal.classList.remove('active');
            cartSidebar.classList.remove('open');
            cartOverlay.classList.remove('active');
            
            // Show success message based on payment method
            let successMessage = 'Order placed successfully! Thank you for your purchase.';
            if (paymentMethod === 'upi') {
                successMessage = 'UPI payment successful! Your order has been confirmed.';
            } else if (paymentMethod === 'cash') {
                successMessage = 'Order confirmed! Pay cash on delivery.';
            }
            
            showNotification(successMessage, 'success');
            
            // Reset form
            paymentForm.reset();
            cardDetails.style.display = 'block';
            upiDetails.style.display = 'none';
            
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    });
}

// Initialize cart UI
loadCart(); // Load cart from localStorage on page load

// Sticky Navigation and Active Link Highlighting
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const navbar = document.getElementById('navbar');
    
    // Add/remove scrolled class for navbar styling
    if (scrolled > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    // Get all sections
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    
    // Determine which section is currently in view
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 120; // Offset for fixed navbar
        const sectionBottom = sectionTop + section.offsetHeight;
        
        if (scrolled >= sectionTop && scrolled < sectionBottom) {
            currentSection = section.getAttribute('id');
        }
    });
    
    // Update active nav link
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === currentSection) {
            link.classList.add('active');
        }
    });
});

// Smooth scrolling for navigation links
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
            
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// CTA Button functionality
const ctaButton = document.querySelector('.cta-button');
if (ctaButton) {
    ctaButton.addEventListener('click', () => {
        const menuSection = document.querySelector('#menu');
        if (menuSection) {
            const offsetTop = menuSection.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
}

// Contact form handling
const contactForm = document.querySelector('.contact-form form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const name = contactForm.querySelector('input[type="text"]').value;
        const email = contactForm.querySelector('input[type="email"]').value;
        const message = contactForm.querySelector('textarea').value;
        
        // Simple validation
        if (name && email && message) {
            // Show success message
            showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
            
            // Reset form
            contactForm.reset();
        } else {
            showNotification('Please fill in all fields.', 'error');
        }
    });
}

// Notification system
function showNotification(message, type) {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        z-index: 10000;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 350px;
    `;
    
    // Add notification to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.menu-item, .service-card, .contact-item');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.hero::before');
    
    parallaxElements.forEach(el => {
        const speed = 0.5;
        el.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Add loading styles
    const style = document.createElement('style');
    style.textContent = `
        .loaded .hero-content {
            animation: fadeInUp 1s ease forwards;
        }
        
        .loaded .hero-image {
            animation: fadeInUp 1s ease 0.3s forwards;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
});

// Navbar color change on different sections
function updateNavbarColor() {
    const scrolled = window.pageYOffset;
    const sections = document.querySelectorAll('section');
    const navbar = document.getElementById('navbar');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 120;
        const sectionBottom = sectionTop + section.offsetHeight;
        
        if (scrolled >= sectionTop && scrolled < sectionBottom) {
            currentSection = section.getAttribute('id');
        }
    });
    
    // Change navbar background based on section
    switch (currentSection) {
        case 'home':
            navbar.style.background = 'rgba(44, 29, 17, 0.95)';
            break;
        case 'about':
            navbar.style.background = 'rgba(44, 29, 17, 0.98)';
            break;
        case 'menu':
            navbar.style.background = 'rgba(44, 29, 17, 0.95)';
            break;
        case 'services':
            navbar.style.background = 'rgba(26, 26, 26, 0.95)';
            break;
        case 'contact':
            navbar.style.background = 'rgba(44, 29, 17, 0.98)';
            break;
        default:
            navbar.style.background = 'rgba(44, 29, 17, 0.95)';
    }
}

// Enhanced scroll event listener
window.addEventListener('scroll', () => {
    updateNavbarColor();
    
    // Throttle scroll events for better performance
    if (!window.ticking) {
        requestAnimationFrame(() => {
            updateNavbarColor();
            window.ticking = false;
        });
        window.ticking = true;
    }
});

// Menu item hover effects
const menuItems = document.querySelectorAll('.menu-item');
menuItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
        item.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    item.addEventListener('mouseleave', () => {
        item.style.transform = 'translateY(0) scale(1)';
    });
});

// Service card hover effects
const serviceCards = document.querySelectorAll('.service-card');
serviceCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-5px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
    });
});

// Add ripple effect to buttons
function createRipple(event) {
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
    circle.classList.add('ripple');
    
    // Add ripple styles
    circle.style.cssText += `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    `;
    
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(rippleStyle);
    
    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) {
        ripple.remove();
    }
    
    button.appendChild(circle);
    
    setTimeout(() => {
        circle.remove();
    }, 600);
}

// Add ripple effect to buttons
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.cta-button, .submit-btn');
    buttons.forEach(button => {
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.addEventListener('click', createRipple);
    });
});

// Scroll progress indicator
function createScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 4px;
        background: linear-gradient(90deg, #D4A574, #B8935A);
        z-index: 10001;
        transform-origin: left center;
        transform: scaleX(0);
        transition: transform 0.3s ease;
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        progressBar.style.width = scrollPercent + '%';
        progressBar.style.transform = `scaleX(${scrollPercent / 100})`;
    });
}

// Initialize scroll progress
document.addEventListener('DOMContentLoaded', createScrollProgress);
