// Offline Mode Simulation and Sync Queue Management

class OfflineManager {
    constructor() {
        this.isOnline = true;
        this.syncInProgress = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupNetworkMonitoring();
        this.updateOfflineUI();
    }

    setupEventListeners() {
        // Offline toggle
        const offlineToggle = document.getElementById('offlineMode');
        offlineToggle.addEventListener('change', (e) => {
            this.toggleOfflineMode(e.target.checked);
        });

        // Reset data button
        document.getElementById('resetData').addEventListener('click', () => {
            this.resetAllData();
        });
    }

    setupNetworkMonitoring() {
        // Monitor actual network status
        window.addEventListener('online', () => {
            if (!this.isOnline) {
                this.goOnline();
            }
        });

        window.addEventListener('offline', () => {
            if (this.isOnline) {
                this.goOffline();
            }
        });

        // Check initial status
        this.isOnline = navigator.onLine;
    }

    toggleOfflineMode(forceOffline) {
        const offlineToggle = document.getElementById('offlineMode');
        
        if (forceOffline) {
            this.goOffline();
            offlineToggle.checked = true;
        } else {
            this.goOnline();
            offlineToggle.checked = false;
        }
    }

    goOffline() {
        this.isOnline = false;
        storage.updateSetting('offlineMode', true);
        this.updateOfflineUI();
        this.showOfflineNotification();
        
        // Add notification
        notifications.addNotification(
            'Offline Mode',
            'Application is now in offline mode. Actions will be queued for sync.',
            'warning'
        );
    }

    goOnline() {
        this.isOnline = true;
        storage.updateSetting('offlineMode', false);
        this.updateOfflineUI();
        this.syncQueue();
        
        // Add notification
        notifications.addNotification(
            'Online Mode',
            'Application is back online. Syncing queued actions...',
            'success'
        );
    }

    updateOfflineUI() {
        const offlineToggle = document.getElementById('offlineMode');
        const toggleLabel = document.querySelector('.toggle-label');
        
        if (this.isOnline) {
            toggleLabel.textContent = 'Offline Mode';
            document.body.classList.remove('offline-mode');
        } else {
            toggleLabel.textContent = 'Online Mode';
            document.body.classList.add('offline-mode');
        }

        // Update queue indicator
        this.updateQueueIndicator();
    }

    showOfflineNotification() {
        // Show toast for immediate feedback
        ui.showToast(
            'Offline mode activated. Actions will be queued for sync when online.',
            'warning',
            'Offline Mode'
        );
    }

    addToQueue(action, data) {
        const queueItem = {
            action,
            data,
            timestamp: new Date().toISOString(),
            status: 'pending'
        };

        if (storage.addToOfflineQueue(queueItem)) {
            this.updateQueueIndicator();
            ui.showToast(
                'Action queued for sync (Offline Mode)',
                'warning',
                'Queued'
            );
            return true;
        }
        return false;
    }

