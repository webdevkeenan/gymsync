// Dashboard Screen Functionality

class DashboardManager {
    constructor() {
        this.refreshInterval = null;
        this.init();
    }

    init() {
        this.updateDashboard();
        this.startAutoRefresh();
    }

    updateDashboard() {
        this.updateStats();
        this.updateRecentActivity();
        this.updateAlerts();
    }

    updateStats() {
        // Today's Check-ins
        const todayCheckins = storage.getTodayCheckins();
        document.getElementById('todayCheckins').textContent = todayCheckins.length;

        // Upcoming Classes
        const upcomingClasses = storage.getUpcomingClasses();
        document.getElementById('upcomingClasses').textContent = upcomingClasses.length;

        // Today's Sales
        const todaySales = storage.getTodaySales();
        const todaySalesTotal = todaySales.reduce((total, sale) => total + sale.total, 0);
        document.getElementById('todaySales').textContent = GymData.formatCurrency(todaySalesTotal);

        // Active Members
        const activeMembers = storage.getActiveMembers();
        document.getElementById('activeMembers').textContent = activeMembers.length;
    }

    updateRecentActivity() {
        const activityContainer = document.getElementById('recentActivity');
        const activities = storage.getRecentActivity(5);

        if (activities.length === 0) {
            ui.showEmptyState(activityContainer, 'No recent activity');
            return;
        }

        activityContainer.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    <i class="fas fa-${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-time">${ui.getRelativeTime(activity.timestamp)}</div>
                </div>
            </div>
        `).join('');
    }

    updateAlerts() {
        const alertsContainer = document.getElementById('alertsList');
        const notifications = storage.getNotifications() || [];
        const unreadNotifications = notifications.filter(n => !n.read);

        // Create alerts from unread notifications and system alerts
        const alerts = [];

        // Add unread notifications as alerts
        unreadNotifications.forEach(notification => {
            alerts.push({
                type: notification.type,
                title: notification.title,
                message: notification.message,
                timestamp: notification.timestamp,
                icon: this.getAlertIcon(notification.type)
            });
        });

        // Add system alerts for expiring memberships
        const members = storage.getMembers() || [];
        const expiringSoon = members.filter(member => {
            if (member.status !== 'Active') return false;
            const daysUntil = GymData.getDaysUntilExpiry(member.expiryDate);
            return daysUntil <= 7 && daysUntil > 0;
        });

        expiringSoon.forEach(member => {
            const daysUntil = GymData.getDaysUntilExpiry(member.expiryDate);
            alerts.push({
                type: 'warning',
                title: 'Membership Expiring Soon',
                message: `${member.firstName} ${member.lastName} membership expires in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`,
                timestamp: new Date().toISOString(),
                icon: 'exclamation-triangle'
            });
        });

        // Add system alerts for expired memberships
        const expiredMembers = members.filter(member => 
            member.status === 'Active' && GymData.isExpired(member.expiryDate)
        );

        expiredMembers.forEach(member => {
            alerts.push({
                type: 'error',
                title: 'Membership Expired',
                message: `${member.firstName} ${member.lastName} membership has expired`,
                timestamp: new Date().toISOString(),
                icon: 'exclamation-circle'
            });
        });

        // Sort alerts by timestamp
        alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        if (alerts.length === 0) {
            ui.showEmptyState(alertsContainer, 'No alerts');
            return;
        }

        alertsContainer.innerHTML = alerts.slice(0, 5).map(alert => `
            <div class="alert-item">
                <div class="alert-icon ${alert.type}">
                    <i class="fas fa-${alert.icon}"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-message">${alert.message}</div>
                    <div class="alert-time">${ui.getRelativeTime(alert.timestamp)}</div>
                </div>
            </div>
        `).join('');
    }

    getAlertIcon(type) {
        const icons = {
            info: 'info-circle',
            warning: 'exclamation-triangle',
            error: 'exclamation-circle',
            success: 'check-circle'
        };
        return icons[type] || 'info-circle';
    }

    startAutoRefresh() {
        // Refresh dashboard every 30 seconds
        this.refreshInterval = setInterval(() => {
            this.updateDashboard();
        }, 30000);
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    // Add activity to dashboard
    addActivity(type, title, metadata = {}) {
        const activity = {
            type,
            title,
            timestamp: new Date().toISOString(),
            icon: this.getActivityIcon(type),
            color: this.getActivityColor(type),
            ...metadata
        };

        // Update recent activity immediately
        this.updateRecentActivity();
        return activity;
    }

    getActivityIcon(type) {
        const icons = {
            checkin: 'sign-in-alt',
            sale: 'shopping-cart',
            booking: 'calendar-check',
            member: 'user-plus',
            notification: 'bell'
        };
        return icons[type] || 'circle';
    }

    getActivityColor(type) {
        const colors = {
            checkin: 'success',
            sale: 'primary',
            booking: 'secondary',
            member: 'info',
            notification: 'warning'
        };
        return colors[type] || 'info';
    }

    // Export dashboard data
    exportDashboardData() {
        const data = {
            timestamp: new Date().toISOString(),
            stats: {
                todayCheckins: storage.getTodayCheckins().length,
                upcomingClasses: storage.getUpcomingClasses().length,
                todaySalesTotal: storage.getTodaySales().reduce((total, sale) => total + sale.total, 0),
                activeMembers: storage.getActiveMembers().length
            },
            recentActivity: storage.getRecentActivity(10),
            alerts: this.getSystemAlerts()
        };

        return data;
    }

    getSystemAlerts() {
        const members = storage.getMembers() || [];
        const alerts = [];

        // Expiring memberships
        const expiringSoon = members.filter(member => {
            if (member.status !== 'Active') return false;
            const daysUntil = GymData.getDaysUntilExpiry(member.expiryDate);
            return daysUntil <= 7 && daysUntil > 0;
        });

        // Expired memberships
        const expiredMembers = members.filter(member => 
            member.status === 'Active' && GymData.isExpired(member.expiryDate)
        );

        return {
            expiringSoon: expiringSoon.length,
            expired: expiredMembers.length,
            total: expiringSoon.length + expiredMembers.length
        };
    }

    // Cleanup
    destroy() {
        this.stopAutoRefresh();
    }
}

// Create global dashboard instance
window.dashboard = new DashboardManager();
