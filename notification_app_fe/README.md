# Stage 2: Campus Notifications Frontend

## Overview
A responsive React/Next.js frontend application for the Campus Notifications Platform built with Material UI. Features priority inbox, filtering, and real-time notification management.

## Features

✨ **Core Features**
- ✅ Display all notifications with priority sorting
- ✅ Priority Inbox - Top 10 most relevant notifications
- ✅ Real-time filtering by notification type (Placement, Result, Event)
- ✅ Search functionality across notification messages
- ✅ "New" vs "Old" notification highlighting
- ✅ Responsive design (mobile + desktop)
- ✅ Material UI styling (no Tailwind/ShadCN)

🎯 **Notification Types**
- 🏢 **Placements** - Highest priority (Green)
- 📝 **Results** - Medium priority (Blue)  
- 🎉 **Events** - Lower priority (Orange)

## Tech Stack

```
Frontend:
├── React 18.2
├── Material-UI 5.14
├── TypeScript 5.0
├── Axios (HTTP client)
└── CSS Modules (styling)
```

## Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

## Directory Structure

```
notification_app_fe/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── NotificationList.tsx    # Notification list component
│   ├── App.tsx                      # Main app component
│   ├── App.css                      # Global styles
│   ├── index.tsx                    # React entry point
│   └── react-app-env.d.ts          # TypeScript definitions
├── package.json
├── tsconfig.json
└── README.md
```

## Component Overview

### App Component (`App.tsx`)
Main application component handling:
- Token management for API authentication
- Filter controls (All, Placement, Result, Event)
- Statistics dashboard
- Notification fetching and state management

**Key Features:**
- Demo mode with mock data
- Token input and validation
- Type filtering with chips
- Statistics cards (Total, Placements, Results, Events)
- Error handling

### NotificationList Component (`components/NotificationList.tsx`)
Renders the list of notifications with:
- Search functionality
- Type indicators and icons
- Timestamp formatting
- "New" notification highlighting
- Summary statistics

**Features:**
- Search by notification message
- Color-coded by type
- Recent notification highlighting (24-hour window)
- Responsive list layout

## UI Features

### Responsive Design
- **Mobile**: Single column, optimized touch targets
- **Tablet**: Two-column layout
- **Desktop**: Full-featured three-column layout

### Material-UI Components Used
```
✓ Container, Paper, Box - Layout
✓ Card, CardContent - Statistics
✓ Chip - Type filters and badges
✓ TextField - Search and input
✓ Button - Actions
✓ Alert - Status messages
✓ CircularProgress - Loading state
✓ List, ListItem - Notification items
✓ Typography - Text hierarchy
✓ Grid - Responsive layout
✓ Icons - Visual indicators
```

### Color Scheme
| Type | Color | Hex |
|------|-------|-----|
| Placement | Green | #4caf50 |
| Result | Blue | #2196f3 |
| Event | Orange | #ff9800 |
| Primary | Blue | #1976d2 |

## API Integration

### Endpoints Used
```
GET /evaluation-service/notifications
├── Query Params:
│   ├── limit=10 (number of notifications)
│   ├── page=1 (pagination)
│   └── notification_type=Event|Result|Placement (filter)
└── Headers:
    └── Authorization: Bearer {access_token}
```

### Demo Mode
If no token is provided, the app operates in demo mode with pre-loaded mock data containing:
- Sample notifications with all types
- Real timestamps and IDs
- Proper priority assignment

## Usage Flow

1. **Setup Phase**
   - Enter access token (or skip to demo mode)
   - Click "Connect" or "Skip Setup & Use Demo Data"

2. **Browse Phase**
   - View all notifications or filter by type
   - Use search to find specific notifications
   - View statistics dashboard

3. **Interaction**
   - Click chips to filter by type
   - Search notifications by message
   - Hover to highlight notification rows
   - "New" badges show recent notifications

## Development

### Running in Development Mode
```bash
npm run dev
```
Opens http://localhost:3000 with hot reload

### Building for Production
```bash
npm run build
```
Creates optimized build in `build/` directory

### Key Features for Developers

✅ **TypeScript**: Full type safety  
✅ **Material-UI Theme**: Customizable theme provider  
✅ **Responsive**: Mobile-first approach  
✅ **Performance**: Memoized filtering, lazy loading ready  
✅ **Accessibility**: ARIA labels, semantic HTML  

## Testing Scenarios

### Test Case 1: Priority Ordering
- Filter shows Placements first, then Results, then Events
- Within same type, newest timestamp first

### Test Case 2: Search Functionality
- Search for "hiring" returns only Placement notifications
- Search for "mid-sem" returns Result notifications

### Test Case 3: Responsive Design
- Mobile view: Single column, optimized spacing
- Tablet: Two-column cards
- Desktop: Full three-column stats + list

### Test Case 4: New Notification Highlighting
- Notifications from last 24 hours highlighted in yellow
- "NEW" badge displayed on recent items

## Known Limitations

1. Mock data used in current implementation
2. No persistent storage (state resets on refresh)
3. Search is case-insensitive only
4. Limited to 10 notifications (configurable)

## Future Enhancements

- [ ] Real API integration with backend
- [ ] User authentication with login
- [ ] Notification read/unread tracking
- [ ] Notification archiving/deletion
- [ ] Custom priority weights
- [ ] Dark mode support
- [ ] Push notifications
- [ ] Email digest options
- [ ] Advanced filtering (date range, etc.)

## Performance Metrics

| Metric | Target |
|--------|--------|
| First Paint | < 1s |
| Time to Interactive | < 2s |
| Lighthouse Score | > 90 |
| Bundle Size | < 200KB (gzipped) |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

**Status**: ✅ Complete  
**Author**: Ayush Verma  
**Date**: 2026-05-02  
**API Version**: v1.0