    async syncQueue() {
        if (this.syncInProgress || this.isOnline === false) {
            return;
        }

        const queue = storage.getOfflineQueue() || [];
        const pendingItems = queue.filter(item => item.status === 'pending');
        
        if (pendingItems.length === 0) {
            return;
        }

        this.syncInProgress = true;
        ui.showToast(
            `Syncing ${pendingItems.length} queued actions...`,
            'info',
            'Syncing'
        );

        let successCount = 0;
        let errorCount = 0;

        for (const item of pendingItems) {
            try {
                const success = await this.processQueueItem(item);
                if (success) {
                    storage.markQueueItemSynced(item.id);
                    successCount++;
                } else {
                    errorCount++;
                }
            } catch (error) {
                console.error('Sync error:', error);
                errorCount++;
            }

            // Small delay between items to simulate processing
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Clean up synced items
        storage.clearSyncedItems();

        this.syncInProgress = false;

        // Show sync completion notification
        if (successCount > 0) {
            ui.showToast(
                `Sync completed: ${successCount} actions synced successfully`,
                'success',
                'Sync Complete'
            );
        }

        if (errorCount > 0) {
            ui.showToast(
                `${errorCount} actions failed to sync`,
                'error',
                'Sync Errors'
            );
        }

        // Update UI
        this.updateQueueIndicator();
        dashboard.updateDashboard();
        notifications.checkSystemAlerts();
    }

    async processQueueItem(item) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 200));

        switch (item.action) {
            case 'checkin':
                return this.processCheckin(item.data);
            case 'enroll':
                return this.processEnrollment(item.data);
            case 'sale':
                return this.processSale(item.data);
            case 'member_update':
                return this.processMemberUpdate(item.data);
            default:
                console.warn('Unknown queue action:', item.action);
                return false;
        }
    }

    processCheckin(data) {
        // Check-in was already added to localStorage when queued
        // This simulates server sync
        return true;
    }

    processEnrollment(data) {
        // Enrollment was already added to localStorage when queued
        // This simulates server sync
        return true;
    }

    processSale(data) {
        // Sale was already added to localStorage when queued
        // This simulates server sync
        return true;
    }

    processMemberUpdate(data) {
        // Member update was already applied to localStorage when queued
        // This simulates server sync
        return true;
    }

    updateQueueIndicator() {
        const queue = storage.getOfflineQueue() || [];
        const pendingCount = queue.filter(item => item.status === 'pending').length;
        
        // Update notification badge if there are pending items
        if (pendingCount > 0 && !this.isOnline) {
            // Could add a visual indicator in the UI
            document.body.setAttribute('data-pending-sync', pendingCount);
        } else {
            document.body.removeAttribute('data-pending-sync');
        }
    }

    getQueueStatus() {
        const queue = storage.getOfflineQueue() || [];
        const pending = queue.filter(item => item.status === 'pending');
        const synced = queue.filter(item => item.status === 'synced');
        
        return {
            total: queue.length,
            pending: pending.length,
            synced: synced.length,
            isOnline: this.isOnline,
            syncInProgress: this.syncInProgress
        };
    }

    viewQueue() {
        const queue = storage.getOfflineQueue() || [];
        const pending = queue.filter(item => item.status === 'pending');
        const synced = queue.filter(item => item.status === 'synced');
        
        const content = `
            <div class="queue-view">
                <div class="queue-summary">
                    <h3>Sync Queue Status</h3>
                    <div class="queue-stats">
                        <div class="stat-item">
                            <span class="stat-label">Status:</span>
                            <span class="stat-value ${this.isOnline ? 'online' : 'offline'}">
                                ${this.isOnline ? 'Online' : 'Offline'}
                            </span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Pending:</span>
                            <span class="stat-value pending">${pending.length}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Synced:</span>
                            <span class="stat-value synced">${synced.length}</span>
                        </div>
                    </div>
                </div>
                
                <div class="queue-actions">
                    ${!this.isOnline ? `
                        <button class="btn btn-primary" onclick="offline.goOnline()">
                            <i class="fas fa-wifi"></i>
                            Go Online & Sync
                        </button>
                    ` : pending.length > 0 ? `
                        <button class="btn btn-primary" onclick="offline.syncQueue()" ${this.syncInProgress ? 'disabled' : ''}>
                            <i class="fas fa-sync"></i>
                            ${this.syncInProgress ? 'Syncing...' : 'Sync Now'}
                        </button>
                    ` : ''}
                    
                    ${synced.length > 0 ? `
                        <button class="btn btn-outline" onclick="offline.clearSynced()">
                            <i class="fas fa-broom"></i>
                            Clear Synced
                        </button>
                    ` : ''}
                </div>
                
                <div class="queue-items">
                    <h4>Queue Items</h4>
                    ${queue.length > 0 ? `
                        <div class="queue-list">
                            ${queue.map(item => `
                                <div class="queue-item ${item.status}">
                                    <div class="queue-item-icon">
                                        <i class="fas ${this.getActionIcon(item.action)}"></i>
                                    </div>
                                    <div class="queue-item-content">
                                        <div class="queue-item-title">${this.getActionTitle(item.action, item.data)}</div>
                                        <div class="queue-item-time">${GymData.formatDateTime(item.timestamp)}</div>
                                        <div class="queue-item-status">${item.status}</div>
                                    </div>
                                    ${item.status === 'pending' ? `
                                        <button class="btn btn-sm btn-danger" onclick="offline.removeFromQueue('${item.id}')">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p>No items in queue</p>'}
                </div>
            </div>
        `;

        ui.showModal('Sync Queue', content);
    }

    getActionIcon(action) {
        const icons = {
            checkin: 'fa-sign-in-alt',
            enroll: 'fa-calendar-plus',
            sale: 'fa-shopping-cart',
            member_update: 'fa-user-edit'
        };
        return icons[action] || 'fa-circle';
    }

    getActionTitle(action, data) {
        switch (action) {
            case 'checkin':
                return `Check-in: ${data.memberName}`;
            case 'enroll':
                return `Booking: ${data.memberName} - ${data.className}`;
            case 'sale':
                return `Sale: ${GymData.formatCurrency(data.total)}`;
            case 'member_update':
                return `Member Update: ${data.firstName} ${data.lastName}`;
            default:
                return `Unknown Action: ${action}`;
        }
    }

    removeFromQueue(itemId) {
        const queue = storage.getOfflineQueue() || [];
        const filtered = queue.filter(item => item.id !== itemId);
        
        if (storage.setOfflineQueue(filtered)) {
            this.updateQueueIndicator();
            this.viewQueue(); // Refresh the modal
            ui.showToast('Item removed from queue', 'info');
        }
    }

    clearSynced() {
        if (storage.clearSyncedItems()) {
            this.updateQueueIndicator();
            this.viewQueue(); // Refresh the modal
            ui.showToast('Synced items cleared', 'success');
        }
    }

    async resetAllData() {
        ui.confirmAction(
            'Are you sure you want to reset all demo data? This will restore the application to its initial state and cannot be undone.',
            () => {
                if (storage.resetAllData()) {
                    ui.showToast('Demo data reset successfully', 'success');
                    
                    // Reinitialize all modules
                    location.reload();
                } else {
                    ui.showToast('Failed to reset data', 'error');
                }
            }
        );
    }

    // Export offline data
    exportOfflineData() {
        const data = {
            timestamp: new Date().toISOString(),
            status: this.getQueueStatus(),
            queue: storage.getOfflineQueue() || []
        };
        return data;
    }
}

// Create global offline instance
window.offline = new OfflineManager();
