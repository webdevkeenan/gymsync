// UI Utilities and Common Functions

class UIManager {
    constructor() {
        this.currentScreen = 'dashboard';
        this.isMobile = false;
        this.isTablet = false;
        this.touchSupported = false;
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupSidebar();
        this.setupModal();
        this.setupToast();
        this.setupResponsiveHandlers();
        this.setupTouchHandlers();
        this.detectDeviceType();
    }

    detectDeviceType() {
        this.isMobile = window.innerWidth <= 768;
        this.isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
        this.touchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // Update body classes for device-specific styling
        document.body.classList.toggle('mobile', this.isMobile);
        document.body.classList.toggle('tablet', this.isTablet);
        document.body.classList.toggle('desktop', !this.isMobile && !this.isTablet);
        document.body.classList.toggle('touch', this.touchSupported);
    }

    setupResponsiveHandlers() {
        // Handle window resize with debouncing
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.detectDeviceType();
                this.handleResponsiveLayout();
            }, 250);
        });

        // Handle orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.detectDeviceType();
                this.handleOrientationChange();
            }, 100);
        });
    }

    setupTouchHandlers() {
        if (!this.touchSupported) return;

        // Add touch feedback for buttons
        document.addEventListener('touchstart', (e) => {
            if (e.target.matches('.btn, .nav-link, .product-card, .class-card, .member-option, .search-result')) {
                e.target.style.transform = 'scale(0.98)';
            }
        });

        document.addEventListener('touchend', (e) => {
            if (e.target.matches('.btn, .nav-link, .product-card, .class-card, .member-option, .search-result')) {
                setTimeout(() => {
                    e.target.style.transform = '';
                }, 150);
            }
        });

        // Prevent double-tap zoom on form inputs
        document.addEventListener('touchstart', (e) => {
            if (e.target.matches('input, textarea, select')) {
                e.target.style.fontSize = '16px';
            }
        });
    }

    handleResponsiveLayout() {
        // Auto-hide sidebar on mobile when switching screens
        if (this.isMobile) {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.remove('active');
        }

        // Adjust modal positioning
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (this.isMobile) {
                modal.style.width = '95%';
                modal.style.margin = '1rem';
            } else if (this.isTablet) {
                modal.style.width = '90%';
                modal.style.margin = 'auto';
            }
        });
    }

    handleOrientationChange() {
        // Special handling for landscape mode on phones
        if (this.isMobile && window.innerHeight < window.innerWidth) {
            document.body.classList.add('landscape-mode');
            
            // Show toast for landscape mode
            this.showToast('For better experience, consider using portrait mode', 'info', 'Landscape Mode');
        } else {
            document.body.classList.remove('landscape-mode');
        }
    }

    // Screen Navigation
    showScreen(screenName) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });

        // Show target screen
        const targetScreen = document.getElementById(`${screenName}-screen`);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
            this.currentScreen = screenName;
        }

        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-screen="${screenName}"]`).classList.add('active');

        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            members: 'Member Management',
            checkin: 'Check-In',
            classes: 'Classes',
            pos: 'Point of Sale',
            notifications: 'Notifications'
        };
        document.getElementById('pageTitle').textContent = titles[screenName] || 'GymSync';

        // Close mobile sidebar
        if (this.isMobile) {
            document.getElementById('sidebar').classList.remove('active');
        }

        // Trigger screen-specific responsive adjustments
        this.handleScreenResponsive(screenName);
    }

    handleScreenResponsive(screenName) {
        switch (screenName) {
            case 'pos':
                this.handlePOSResponsive();
                break;
            case 'members':
                this.handleMembersResponsive();
                break;
            case 'classes':
                this.handleClassesResponsive();
                break;
        }
    }

    handlePOSResponsive() {
        const posContainer = document.querySelector('.pos-container');
        const posCart = document.querySelector('.pos-cart');
        
        if (this.isMobile) {
            // Make cart sticky on mobile
            posCart.style.position = 'sticky';
            posCart.style.top = '0';
            posCart.style.zIndex = '10';
        } else {
            // Reset to default positioning
            posCart.style.position = '';
            posCart.style.top = '';
            posCart.style.zIndex = '';
        }
    }

    handleMembersResponsive() {
        const table = document.querySelector('.data-table');
        if (this.isMobile && table) {
            // Add horizontal scroll wrapper for table
            if (!table.parentElement.classList.contains('table-wrapper')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'table-wrapper';
                wrapper.style.overflowX = 'auto';
                wrapper.style.webkitOverflowScrolling = 'touch';
                table.parentNode.insertBefore(wrapper, table);
                wrapper.appendChild(table);
            }
        }
    }

    handleClassesResponsive() {
        const classesGrid = document.querySelector('.classes-grid');
        if (this.isMobile && classesGrid) {
            // Adjust grid for mobile
            classesGrid.style.gridTemplateColumns = '1fr';
        }
    }

    setupNavigation() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const screenName = link.dataset.screen;
                this.showScreen(screenName);
            });
        });

        // Add mobile menu toggle
        if (this.isMobile) {
            this.addMobileMenuToggle();
        }
    }

    addMobileMenuToggle() {
        const header = document.querySelector('.header');
        const mobileToggle = document.createElement('button');
        mobileToggle.className = 'mobile-menu-toggle';
        mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
        mobileToggle.style.cssText = `
            background: none;
            border: none;
            font-size: 1.25rem;
            color: var(--text-primary);
            cursor: pointer;
            padding: 0.5rem;
        `;

        mobileToggle.addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('active');
        });

        header.insertBefore(mobileToggle, header.firstChild);
    }

    setupSidebar() {
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');

        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });

        // Add swipe gestures for mobile
        if (this.touchSupported) {
            this.setupSwipeGestures(sidebar);
        }

        // Initialize sidebar state based on screen size
        if (this.isMobile) {
            sidebar.classList.add('collapsed');
        }
    }

    setupSwipeGestures(sidebar) {
        let touchStartX = 0;
        let touchEndX = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipeGesture(touchStartX, touchEndX, sidebar);
        });
    }

    handleSwipeGesture(startX, endX, sidebar) {
        const swipeThreshold = 50;
        const diff = startX - endX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - close sidebar
                sidebar.classList.remove('active');
            } else {
                // Swipe right - open sidebar
                sidebar.classList.add('active');
            }
        }
    }

    // Modal Management
    setupModal() {
        const modalOverlay = document.getElementById('modalOverlay');
        const modalClose = document.getElementById('modalClose');

        modalClose.addEventListener('click', () => {
            this.hideModal();
        });

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                this.hideModal();
            }
        });
    }

    showModal(title, content) {
        const modalOverlay = document.getElementById('modalOverlay');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        modalTitle.textContent = title;
        modalBody.innerHTML = content;
        modalOverlay.classList.remove('hidden');
    }

    hideModal() {
        document.getElementById('modalOverlay').classList.add('hidden');
    }

    // Toast Notifications
    setupToast() {
        // Toast container is already in HTML
    }

    showToast(message, type = 'info', title = null) {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        const toastTitle = title || type.charAt(0).toUpperCase() + type.slice(1);

        toast.innerHTML = `
            <i class="fas ${icons[type]} toast-icon"></i>
            <div class="toast-content">
                <div class="toast-title">${toastTitle}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        toastContainer.appendChild(toast);

        // Add close functionality
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 5000);
    }

    // Badge Creation
    createBadge(text, type = 'active') {
        const badge = document.createElement('span');
        badge.className = `badge badge-${type}`;
        badge.textContent = text;
        return badge;
    }

    // Loading States
    showLoading(element) {
        element.disabled = true;
        element.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    }

    hideLoading(element, originalText) {
        element.disabled = false;
        element.innerHTML = originalText;
    }

    // Form Validation
    validateForm(formElement) {
        const inputs = formElement.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });

        return isValid;
    }

    // Search Functionality
    setupSearch(searchInput, searchFunction) {
        let searchTimeout;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchFunction(e.target.value);
            }, 300);
        });
    }

    // Table Creation
    createTable(headers, data, rowRenderer) {
        const table = document.createElement('table');
        table.className = 'data-table';

        // Create header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create body
        const tbody = document.createElement('tbody');
        data.forEach(item => {
            const row = rowRenderer(item);
            tbody.appendChild(row);
        });
        table.appendChild(tbody);

        return table;
    }

    // Card Creation
    createCard(title, content, className = '') {
        const card = document.createElement('div');
        card.className = `card ${className}`;
        
        if (title) {
            const cardHeader = document.createElement('div');
            cardHeader.className = 'card-header';
            cardHeader.textContent = title;
            card.appendChild(cardHeader);
        }

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';
        cardBody.innerHTML = content;
        card.appendChild(cardBody);

        return card;
    }

    // Empty State
    showEmptyState(container, message = 'No data available') {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>${message}</p>
            </div>
        `;
    }

    // Confirmation Dialog
    confirmAction(message, onConfirm) {
        const content = `
            <p>${message}</p>
            <div class="modal-actions">
                <button class="btn btn-outline" id="confirmCancel">Cancel</button>
                <button class="btn btn-danger" id="confirmOk">Confirm</button>
            </div>
        `;

        this.showModal('Confirm Action', content);

        document.getElementById('confirmCancel').addEventListener('click', () => {
            this.hideModal();
        });

        document.getElementById('confirmOk').addEventListener('click', () => {
            onConfirm();
            this.hideModal();
        });
    }

    // Format utilities
    formatPhoneNumber(phone) {
        const cleaned = phone.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            return `(${match[1]}) ${match[2]}-${match[3]}`;
        }
        return phone;
    }

    // Date utilities
    getRelativeTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        
        return GymData.formatDate(dateString);
    }

    // Update notification badge
    updateNotificationBadge() {
        const badge = document.getElementById('notificationBadge');
        const count = storage.getUnreadCount();
        
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }

    // Initialize tooltips (if needed)
    initTooltips() {
        // Simple tooltip implementation
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = e.target.dataset.tooltip;
                document.body.appendChild(tooltip);

                const rect = e.target.getBoundingClientRect();
                tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
                tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
            });

            element.addEventListener('mouseleave', () => {
                const tooltip = document.querySelector('.tooltip');
                if (tooltip) tooltip.remove();
            });
        });
    }

    // Responsive utilities
    isMobile() {
        return window.innerWidth <= 768;
    }

    isTablet() {
        return window.innerWidth > 768 && window.innerWidth <= 1024;
    }

    isDesktop() {
        return window.innerWidth > 1024;
    }
}

// Create global UI instance
window.ui = new UIManager();
