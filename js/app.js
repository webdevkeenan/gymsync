// Main Application Controller

class GymSyncApp {
    constructor() {
        this.initialized = false;
        this.init();
    }

    async init() {
        try {
            // Initialize storage with mock data
            storage.initializeStorage();
            
            // Initialize all modules
            this.initializeModules();
            
            // Setup global event listeners
            this.setupGlobalListeners();
            
            // Update notification badge
            ui.updateNotificationBadge();
            
            // Check for system alerts
            notifications.checkSystemAlerts();
            
            // Show welcome message
            this.showWelcomeMessage();
            
            this.initialized = true;
            console.log('GymSync initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize GymSync:', error);
            ui.showToast('Failed to initialize application', 'error');
        }
    }

    initializeModules() {
        // All modules are auto-initialized when their scripts load
        // This method ensures they're ready
        console.log('Modules initialized:', {
            dashboard: !!window.dashboard,
            members: !!window.members,
            checkin: !!window.checkin,
            classes: !!window.classes,
            pos: !!window.pos,
            notifications: !!window.notifications,
            offline: !!window.offline
        });
    }

    setupGlobalListeners() {
        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Handle before unload to warn about unsaved changes
        window.addEventListener('beforeunload', (e) => {
            return this.handleBeforeUnload(e);
        });

        // Setup periodic updates
        this.setupPeriodicUpdates();
    }

    handleKeyboardShortcuts(e) {
        // Only when not typing in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        // Ctrl/Cmd + K for quick search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.openQuickSearch();
        }

