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

    setupStatCardInteractivity() {
        // Add click handlers to stat cards
        const statCards = document.querySelectorAll('.stat-card');
        
        statCards.forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                const statType = card.dataset.stat;
                this.showStatDetails(statType);
            });
        });
    }

    showStatDetails(statType) {
        let content = '';
        let title = '';

        switch (statType) {
            case 'checkins':
                title = "Today's Check-ins Details";
                content = this.getCheckinsDetails();
                break;
            case 'classes':
                title = 'Upcoming Classes Details';
                content = this.getClassesDetails();
                break;
            case 'sales':
                title = "Today's Sales Details";
                content = this.getSalesDetails();
                break;
            case 'members':
                title = 'Active Members Details';
                content = this.getMembersDetails();
                break;
            default:
                return;
        }

        ui.showModal(title, content);
    }

    getCheckinsDetails() {
        const todayCheckins = storage.getTodayCheckins();
        
        if (todayCheckins.length === 0) {
            return '<div class="empty-state"><i class="fas fa-sign-in-alt"></i><p>No check-ins today</p></div>';
        }

        const html = `
            <div class="stat-details">
                <div class="stat-summary">
                    <div class="summary-item">
                        <span class="label">Total Check-ins:</span>
                        <span class="value">${todayCheckins.length}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Peak Hour:</span>
                        <span class="value">${this.getPeakHour(todayCheckins)}</span>
                    </div>
                </div>
                <div class="details-list">
                    <h4>Recent Check-ins</h4>
                    ${todayCheckins.map(checkin => `
                        <div class="detail-item">
                            <div class="detail-info">
                                <strong>${checkin.memberName}</strong>
                                <small>${checkin.memberId}</small>
                            </div>
                            <div class="detail-time">
                                ${new Date(checkin.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        return html;
    }

    getClassesDetails() {
        const upcomingClasses = storage.getUpcomingClasses();
        
        if (upcomingClasses.length === 0) {
            return '<div class="empty-state"><i class="fas fa-calendar"></i><p>No upcoming classes today</p></div>';
        }

        const html = `
            <div class="stat-details">
                <div class="stat-summary">
                    <div class="summary-item">
                        <span class="label">Total Classes:</span>
                        <span class="value">${upcomingClasses.length}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Total Capacity:</span>
                        <span class="value">${upcomingClasses.reduce((sum, cls) => sum + cls.capacity, 0)}</span>
                    </div>
                </div>
                <div class="details-list">
                    <h4>Upcoming Classes</h4>
                    ${upcomingClasses.map(cls => {
                        const enrollments = storage.getEnrollments().filter(e => e.classId === cls.id);
                        const available = cls.capacity - enrollments.length;
                        return `
                            <div class="detail-item">
                                <div class="detail-info">
                                    <strong>${cls.name}</strong>
                                    <small>${cls.instructor} • ${cls.time}</small>
                                </div>
                                <div class="detail-status">
                                    <span class="badge ${available > 5 ? 'success' : available > 0 ? 'warning' : 'danger'}">
                                        ${available}/${cls.capacity} spots
                                    </span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        return html;
    }

    getSalesDetails() {
        const todaySales = storage.getTodaySales();
        const totalSales = todaySales.reduce((total, sale) => total + sale.total, 0);
        
        if (todaySales.length === 0) {
            return '<div class="empty-state"><i class="fas fa-shopping-cart"></i><p>No sales today</p></div>';
        }

        const html = `
            <div class="stat-details">
                <div class="stat-summary">
                    <div class="summary-item">
                        <span class="label">Total Sales:</span>
                        <span class="value">${GymData.formatCurrency(totalSales)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Transactions:</span>
                        <span class="value">${todaySales.length}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Average Sale:</span>
                        <span class="value">${GymData.formatCurrency(totalSales / todaySales.length)}</span>
                    </div>
                </div>
                <div class="details-list">
                    <h4>Recent Sales</h4>
                    ${todaySales.map(sale => `
                        <div class="detail-item">
                            <div class="detail-info">
                                <strong>Sale #${sale.id}</strong>
                                <small>${sale.paymentMethod} • ${sale.items.length} items</small>
                            </div>
                            <div class="detail-amount">
                                <strong>${GymData.formatCurrency(sale.total)}</strong>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        return html;
    }

    getMembersDetails() {
        const activeMembers = storage.getActiveMembers();
        const allMembers = storage.getMembers();
        
        const html = `
            <div class="stat-details">
                <div class="stat-summary">
                    <div class="summary-item">
                        <span class="label">Active Members:</span>
                        <span class="value">${activeMembers.length}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Total Members:</span>
                        <span class="value">${allMembers.length}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Activation Rate:</span>
                        <span class="value">${Math.round((activeMembers.length / allMembers.length) * 100)}%</span>
                    </div>
                </div>
                <div class="details-list">
                    <h4>Recently Active Members</h4>
                    ${activeMembers.slice(0, 10).map(member => {
                        const daysUntil = GymData.getDaysUntilExpiry(member.expiryDate);
                        const statusClass = daysUntil > 30 ? 'success' : daysUntil > 7 ? 'warning' : 'danger';
                        return `
                            <div class="detail-item">
                                <div class="detail-info">
                                    <strong>${member.firstName} ${member.lastName}</strong>
                                    <small>${member.plan} • ${member.id}</small>
                                </div>
                                <div class="detail-status">
                                    <span class="badge ${statusClass}">
                                        ${daysUntil} days left
                                    </span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        return html;
    }

    getPeakHour(checkins) {
        const hourCounts = {};
        
        checkins.forEach(checkin => {
            const hour = new Date(checkin.timestamp).getHours();
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });

        const peakHour = Object.keys(hourCounts).reduce((a, b) => 
            hourCounts[a] > hourCounts[b] ? a : b
        );

        return `${peakHour}:00 - ${parseInt(peakHour) + 1}:00`;
    }

    startAutoRefresh() {
        // Add click handlers to stat cards
        this.setupStatCardInteractivity();
        
        // Auto-refresh dashboard every 30 seconds
        setInterval(() => {
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
