// Notifications System Functionality

class NotificationsManager {
    constructor() {
        this.notifications = [];
        this.init();
    }

    init() {
        this.loadNotifications();
        this.renderNotifications();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Auto-refresh notifications every 30 seconds
        setInterval(() => {
            this.checkSystemAlerts();
        }, 30000);
    }

    loadNotifications() {
        this.notifications = storage.getNotifications() || [];
    }

    renderNotifications() {
        const notificationsList = document.getElementById('notificationsList');
        
        if (this.notifications.length === 0) {
            notificationsList.innerHTML = `
                <div class="no-notifications">
                    <i class="fas fa-bell"></i>
                    <p>No notifications</p>
                </div>
            `;
            return;
        }

        notificationsList.innerHTML = this.notifications.map(notification => {
            const iconClass = this.getNotificationIcon(notification.type);
            const isRead = notification.read;
            
            return `
                <div class="notification-item ${isRead ? 'read' : 'unread'}" data-id="${notification.id}">
                    <div class="notification-icon ${notification.type}">
                        <i class="fas ${iconClass}"></i>
                    </div>
                    <div class="notification-content">
                        <div class="notification-title">${notification.title}</div>
                        <div class="notification-message">${notification.message}</div>
                        <div class="notification-time">${ui.getRelativeTime(notification.timestamp)}</div>
                    </div>
                    <div class="notification-actions">
                        ${!isRead ? `
                            <button class="btn btn-sm btn-outline" onclick="notifications.markAsRead('${notification.id}')" title="Mark as read">
                                <i class="fas fa-check"></i>
                            </button>
                        ` : ''}
                        <button class="btn btn-sm btn-danger" onclick="notifications.deleteNotification('${notification.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    getNotificationIcon(type) {
        const icons = {
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle',
            error: 'fa-exclamation-circle',
            success: 'fa-check-circle'
        };
        return icons[type] || 'fa-info-circle';
    }

    addNotification(title, message, type = 'info', autoShow = true) {
        const notification = {
            title,
            message,
            type
        };

        if (storage.addNotification(notification)) {
            this.loadNotifications();
            this.renderNotifications();
            ui.updateNotificationBadge();
            
            if (autoShow) {
                ui.showToast(message, type, title);
            }
        }
    }

    markAsRead(notificationId) {
        if (storage.markNotificationRead(notificationId)) {
            this.loadNotifications();
            this.renderNotifications();
            ui.updateNotificationBadge();
        }
    }

    markAllAsRead() {
        if (storage.markAllNotificationsRead()) {
            this.loadNotifications();
            this.renderNotifications();
            ui.updateNotificationBadge();
            ui.showToast('All notifications marked as read', 'success');
        }
    }

    deleteNotification(notificationId) {
        ui.confirmAction(
            'Are you sure you want to delete this notification?',
            () => {
                if (storage.deleteNotification(notificationId)) {
                    this.loadNotifications();
                    this.renderNotifications();
                    ui.updateNotificationBadge();
                    ui.showToast('Notification deleted', 'success');
                }
            }
        );
    }

    clearAllNotifications() {
        ui.confirmAction(
            'Are you sure you want to delete all notifications?',
            () => {
                storage.setNotifications([]);
                this.loadNotifications();
                this.renderNotifications();
                ui.updateNotificationBadge();
                ui.showToast('All notifications cleared', 'success');
            }
        );
    }

    checkSystemAlerts() {
        // Check for expiring memberships
        this.checkExpiringMemberships();
        
        // Check for full classes
        this.checkFullClasses();
        
        // Check for low stock products
        this.checkLowStock();
        
        // Check offline queue
        this.checkOfflineQueue();
    }

    checkExpiringMemberships() {
        const members = storage.getMembers() || [];
        const today = new Date();
        
        members.forEach(member => {
            if (member.status !== 'Active') return;
            
            const expiryDate = new Date(member.expiryDate);
            const daysUntil = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
            
            // Check if we already have a notification for this member
            const existingNotification = this.notifications.find(n => 
                n.type === 'warning' && 
                n.title.includes(member.firstName) && 
                n.title.includes(member.lastName) &&
                n.message.includes('expiring')
            );
            
            if (daysUntil === 7 && !existingNotification) {
                this.addNotification(
                    'Membership Expiring Soon',
                    `${member.firstName} ${member.lastName}'s membership expires in 7 days`,
                    'warning',
                    false
                );
            } else if (daysUntil === 1 && !existingNotification) {
                this.addNotification(
                    'Membership Expires Tomorrow',
                    `${member.firstName} ${member.lastName}'s membership expires tomorrow`,
                    'warning',
                    false
                );
            } else if (daysUntil < 0 && member.status === 'Active') {
                // Membership has expired but status not updated
                this.addNotification(
                    'Membership Expired',
                    `${member.firstName} ${member.lastName}'s membership has expired`,
                    'error',
                    false
                );
            }
        });
    }

    checkFullClasses() {
        const classes = GymData.classes;
        const enrollments = storage.getEnrollments() || [];
        
        classes.forEach(cls => {
            const classEnrollments = enrollments.filter(e => e.classId === cls.id && e.status === 'booked');
            const isFull = classEnrollments.length >= cls.capacity;
            
            // Check if we already have a notification for this class
            const existingNotification = this.notifications.find(n => 
                n.type === 'warning' && 
                n.title.includes(cls.name) &&
                n.message.includes('fully booked')
            );
            
            if (isFull && !existingNotification) {
                this.addNotification(
                    'Class Full',
                    `${cls.name} is now fully booked`,
                    'warning',
                    false
                );
            }
        });
    }

    checkLowStock() {
        const products = GymData.products;
        const lowStockThreshold = 10;
        
        products.forEach(product => {
            if (product.stock <= lowStockThreshold) {
                // Check if we already have a notification for this product
                const existingNotification = this.notifications.find(n => 
                    n.type === 'warning' && 
                    n.title.includes(product.name) &&
                    n.message.includes('low stock')
                );
                
                if (!existingNotification) {
                    this.addNotification(
                        'Low Stock Alert',
                        `${product.name} is running low on stock (${product.stock} remaining)`,
                        'warning',
                        false
                    );
                }
            }
        });
    }

    checkOfflineQueue() {
        const queue = storage.getOfflineQueue() || [];
        const pendingCount = queue.filter(item => item.status === 'pending').length;
        
        if (pendingCount > 0) {
            // Check if we already have a notification for pending items
            const existingNotification = this.notifications.find(n => 
                n.type === 'info' && 
                n.title.includes('Offline Queue') &&
                n.message.includes('pending sync')
            );
            
            if (!existingNotification) {
                this.addNotification(
                    'Offline Queue',
                    `${pendingCount} item${pendingCount > 1 ? 's' : ''} pending sync`,
                    'info',
                    false
                );
            }
        }
    }

    // Get notification statistics
    getNotificationStats() {
        const total = this.notifications.length;
        const unread = this.notifications.filter(n => !n.read).length;
        const byType = {
            info: this.notifications.filter(n => n.type === 'info').length,
            warning: this.notifications.filter(n => n.type === 'warning').length,
            error: this.notifications.filter(n => n.type === 'error').length,
            success: this.notifications.filter(n => n.type === 'success').length
        };

        return {
            total,
            unread,
            read: total - unread,
            byType
        };
    }

    // Export notifications data
    exportNotifications() {
        const data = {
            timestamp: new Date().toISOString(),
            stats: this.getNotificationStats(),
            notifications: this.notifications
        };
        return data;
    }

    // System notification templates
    notifyMemberJoined(memberName) {
        this.addNotification(
            'New Member',
            `Welcome ${memberName} to the gym community!`,
            'success'
        );
    }

    notifyMemberCheckedIn(memberName) {
        // Only show for first-time visitors
        const checkins = storage.getCheckins() || [];
        const member = (storage.getMembers() || []).find(m => 
            `${m.firstName} ${m.lastName}` === memberName
        );
        
        if (member) {
            const memberCheckins = checkins.filter(c => c.memberId === member.id);
            if (memberCheckins.length === 1) {
                this.addNotification(
                    'First Visit',
                    `${memberName} visited for the first time!`,
                    'info'
                );
            }
        }
    }

    notifyClassBooked(memberName, className) {
        this.addNotification(
            'Class Booking',
            `${memberName} booked ${className}`,
            'info'
        );
    }

    notifySaleCompleted(total, paymentMethod) {
        this.addNotification(
            'Sale Completed',
            `Sale of ${GymData.formatCurrency(total)} via ${paymentMethod}`,
            'success'
        );
    }

    notifySystemError(error) {
        this.addNotification(
            'System Error',
            error,
            'error'
        );
    }

    notifyMaintenance(message) {
        this.addNotification(
            'Maintenance Notice',
            message,
            'warning'
        );
    }
}

// Create global notifications instance
window.notifications = new NotificationsManager();
