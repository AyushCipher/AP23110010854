import express, { Request, Response } from 'express';

const app = express();
const PORT = 3000;

interface Notification {
  ID: string;
  Type: 'Result' | 'Placement' | 'Event';
  Message: string;
  Timestamp: string;
}

interface PriorityNotification extends Notification {
  Priority: number;
  SortKey: number;
}

const PRIORITY_MAP: Record<string, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

const ALL_NOTIFICATIONS: Notification[] = [
  { ID: 'd146095a-0d86-4a34-9e69-3900a14576bc', Type: 'Result',    Message: 'mid-sem',                         Timestamp: '2026-04-22 17:51:39' },
  { ID: 'b2832186-ea5a-4b7c-93a9-1f2f24806ab0', Type: 'Placement', Message: 'CSX Corporation hiring',          Timestamp: '2026-04-22 17:51:18' },
  { ID: '81589ada-0ad3-4f77-9554-f52fb558e09d', Type: 'Event',     Message: 'farewell',                        Timestamp: '2026-04-22 17:51:06' },
  { ID: '0055513a-1420-4bbc-8678-eefec65e1ede', Type: 'Result',    Message: 'mid-sem',                         Timestamp: '2026-04-22 17:50:54' },
  { ID: 'ea836726-c25a-4f21-a72f-544a6af8a37f', Type: 'Result',    Message: 'project-review',                  Timestamp: '2026-04-22 17:50:42' },
  { ID: 'e03cb427-8fc6-47f7-bb00-be228f60d2c',  Type: 'Result',    Message: 'external',                        Timestamp: '2026-04-22 17:50:30' },
  { ID: 'e5c4ff20-31bf-4040-8f02-72fda59e8918', Type: 'Result',    Message: 'project-review',                  Timestamp: '2026-04-22 17:50:18' },
  { ID: '1cfce5ee-ad37-4894-8946-d707627176a5', Type: 'Event',     Message: 'tech-fest',                       Timestamp: '2026-04-22 17:50:06' },
  { ID: 'cf2885a6-45ac-4ba0-b548-6e9e9d4c52c8', Type: 'Result',    Message: 'project-review',                  Timestamp: '2026-04-22 17:49:54' },
  { ID: '8a7412bd-6065-4dd9-8501-a37f11cc848b', Type: 'Placement', Message: 'Advanced Micro Devices Inc. hiring', Timestamp: '2026-04-22 17:49:42' },
  { ID: 'f3a12c77-0011-4f6b-a910-d7e3b29a1234', Type: 'Placement', Message: 'Google SWE Internship',           Timestamp: '2026-04-22 17:49:30' },
  { ID: 'a9b21c44-ffee-4321-b012-8801c2d93456', Type: 'Event',     Message: 'annual-sports-day',               Timestamp: '2026-04-22 17:48:58' },
  { ID: 'c4d98e11-1122-4abc-9900-ee7712fabc99', Type: 'Result',    Message: 'end-sem-results',                 Timestamp: '2026-04-22 17:48:44' },
  { ID: 'b11faac3-3344-4bde-a234-99aa11bc2211', Type: 'Placement', Message: 'Infosys Placement Drive',         Timestamp: '2026-04-22 17:48:20' },
  { ID: 'd99012fe-5566-4cde-b456-aa1234cd5678', Type: 'Event',     Message: 'graduation-ceremony',             Timestamp: '2026-04-22 17:48:00' },
];

function parseTimestamp(ts: string): number {
  return Math.floor(new Date(ts.replace(' ', 'T')).getTime() / 1000);
}

function calculateSortKey(priority: number, timestamp: number): number {
  return priority * 1_000_000 + timestamp;
}

function applyPriority(notifications: Notification[]): PriorityNotification[] {
  return notifications
    .map((n) => {
      const priority = PRIORITY_MAP[n.Type] || 0;
      const timestamp = parseTimestamp(n.Timestamp);
      return { ...n, Priority: priority, SortKey: calculateSortKey(priority, timestamp) };
    })
    .sort((a, b) => {
      if (a.Priority !== b.Priority) return b.Priority - a.Priority;
      return parseTimestamp(b.Timestamp) - parseTimestamp(a.Timestamp);
    });
}

app.get('/evaluation-service/notifications', (req: Request, res: Response) => {
  const limitParam = parseInt(req.query.limit as string) || 10;
  const typeParam = req.query.notification_type as string | undefined;
  const page = parseInt(req.query.page as string) || 1;

  const limit = Math.min(Math.max(limitParam, 1), 100);

  let filtered = typeParam
    ? ALL_NOTIFICATIONS.filter((n) => n.Type === typeParam)
    : ALL_NOTIFICATIONS;

  const prioritized = applyPriority(filtered);

  const start = (page - 1) * limit;
  const top_notifications = prioritized.slice(start, start + limit);

  res.json({
    notifications: top_notifications,
    top_notifications,
    total_processed: prioritized.length,
    top_10_returned: top_notifications.length,
    page,
    limit,
  });
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'notification-mock-server', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`\n✅ Mock Notification Server running at http://localhost:${PORT}`);
  console.log(`\n📋 Available Endpoints:`);
  console.log(`   GET http://localhost:${PORT}/evaluation-service/notifications`);
  console.log(`   GET http://localhost:${PORT}/evaluation-service/notifications?limit=10`);
  console.log(`   GET http://localhost:${PORT}/evaluation-service/notifications?limit=10&notification_type=Placement`);
  console.log(`   GET http://localhost:${PORT}/evaluation-service/notifications?limit=10&notification_type=Result`);
  console.log(`   GET http://localhost:${PORT}/evaluation-service/notifications?limit=10&notification_type=Event`);
  console.log(`   GET http://localhost:${PORT}/health`);
  console.log(`\n📸 Open Postman and use these URLs to get your screenshots!\n`);
});
