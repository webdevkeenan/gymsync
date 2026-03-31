// localStorage Management for GymSync Application

class StorageManager {
    constructor() {
        this.keys = {
            members: 'gymsync_members',
            checkins: 'gymsync_checkins',
            enrollments: 'gymsync_enrollments',
            sales: 'gymsync_sales',
            notifications: 'gymsync_notifications',
            offlineQueue: 'gymsync_offline_queue',
            cart: 'gymsync_cart',
            settings: 'gymsync_settings'
        };
    }

    // Initialize storage with mock data if empty
    initializeStorage() {
        if (!this.getMembers()) {
            this.setMembers(GymData.members);
        }
        if (!this.getCheckins()) {
            this.setCheckins(GymData.checkins);
        }
        if (!this.getEnrollments()) {
            this.setEnrollments(GymData.enrollments);
        }
        if (!this.getSales()) {
            this.setSales(GymData.sales);
        }
        if (!this.getNotifications()) {
            this.setNotifications(GymData.notifications);
        }
        if (!this.getOfflineQueue()) {
            this.setOfflineQueue(GymData.offlineQueue);
        }
        if (!this.getCart()) {
            this.setCart([]);
        }
        if (!this.getSettings()) {
            this.setSettings({
                offlineMode: false,
                notifications: true,
                theme: 'light'
            });
        }
    }

    // Generic storage methods
    setItem(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    }

