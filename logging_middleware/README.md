# Notification System Logging Middleware

## Overview
This is a reusable logging middleware for the Campus Notification System. It provides structured logging with automatic API submission and queue management.

## Features
- ✅ Structured logging with levels (debug, info, warn, error, fatal)
- ✅ Automatic batch processing and API submission
- ✅ Queue management with configurable flush intervals
- ✅ Unique log IDs for tracking
- ✅ TypeScript support
- ✅ Console output for development

## Usage

```typescript
import { Log, logger } from './Logger';

// Set access token
logger.setAccessToken('your_access_token_here');

// Log events
Log("handler", "info", "cache", "Cache hit for user notifications");
Log("backend", "error", "db", "Failed to fetch notifications from database");
Log("controller", "warn", "api", "API rate limit approaching");
```

## Log Levels

| Level | Purpose | Use When |
|-------|---------|----------|
| `debug` | Development info | Detailed troubleshooting info |
| `info` | General information | Important workflow events |
| `warn` | Warning conditions | Unexpected but handled situations |
| `error` | Error conditions | Application errors |
| `fatal` | Critical failures | System-critical failures |

## Packages

Valid package values (as per API constraints):
- **Backend packages**: `cache`, `controller`, `cron_job`, `db`, `domain`, `handler`, `repository`, `route`, `service`
- **Frontend packages**: `api`, `component`, `hook`, `page`, `state`, `style`
- **Both**: `auth`, `config`, `middleware`, `utils`

## API Integration

Logs are automatically sent to:
```
POST http://20.207.122.201/evaluation-service/logs
Headers: Authorization: Bearer {access_token}
```

## Configuration

- Queue flush interval: 5 seconds (configurable)
- Auto-flush threshold: 10 logs in queue
- Graceful shutdown: Flushes remaining logs before exit
