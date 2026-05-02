# Stage 1

## Notification System Design

## 1. Overview

This document describes the design and architecture of the Stage 1 notification backend system. The system fetches campus notifications from a remote evaluation API, applies a priority-based sorting algorithm, and returns the top-N notifications in a structured priority inbox.

---

## 2. System Architecture

The backend is built in **TypeScript** using a layered, service-oriented architecture. There is no HTTP server — the system runs as a CLI process that orchestrates service calls and outputs results to stdout.

```
┌─────────────────────────────────┐
│           Entry Point           │
│           index.ts              │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│        Stage1Orchestrator       │
│  (Coordinates full pipeline)    │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│       NotificationService       │
│  - Input validation             │
│  - Fetch from API               │
│  - Coordinate priority logic    │
└────────┬──────────┬─────────────┘
         │          │
         ▼          ▼
┌──────────────┐  ┌─────────────────┐
│  HttpClient  │  │  PriorityService │
│  (REST GET + │  │  (Sort + Filter) │
│   retry)     │  └─────────────────┘
└──────────────┘
```

---

## 3. Directory Structure

```
notification_app_be/
├── index.ts                        # Entry point
├── index-production.ts             # Production entry point
├── src/
│   ├── config/
│   │   └── constants.ts            # API URL, timeouts, priority map, limits
│   ├── errors/
│   │   └── AppError.ts             # Custom error classes
│   ├── middleware/
│   │   └── Logger.ts               # Async structured logger
│   ├── orchestrators/
│   │   └── Stage1Orchestrator.ts   # Main pipeline controller
│   ├── services/
│   │   ├── HttpClient.ts           # Retry-capable HTTP GET client
│   │   ├── NotificationService.ts  # Business logic + validation
│   │   └── PriorityService.ts      # Priority sorting + filtering
│   ├── types/
│   │   └── index.ts                # Shared TypeScript interfaces
│   └── utils/
│       └── helpers.ts              # Validators, timestamp parser, retry util
├── package.json
└── tsconfig.json
```

---

## 4. Data Models

### 4.1 `Notification`
The raw notification object returned by the evaluation API.

| Field       | Type             | Description                          |
|-------------|------------------|--------------------------------------|
| `ID`        | `string` (UUID)  | Unique identifier                    |
| `Type`      | `NotificationType` | One of `Result`, `Placement`, `Event` |
| `Message`   | `string`         | Human-readable notification body     |
| `Timestamp` | `string`         | ISO-like datetime (`YYYY-MM-DD HH:MM:SS`) |

### 4.2 `PriorityNotification`
Extends `Notification` with computed priority metadata.

| Field      | Type     | Description                                 |
|------------|----------|---------------------------------------------|
| `Priority` | `number` | Type-based weight: Placement=3, Result=2, Event=1 |
| `SortKey`  | `number` | Composite key: `Priority × 1,000,000 + Unix timestamp` |

### 4.3 `PriorityInboxResponse`

```typescript
{
  success: boolean;
  data: {
    top_notifications: PriorityNotification[];
    total_processed: number;
    top_returned: number;
  };
  error?: string;
}
```

### 4.4 `FetchOptions`

```typescript
{
  accessToken: string;
  timeout?: number;
  retryAttempts?: number;
}
```

---

## 5. Priority Algorithm

### 5.1 Type Priority Map

| Notification Type | Priority Weight |
|-------------------|----------------|
| `Placement`       | 3 (Highest)    |
| `Result`          | 2              |
| `Event`           | 1 (Lowest)     |

### 5.2 Sort Key Formula

```
SortKey = (TypePriority × 1,000,000) + UnixTimestampSeconds
```

The multiplier of **1,000,000** ensures type priority always dominates over recency. Within the same type, newer notifications rank higher.

### 5.3 Sorting Rules

1. **Primary sort**: by `Priority` descending (Placement > Result > Event)
2. **Secondary sort (tiebreaker)**: by `Timestamp` descending (newest first)

### 5.4 `applyPrioritySorting` Pseudocode

```
for each notification:
    priority  = PRIORITY_MAP[notification.Type]
    timestamp = parseTimestamp(notification.Timestamp)
    sortKey   = priority × 1,000,000 + timestamp

sort notifications:
    if a.Priority != b.Priority → sort by Priority DESC
    else → sort by Timestamp DESC

return sorted list
```

---

## 6. API Integration

### 6.1 Endpoint

```
GET http://20.207.122.201/evaluation-service/notifications
```

### 6.2 Request

| Component     | Value                                     |
|---------------|-------------------------------------------|
| Method        | `GET`                                     |
| Authorization | `Bearer <access_token>`                   |
| Content-Type  | `application/json`                        |
| Timeout       | `30,000 ms` (configurable via `API_TIMEOUT`) |

### 6.3 Response Shape

```json
{
  "notifications": [
    {
      "ID": "uuid",
      "Type": "Placement",
      "Message": "CSX Corporation hiring",
      "Timestamp": "2026-04-22 17:51:18"
    }
  ]
}
```

### 6.4 Retry Strategy

The `HttpClient` uses a **linear backoff retry** with configurable attempts (default: **3**).

| Attempt | Delay Before Retry |
|---------|--------------------|
| 1st     | Immediate          |
| 2nd     | 1,000 ms           |
| 3rd     | 2,000 ms           |

On all retries exhausted, an `APIError` is thrown with HTTP status and body.

---

## 7. Layer Responsibilities

### 7.1 `Stage1Orchestrator`
- Validates the access token before execution
- Calls `NotificationService.getPriorityInbox()`
- Formats and prints results to stdout
- Handles fatal errors and triggers logger shutdown

