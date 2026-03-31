// Mock Data for GymSync Application

// Mock Members Data
const mockMembers = [
    {
        id: 'M001',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@email.com',
        phone: '555-0101',
        plan: 'Premium',
        status: 'Active',
        joinDate: '2023-01-15',
        expiryDate: '2024-12-31',
        lastVisit: '2024-03-29',
        emergencyContact: 'Jane Smith - 555-0102',
        notes: 'Prefers morning workouts'
    },
    {
        id: 'M002',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.j@email.com',
        phone: '555-0103',
        plan: 'Basic',
        status: 'Active',
        joinDate: '2023-03-20',
        expiryDate: '2024-06-30',
        lastVisit: '2024-03-28',
        emergencyContact: 'Mike Johnson - 555-0104',
        notes: 'Training for marathon'
    },
    {
        id: 'M003',
        firstName: 'Mike',
        lastName: 'Williams',
        email: 'mike.w@email.com',
        phone: '555-0105',
        plan: 'Premium',
        status: 'Expired',
        joinDate: '2022-11-10',
        expiryDate: '2024-02-28',
        lastVisit: '2024-02-25',
        emergencyContact: 'Lisa Williams - 555-0106',
        notes: 'Needs membership renewal'
    },
    {
        id: 'M004',
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.d@email.com',
        phone: '555-0107',
        plan: 'Student',
        status: 'Active',
        joinDate: '2023-09-01',
        expiryDate: '2024-08-31',
        lastVisit: '2024-03-30',
        emergencyContact: 'Robert Davis - 555-0108',
        notes: 'Student ID verified'
    },
    {
        id: 'M005',
        firstName: 'David',
        lastName: 'Brown',
        email: 'david.b@email.com',
        phone: '555-0109',
        plan: 'Premium',
        status: 'Active',
        joinDate: '2023-06-15',
        expiryDate: '2025-06-14',
        lastVisit: '2024-03-29',
        emergencyContact: 'Mary Brown - 555-0110',
        notes: 'Personal training client'
    }
];

// Mock Membership Plans
const mockPlans = [
    {
        id: 'basic',
        name: 'Basic',
        price: 29.99,
        duration: 'month',
        features: ['Gym Access', 'Basic Equipment']
    },
    {
        id: 'premium',
        name: 'Premium',
        price: 59.99,
        duration: 'month',
        features: ['Gym Access', 'All Equipment', 'Group Classes', 'Sauna']
    },
    {
        id: 'student',
        name: 'Student',
        price: 19.99,
        duration: 'month',
        features: ['Gym Access', 'Basic Equipment', 'Student Discount']
    }
];

// Mock Check-ins
const mockCheckins = [
    {
        id: 'C001',
        memberId: 'M001',
        memberName: 'John Smith',
        timestamp: '2024-03-30T08:30:00',
        type: 'regular',
        status: 'completed'
    },
    {
        id: 'C002',
        memberId: 'M002',
        memberName: 'Sarah Johnson',
        timestamp: '2024-03-30T09:15:00',
        type: 'regular',
        status: 'completed'
    },
    {
        id: 'C003',
        memberId: 'M004',
        memberName: 'Emily Davis',
        timestamp: '2024-03-30T10:00:00',
        type: 'regular',
        status: 'completed'
    }
];

// Mock Class Sessions
const mockClasses = [
    {
        id: 'CLS001',
        name: 'Morning Yoga',
        instructor: 'Emma Wilson',
        date: '2024-03-31',
        time: '07:00 AM',
        duration: 60,
        capacity: 20,
        enrolled: 15,
        room: 'Studio A',
        description: 'Start your day with energizing yoga flows'
    },
    {
        id: 'CLS002',
        name: 'HIIT Training',
        instructor: 'James Chen',
        date: '2024-03-31',
        time: '09:00 AM',
        duration: 45,
        capacity: 15,
        enrolled: 12,
        room: 'Main Floor',
        description: 'High-intensity interval training'
    },
    {
        id: 'CLS003',
        name: 'Spin Class',
        instructor: 'Maria Garcia',
        date: '2024-03-31',
        time: '10:30 AM',
        duration: 60,
        capacity: 25,
        enrolled: 25,
        room: 'Cycling Studio',
        description: 'Indoor cycling workout'
    },
    {
        id: 'CLS004',
        name: 'Boxing',
        instructor: 'Tony Rodriguez',
        date: '2024-03-31',
        time: '12:00 PM',
        duration: 60,
        capacity: 18,
        enrolled: 8,
        room: 'Boxing Room',
        description: 'Boxing techniques and conditioning'
    },
    {
        id: 'CLS005',
        name: 'Evening Pilates',
        instructor: 'Lisa Thompson',
        date: '2024-03-31',
        time: '06:00 PM',
        duration: 55,
        capacity: 16,
        enrolled: 10,
        room: 'Studio B',
        description: 'Core strengthening and flexibility'
    },
    {
        id: 'CLS006',
        name: 'Strength Training',
        instructor: 'Mark Johnson',
        date: '2024-04-01',
        time: '08:00 AM',
        duration: 60,
        capacity: 20,
        enrolled: 14,
        room: 'Weight Room',
        description: 'Progressive strength training program'
    }
];

