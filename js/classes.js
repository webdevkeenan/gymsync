// Classes System Functionality

class ClassesManager {
    constructor() {
        this.currentClasses = [];
        this.filteredClasses = [];
        this.init();
    }

    init() {
        this.loadClasses();
        this.renderClasses();
    }

    loadClasses() {
        // Load from mock data and update with current enrollment counts
        this.currentClasses = [...GymData.classes];
        this.updateEnrollmentCounts();
        this.filteredClasses = [...this.currentClasses];
    }

    updateEnrollmentCounts() {
        const enrollments = storage.getEnrollments() || [];
        
        this.currentClasses.forEach(cls => {
            const classEnrollments = enrollments.filter(e => e.classId === cls.id && e.status === 'booked');
            cls.enrolled = classEnrollments.length;
        });
    }

    renderClasses() {
        const classesGrid = document.getElementById('classesGrid');
        
        if (this.filteredClasses.length === 0) {
            classesGrid.innerHTML = `
                <div class="no-classes">
                    <i class="fas fa-calendar-alt"></i>
                    <p>No classes available</p>
                </div>
            `;
            return;
        }

        classesGrid.innerHTML = this.filteredClasses.map(cls => {
            const capacityPercentage = (cls.enrolled / cls.capacity) * 100;
            const seatsRemaining = cls.capacity - cls.enrolled;
            const isFull = seatsRemaining === 0;
            const capacityStatus = this.getCapacityStatus(capacityPercentage);
            
            return `
                <div class="class-card">
                    <div class="class-header">
                        <div class="class-name">${cls.name}</div>
                        <div class="class-instructor">with ${cls.instructor}</div>
                    </div>
                    
                    <div class="class-details">
                        <div class="class-detail">
                            <span class="class-detail-label">Date:</span>
                            <span class="class-detail-value">${GymData.formatDate(cls.date)}</span>
                        </div>
                        <div class="class-detail">
                            <span class="class-detail-label">Time:</span>
                            <span class="class-detail-value">${cls.time}</span>
                        </div>
                        <div class="class-detail">
                            <span class="class-detail-label">Duration:</span>
                            <span class="class-detail-value">${cls.duration} min</span>
                        </div>
                        <div class="class-detail">
                            <span class="class-detail-label">Room:</span>
                            <span class="class-detail-value">${cls.room}</span>
                        </div>
                    </div>
                    
                    <div class="capacity-section">
                        <div class="capacity-bar">
                            <div class="capacity-fill ${capacityStatus}" style="width: ${capacityPercentage}%"></div>
                        </div>
                        <div class="capacity-text">
                            ${seatsRemaining} seat${seatsRemaining !== 1 ? 's' : ''} remaining
                        </div>
                    </div>
                    
                    <div class="class-description">
                        <p>${cls.description}</p>
                    </div>
                    
                    <div class="class-actions">
                        ${isFull ? `
                            <button class="btn btn-warning" disabled>
                                <i class="fas fa-users"></i>
                                Class Full
                            </button>
                        ` : `
                            <button class="btn btn-primary" onclick="classes.bookClass('${cls.id}')">
                                <i class="fas fa-plus-circle"></i>
                                Book Class
                            </button>
                        `}
                        
                        <button class="btn btn-outline" onclick="classes.viewClassDetails('${cls.id}')">
                            <i class="fas fa-info-circle"></i>
                            Details
                        </button>
                    </div>
                    
                    ${isFull ? `
                    <div class="class-alert">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>This class is full. Join the waitlist?</span>
                        <button class="btn btn-sm btn-outline" onclick="classes.joinWaitlist('${cls.id}')">
                            Join Waitlist
                        </button>
                    </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    getCapacityStatus(percentage) {
        if (percentage >= 100) return 'danger';
        if (percentage >= 80) return 'warning';
        return 'success';
    }

    async bookClass(classId) {
        const cls = this.currentClasses.find(c => c.id === classId);
        if (!cls) {
            ui.showToast('Class not found', 'error');
            return;
        }

        // Check if class is full
        if (cls.enrolled >= cls.capacity) {
            ui.showToast('Class is full', 'warning');
            this.renderClasses();
            return;
        }

        // Show member selection modal
        this.showMemberSelectionModal(cls);
    }

    showMemberSelectionModal(cls) {
        const members = storage.getMembers() || [];
        const activeMembers = members.filter(member => 
            member.status === 'Active' && !GymData.isExpired(member.expiryDate)
        );

        const content = `
            <div class="member-selection">
                <h4>Select Member for ${cls.name}</h4>
                <div class="member-list">
                    ${activeMembers.map(member => `
                        <div class="member-option" onclick="classes.confirmBooking('${cls.id}', '${member.id}')">
                            <div class="member-info">
                                <strong>${member.firstName} ${member.lastName}</strong>
                                <span class="member-id">${member.id}</span>
                            </div>
                            <div class="member-plan">${member.plan}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="modal-actions">
                    <button class="btn btn-outline" onclick="ui.hideModal()">Cancel</button>
                </div>
            </div>
        `;

        ui.showModal('Select Member', content);
    }

    async confirmBooking(classId, memberId) {
        const cls = this.currentClasses.find(c => c.id === classId);
        const member = (storage.getMembers() || []).find(m => m.id === memberId);
        
        if (!cls || !member) {
            ui.showToast('Invalid class or member', 'error');
            return;
        }

        // Check if already enrolled
        const enrollments = storage.getEnrollments() || [];
        const alreadyEnrolled = enrollments.some(e => 
            e.classId === classId && e.memberId === memberId && e.status === 'booked'
        );

        if (alreadyEnrolled) {
            ui.showToast('Member is already enrolled in this class', 'warning');
            return;
        }

        // Check if class is still available
        if (cls.enrolled >= cls.capacity) {
            ui.showToast('Class is now full', 'warning');
            return;
        }

        const isOffline = storage.getSettings()?.offlineMode || false;
        
        const enrollmentData = {
            classId: cls.id,
            className: cls.name,
            memberId: member.id,
            memberName: `${member.firstName} ${member.lastName}`,
            enrollmentDate: new Date().toISOString(),
            status: 'booked'
        };

        if (isOffline) {
            // Add to offline queue
            storage.addToOfflineQueue({
                action: 'enroll',
                data: enrollmentData
            });
            
            ui.showToast('Booking queued for sync (Offline Mode)', 'warning');
        } else {
            // Process immediately
            if (storage.addEnrollment(enrollmentData)) {
                // Update class enrollment count
                this.updateEnrollmentCounts();
                
                ui.showToast(`${member.firstName} ${member.lastName} booked for ${cls.name}`, 'success');
                
                // Add activity
                dashboard.addActivity('booking', `${member.firstName} ${member.lastName} booked ${cls.name}`);
                
                // Add notification if class is now full
                if (cls.enrolled >= cls.capacity) {
                    storage.addNotification({
                        title: 'Class Full',
                        message: `${cls.name} is now fully booked`,
                        type: 'warning'
                    });
                    ui.updateNotificationBadge();
                }
                
                // Update dashboard
                dashboard.updateDashboard();
                
                // Re-render classes
                this.renderClasses();
            } else {
                ui.showToast('Failed to book class', 'error');
            }
        }

        ui.hideModal();
    }

    joinWaitlist(classId) {
        const cls = this.currentClasses.find(c => c.id === classId);
        if (!cls) return;

        // Show member selection modal for waitlist
        this.showMemberSelectionModal(cls, true);
    }

    viewClassDetails(classId) {
        const cls = this.currentClasses.find(c => c.id === classId);
        if (!cls) return;

        const enrollments = (storage.getEnrollments() || []).filter(e => e.classId === classId && e.status === 'booked');

        const content = `
            <div class="class-details-view">
                <div class="class-info">
                    <h3>${cls.name}</h3>
                    <p class="instructor">Instructor: ${cls.instructor}</p>
                    <p class="description">${cls.description}</p>
                </div>
                
                <div class="class-schedule">
                    <h4>Schedule</h4>
                    <div class="schedule-grid">
                        <div class="schedule-item">
                            <label>Date:</label>
                            <span>${GymData.formatDate(cls.date)}</span>
                        </div>
                        <div class="schedule-item">
                            <label>Time:</label>
                            <span>${cls.time}</span>
                        </div>
                        <div class="schedule-item">
                            <label>Duration:</label>
                            <span>${cls.duration} minutes</span>
                        </div>
                        <div class="schedule-item">
                            <label>Room:</label>
                            <span>${cls.room}</span>
                        </div>
                    </div>
                </div>
                
                <div class="class-capacity">
                    <h4>Capacity</h4>
                    <div class="capacity-info">
                        <div class="capacity-bar">
                            <div class="capacity-fill ${this.getCapacityStatus((cls.enrolled / cls.capacity) * 100)}" 
                                 style="width: ${(cls.enrolled / cls.capacity) * 100}%"></div>
                        </div>
                        <div class="capacity-text">
                            ${cls.enrolled} / ${cls.capacity} enrolled (${cls.capacity - cls.enrolled} seats available)
                        </div>
                    </div>
                </div>
                
                <div class="class-enrollments">
                    <h4>Enrolled Members (${enrollments.length})</h4>
                    ${enrollments.length > 0 ? `
                        <div class="enrollment-list">
                            ${enrollments.map(enrollment => `
                                <div class="enrollment-item">
                                    <div class="enrollment-member">
                                        <strong>${enrollment.memberName}</strong>
                                        <span class="enrollment-id">${enrollment.memberId}</span>
                                    </div>
                                    <div class="enrollment-date">
                                        Booked: ${GymData.formatDateTime(enrollment.enrollmentDate)}
                                    </div>
                                    <button class="btn btn-sm btn-danger" onclick="classes.cancelEnrollment('${enrollment.id}')">
                                        <i class="fas fa-times"></i>
                                        Cancel
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p>No members enrolled yet</p>'}
                </div>
            </div>
        `;

        ui.showModal(`Class Details - ${cls.name}`, content);
    }

    cancelEnrollment(enrollmentId) {
        ui.confirmAction(
            'Are you sure you want to cancel this enrollment?',
            () => {
                if (storage.deleteEnrollment(enrollmentId)) {
                    ui.showToast('Enrollment cancelled', 'success');
                    
                    // Update enrollment counts and re-render
                    this.updateEnrollmentCounts();
                    this.renderClasses();
                    
                    // Update dashboard
                    dashboard.updateDashboard();
                    
                    // Re-open modal to show updated details
                    const enrollment = (storage.getEnrollments() || []).find(e => e.id === enrollmentId);
                    if (enrollment) {
                        this.viewClassDetails(enrollment.classId);
                    }
                } else {
                    ui.showToast('Failed to cancel enrollment', 'error');
                }
            }
        );
    }

    filterClasses(query) {
        if (!query.trim()) {
            this.filteredClasses = [...this.currentClasses];
        } else {
            const lowerQuery = query.toLowerCase();
            this.filteredClasses = this.currentClasses.filter(cls => 
                cls.name.toLowerCase().includes(lowerQuery) ||
                cls.instructor.toLowerCase().includes(lowerQuery) ||
                cls.description.toLowerCase().includes(lowerQuery) ||
                cls.room.toLowerCase().includes(lowerQuery)
            );
        }
        this.renderClasses();
    }

    // Get class statistics
    getClassStats() {
        const enrollments = storage.getEnrollments() || [];
        const today = new Date().toISOString().split('T')[0];
        
        return {
            totalClasses: this.currentClasses.length,
            upcomingClasses: this.currentClasses.filter(cls => cls.date >= today).length,
            totalEnrollments: enrollments.filter(e => e.status === 'booked').length,
            averageOccupancy: this.calculateAverageOccupancy(),
            popularClasses: this.getPopularClasses()
        };
    }

    calculateAverageOccupancy() {
        if (this.currentClasses.length === 0) return 0;
        
        const totalOccupancy = this.currentClasses.reduce((sum, cls) => {
            return sum + ((cls.enrolled / cls.capacity) * 100);
        }, 0);
        
        return Math.round(totalOccupancy / this.currentClasses.length);
    }

    getPopularClasses() {
        const enrollments = storage.getEnrollments() || [];
        const classCounts = {};
        
        enrollments.forEach(enrollment => {
            if (enrollment.status === 'booked') {
                classCounts[enrollment.className] = (classCounts[enrollment.className] || 0) + 1;
            }
        });
        
        return Object.entries(classCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));
    }

    // Export classes data
    exportClasses() {
        const data = {
            timestamp: new Date().toISOString(),
            stats: this.getClassStats(),
            classes: this.currentClasses,
            enrollments: storage.getEnrollments() || []
        };
        return data;
    }
}

// Create global classes instance
window.classes = new ClassesManager();