    getItem(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Storage error:', error);
            return null;
        }
    }

    removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    }

    // Members
    setMembers(members) {
        return this.setItem(this.keys.members, members);
    }

    getMembers() {
        return this.getItem(this.keys.members);
    }

    addMember(member) {
        const members = this.getMembers() || [];
        member.id = GymData.generateId('M');
        members.push(member);
        return this.setMembers(members);
    }

    updateMember(memberId, updates) {
        const members = this.getMembers() || [];
        const index = members.findIndex(m => m.id === memberId);
        if (index !== -1) {
            members[index] = { ...members[index], ...updates };
            return this.setMembers(members);
        }
        return false;
    }

    deleteMember(memberId) {
        const members = this.getMembers() || [];
        const filtered = members.filter(m => m.id !== memberId);
        return this.setMembers(filtered);
    }

    // Check-ins
    setCheckins(checkins) {
        return this.setItem(this.keys.checkins, checkins);
    }

    getCheckins() {
        return this.getItem(this.keys.checkins);
    }

    addCheckin(checkin) {
        const checkins = this.getCheckins() || [];
        checkin.id = GymData.generateId('C');
        checkins.push(checkin);
        return this.setCheckins(checkins);
    }

    // Enrollments
    setEnrollments(enrollments) {
        return this.setItem(this.keys.enrollments, enrollments);
    }

    getEnrollments() {
        return this.getItem(this.keys.enrollments);
    }

    addEnrollment(enrollment) {
        const enrollments = this.getEnrollments() || [];
        enrollment.id = GymData.generateId('E');
        enrollments.push(enrollment);
        return this.setEnrollments(enrollments);
    }

    updateEnrollment(enrollmentId, updates) {
        const enrollments = this.getEnrollments() || [];
        const index = enrollments.findIndex(e => e.id === enrollmentId);
        if (index !== -1) {
            enrollments[index] = { ...enrollments[index], ...updates };
            return this.setEnrollments(enrollments);
        }
        return false;
    }

    deleteEnrollment(enrollmentId) {
        const enrollments = this.getEnrollments() || [];
        const filtered = enrollments.filter(e => e.id !== enrollmentId);
        return this.setEnrollments(filtered);
    }

    // Sales
    setSales(sales) {
        return this.setItem(this.keys.sales, sales);
    }

    getSales() {
        return this.getItem(this.keys.sales);
    }

    addSale(sale) {
        const sales = this.getSales() || [];
        sale.id = GymData.generateId('S');
        sales.push(sale);
        return this.setSales(sales);
    }

    // Notifications
    setNotifications(notifications) {
        return this.setItem(this.keys.notifications, notifications);
    }

    getNotifications() {
        return this.getItem(this.keys.notifications);
    }

    addNotification(notification) {
        const notifications = this.getNotifications() || [];
        notification.id = GymData.generateId('N');
        notification.timestamp = new Date().toISOString();
        notification.read = false;
        notifications.unshift(notification);
        return this.setNotifications(notifications);
    }

    markNotificationRead(notificationId) {
        const notifications = this.getNotifications() || [];
        const notification = notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            return this.setNotifications(notifications);
        }
        return false;
    }

    markAllNotificationsRead() {
        const notifications = this.getNotifications() || [];
        notifications.forEach(n => n.read = true);
        return this.setNotifications(notifications);
    }

    deleteNotification(notificationId) {
        const notifications = this.getNotifications() || [];
        const filtered = notifications.filter(n => n.id !== notificationId);
        return this.setNotifications(filtered);
    }

    getUnreadCount() {
        const notifications = this.getNotifications() || [];
        return notifications.filter(n => !n.read).length;
    }

    // Offline Queue
    setOfflineQueue(queue) {
        return this.setItem(this.keys.offlineQueue, queue);
    }

    getOfflineQueue() {
        return this.getItem(this.keys.offlineQueue);
    }

    addToOfflineQueue(action) {
        const queue = this.getOfflineQueue() || [];
        action.id = GymData.generateId('Q');
        action.timestamp = new Date().toISOString();
        action.status = 'pending';
        queue.push(action);
        return this.setOfflineQueue(queue);
    }

    markQueueItemSynced(itemId) {
        const queue = this.getOfflineQueue() || [];
        const item = queue.find(q => q.id === itemId);
        if (item) {
            item.status = 'synced';
            item.syncedAt = new Date().toISOString();
            return this.setOfflineQueue(queue);
        }
        return false;
    }

    clearSyncedItems() {
        const queue = this.getOfflineQueue() || [];
        const pending = queue.filter(q => q.status !== 'synced');
        return this.setOfflineQueue(pending);
    }

    // Shopping Cart
    setCart(cart) {
        return this.setItem(this.keys.cart, cart);
    }

    getCart() {
        return this.getItem(this.keys.cart);
    }

    addToCart(product) {
        const cart = this.getCart() || [];
        const existingItem = cart.find(item => item.productId === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: 1
            });
        }
        
        return this.setCart(cart);
    }

    updateCartItemQuantity(productId, quantity) {
        const cart = this.getCart() || [];
        const item = cart.find(item => item.productId === productId);
        
        if (item) {
            if (quantity <= 0) {
                return this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                return this.setCart(cart);
            }
        }
        return false;
    }

    removeFromCart(productId) {
        const cart = this.getCart() || [];
        const filtered = cart.filter(item => item.productId !== productId);
        return this.setCart(filtered);
    }

    clearCart() {
        return this.setCart([]);
    }

    getCartTotal() {
        const cart = this.getCart() || [];
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const tax = subtotal * 0.1; // 10% tax
        const total = subtotal + tax;
        
        return {
            subtotal,
            tax,
            total,
            itemCount: cart.reduce((count, item) => count + item.quantity, 0)
        };
    }

    // Settings
    setSettings(settings) {
        return this.setItem(this.keys.settings, settings);
    }

    getSettings() {
        return this.getItem(this.keys.settings);
    }

    updateSetting(key, value) {
        const settings = this.getSettings() || {};
        settings[key] = value;
        return this.setSettings(settings);
    }

    // Analytics and Statistics
    getTodayCheckins() {
        const checkins = this.getCheckins() || [];
        return checkins.filter(checkin => GymData.isToday(checkin.timestamp));
    }

    getTodaySales() {
        const sales = this.getSales() || [];
        return sales.filter(sale => GymData.isToday(sale.timestamp));
    }

    getActiveMembers() {
        const members = this.getMembers() || [];
        return members.filter(member => member.status === 'Active' && !GymData.isExpired(member.expiryDate));
    }

    getUpcomingClasses() {
        const classes = GymData.classes;
        const today = new Date();
        return classes.filter(cls => {
            const classDate = new Date(cls.date + ' ' + cls.time);
            return classDate > today;
        });
    }

    getRecentActivity(limit = 10) {
        const activities = [];
        
        // Add recent checkins
        const checkins = this.getCheckins() || [];
        checkins.slice(-5).forEach(checkin => {
            activities.push({
                type: 'checkin',
                title: `${checkin.memberName} checked in`,
                timestamp: checkin.timestamp,
                icon: 'sign-in-alt',
                color: 'success'
            });
        });

        // Add recent sales
        const sales = this.getSales() || [];
        sales.slice(-5).forEach(sale => {
            activities.push({
                type: 'sale',
                title: `Sale: ${GymData.formatCurrency(sale.total)}`,
                timestamp: sale.timestamp,
                icon: 'shopping-cart',
                color: 'primary'
            });
        });

        // Add recent enrollments
        const enrollments = this.getEnrollments() || [];
        enrollments.slice(-5).forEach(enrollment => {
            activities.push({
                type: 'booking',
                title: `${enrollment.memberName} booked ${enrollment.className}`,
                timestamp: enrollment.enrollmentDate,
                icon: 'calendar-check',
                color: 'secondary'
            });
        });

        // Sort by timestamp and limit
        return activities
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
    }

    // Reset all data
    resetAllData() {
        Object.values(this.keys).forEach(key => {
            this.removeItem(key);
        });
        this.initializeStorage();
        return true;
    }
}

// Create global storage instance
window.storage = new StorageManager();
