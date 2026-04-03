# GymSync - Gym Management Dashboard

A responsive, front-end-only web prototype for gym management, designed for front desk staff, managers, and members.

## Features

### Core Functionality
- **Selected Member Workflow**: Global member context system across all screens
- **Dashboard**: Real-time stats, recent activity, and quick actions
- **Member Management**: Search, view, and manage member profiles
- **Check-In System**: Member check-ins with status validation
- **Class Booking**: Book classes with capacity management
- **Point of Sale (POS)**: Product catalog and sales processing
- **Notifications**: Real-time alerts and system messages
- **Offline Mode**: Queue actions when offline, sync when online

### Responsive Design
- **Desktop**: Full sidebar navigation with dual-column layouts
- **Tablet**: Adaptive layouts with collapsible sidebar
- **Mobile**: Hamburger menu, single-column layouts, touch-friendly controls
- **Accessibility**: High contrast mode support, reduced motion preferences, semantic HTML

### Visual Design
- **Modern UI**: Card-based design with subtle shadows and animations
- **Color Scheme**: Professional gradient sidebar with clean white content areas
- **Typography**: System fonts for optimal readability across devices
- **Interactive Elements**: Hover states, smooth transitions, and micro-interactions

## Technical Implementation

### Architecture
- **Pure JavaScript**: No frameworks, vanilla ES6+ with class-based architecture
- **State Management**: Centralized state with localStorage persistence
- **Component-Based**: Modular screen rendering and reusable UI patterns
- **Event-Driven**: Comprehensive event handling with proper delegation

### Data Management
- **Mock Data**: Realistic sample data for members, classes, products, and transactions
- **LocalStorage**: Persistent storage for user data and application state
- **Offline Queue**: Actions queued when offline, synced when connection restored
- **Data Validation**: Member status checks, capacity limits, and business rules

### Responsive Features
- **Fluid Grids**: CSS Grid and Flexbox for adaptive layouts
- **Breakpoints**: Mobile (480px), Tablet (768px), Desktop (1024px+)
- **Touch Optimization**: Larger tap targets and mobile-friendly controls
- **Performance**: Optimized animations and efficient DOM manipulation

## File Structure

```
gymsync/
├── index.html          # Main HTML structure
├── styles.css          # Complete responsive styling
├── script.js           # Application logic and state management
└── README.md           # This documentation
```

## Usage

1. Open `index.html` in a web browser
2. The app loads with demo data and is ready to use
3. Select a member to enable check-in, booking, and POS features
4. Use the sidebar navigation to switch between screens
5. Toggle offline mode to test queuing and sync functionality

## Key Workflows

### Member Check-In
1. Select a member from the Member Management screen
2. Navigate to Check-In screen
3. Verify member status and alerts
4. Confirm check-in (only active members can check-in)

### Class Booking
1. Select a member
2. Navigate to Classes screen
3. Choose an available class (seats remaining > 0)
4. Book class for selected member

### Point of Sale
1. Select a member (required for checkout)
2. Add products to cart
3. Select payment method
4. Complete checkout with receipt

### Offline Mode
1. Toggle Offline Mode in sidebar
2. Actions are queued instead of processed immediately
3. Return online to sync queued actions
4. Status indicators show sync progress

## Browser Compatibility

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Mobile Browsers**: iOS Safari 13+, Chrome Mobile 80+
- **Features Used**: ES6 Classes, CSS Grid, Flexbox, LocalStorage, Fetch API

## Development Notes

### State Persistence
The application uses localStorage to persist:
- Selected member ID
- Check-in records
- Sales transactions
- Class enrollments
- Offline queue items
- User preferences

### Reset Demo Data
Use the "Reset Demo Data" button in the sidebar to:
- Clear all persisted data
- Regenerate initial demo data
- Reset application to default state

### Performance Considerations
- Efficient DOM updates with targeted rendering
- Debounced search functionality
- Optimized animations using CSS transforms
- Lazy loading of screen content

## Future Enhancements

### Potential Features
- Real-time WebSocket integration
- Advanced reporting and analytics
- Member photo uploads
- Barcode scanning support
- Email/SMS notifications
- Advanced user roles and permissions

### Technical Improvements
- Service Worker for offline support
- Web Components for better modularity
- TypeScript for type safety
- Unit testing framework
- CI/CD pipeline

---

**GymSync** - A modern, responsive gym management solution built with pure web technologies.