// Mock Class Enrollments
const mockEnrollments = [
    {
        id: 'E001',
        classId: 'CLS001',
        className: 'Morning Yoga',
        memberId: 'M001',
        memberName: 'John Smith',
        enrollmentDate: '2024-03-29T10:30:00',
        status: 'booked'
    },
    {
        id: 'E002',
        classId: 'CLS002',
        className: 'HIIT Training',
        memberId: 'M002',
        memberName: 'Sarah Johnson',
        enrollmentDate: '2024-03-28T14:20:00',
        status: 'booked'
    },
    {
        id: 'E003',
        classId: 'CLS005',
        className: 'Evening Pilates',
        memberId: 'M004',
        memberName: 'Emily Davis',
        enrollmentDate: '2024-03-30T11:15:00',
        status: 'booked'
    }
];

// Mock Products
const mockProducts = [
    {
        id: 'P001',
        name: 'Protein Shake',
        price: 4.99,
        category: 'Supplements',
        stock: 50,
        description: 'High-quality protein supplement',
        icon: 'fa-blender'
    },
    {
        id: 'P002',
        name: 'Energy Bar',
        price: 2.99,
        category: 'Snacks',
        stock: 100,
        description: 'Nutritious energy bar',
        icon: 'fa-cookie'
    },
    {
        id: 'P003',
        name: 'Gym Towel',
        price: 12.99,
        category: 'Accessories',
        stock: 30,
        description: 'Premium gym towel',
        icon: 'fa-hand-paper'
    },
    {
        id: 'P004',
        name: 'Water Bottle',
        price: 8.99,
        category: 'Accessories',
        stock: 45,
        description: 'Reusable water bottle',
        icon: 'fa-tint'
    },
    {
        id: 'P005',
        name: 'Gym Bag',
        price: 29.99,
        category: 'Accessories',
        stock: 20,
        description: 'Spacious gym bag',
        icon: 'fa-shopping-bag'
    },
    {
        id: 'P006',
        name: 'Workout Gloves',
        price: 19.99,
        category: 'Accessories',
        stock: 25,
        description: 'Training gloves',
        icon: 'fa-mitten'
    },
    {
        id: 'P007',
        name: 'BCAA Powder',
        price: 24.99,
        category: 'Supplements',
        stock: 35,
        description: 'Branched-chain amino acids',
        icon: 'fa-vial'
    },
    {
        id: 'P008',
        name: 'Yoga Mat',
        price: 34.99,
        category: 'Equipment',
        stock: 15,
        description: 'Non-slip yoga mat',
        icon: 'fa-rectangle-landscape'
    }
];

// Mock Sales
const mockSales = [
    {
        id: 'S001',
        items: [
            { productId: 'P001', name: 'Protein Shake', price: 4.99, quantity: 2 },
            { productId: 'P002', name: 'Energy Bar', price: 2.99, quantity: 1 }
        ],
        subtotal: 12.97,
        tax: 1.30,
        total: 14.27,
        paymentMethod: 'card',
        timestamp: '2024-03-30T11:30:00',
        memberId: 'M001',
        memberName: 'John Smith',
        status: 'completed'
    },
    {
        id: 'S002',
        items: [
            { productId: 'P004', name: 'Water Bottle', price: 8.99, quantity: 1 },
            { productId: 'P003', name: 'Gym Towel', price: 12.99, quantity: 1 }
        ],
        subtotal: 21.98,
        tax: 2.20,
        total: 24.18,
        paymentMethod: 'cash',
        timestamp: '2024-03-30T14:15:00',
        memberId: 'M002',
        memberName: 'Sarah Johnson',
        status: 'completed'
    }
];

// Mock Notifications
const mockNotifications = [
    {
        id: 'N001',
        title: 'Class Full',
        message: 'Spin Class at 10:30 AM is now fully booked',
        type: 'warning',
        timestamp: '2024-03-30T09:00:00',
        read: false
    },
    {
        id: 'N002',
        title: 'Membership Expiry',
        message: 'Mike Williams (M003) membership has expired',
        type: 'error',
        timestamp: '2024-03-29T17:00:00',
        read: false
    },
    {
        id: 'N003',
        title: 'New Member',
        message: 'Welcome Emily Davis to the gym community',
        type: 'info',
        timestamp: '2024-03-28T10:30:00',
        read: true
    },
    {
        id: 'N004',
        title: 'Equipment Maintenance',
        message: 'Treadmill #3 will be under maintenance tomorrow',
        type: 'info',
        timestamp: '2024-03-27T16:00:00',
        read: true
    }
];

// Mock Offline Queue
const mockOfflineQueue = [];

// Data Generator Functions
function generateId(prefix) {
    return prefix + Date.now().toString(36).toUpperCase();
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function isToday(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

function isExpired(expiryDate) {
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry < today;
}

function getDaysUntilExpiry(expiryDate) {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Export all data and utility functions
window.GymData = {
    members: mockMembers,
    plans: mockPlans,
    checkins: mockCheckins,
    classes: mockClasses,
    enrollments: mockEnrollments,
    products: mockProducts,
    sales: mockSales,
    notifications: mockNotifications,
    offlineQueue: mockOfflineQueue,
    generateId,
    formatCurrency,
    formatDateTime,
    formatDate,
    formatTime,
    isToday,
    isExpired,
    getDaysUntilExpiry
};