        // Ctrl/Cmd + / for keyboard shortcuts help
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            this.showKeyboardShortcuts();
        }

        // Number keys for navigation
        if (e.key >= '1' && e.key <= '6') {
            const screens = ['dashboard', 'members', 'checkin', 'classes', 'pos', 'notifications'];
            const screenIndex = parseInt(e.key) - 1;
            if (screenIndex < screens.length) {
                ui.showScreen(screens[screenIndex]);
            }
        }
    }

    handleResize() {
        // Handle responsive layout changes
        if (window.innerWidth <= 768) {
            document.getElementById('sidebar').classList.add('collapsed');
        }
    }

    handleBeforeUnload(e) {
        // Check if there are unsaved changes or pending sync items
        const queue = storage.getOfflineQueue() || [];
        const pendingItems = queue.filter(item => item.status === 'pending');
        
        if (pendingItems.length > 0 && !offline.isOnline) {
            e.preventDefault();
            e.returnValue = 'You have pending sync items. Are you sure you want to leave?';
            return e.returnValue;
        }
    }

    setupPeriodicUpdates() {
        // Update dashboard every 30 seconds
        setInterval(() => {
            if (this.initialized) {
                dashboard.updateDashboard();
            }
        }, 30000);

        // Check system alerts every minute
        setInterval(() => {
            if (this.initialized) {
                notifications.checkSystemAlerts();
            }
        }, 60000);

        // Update notification badge every 15 seconds
        setInterval(() => {
            if (this.initialized) {
                ui.updateNotificationBadge();
            }
        }, 15000);
    }

    showWelcomeMessage() {
        const lastVisit = storage.getSettings()?.lastVisit;
        const now = new Date().toISOString();
        
        if (!lastVisit || !GymData.isToday(lastVisit)) {
            // Show welcome notification
            const hour = new Date().getHours();
            let greeting = 'Good day';
            
            if (hour < 12) greeting = 'Good morning';
            else if (hour < 18) greeting = 'Good afternoon';
            else greeting = 'Good evening';
            
            setTimeout(() => {
                ui.showToast(
                    `${greeting}! Welcome to GymSync.`,
                    'info',
                    'Welcome'
                );
            }, 1000);
        }
        
        // Update last visit
        storage.updateSetting('lastVisit', now);
    }

    openQuickSearch() {
        // Create quick search modal
        const content = `
            <div class="quick-search">
                <div class="search-container">
                    <input type="text" id="quickSearchInput" placeholder="Search members, classes, products..." autofocus>
                    <div class="quick-search-results" id="quickSearchResults">
                        <div class="search-hint">
                            <p>Start typing to search...</p>
                            <p>Search members by name, ID, email, or phone</p>
                            <p>Search classes by name or instructor</p>
                            <p>Search products by name</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        ui.showModal('Quick Search', content);

        const searchInput = document.getElementById('quickSearchInput');
        const resultsContainer = document.getElementById('quickSearchResults');
        
        searchInput.addEventListener('input', (e) => {
            this.performQuickSearch(e.target.value, resultsContainer);
        });

        // Focus on input
        setTimeout(() => searchInput.focus(), 100);
    }

    performQuickSearch(query, resultsContainer) {
        if (!query.trim()) {
            resultsContainer.innerHTML = `
                <div class="search-hint">
                    <p>Start typing to search...</p>
                </div>
            `;
            return;
        }

        const lowerQuery = query.toLowerCase();
        const results = {
            members: [],
            classes: [],
            products: []
        };

        // Search members
        const members = storage.getMembers() || [];
        results.members = members.filter(member => 
            member.firstName.toLowerCase().includes(lowerQuery) ||
            member.lastName.toLowerCase().includes(lowerQuery) ||
            member.id.toLowerCase().includes(lowerQuery) ||
            member.email.toLowerCase().includes(lowerQuery)
        ).slice(0, 3);

        // Search classes
        results.classes = GymData.classes.filter(cls => 
            cls.name.toLowerCase().includes(lowerQuery) ||
            cls.instructor.toLowerCase().includes(lowerQuery)
        ).slice(0, 3);

        // Search products
        results.products = GymData.products.filter(product => 
            product.name.toLowerCase().includes(lowerQuery)
        ).slice(0, 3);

        // Render results
        let html = '';

        if (results.members.length > 0) {
            html += `
                <div class="search-section">
                    <h4>Members</h4>
                    ${results.members.map(member => `
                        <div class="search-result" onclick="ui.hideModal(); ui.showScreen('members'); setTimeout(() => members.viewMember('${member.id}'), 100);">
                            <i class="fas fa-user"></i>
                            <div>
                                <strong>${member.firstName} ${member.lastName}</strong>
                                <small>${member.id}</small>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        if (results.classes.length > 0) {
            html += `
                <div class="search-section">
                    <h4>Classes</h4>
                    ${results.classes.map(cls => `
                        <div class="search-result" onclick="ui.hideModal(); ui.showScreen('classes'); setTimeout(() => classes.viewClassDetails('${cls.id}'), 100);">
                            <i class="fas fa-calendar"></i>
                            <div>
                                <strong>${cls.name}</strong>
                                <small>${cls.instructor} - ${cls.time}</small>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        if (results.products.length > 0) {
            html += `
                <div class="search-section">
                    <h4>Products</h4>
                    ${results.products.map(product => `
                        <div class="search-result" onclick="ui.hideModal(); ui.showScreen('pos'); setTimeout(() => pos.addToCart('${product.id}'), 100);">
                            <i class="fas fa-shopping-cart"></i>
                            <div>
                                <strong>${product.name}</strong>
                                <small>${GymData.formatCurrency(product.price)}</small>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        if (html === '') {
            html = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>No results found</p>
                </div>
            `;
        }

        resultsContainer.innerHTML = html;
    }

    showKeyboardShortcuts() {
        const content = `
            <div class="keyboard-shortcuts">
                <h3>Keyboard Shortcuts</h3>
                <div class="shortcuts-list">
                    <div class="shortcut-item">
                        <kbd>Ctrl</kbd> + <kbd>K</kbd>
                        <span>Quick Search</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Ctrl</kbd> + <kbd>/</kbd>
                        <span>Show Shortcuts</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>1</kbd>
                        <span>Dashboard</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>2</kbd>
                        <span>Member Management</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>3</kbd>
                        <span>Check-In</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>4</kbd>
                        <span>Classes</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>5</kbd>
                        <span>Point of Sale</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>6</kbd>
                        <span>Notifications</span>
                    </div>
                </div>
            </div>
        `;

        ui.showModal('Keyboard Shortcuts', content);
    }

    // Application statistics
    getAppStats() {
        return {
            version: '1.0.0',
            initialized: this.initialized,
            storage: {
                members: (storage.getMembers() || []).length,
                checkins: (storage.getCheckins() || []).length,
                enrollments: (storage.getEnrollments() || []).length,
                sales: (storage.getSales() || []).length,
                notifications: (storage.getNotifications() || []).length,
                offlineQueue: (storage.getOfflineQueue() || []).filter(q => q.status === 'pending').length
            },
            modules: {
                dashboard: !!window.dashboard,
                members: !!window.members,
                checkin: !!window.checkin,
                classes: !!window.classes,
                pos: !!window.pos,
                notifications: !!window.notifications,
                offline: !!window.offline
            }
        };
    }

    // Export all application data
    exportAllData() {
        const data = {
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            stats: this.getAppStats(),
            data: {
                members: storage.getMembers(),
                checkins: storage.getCheckins(),
                enrollments: storage.getEnrollments(),
                sales: storage.getSales(),
                notifications: storage.getNotifications(),
                offlineQueue: storage.getOfflineQueue(),
                settings: storage.getSettings()
            }
        };
        
        return data;
    }

    // Cleanup method
    destroy() {
        if (dashboard) dashboard.destroy();
        // Other cleanup if needed
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new GymSyncApp();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && window.app) {
        // Refresh data when page becomes visible
        dashboard.updateDashboard();
        notifications.checkSystemAlerts();
        ui.updateNotificationBadge();
    }
});
