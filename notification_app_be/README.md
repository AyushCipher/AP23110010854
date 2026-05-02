# Stage 1: Priority Notification Logic

## Overview
Stage 1 implements the core business logic for prioritizing notifications without any UI component.

## Features
✅ Fetch notifications from Campus Notifications API  
✅ Apply priority-based sorting (Placement > Result > Event)  
✅ Sort by recency within each priority tier  
✅ Return top 10 most relevant notifications  
✅ Comprehensive logging via Logging Middleware

## Implementation

### Core Algorithm
```
Input: All notifications from API
  ↓
Filter & Prioritize:
  - Placement notifications (Priority: 3)
  - Result notifications (Priority: 2)
  - Event notifications (Priority: 1)
  ↓
Sort by timestamp (newest first) within each priority
  ↓
Return top 10 notifications
  ↓
Output: Prioritized notification list
```

### Notification Model
```typescript
interface Notification {
  ID: string;
  Type: "Result" | "Placement" | "Event";
  Message: string;
  Timestamp: string; // "YYYY-MM-DD HH:MM:SS"
}
```

## Usage

### Direct Execution
```bash
# Set your access token from API registration
ACCESS_TOKEN="your_token_here" node index.ts
```

### As Module
```typescript
import { NotificationEngine } from "./Stage1_PriorityNotifications";

const engine = new NotificationEngine(accessToken);
const priorityInbox = await engine.getPriorityInbox();
console.log(priorityInbox.top_notifications);
```

## Output Example
```json
{
  "top_notifications": [
    {
      "ID": "b2832186-ea5a-4b7c-93a9-1f2f24806ab0",
      "Type": "Placement",
      "Message": "CSX Corporation hiring",
      "Timestamp": "2026-04-22 17:51:18",
      "Priority": 3,
      "SortKey": 3000001745355078
    },
    {
      "ID": "d146095a-0d86-4a34-9e69-3900a14576bc",
      "Type": "Result",
      "Message": "mid-sem",
      "Timestamp": "2026-04-22 17:51:39",
      "Priority": 2,
      "SortKey": 2000001745355099
    }
  ],
  "total_processed": 12,
  "top_10_returned": 10
}
```

## Logging
All operations are logged using the Logging Middleware:

- **API Calls**: When fetching from notifications endpoint
- **Processing**: When applying priority sorting
- **Results**: When returning top notifications
- **Errors**: Any failures in the process

Example logs:
```
[INFO] controller > service: Fetching notifications from API
[DEBUG] service > service: Processing 12 notifications
[INFO] service > service: Applied priority sorting successfully
[INFO] controller > api: Returning top 10 of 12 notifications
```

## API Dependencies

### Notifications API
- **Endpoint**: `GET http://20.207.122.201/evaluation-service/notifications`
- **Authentication**: Bearer token required
- **Response**: Array of notification objects

## Testing

Test cases can be run against different scenarios:

1. **Mixed Types**: Verify Placement > Result > Event ordering
2. **Same Type, Different Times**: Verify newest timestamp first
3. **Limit Enforcement**: Verify exactly 10 returned
4. **Empty Results**: Verify graceful handling

## Performance

| Metric | Value |
|--------|-------|
| Time Complexity | O(n log n) |
| Space Complexity | O(n) |
| Typical Processing Time | <100ms |
| Max Notifications Tested | 15+ |

## Files

- `Stage1_PriorityNotifications.ts` - Core business logic
- `index.ts` - Entry point and CLI runner
- `package.json` - Dependencies and scripts
- `README.md` - This file

---

**Status**: ✅ Complete  
**Author**: Ayush Verma  
**Date**: 2026-05-02
