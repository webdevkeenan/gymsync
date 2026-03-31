// Point of Sale System Functionality

class POSManager {
    constructor() {
        this.products = [];
        this.cart = [];
        this.init();
    }

    init() {
        this.loadProducts();
        this.loadCart();
        this.setupEventListeners();
        this.renderProducts();
        this.renderCart();
    }

    setupEventListeners() {
        // Checkout button
        document.getElementById('checkoutBtn').addEventListener('click', () => {
            this.checkout();
        });

        // Payment method change
        document.querySelectorAll('input[name="payment"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.renderCart();
            });
        });
    }

    loadProducts() {
        this.products = [...GymData.products];
    }

    loadCart() {
        this.cart = storage.getCart() || [];
    }

    saveCart() {
        storage.setCart(this.cart);
    }

    renderProducts() {
        const productsGrid = document.getElementById('productsGrid');
        
        if (this.products.length === 0) {
            productsGrid.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-shopping-cart"></i>
                    <p>No products available</p>
                </div>
            `;
            return;
        }

        productsGrid.innerHTML = this.products.map(product => {
            const cartItem = this.cart.find(item => item.productId === product.id);
            const quantityInCart = cartItem ? cartItem.quantity : 0;
            
            return `
                <div class="product-card" onclick="pos.addToCart('${product.id}')">
                    <div class="product-image">
                        <i class="fas ${product.icon}"></i>
                    </div>
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">${GymData.formatCurrency(product.price)}</div>
                    <div class="product-stock">Stock: ${product.stock}</div>
                    ${quantityInCart > 0 ? `
                        <div class="cart-indicator">
                            <i class="fas fa-check-circle"></i>
                            ${quantityInCart} in cart
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    renderCart() {
        const cartItems = document.getElementById('cartItems');
        const cartTotal = storage.getCartTotal();
        
        // Update cart items
        if (this.cart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                </div>
            `;
        } else {
            cartItems.innerHTML = this.cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn" onclick="pos.updateQuantity('${item.productId}', ${item.quantity - 1})">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn" onclick="pos.updateQuantity('${item.productId}', ${item.quantity + 1})">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    <div class="cart-item-price">
                        ${GymData.formatCurrency(item.price * item.quantity)}
                    </div>
                    <button class="cart-item-remove" onclick="pos.removeFromCart('${item.productId}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');
        }

        // Update cart summary
        document.getElementById('cartSubtotal').textContent = GymData.formatCurrency(cartTotal.subtotal);
        document.getElementById('cartTax').textContent = GymData.formatCurrency(cartTotal.tax);
        document.getElementById('cartTotal').textContent = GymData.formatCurrency(cartTotal.total);

        // Update checkout button state
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (this.cart.length === 0) {
            checkoutBtn.disabled = true;
            checkoutBtn.innerHTML = '<i class="fas fa-credit-card"></i> Checkout';
        } else {
            checkoutBtn.disabled = false;
            checkoutBtn.innerHTML = `<i class="fas fa-credit-card"></i> Checkout ${GymData.formatCurrency(cartTotal.total)}`;
        }
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            ui.showToast('Product not found', 'error');
            return;
        }

        // Check stock
        const cartItem = this.cart.find(item => item.productId === productId);
        const currentQuantity = cartItem ? cartItem.quantity : 0;
        
        if (currentQuantity >= product.stock) {
            ui.showToast('Product is out of stock', 'warning');
            return;
        }

        // Add to cart
        storage.addToCart(product);
        this.loadCart();
        this.renderCart();
        this.renderProducts();
        
        ui.showToast(`${product.name} added to cart`, 'success');
    }

    updateQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeFromCart(productId);
            return;
        }

        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // Check stock
        if (newQuantity > product.stock) {
            ui.showToast('Only ' + product.stock + ' available in stock', 'warning');
            return;
        }

        // Update quantity
        if (storage.updateCartItemQuantity(productId, newQuantity)) {
            this.loadCart();
            this.renderCart();
            this.renderProducts();
        }
    }

    removeFromCart(productId) {
        if (storage.removeFromCart(productId)) {
            this.loadCart();
            this.renderCart();
            this.renderProducts();
            ui.showToast('Item removed from cart', 'info');
        }
    }

    async checkout() {
        if (this.cart.length === 0) {
            ui.showToast('Cart is empty', 'warning');
            return;
        }

        const cartTotal = storage.getCartTotal();
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

        // Show checkout confirmation modal
        this.showCheckoutModal(cartTotal, paymentMethod);
    }

    showCheckoutModal(cartTotal, paymentMethod) {
        const paymentIcons = {
            cash: 'fa-money-bill-wave',
            card: 'fa-credit-card',
            mobile: 'fa-mobile-alt'
        };

        const content = `
            <div class="checkout-summary">
                <h3>Order Summary</h3>
                <div class="summary-items">
                    ${this.cart.map(item => `
                        <div class="summary-item">
                            <span>${item.name} x${item.quantity}</span>
                            <span>${GymData.formatCurrency(item.price * item.quantity)}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="summary-totals">
                    <div class="summary-row">
                        <span>Subtotal:</span>
                        <span>${GymData.formatCurrency(cartTotal.subtotal)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Tax (10%):</span>
                        <span>${GymData.formatCurrency(cartTotal.tax)}</span>
                    </div>
                    <div class="summary-row total">
                        <span>Total:</span>
                        <span>${GymData.formatCurrency(cartTotal.total)}</span>
                    </div>
                </div>
                
                <div class="payment-info">
                    <h4>Payment Method</h4>
                    <div class="payment-selected">
                        <i class="fas ${paymentIcons[paymentMethod]}"></i>
                        <span>${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}</span>
                    </div>
                </div>
                
                <div class="checkout-actions">
                    <button class="btn btn-outline" onclick="ui.hideModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="pos.processCheckout()">
                        <i class="fas fa-check"></i>
                        Complete Sale
                    </button>
                </div>
            </div>
        `;

        ui.showModal('Checkout', content);
    }

    async processCheckout() {
        const cartTotal = storage.getCartTotal();
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

        // Check stock again before finalizing
        for (const item of this.cart) {
            const product = this.products.find(p => p.id === item.productId);
            if (product && item.quantity > product.stock) {
                ui.showToast(`${product.name} is out of stock`, 'error');
                ui.hideModal();
                return;
            }
        }

        const isOffline = storage.getSettings()?.offlineMode || false;
        
        const saleData = {
            items: [...this.cart],
            subtotal: cartTotal.subtotal,
            tax: cartTotal.tax,
            total: cartTotal.total,
            paymentMethod: paymentMethod,
            timestamp: new Date().toISOString(),
            memberId: null, // Could be linked to member in future
            memberName: 'Guest',
            status: 'completed'
        };

        if (isOffline) {
            // Add to offline queue
            storage.addToOfflineQueue({
                action: 'sale',
                data: saleData
            });
            
            ui.showToast('Sale queued for sync (Offline Mode)', 'warning');
        } else {
            // Process immediately
            if (storage.addSale(saleData)) {
                // Update product stock
                this.updateProductStock();
                
                // Clear cart
                storage.clearCart();
                this.loadCart();
                this.renderCart();
                this.renderProducts();
                
                ui.showToast('Sale completed successfully', 'success');
                
                // Add activity
                dashboard.addActivity('sale', `Sale: ${GymData.formatCurrency(saleData.total)}`);
                
                // Update dashboard
                dashboard.updateDashboard();
                
                // Show receipt
                this.showReceipt(saleData);
            } else {
                ui.showToast('Failed to process sale', 'error');
            }
        }

        ui.hideModal();
    }

    updateProductStock() {
        // Update stock in products array (in a real app, this would update the database)
        this.cart.forEach(item => {
            const product = this.products.find(p => p.id === item.productId);
            if (product) {
                product.stock -= item.quantity;
            }
        });
    }

    showReceipt(sale) {
        const receiptContent = `
            <div class="receipt">
                <div class="receipt-header">
                    <h3>GymSync</h3>
                    <p>Receipt</p>
                    <p>${GymData.formatDateTime(sale.timestamp)}</p>
                </div>
                
                <div class="receipt-items">
                    ${sale.items.map(item => `
                        <div class="receipt-item">
                            <span>${item.name} x${item.quantity}</span>
                            <span>${GymData.formatCurrency(item.price * item.quantity)}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="receipt-totals">
                    <div class="receipt-row">
                        <span>Subtotal:</span>
                        <span>${GymData.formatCurrency(sale.subtotal)}</span>
                    </div>
                    <div class="receipt-row">
                        <span>Tax:</span>
                        <span>${GymData.formatCurrency(sale.tax)}</span>
                    </div>
                    <div class="receipt-row total">
                        <span>Total:</span>
                        <span>${GymData.formatCurrency(sale.total)}</span>
                    </div>
                </div>
                
                <div class="receipt-payment">
                    <p>Payment: ${sale.paymentMethod.charAt(0).toUpperCase() + sale.paymentMethod.slice(1)}</p>
                    <p>Thank you for your purchase!</p>
                </div>
                
                <div class="receipt-actions">
                    <button class="btn btn-primary" onclick="ui.hideModal()">Close</button>
                </div>
            </div>
        `;

        ui.showModal('Receipt', receiptContent);
    }

    // Get POS statistics
    getPOSStats() {
        const sales = storage.getSales() || [];
        const today = new Date().toISOString().split('T')[0];
        const todaySales = sales.filter(sale => sale.timestamp.startsWith(today));
        
        return {
            todaySales: todaySales.length,
            todayRevenue: todaySales.reduce((sum, sale) => sum + sale.total, 0),
            totalSales: sales.length,
            totalRevenue: sales.reduce((sum, sale) => sum + sale.total, 0),
            averageSale: sales.length > 0 ? sales.reduce((sum, sale) => sum + sale.total, 0) / sales.length : 0,
            topProducts: this.getTopProducts()
        };
    }

    getTopProducts() {
        const sales = storage.getSales() || [];
        const productSales = {};
        
        sales.forEach(sale => {
            sale.items.forEach(item => {
                productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
            });
        });
        
        return Object.entries(productSales)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([name, quantity]) => ({ name, quantity }));
    }

    // Export POS data
    exportPOSData() {
        const data = {
            timestamp: new Date().toISOString(),
            stats: this.getPOSStats(),
            products: this.products,
            sales: storage.getSales() || []
        };
        return data;
    }
}

// Create global POS instance
window.pos = new POSManager();
