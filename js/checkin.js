// Check-In System Functionality

class CheckInManager {
    constructor() {
        this.searchResults = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.clearResults();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('checkinSearch');
        searchInput.addEventListener('input', (e) => {
            if (e.target.value.trim().length >= 2) {
                this.searchMembers(e.target.value);
            } else {
                this.clearResults();
            }
        });

        // Search button
        document.getElementById('searchCheckinBtn').addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                this.searchMembers(query);
            }
        });

        // Enter key search
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value.trim();
                if (query) {
                    this.searchMembers(query);
                }
            }
        });
    }

    searchMembers(query) {
        const members = storage.getMembers() || [];
        const lowerQuery = query.toLowerCase();
        
        this.searchResults = members.filter(member => 
            member.id.toLowerCase().includes(lowerQuery) ||
            member.firstName.toLowerCase().includes(lowerQuery) ||
            member.lastName.toLowerCase().includes(lowerQuery) ||
            member.email.toLowerCase().includes(lowerQuery) ||
            member.phone.includes(query)
        );

        this.renderSearchResults();
    }

    renderSearchResults() {
        const resultsContainer = document.getElementById('checkinResults');
        
        if (this.searchResults.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>No members found. Try searching with name, ID, email, or phone number.</p>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = this.searchResults.map(member => {
            const canCheckIn = this.canMemberCheckIn(member);
            const statusInfo = this.getMemberStatusInfo(member);
            
            return `
                <div class="member-card">
                    <div class="member-header">
                        <div class="member-info">
                            <h3>${member.firstName} ${member.lastName}</h3>
                            <p>ID: ${member.id} | ${member.email}</p>
                        </div>
                        <div class="member-status">
                            ${this.createStatusBadge(member.status, member.expiryDate)}
                            ${statusInfo.warningBadge}
                        </div>
                    </div>
                    
                    <div class="member-details">
                        <div class="detail-item">
                            <span class="detail-label">Phone:</span>
                            <span class="detail-value">${ui.formatPhoneNumber(member.phone)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Membership Plan:</span>
                            <span class="detail-value">${member.plan}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Join Date:</span>
                            <span class="detail-value">${GymData.formatDate(member.joinDate)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Expiry Date:</span>
                            <span class="detail-value">${GymData.formatDate(member.expiryDate)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Last Visit:</span>
                            <span class="detail-value">${GymData.formatDate(member.lastVisit)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Emergency Contact:</span>
                            <span class="detail-value">${member.emergencyContact}</span>
                        </div>
                        ${member.notes ? `
                        <div class="detail-item full-width">
                            <span class="detail-label">Notes:</span>
                            <span class="detail-value">${member.notes}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="member-actions">
                        ${canCheckIn ? `
                            <button class="btn btn-success" onclick="checkin.checkInMember('${member.id}')">
                                <i class="fas fa-check-circle"></i>
                                Check In
                            </button>
                        ` : `
                            <button class="btn btn-warning" disabled>
                                <i class="fas fa-exclamation-triangle"></i>
                                Cannot Check In
                            </button>
                        `}
                        
                        <button class="btn btn-outline" onclick="checkin.viewMemberHistory('${member.id}')">
                            <i class="fas fa-history"></i>
                            View History
                        </button>
                    </div>
                    
                    ${statusInfo.alertMessage ? `
                    <div class="checkin-alert ${statusInfo.alertType}">
                        <i class="fas fa-${statusInfo.alertIcon}"></i>
                        <span>${statusInfo.alertMessage}</span>
                    </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    canMemberCheckIn(member) {
        // Check if membership is active
        if (member.status !== 'Active') {
            return false;
        }

        // Check if membership is expired
        if (GymData.isExpired(member.expiryDate)) {
            return false;
        }

        // Check if already checked in today
        const todayCheckins = storage.getTodayCheckins();
        const alreadyCheckedIn = todayCheckins.some(checkin => checkin.memberId === member.id);
        if (alreadyCheckedIn) {
            return false;
        }

        return true;
    }

    getMemberStatusInfo(member) {
        const info = {
            warningBadge: '',
            alertMessage: '',
            alertType: 'warning',
            alertIcon: 'exclamation-triangle'
        };

        // Check expiry status
        if (member.status === 'Active' && GymData.isExpired(member.expiryDate)) {
            info.warningBadge = '<span class="badge badge-expired">Expired</span>';
            info.alertMessage = 'Membership has expired. Please renew membership.';
            info.alertType = 'error';
            info.alertIcon = 'exclamation-circle';
        } else if (member.status !== 'Active') {
            info.warningBadge = `<span class="badge badge-warning">${member.status}</span>`;
            info.alertMessage = `Membership is ${member.status.toLowerCase()}. Cannot check in.`;
            info.alertType = 'error';
            info.alertIcon = 'exclamation-circle';
        } else {
            const daysUntil = GymData.getDaysUntilExpiry(member.expiryDate);
            if (daysUntil <= 7) {
                info.warningBadge = `<span class="badge badge-warning">Expires in ${daysUntil} day${daysUntil > 1 ? 's' : ''}</span>`;
                info.alertMessage = `Membership expires in ${daysUntil} day${daysUntil > 1 ? 's' : ''}. Consider renewal soon.`;
            }
        }

        // Check if already checked in today
        const todayCheckins = storage.getTodayCheckins();
        const alreadyCheckedIn = todayCheckins.some(checkin => checkin.memberId === member.id);
        if (alreadyCheckedIn) {
            info.alertMessage = 'Already checked in today.';
            info.alertType = 'info';
            info.alertIcon = 'info-circle';
        }

        return info;
    }

    createStatusBadge(status, expiryDate) {
        let badgeType = 'active';
        let badgeText = status;

        if (status === 'Active' && GymData.isExpired(expiryDate)) {
            badgeType = 'expired';
            badgeText = 'Expired';
        } else if (status === 'Active') {
            const daysUntil = GymData.getDaysUntilExpiry(expiryDate);
            if (daysUntil <= 7) {
                badgeType = 'warning';
                badgeText = `Expires in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`;
            }
        }

        return `<span class="badge badge-${badgeType}">${badgeText}</span>`;
    }

    async checkInMember(memberId) {
        const member = (storage.getMembers() || []).find(m => m.id === memberId);
        if (!member) {
            ui.showToast('Member not found', 'error');
            return;
        }

        // Double-check eligibility
        if (!this.canMemberCheckIn(member)) {
            ui.showToast('Member is not eligible for check-in', 'warning');
            return;
        }

        const isOffline = storage.getSettings()?.offlineMode || false;
        
        const checkinData = {
            memberId: member.id,
            memberName: `${member.firstName} ${member.lastName}`,
            timestamp: new Date().toISOString(),
            type: 'regular',
            status: 'completed'
        };

        if (isOffline) {
            // Add to offline queue
            storage.addToOfflineQueue({
                action: 'checkin',
                data: checkinData
            });
            
            ui.showToast('Check-in queued for sync (Offline Mode)', 'warning');
        } else {
            // Process immediately
            if (storage.addCheckin(checkinData)) {
                // Update member's last visit
                storage.updateMember(memberId, {
                    lastVisit: new Date().toISOString().split('T')[0]
                });
                
                ui.showToast(`${member.firstName} ${member.lastName} checked in successfully`, 'success');
                
                // Add activity
                dashboard.addActivity('checkin', `${member.firstName} ${member.lastName} checked in`);
                
                // Add notification for first-time visitors
                const memberCheckins = (storage.getCheckins() || []).filter(c => c.memberId === memberId);
                if (memberCheckins.length === 1) {
                    storage.addNotification({
                        title: 'First Visit',
                        message: `${member.firstName} ${member.lastName} visited for the first time!`,
                        type: 'info'
                    });
                    ui.updateNotificationBadge();
                }
                
                // Update dashboard
                dashboard.updateDashboard();
            } else {
                ui.showToast('Failed to check in member', 'error');
            }
        }

        // Clear search and results
        document.getElementById('checkinSearch').value = '';
        this.clearResults();
    }

    viewMemberHistory(memberId) {
        const member = (storage.getMembers() || []).find(m => m.id === memberId);
        if (!member) return;

        const checkins = (storage.getCheckins() || []).filter(c => c.memberId === memberId);
        const enrollments = (storage.getEnrollments() || []).filter(e => e.memberId === memberId);

        const content = `
            <div class="member-history">
                <div class="history-section">
                    <h4>Member Information</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Name:</label>
                            <span>${member.firstName} ${member.lastName}</span>
                        </div>
                        <div class="detail-item">
                            <label>ID:</label>
                            <span>${member.id}</span>
                        </div>
                        <div class="detail-item">
                            <label>Plan:</label>
                            <span>${member.plan}</span>
                        </div>
                        <div class="detail-item">
                            <label>Status:</label>
                            <span>${this.createStatusBadge(member.status, member.expiryDate)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="history-section">
                    <h4>Check-in History (${checkins.length} visits)</h4>
                    ${checkins.length > 0 ? `
                        <div class="history-list">
                            ${checkins.slice(-10).reverse().map(checkin => `
                                <div class="history-item">
                                    <div class="history-icon">
                                        <i class="fas fa-sign-in-alt"></i>
                                    </div>
                                    <div class="history-content">
                                        <div class="history-title">Check-in</div>
                                        <div class="history-time">${GymData.formatDateTime(checkin.timestamp)}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p>No check-ins recorded</p>'}
                </div>
                
                <div class="history-section">
                    <h4>Class Bookings (${enrollments.length} bookings)</h4>
                    ${enrollments.length > 0 ? `
                        <div class="history-list">
                            ${enrollments.slice(-10).reverse().map(enrollment => `
                                <div class="history-item">
                                    <div class="history-icon">
                                        <i class="fas fa-calendar-alt"></i>
                                    </div>
                                    <div class="history-content">
                                        <div class="history-title">${enrollment.className}</div>
                                        <div class="history-time">Booked: ${GymData.formatDateTime(enrollment.enrollmentDate)}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p>No class bookings</p>'}
                </div>
            </div>
        `;

        ui.showModal(`Member History - ${member.firstName} ${member.lastName}`, content);
    }

    clearResults() {
        document.getElementById('checkinResults').innerHTML = `
            <div class="search-prompt">
                <i class="fas fa-search"></i>
                <p>Search for a member to check in</p>
                <p>Enter member name, ID, email, or phone number</p>
            </div>
        `;
    }

    // Get today's check-in statistics
    getTodayStats() {
        const todayCheckins = storage.getTodayCheckins();
        const members = storage.getMembers() || [];
        
        return {
            total: todayCheckins.length,
            uniqueMembers: new Set(todayCheckins.map(c => c.memberId)).size,
            peakHour: this.getPeakHour(todayCheckins),
            newVisitors: todayCheckins.filter(checkin => {
                const memberCheckins = (storage.getCheckins() || []).filter(c => c.memberId === checkin.memberId);
                return memberCheckins.length === 1;
            }).length
        };
    }

    getPeakHour(checkins) {
        const hourCounts = {};
        
        checkins.forEach(checkin => {
            const hour = new Date(checkin.timestamp).getHours();
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });

        let peakHour = 0;
        let maxCount = 0;
        
        Object.entries(hourCounts).forEach(([hour, count]) => {
            if (count > maxCount) {
                maxCount = count;
                peakHour = parseInt(hour);
            }
        });

        return peakHour;
    }

    // Export check-in data
    exportCheckins() {
        const checkins = storage.getCheckins() || [];
        const data = {
            timestamp: new Date().toISOString(),
            totalCheckins: checkins.length,
            todayStats: this.getTodayStats(),
            checkins: checkins
        };
        return data;
    }
}

// Create global checkin instance
window.checkin = new CheckInManager();
