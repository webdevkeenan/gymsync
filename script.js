// GymSync Application
class GymSyncApp {
    constructor() {
        this.state = {
            selectedMemberId: null,
            isOffline: false,
            currentScreen: 'dashboard',
            cart: [],
            notifications: []
        };
        
        this.data = {
            members: [],
            membershipPlans: [],
            checkIns: [],
            classes: [],
            enrollments: [],
            products: [],
            sales: [],
            offlineQueue: []
        };
        
        this.init();
    }
    
    init() {
        this.loadMockData();
        this.loadPersistedData();
        this.setupEventListeners();
        this.updateNotificationBadge();
        this.render();
        this.startPeriodicUpdates();
    }
    
    // Mock Data Generation
    loadMockData() {
        // Membership Plans
        this.data.membershipPlans = [
            { id: 1, name: 'Basic', duration: '1 month', price: 29.99 },
            { id: 2, name: 'Premium', duration: '3 months', price: 79.99 },
            { id: 3, name: 'VIP', duration: '12 months', price: 299.99 }
        ];
        
        // Members
        this.data.members = [
            {
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@email.com',
                phone: '555-0101',
                membershipPlanId: 2,
                membershipStatus: 'active',
                alerts: [],
                lastVisit: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 2,
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@email.com',
                phone: '555-0102',
                membershipPlanId: 3,
                membershipStatus: 'active',
                alerts: ['Payment due in 5 days'],
                lastVisit: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 3,
                firstName: 'Mike',
                lastName: 'Johnson',
                email: 'mike.j@email.com',
                phone: '555-0103',
                membershipPlanId: 1,
                membershipStatus: 'expired',
                alerts: ['Membership expired', 'Payment overdue'],
                lastVisit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 4,
                firstName: 'Sarah',
                lastName: 'Williams',
                email: 'sarah.w@email.com',
                phone: '555-0104',
                membershipPlanId: 2,
                membershipStatus: 'active',
                alerts: [],
                lastVisit: new Date().toISOString()
            },
            {
                id: 5,
                firstName: 'Tom',
                lastName: 'Brown',
                email: 'tom.brown@email.com',
                phone: '555-0105',
                membershipPlanId: 1,
                membershipStatus: 'inactive',
                alerts: ['Account frozen'],
                lastVisit: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        
        // Classes
        this.data.classes = [
            {
                id: 1,
                title: 'Morning Yoga',
                instructor: 'Emma Wilson',
                dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
                capacity: 20,
                seatsRemaining: 8
            },
            {
                id: 2,
                title: 'HIIT Training',
                instructor: 'John Davis',
                dateTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
                capacity: 15,
                seatsRemaining: 3
            },
            {
                id: 3,
                title: 'Spin Class',
                instructor: 'Lisa Chen',
                dateTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
                capacity: 25,
                seatsRemaining: 12
            },
            {
                id: 4,
                title: 'Pilates',
                instructor: 'Maria Garcia',
                dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                capacity: 12,
                seatsRemaining: 0
            }
        ];
        
        // Products
        this.data.products = [
            { id: 1, name: 'Protein Powder', price: 29.99, category: 'supplements' },
            { id: 2, name: 'Energy Bar', price: 2.99, category: 'supplements' },
            { id: 3, name: 'Gym T-Shirt', price: 19.99, category: 'merchandise' },
            { id: 4, name: 'Water Bottle', price: 12.99, category: 'merchandise' },
            { id: 5, name: 'Personal Training', price: 49.99, category: 'services' },
            { id: 6, name: 'Yoga Mat', price: 24.99, category: 'merchandise' },
            { id: 7, name: 'Pre-Workout', price: 34.99, category: 'supplements' },
            { id: 8, name: 'Gym Bag', price: 39.99, category: 'merchandise' }
        ];
        
        // Generate some initial data
        this.generateInitialData();
    }
    
    generateInitialData() {
        // Generate some check-ins
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < 15; i++) {
            const checkInTime = new Date(today.getTime() + Math.random() * 12 * 60 * 60 * 1000);
            this.data.checkIns.push({
                id: Date.now() + i,
                memberId: [1, 2, 4][Math.floor(Math.random() * 3)],
                timestamp: checkInTime.toISOString(),
                status: 'completed'
            });
        }
        
        // Generate some sales
        for (let i = 0; i < 8; i++) {
            const saleTime = new Date(today.getTime() + Math.random() * 12 * 60 * 60 * 1000);
            const items = [];
            const numItems = Math.floor(Math.random() * 3) + 1;
            
            for (let j = 0; j < numItems; j++) {
                const product = this.data.products[Math.floor(Math.random() * this.data.products.length)];
                items.push({
                    productId: product.id,
                    quantity: Math.floor(Math.random() * 2) + 1,
                    price: product.price
                });
            }
            
            const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const tax = subtotal * 0.08;
            const total = subtotal + tax;
            
            this.data.sales.push({
                id: Date.now() + i + 1000,
                memberId: [1, 2, 4][Math.floor(Math.random() * 3)],
                items,
                subtotal,
                tax,
                total,
                paymentMethod: ['cash', 'card', 'mobile'][Math.floor(Math.random() * 3)],
                createdAt: saleTime.toISOString()
            });
        }
        
        // Generate some enrollments
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        for (let i = 0; i < 5; i++) {
            this.data.enrollments.push({
                id: Date.now() + i + 2000,
                memberId: [1, 2, 4][Math.floor(Math.random() * 3)],
                classSessionId: this.data.classes[Math.floor(Math.random() * 3)].id,
                bookedAt: new Date().toISOString(),
                status: 'booked'
            });
        }
    }
    
    // Data Persistence
    loadPersistedData() {
        const persisted = localStorage.getItem('gymsync_state');
        if (persisted) {
            const data = JSON.parse(persisted);
            this.state = { ...this.state, ...data.state };
            this.data = { ...this.data, ...data.data };
        }
    }
    
    savePersistedData() {
        const toPersist = {
            state: {
                selectedMemberId: this.state.selectedMemberId,
                isOffline: this.state.isOffline,
                cart: this.state.cart,
                notifications: this.state.notifications
            },
            data: {
                checkIns: this.data.checkIns,
                enrollments: this.data.enrollments,
                sales: this.data.sales,
                members: this.data.members,
                offlineQueue: this.data.offlineQueue
            }
        };
        localStorage.setItem('gymsync_state', JSON.stringify(toPersist));
    }
    
    // Event Listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const screen = e.currentTarget.dataset.screen;
                this.navigateToScreen(screen);
            });
        });
        
        // Mobile sidebar toggle
        document.getElementById('mobileSidebarToggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });
        
        // Sidebar toggle (desktop)
        document.getElementById('sidebarToggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('collapsed');
        });
        
        // Offline toggle
        document.getElementById('offlineToggle').addEventListener('change', (e) => {
            this.toggleOfflineMode(e.target.checked);
        });
        
        // Reset data
        document.getElementById('resetDataBtn').addEventListener('click', () => {
            this.resetDemoData();
        });
        
        // Quick actions
        document.getElementById('quickCheckinBtn').addEventListener('click', () => {
            this.navigateToScreen('checkin');
        });
        
        document.getElementById('quickSaleBtn').addEventListener('click', () => {
            this.navigateToScreen('pos');
        });
        
        document.getElementById('quickClassBtn').addEventListener('click', () => {
            this.navigateToScreen('classes');
        });
        
        document.getElementById('quickMemberBtn').addEventListener('click', () => {
            this.navigateToScreen('members');
        });
        
        // Member search
        document.getElementById('memberSearch').addEventListener('input', (e) => {
            this.searchMembers(e.target.value);
        });
        
        // Add member button
        document.getElementById('addMemberBtn').addEventListener('click', () => {
            this.showAddMemberForm();
        });
        
        // Check-in confirm
        document.getElementById('confirmCheckinBtn').addEventListener('click', () => {
            this.confirmCheckIn();
        });
        
        // Class filter
        document.getElementById('classFilter').addEventListener('change', (e) => {
            this.filterClasses(e.target.value);
        });
        
        // Product categories
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterProducts(e.currentTarget.dataset.category);
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });
        
        // Checkout
        document.getElementById('checkoutBtn').addEventListener('click', () => {
            this.processCheckout();
        });
        
        // Notification filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterNotifications(e.currentTarget.dataset.filter);
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });
    }
    
    // Navigation
    navigateToScreen(screenName) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-screen="${screenName}"]`).classList.add('active');
        
        // Update screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        document.getElementById(`${screenName}Screen`).classList.remove('hidden');
        
        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            members: 'Member Management',
            checkin: 'Check-In',
            classes: 'Classes',
            pos: 'Point of Sale',
            notifications: 'Notifications'
        };
        document.getElementById('pageTitle').textContent = titles[screenName];
        
        this.state.currentScreen = screenName;
        this.renderScreen(screenName);
        
        // Close mobile sidebar
        document.getElementById('sidebar').classList.remove('open');
    }
    
    // Selected Member Management
    selectMember(memberId) {
        this.state.selectedMemberId = memberId;
        this.savePersistedData();
        this.updateSelectedMemberPanel();
        this.showToast(`Selected: ${this.getMemberName(memberId)}`, 'success');
    }
    
    clearSelectedMember() {
        this.state.selectedMemberId = null;
        this.savePersistedData();
        this.updateSelectedMemberPanel();
        this.showToast('Member selection cleared', 'info');
    }
    
    getSelectedMember() {
        if (!this.state.selectedMemberId) return null;
        return this.data.members.find(m => m.id === this.state.selectedMemberId);
    }
    
    getMemberName(memberId) {
        const member = this.data.members.find(m => m.id === memberId);
        return member ? `${member.firstName} ${member.lastName}` : 'Unknown';
    }
    
    // UI Updates
    updateSelectedMemberPanel() {
        const container = document.getElementById('selectedMemberInfo');
        const member = this.getSelectedMember();
        
        if (!member) {
            container.innerHTML = `
                <div class="no-member-selected">
                    <p>No member selected</p>
                    <button class="btn btn-sm btn-primary" onclick="app.navigateToScreen('members')">Select Member</button>
                </div>
            `;
            return;
        }
        
        const plan = this.data.membershipPlans.find(p => p.id === member.membershipPlanId);
        const alertsHtml = member.alerts.length > 0 
            ? `<div class="member-alerts">
                 ${member.alerts.map(alert => `<div class="alert">⚠️ ${alert}</div>`).join('')}
               </div>`
            : '';
        
        container.innerHTML = `
            <div class="member-info">
                <div class="member-name">${member.firstName} ${member.lastName}</div>
                <div class="member-details">
                    <div>ID: #${member.id.toString().padStart(4, '0')}</div>
                    <div>Plan: ${plan ? plan.name : 'Unknown'}</div>
                    <div class="member-status ${member.membershipStatus}">${member.membershipStatus}</div>
                </div>
                ${alertsHtml}
                <div class="member-actions">
                    <button class="btn btn-sm btn-outline" onclick="app.navigateToScreen('members')">Change</button>
                    <button class="btn btn-sm btn-outline" onclick="app.clearSelectedMember()">Clear</button>
                </div>
            </div>
        `;
    }
    
    // Screen Rendering
    render() {
        this.updateSelectedMemberPanel();
        this.updateSyncStatus();
        this.renderScreen(this.state.currentScreen);
    }
    
    renderScreen(screenName) {
        switch(screenName) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'members':
                this.renderMembers();
                break;
            case 'checkin':
                this.renderCheckIn();
                break;
            case 'classes':
                this.renderClasses();
                break;
            case 'pos':
                this.renderPOS();
                break;
            case 'notifications':
                this.renderNotifications();
                break;
        }
    }
    
    renderDashboard() {
        // Update stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayCheckIns = this.data.checkIns.filter(ci => 
            new Date(ci.timestamp) >= today
        ).length;
        
        const todaySales = this.data.sales
            .filter(s => new Date(s.createdAt) >= today)
            .reduce((sum, s) => sum + s.total, 0);
        
        const activeMembers = this.data.members.filter(m => m.membershipStatus === 'active').length;
        const upcomingClasses = this.data.classes.filter(c => 
            new Date(c.dateTime) > new Date() && 
            new Date(c.dateTime) < new Date(Date.now() + 24 * 60 * 60 * 1000)
        ).length;
        
        document.getElementById('todayCheckins').textContent = todayCheckIns;
        document.getElementById('upcomingClasses').textContent = upcomingClasses;
        document.getElementById('salesToday').textContent = `$${todaySales.toFixed(2)}`;
        document.getElementById('activeMembers').textContent = activeMembers;
        
        // Render recent activity
        const recentActivity = this.getRecentActivity();
        const activityHtml = recentActivity.slice(0, 5).map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">${activity.icon}</div>
                <div class="activity-details">
                    <div class="activity-text">${activity.text}</div>
                    <div class="activity-time">${this.formatTime(activity.timestamp)}</div>
                </div>
            </div>
        `).join('');
        
        document.getElementById('recentActivity').innerHTML = activityHtml || '<p class="no-activity">No recent activity</p>';
        
        // Render alerts
        const alerts = this.getAlerts();
        const alertsHtml = alerts.slice(0, 3).map(alert => `
            <div class="alert-item">
                <div class="alert-icon ${alert.severity}">${alert.icon}</div>
                <div class="alert-details">
                    <div class="alert-text">${alert.message}</div>
                    <div class="alert-time">${this.formatTime(alert.timestamp)}</div>
                </div>
            </div>
        `).join('');
        
        document.getElementById('alertsList').innerHTML = alertsHtml || '<p class="no-alerts">No alerts</p>';
    }
    
    renderMembers() {
        const container = document.getElementById('membersGrid');
        const searchTerm = document.getElementById('memberSearch').value.toLowerCase();
        
        let members = this.data.members;
        if (searchTerm) {
            members = members.filter(m => 
                m.firstName.toLowerCase().includes(searchTerm) ||
                m.lastName.toLowerCase().includes(searchTerm) ||
                m.email.toLowerCase().includes(searchTerm)
            );
        }
        
        const membersHtml = members.map(member => {
            const plan = this.data.membershipPlans.find(p => p.id === member.membershipPlanId);
            return `
                <div class="member-card">
                    <div class="member-card-header">
                        <div class="member-card-name">${member.firstName} ${member.lastName}</div>
                        <div class="member-status ${member.membershipStatus}">${member.membershipStatus}</div>
                    </div>
                    <div class="member-card-details">
                        <div class="member-detail"><strong>Email:</strong> ${member.email}</div>
                        <div class="member-detail"><strong>Phone:</strong> ${member.phone}</div>
                        <div class="member-detail"><strong>Plan:</strong> ${plan ? plan.name : 'Unknown'}</div>
                        <div class="member-detail"><strong>Last Visit:</strong> ${this.formatDate(member.lastVisit)}</div>
                    </div>
                    <div class="member-card-actions">
                        <button class="btn btn-sm btn-primary" onclick="app.selectMember(${member.id})">Select</button>
                        <button class="btn btn-sm btn-outline" onclick="app.editMember(${member.id})">Edit</button>
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = membersHtml || '<p class="no-results">No members found</p>';
    }
    
    renderCheckIn() {
        const container = document.getElementById('checkinMemberInfo');
        const member = this.getSelectedMember();
        const confirmBtn = document.getElementById('confirmCheckinBtn');
        
        if (!member) {
            container.innerHTML = '<p class="info-message">Please select a member first</p>';
            confirmBtn.disabled = true;
            return;
        }
        
        const plan = this.data.membershipPlans.find(p => p.id === member.membershipPlanId);
        const canCheckIn = member.membershipStatus === 'active';
        
        container.innerHTML = `
            <div class="checkin-member-details">
                <div class="checkin-member-info">
                    <div class="checkin-member-name">${member.firstName} ${member.lastName}</div>
                    <div class="checkin-member-plan">Plan: ${plan ? plan.name : 'Unknown'}</div>
                    <div class="checkin-member-status ${member.membershipStatus}">${member.membershipStatus}</div>
                    <div class="checkin-member-last">Last Visit: ${this.formatDate(member.lastVisit)}</div>
                </div>
                ${member.alerts.length > 0 ? `
                    <div class="checkin-alerts">
                        <h4>Alerts</h4>
                        <ul>
                            ${member.alerts.map(alert => `<li>${alert}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
        
        confirmBtn.disabled = !canCheckIn;
        
        if (!canCheckIn) {
            confirmBtn.textContent = member.membershipStatus === 'expired' ? 'Membership Expired' : 'Cannot Check In';
            confirmBtn.classList.remove('btn-primary');
            confirmBtn.classList.add('btn-secondary');
        } else {
            confirmBtn.textContent = 'Confirm Check-In';
            confirmBtn.classList.add('btn-primary');
            confirmBtn.classList.remove('btn-secondary');
        }
    }
    
    renderClasses() {
        const container = document.getElementById('classesGrid');
        const filter = document.getElementById('classFilter').value;
        
        let classes = this.data.classes;
        const now = new Date();
        
        if (filter === 'today') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
            classes = classes.filter(c => {
                const classDate = new Date(c.dateTime);
                return classDate >= today && classDate < tomorrow;
            });
        } else if (filter === 'week') {
            const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            classes = classes.filter(c => new Date(c.dateTime) <= weekFromNow);
        }
        
        const classesHtml = classes.map(classSession => {
            const isFull = classSession.seatsRemaining === 0;
            const capacityPercentage = ((classSession.capacity - classSession.seatsRemaining) / classSession.capacity) * 100;
            
            return `
                <div class="class-card">
                    <div class="class-card-header">
                        <div class="class-title">${classSession.title}</div>
                        <div class="class-instructor">with ${classSession.instructor}</div>
                    </div>
                    <div class="class-details">
                        <div class="class-detail"><strong>Date:</strong> ${this.formatDate(classSession.dateTime)}</div>
                        <div class="class-detail"><strong>Time:</strong> ${this.formatTime(classSession.dateTime)}</div>
                    </div>
                    <div class="class-capacity">
                        <span class="capacity-text">${classSession.capacity - classSession.seatsRemaining}/${classSession.capacity}</span>
                        <div class="capacity-bar">
                            <div class="capacity-fill" style="width: ${capacityPercentage}%"></div>
                        </div>
                        <span class="capacity-text">${classSession.seatsRemaining} left</span>
                    </div>
                    <button class="btn ${isFull ? 'btn-secondary' : 'btn-primary'}" 
                            onclick="app.bookClass(${classSession.id})"
                            ${isFull ? 'disabled' : ''}>
                        ${isFull ? 'Class Full' : 'Book Class'}
                    </button>
                </div>
            `;
        }).join('');
        
        container.innerHTML = classesHtml || '<p class="no-classes">No classes found</p>';
    }
    
    renderPOS() {
        this.renderProducts();
        this.renderCart();
    }
    
    renderProducts() {
        const container = document.getElementById('productsGrid');
        const activeCategory = document.querySelector('.category-btn.active').dataset.category;
        
        let products = this.data.products;
        if (activeCategory !== 'all') {
            products = products.filter(p => p.category === activeCategory);
        }
        
        const productsHtml = products.map(product => `
            <div class="product-card" onclick="app.addToCart(${product.id})">
                <div class="product-name">${product.name}</div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="product-category">${product.category}</div>
            </div>
        `).join('');
        
        container.innerHTML = productsHtml;
    }
    
    renderCart() {
        const container = document.getElementById('cartItems');
        const checkoutBtn = document.getElementById('checkoutBtn');
        
        if (this.state.cart.length === 0) {
            container.innerHTML = '<p class="empty-cart">Cart is empty</p>';
            checkoutBtn.disabled = true;
            this.updateCartTotals();
            return;
        }
        
        const cartHtml = this.state.cart.map(item => {
            const product = this.data.products.find(p => p.id === item.productId);
            return `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${product.name}</div>
                        <div class="cart-item-price">$${product.price.toFixed(2)} each</div>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="app.updateCartQuantity(${item.productId}, -1)">-</button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="quantity-btn" onclick="app.updateCartQuantity(${item.productId}, 1)">+</button>
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = cartHtml;
        checkoutBtn.disabled = !this.getSelectedMember();
        this.updateCartTotals();
    }
    
    updateCartTotals() {
        const subtotal = this.state.cart.reduce((sum, item) => {
            const product = this.data.products.find(p => p.id === item.productId);
            return sum + (product.price * item.quantity);
        }, 0);
        
        const tax = subtotal * 0.08;
        const total = subtotal + tax;
        
        document.getElementById('cartSubtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('cartTax').textContent = `$${tax.toFixed(2)}`;
        document.getElementById('cartTotal').textContent = `$${total.toFixed(2)}`;
    }
    
    renderNotifications() {
        const container = document.getElementById('notificationsList');
        const filter = document.querySelector('.filter-btn.active').dataset.filter;
        
        let notifications = this.state.notifications;
        
        if (filter === 'unread') {
            notifications = notifications.filter(n => !n.read);
        } else if (filter === 'pending') {
            notifications = notifications.filter(n => n.pendingSync);
        }
        
        const notificationsHtml = notifications.map(notification => `
            <div class="notification-item ${notification.read ? '' : 'unread'} ${notification.pendingSync ? 'pending-sync' : ''}" 
                 onclick="app.markNotificationRead(${notification.id})">
                <div class="notification-header">
                    <div class="notification-type ${notification.type}">${notification.type}</div>
                    <div class="notification-time">${this.formatTime(notification.createdAt)}</div>
                </div>
                <div class="notification-message">${notification.message}</div>
            </div>
        `).join('');
        
        container.innerHTML = notificationsHtml || '<p class="no-notifications">No notifications</p>';
    }
    
    markNotificationRead(notificationId) {
        const notification = this.state.notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
            notification.read = true;
            this.savePersistedData();
            this.updateNotificationBadge();
            this.renderNotifications();
        }
    }
    
    // Business Logic
    confirmCheckIn() {
        const member = this.getSelectedMember();
        if (!member || member.membershipStatus !== 'active') return;
        
        const checkIn = {
            id: Date.now(),
            memberId: member.id,
            timestamp: new Date().toISOString(),
            status: this.state.isOffline ? 'pending' : 'completed'
        };
        
        if (this.state.isOffline) {
            this.data.offlineQueue.push({
                id: Date.now(),
                actionType: 'checkin',
                payload: checkIn,
                queuedAt: new Date().toISOString(),
                syncStatus: 'pending'
            });
            this.showToast('Check-in queued for sync', 'warning');
            this.addNotification('warning', `Check-in queued: ${member.firstName} ${member.lastName} (pending sync)`);
        } else {
            this.data.checkIns.push(checkIn);
            member.lastVisit = checkIn.timestamp;
            this.savePersistedData();
            this.showToast(`${member.firstName} ${member.lastName} checked in successfully!`, 'success');
        }
        
        this.addNotification('success', `Check-in: ${member.firstName} ${member.lastName}`);
        this.render();
    }
    
    bookClass(classSessionId) {
        const member = this.getSelectedMember();
        if (!member) {
            this.showToast('Please select a member first', 'warning');
            return;
        }
        
        const classSession = this.data.classes.find(c => c.id === classSessionId);
        if (!classSession || classSession.seatsRemaining === 0) {
            this.showToast('Class is full', 'error');
            return;
        }
        
        // Check if already enrolled
        const alreadyEnrolled = this.data.enrollments.some(e => 
            e.memberId === member.id && e.classSessionId === classSessionId
        );
        
        if (alreadyEnrolled) {
            this.showToast('Already enrolled in this class', 'warning');
            return;
        }
        
        const enrollment = {
            id: Date.now(),
            memberId: member.id,
            classSessionId,
            bookedAt: new Date().toISOString(),
            status: this.state.isOffline ? 'pending' : 'booked'
        };
        
        if (this.state.isOffline) {
            this.data.offlineQueue.push({
                id: Date.now(),
                actionType: 'booking',
                payload: enrollment,
                queuedAt: new Date().toISOString(),
                syncStatus: 'pending'
            });
            this.showToast('Booking queued for sync', 'warning');
            this.addNotification('warning', `Booking queued: ${member.firstName} ${member.lastName} - ${classSession.title} (pending sync)`);
        } else {
            this.data.enrollments.push(enrollment);
            classSession.seatsRemaining--;
            this.savePersistedData();
            this.showToast(`Successfully booked ${member.firstName} for ${classSession.title}`, 'success');
        }
        
        this.addNotification('success', `Booking: ${member.firstName} ${member.lastName} - ${classSession.title}`);
        this.render();
    }
    
    addToCart(productId) {
        const existingItem = this.state.cart.find(item => item.productId === productId);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.state.cart.push({ productId, quantity: 1 });
        }
        
        this.renderCart();
    }
    
    updateCartQuantity(productId, change) {
        const item = this.state.cart.find(item => item.productId === productId);
        if (!item) return;
        
        item.quantity += change;
        
        if (item.quantity <= 0) {
            this.state.cart = this.state.cart.filter(item => item.productId !== productId);
        }
        
        this.renderCart();
    }
    
    processCheckout() {
        const member = this.getSelectedMember();
        if (!member) {
            this.showToast('Please select a member first', 'warning');
            return;
        }
        
        if (this.state.cart.length === 0) {
            this.showToast('Cart is empty', 'warning');
            return;
        }
        
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        
        const items = this.state.cart.map(item => {
            const product = this.data.products.find(p => p.id === item.productId);
            return {
                productId: product.id,
                quantity: item.quantity,
                price: product.price
            };
        });
        
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.08;
        const total = subtotal + tax;
        
        const sale = {
            id: Date.now(),
            memberId: member.id,
            items,
            subtotal,
            tax,
            total,
            paymentMethod,
            createdAt: new Date().toISOString(),
            status: this.state.isOffline ? 'pending' : 'completed'
        };
        
        if (this.state.isOffline) {
            this.data.offlineQueue.push({
                id: Date.now(),
                actionType: 'sale',
                payload: sale,
                queuedAt: new Date().toISOString(),
                syncStatus: 'pending'
            });
            this.showToast('Sale queued for sync', 'warning');
            this.addNotification('warning', `Sale queued: ${member.firstName} ${member.lastName} - $${total.toFixed(2)} (pending sync)`);
        } else {
            this.data.sales.push(sale);
            this.savePersistedData();
            this.showToast(`Sale completed for ${member.firstName} ${member.lastName} - $${total.toFixed(2)}`, 'success');
        }
        
        this.addNotification('success', `Sale: ${member.firstName} ${member.lastName} - $${total.toFixed(2)}`);
        this.state.cart = [];
        this.render();
    }
    
    // Offline Mode
    toggleOfflineMode(isOffline) {
        this.state.isOffline = isOffline;
        this.updateSyncStatus();
        
        if (isOffline) {
            this.showToast('Offline mode enabled', 'warning');
        } else {
            this.showToast('Online mode enabled', 'success');
            this.syncOfflineQueue();
        }
        
        this.savePersistedData();
    }
    
    syncOfflineQueue() {
        if (this.data.offlineQueue.length === 0) return;
        
        const queueLength = this.data.offlineQueue.length;
        
        this.data.offlineQueue.forEach(item => {
            switch(item.actionType) {
                case 'checkin':
                    this.data.checkIns.push(item.payload);
                    break;
                case 'booking':
                    this.data.enrollments.push(item.payload);
                    const classSession = this.data.classes.find(c => c.id === item.payload.classSessionId);
                    if (classSession) classSession.seatsRemaining--;
                    break;
                case 'sale':
                    this.data.sales.push(item.payload);
                    break;
            }
            item.syncStatus = 'synced';
        });
        
        this.data.offlineQueue = [];
        this.savePersistedData();
        this.showToast(`Synced ${queueLength} items`, 'success');
        this.addNotification('success', `Sync completed: ${queueLength} items synced`);
        this.render();
    }
    
    updateSyncStatus() {
        const statusElement = document.getElementById('syncStatus');
        const indicator = statusElement.querySelector('.status-indicator');
        const text = statusElement.querySelector('.status-text');
        
        if (this.state.isOffline) {
            indicator.classList.remove('online');
            indicator.classList.add('offline');
            text.textContent = 'Offline';
        } else {
            indicator.classList.remove('offline');
            indicator.classList.add('online');
            text.textContent = 'Online';
        }
    }
    
    // Utility Functions
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        
        return date.toLocaleDateString();
    }
    
    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString();
    }
    
    getRecentActivity() {
        const activities = [];
        
        // Add check-ins
        this.data.checkIns.slice(-5).forEach(checkIn => {
            const member = this.data.members.find(m => m.id === checkIn.memberId);
            activities.push({
                type: 'checkin',
                icon: '✅',
                text: `${member.firstName} ${member.lastName} checked in`,
                timestamp: checkIn.timestamp
            });
        });
        
        // Add sales
        this.data.sales.slice(-5).forEach(sale => {
            const member = this.data.members.find(m => m.id === sale.memberId);
            activities.push({
                type: 'sale',
                icon: '💳',
                text: `Sale: $${sale.total.toFixed(2)} - ${member.firstName} ${member.lastName}`,
                timestamp: sale.createdAt
            });
        });
        
        // Add bookings
        this.data.enrollments.slice(-5).forEach(enrollment => {
            const member = this.data.members.find(m => m.id === enrollment.memberId);
            const classSession = this.data.classes.find(c => c.id === enrollment.classSessionId);
            activities.push({
                type: 'booking',
                icon: '📅',
                text: `${member.firstName} ${member.lastName} booked ${classSession.title}`,
                timestamp: enrollment.bookedAt
            });
        });
        
        return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
    
    getAlerts() {
        const alerts = [];
        
        // Member alerts
        this.data.members.forEach(member => {
            member.alerts.forEach(alert => {
                alerts.push({
                    severity: 'warning',
                    icon: '⚠️',
                    message: `${member.firstName} ${member.lastName}: ${alert}`,
                    timestamp: member.lastVisit
                });
            });
        });
        
        // Full classes
        this.data.classes.forEach(classSession => {
            if (classSession.seatsRemaining === 0) {
                alerts.push({
                    severity: 'error',
                    icon: '🚫',
                    message: `${classSession.title} is full`,
                    timestamp: classSession.dateTime
                });
            }
        });
        
        // Offline queue items
        if (this.data.offlineQueue.length > 0) {
            alerts.push({
                severity: 'warning',
                icon: '🔄',
                message: `${this.data.offlineQueue.length} items pending sync`,
                timestamp: new Date().toISOString()
            });
        }
        
        return alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
    
    addNotification(type, message) {
        const notification = {
            id: Date.now(),
            type,
            message,
            createdAt: new Date().toISOString(),
            read: false,
            pendingSync: this.state.isOffline
        };
        
        this.state.notifications.unshift(notification);
        
        // Keep only last 50 notifications
        if (this.state.notifications.length > 50) {
            this.state.notifications = this.state.notifications.slice(0, 50);
        }
        
        this.savePersistedData();
        this.updateNotificationBadge();
        
        // Update notifications screen if it's currently active
        if (this.state.currentScreen === 'notifications') {
            this.renderNotifications();
        }
    }
    
    updateNotificationBadge() {
        const badge = document.getElementById('notificationBadge');
        const unreadCount = this.state.notifications.filter(n => !n.read).length;
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'block' : 'none';
    }
    
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        toast.innerHTML = `
            <span class="toast-icon">${icons[type]}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }
    
    searchMembers(searchTerm) {
        this.renderMembers();
    }
    
    filterClasses(filter) {
        this.renderClasses();
    }
    
    filterProducts(category) {
        this.renderProducts();
    }
    
    filterNotifications(filter) {
        this.renderNotifications();
    }
    
    showAddMemberForm() {
        // For demo purposes, just show a toast
        this.showToast('Add member form would open here', 'info');
    }
    
    editMember(memberId) {
        // For demo purposes, just show a toast
        const member = this.data.members.find(m => m.id === memberId);
        this.showToast(`Edit form for ${member.firstName} ${member.lastName} would open here`, 'info');
    }
    
    resetDemoData() {
        if (confirm('Are you sure you want to reset all demo data? This will clear check-ins, sales, and enrollments.')) {
            // Clear persisted data
            localStorage.removeItem('gymsync_state');
            
            // Reset state
            this.state = {
                selectedMemberId: null,
                isOffline: false,
                currentScreen: 'dashboard',
                cart: [],
                notifications: []
            };
            
            // Regenerate initial data
            this.data.checkIns = [];
            this.data.sales = [];
            this.data.enrollments = [];
            this.data.offlineQueue = [];
            this.generateInitialData();
            
            this.render();
            this.showToast('Demo data reset successfully', 'success');
        }
    }
    
    startPeriodicUpdates() {
        // Update dashboard every 30 seconds
        setInterval(() => {
            if (this.state.currentScreen === 'dashboard') {
                this.renderDashboard();
            }
        }, 30000);
        
        // Check for class starting soon
        setInterval(() => {
            const now = new Date();
            this.data.classes.forEach(classSession => {
                const classTime = new Date(classSession.dateTime);
                const diffMins = (classTime - now) / 60000;
                
                if (diffMins > 0 && diffMins <= 30 && diffMins % 15 === 0) {
                    this.addNotification('info', `${classSession.title} starting in ${Math.floor(diffMins)} minutes`);
                }
            });
        }, 60000); // Check every minute
    }
}

// Initialize the app
const app = new GymSyncApp();
