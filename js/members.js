// Member Management Screen Functionality

class MemberManager {
    constructor() {
        this.currentMembers = [];
        this.filteredMembers = [];
        this.init();
    }

    init() {
        this.loadMembers();
        this.setupEventListeners();
        this.renderMembers();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('memberSearch');
        ui.setupSearch(searchInput, (query) => {
            this.filterMembers(query);
        });

        // Add member button
        document.getElementById('addMemberBtn').addEventListener('click', () => {
            this.showAddMemberForm();
        });
    }

    loadMembers() {
        this.currentMembers = storage.getMembers() || [];
        this.filteredMembers = [...this.currentMembers];
    }

    filterMembers(query) {
        if (!query.trim()) {
            this.filteredMembers = [...this.currentMembers];
        } else {
            const lowerQuery = query.toLowerCase();
            this.filteredMembers = this.currentMembers.filter(member => 
                member.id.toLowerCase().includes(lowerQuery) ||
                member.firstName.toLowerCase().includes(lowerQuery) ||
                member.lastName.toLowerCase().includes(lowerQuery) ||
                member.email.toLowerCase().includes(lowerQuery) ||
                member.phone.includes(query)
            );
        }
        this.renderMembers();
    }

    renderMembers() {
        const tableBody = document.getElementById('membersTableBody');
        
        if (this.filteredMembers.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">
                        <div class="empty-state">
                            <i class="fas fa-users"></i>
                            <p>No members found</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.filteredMembers.map(member => `
            <tr>
                <td>${member.id}</td>
                <td>${member.firstName} ${member.lastName}</td>
                <td>${member.email}</td>
                <td>${ui.formatPhoneNumber(member.phone)}</td>
                <td>${member.plan}</td>
                <td>${this.createStatusBadge(member.status, member.expiryDate)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-outline" onclick="members.viewMember('${member.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="members.editMember('${member.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="members.deleteMember('${member.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
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

    viewMember(memberId) {
        const member = this.currentMembers.find(m => m.id === memberId);
        if (!member) return;

        const content = `
            <div class="member-details-view">
                <div class="detail-section">
                    <h4>Personal Information</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Member ID:</label>
                            <span>${member.id}</span>
                        </div>
                        <div class="detail-item">
                            <label>Name:</label>
                            <span>${member.firstName} ${member.lastName}</span>
                        </div>
                        <div class="detail-item">
                            <label>Email:</label>
                            <span>${member.email}</span>
                        </div>
                        <div class="detail-item">
                            <label>Phone:</label>
                            <span>${ui.formatPhoneNumber(member.phone)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>Membership Information</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Plan:</label>
                            <span>${member.plan}</span>
                        </div>
                        <div class="detail-item">
                            <label>Status:</label>
                            <span>${this.createStatusBadge(member.status, member.expiryDate)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Join Date:</label>
                            <span>${GymData.formatDate(member.joinDate)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Expiry Date:</label>
                            <span>${GymData.formatDate(member.expiryDate)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Last Visit:</label>
                            <span>${GymData.formatDate(member.lastVisit)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>Emergency Contact</h4>
                    <div class="detail-item">
                        <label>Contact:</label>
                        <span>${member.emergencyContact}</span>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>Notes</h4>
                    <div class="detail-item">
                        <p>${member.notes || 'No notes available'}</p>
                    </div>
                </div>
            </div>
        `;

        ui.showModal(`Member Details - ${member.firstName} ${member.lastName}`, content);
    }

    editMember(memberId) {
        const member = this.currentMembers.find(m => m.id === memberId);
        if (!member) return;

        const content = `
            <form id="editMemberForm" class="member-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="editFirstName">First Name *</label>
                        <input type="text" id="editFirstName" name="firstName" value="${member.firstName}" required>
                    </div>
                    <div class="form-group">
                        <label for="editLastName">Last Name *</label>
                        <input type="text" id="editLastName" name="lastName" value="${member.lastName}" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="editEmail">Email *</label>
                        <input type="email" id="editEmail" name="email" value="${member.email}" required>
                    </div>
                    <div class="form-group">
                        <label for="editPhone">Phone *</label>
                        <input type="tel" id="editPhone" name="phone" value="${member.phone}" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="editPlan">Membership Plan *</label>
                        <select id="editPlan" name="plan" required>
                            <option value="Basic" ${member.plan === 'Basic' ? 'selected' : ''}>Basic</option>
                            <option value="Premium" ${member.plan === 'Premium' ? 'selected' : ''}>Premium</option>
                            <option value="Student" ${member.plan === 'Student' ? 'selected' : ''}>Student</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="editStatus">Status *</label>
                        <select id="editStatus" name="status" required>
                            <option value="Active" ${member.status === 'Active' ? 'selected' : ''}>Active</option>
                            <option value="Inactive" ${member.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                            <option value="Suspended" ${member.status === 'Suspended' ? 'selected' : ''}>Suspended</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="editExpiryDate">Expiry Date *</label>
                        <input type="date" id="editExpiryDate" name="expiryDate" value="${member.expiryDate}" required>
                    </div>
                    <div class="form-group">
                        <label for="editLastVisit">Last Visit</label>
                        <input type="date" id="editLastVisit" name="lastVisit" value="${member.lastVisit}">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="editEmergencyContact">Emergency Contact</label>
                    <input type="text" id="editEmergencyContact" name="emergencyContact" value="${member.emergencyContact}">
                </div>
                
                <div class="form-group">
                    <label for="editNotes">Notes</label>
                    <textarea id="editNotes" name="notes" rows="3">${member.notes || ''}</textarea>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" onclick="ui.hideModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
            </form>
        `;

        ui.showModal(`Edit Member - ${member.firstName} ${member.lastName}`, content);

        // Handle form submission
        document.getElementById('editMemberForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveMemberChanges(memberId, new FormData(e.target));
        });
    }

    saveMemberChanges(memberId, formData) {
        const updates = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            plan: formData.get('plan'),
            status: formData.get('status'),
            expiryDate: formData.get('expiryDate'),
            lastVisit: formData.get('lastVisit'),
            emergencyContact: formData.get('emergencyContact'),
            notes: formData.get('notes')
        };

        if (storage.updateMember(memberId, updates)) {
            ui.showToast('Member updated successfully', 'success');
            this.loadMembers();
            this.filterMembers(document.getElementById('memberSearch').value);
            ui.hideModal();
            
            // Update dashboard
            dashboard.updateDashboard();
        } else {
            ui.showToast('Failed to update member', 'error');
        }
    }

    showAddMemberForm() {
        const content = `
            <form id="addMemberForm" class="member-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="addFirstName">First Name *</label>
                        <input type="text" id="addFirstName" name="firstName" required>
                    </div>
                    <div class="form-group">
                        <label for="addLastName">Last Name *</label>
                        <input type="text" id="addLastName" name="lastName" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="addEmail">Email *</label>
                        <input type="email" id="addEmail" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="addPhone">Phone *</label>
                        <input type="tel" id="addPhone" name="phone" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="addPlan">Membership Plan *</label>
                        <select id="addPlan" name="plan" required>
                            <option value="Basic">Basic</option>
                            <option value="Premium">Premium</option>
                            <option value="Student">Student</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="addStatus">Status *</label>
                        <select id="addStatus" name="status" required>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="addExpiryDate">Expiry Date *</label>
                        <input type="date" id="addExpiryDate" name="expiryDate" required>
                    </div>
                    <div class="form-group">
                        <label for="addEmergencyContact">Emergency Contact</label>
                        <input type="text" id="addEmergencyContact" name="emergencyContact">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="addNotes">Notes</label>
                    <textarea id="addNotes" name="notes" rows="3"></textarea>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" onclick="ui.hideModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Add Member</button>
                </div>
            </form>
        `;

        ui.showModal('Add New Member', content);

        // Set default expiry date to 1 year from today
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        document.getElementById('addExpiryDate').value = expiryDate.toISOString().split('T')[0];

        // Handle form submission
        document.getElementById('addMemberForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addNewMember(new FormData(e.target));
        });
    }

    addNewMember(formData) {
        const newMember = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            plan: formData.get('plan'),
            status: formData.get('status'),
            expiryDate: formData.get('expiryDate'),
            emergencyContact: formData.get('emergencyContact'),
            notes: formData.get('notes'),
            joinDate: new Date().toISOString().split('T')[0],
            lastVisit: new Date().toISOString().split('T')[0]
        };

        if (storage.addMember(newMember)) {
            ui.showToast('Member added successfully', 'success');
            this.loadMembers();
            this.filterMembers(document.getElementById('memberSearch').value);
            ui.hideModal();
            
            // Add activity
            dashboard.addActivity('member', `${newMember.firstName} ${newMember.lastName} joined the gym`);
            
            // Add notification
            storage.addNotification({
                title: 'New Member',
                message: `Welcome ${newMember.firstName} ${newMember.lastName} to the gym community`,
                type: 'info'
            });
            
            // Update dashboard
            dashboard.updateDashboard();
            ui.updateNotificationBadge();
        } else {
            ui.showToast('Failed to add member', 'error');
        }
    }

    deleteMember(memberId) {
        const member = this.currentMembers.find(m => m.id === memberId);
        if (!member) return;

        ui.confirmAction(
            `Are you sure you want to delete ${member.firstName} ${member.lastName}? This action cannot be undone.`,
            () => {
                if (storage.deleteMember(memberId)) {
                    ui.showToast('Member deleted successfully', 'success');
                    this.loadMembers();
                    this.filterMembers(document.getElementById('memberSearch').value);
                    
                    // Update dashboard
                    dashboard.updateDashboard();
                } else {
                    ui.showToast('Failed to delete member', 'error');
                }
            }
        );
    }

    // Export members data
    exportMembers() {
        const data = {
            timestamp: new Date().toISOString(),
            totalMembers: this.currentMembers.length,
            activeMembers: this.currentMembers.filter(m => m.status === 'Active').length,
            members: this.currentMembers
        };
        return data;
    }
}

// Create global members instance
window.members = new MemberManager();