### 7.2 `NotificationService`
- Validates `FetchOptions` (access token, type, limit)
- Calls `HttpClient.get()` to retrieve raw notifications
- Delegates sorting to `PriorityService.applyPrioritySorting()`
- Slices top-N via `PriorityService.getTopNotifications()`
- Returns `PriorityInboxResponse` with success/error envelope

### 7.3 `HttpClient`
- Performs `fetch()` with `AbortController` timeout
- Wraps non-200 responses in `APIError`
- Delegates to `retryAsync()` utility for fault tolerance

### 7.4 `PriorityService`
- Assigns `Priority` based on `PRIORITY_MAP`
- Computes `SortKey`
- Sorts notifications using dual-key comparator
- Provides `filterByType()` for type-filtered queries
- Slices result to the requested `limit`

### 7.5 `Logger` (Middleware)
- Async, batched log flusher to the evaluation logger API
- Supports log levels: `debug`, `info`, `error`, `fatal`
- Log components: `backend`, `handler`, `service`, `api`
- Flushes on `shutdown()` call or when queue exceeds threshold

---

## 8. Error Handling

| Error Class            | When Thrown                                    |
|------------------------|------------------------------------------------|
| `ValidationError`      | Invalid token, type, or limit value            |
| `APIError`             | Non-2xx HTTP response from external API        |
| `NotificationFetchError` | Network failure or unhandled fetch error      |

All errors are caught at the orchestrator level. Failures return a structured `PriorityInboxResponse` with `success: false` and an `error` message field, ensuring the calling layer can handle errors gracefully without unhandled crashes.

---

## 9. Configuration

Managed in `src/config/constants.ts`. Overridable via environment variables.

| Constant                     | Default Value                                               | Env Override         |
|------------------------------|-------------------------------------------------------------|----------------------|
| `API.NOTIFICATIONS_ENDPOINT` | `http://20.207.122.201/evaluation-service/notifications`   | `NOTIFICATIONS_API`  |
| `API.TIMEOUT`                | `30000` ms                                                  | `API_TIMEOUT`        |
| `API.RETRY_ATTEMPTS`         | `3`                                                         | `API_RETRY`          |
| `NOTIFICATION.DEFAULT_LIMIT` | `10`                                                        | —                    |
| `NOTIFICATION.MAX_LIMIT`     | `100`                                                       | —                    |
| `NOTIFICATION.PRIORITY_MAP`  | `{ Placement: 3, Result: 2, Event: 1 }`                    | —                    |

---

## 10. Execution Flow

```
1. index.ts reads ACCESS_TOKEN from .env
2. Validates token presence → exits with code 1 if missing
3. Sets token on Logger instance
4. Stage1Orchestrator.run(accessToken) called
5.   NotificationService.getPriorityInbox({ accessToken }, limit=10)
6.     HttpClient.get(NOTIFICATIONS_ENDPOINT, { Authorization: Bearer <token> })
7.       [retry up to 3×] fetch() with 30s AbortController timeout
8.     Returns raw notifications array
9.     PriorityService.applyPrioritySorting(notifications)
10.      Assigns Priority and SortKey per notification
11.      Sorts: Priority DESC → Timestamp DESC
12.    PriorityService.getTopNotifications(sorted, 10)
13.      Returns first 10 items
14.  Returns PriorityInboxResponse
15. Orchestrator prints formatted results to stdout
16. Logger.shutdown() flushes remaining log batch to evaluation API
```

---

## 11. Validation Rules

| Parameter     | Rule                                                            |
|---------------|-----------------------------------------------------------------|
| `accessToken` | Non-empty string, not equal to placeholder `YOUR_ACCESS_TOKEN_HERE` |
| `type`        | Must be one of `"Result"`, `"Placement"`, `"Event"`            |
| `limit`       | Integer, `1 ≤ limit ≤ 100`                                     |

---

## 12. Design Decisions

| Decision | Rationale |
|----------|-----------|
| TypeScript throughout | Type safety on notification shapes and API contracts |
| No HTTP server in Stage 1 | Stage 1 is a CLI/orchestrated batch job; HTTP server added in later stages |
| Custom `HttpClient` over axios | Zero dependencies; native `fetch` with `AbortController` handles timeouts cleanly |
| `SortKey = Priority × 1e6 + timestamp` | Single numeric key enables O(n log n) sort without nested comparisons |
| Layered service architecture | Each class has a single responsibility; easy to test and extend per stage |
| Async logger with queue | Avoids blocking the main pipeline on every log write |
| Error enveloping in response | Allows the orchestrator to inspect failures without try-catch at every call site |

---

## 13. Efficiency and Scaling

### 13.1 Computational Complexity
- **Time Complexity**: $O(N \log N)$ where $N$ is the total number of notifications fetched. This is dominated by the sorting algorithm.
- **Space Complexity**: $O(N)$ to store the fetched notifications in memory during processing.

### 13.2 Maintaining Top-N Efficiently
To maintain the Top-10 efficiently as new notifications arrive (streaming scenario), the system would transition from a global sort to a **Min-Heap (Priority Queue)** of size 10:
1. Initialize a Min-Heap of size 10 based on the `SortKey`.
2. For every new notification:
   - Compare its `SortKey` with the heap's root (the minimum of the current top 10).
   - If the new notification has a higher `SortKey`, replace the root and heapify.
3. This reduces complexity from $O(M \log M)$ to $O(M \log N)$, where $M$ is the stream size and $N$ is the inbox limit (10).

### 13.3 Handling High Volume
- **Batch Processing**: Instead of fetching all notifications at once, the system can implement pagination at the API level (if supported) to process notifications in chunks.
- **Caching**: The `SortKey` can be calculated once and stored (e.g., in Redis) to avoid re-parsing timestamps during frequent re-sorts.
