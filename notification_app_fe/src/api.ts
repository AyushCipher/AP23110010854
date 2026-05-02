import axios from 'axios';

export interface Notification {
  ID: string;
  Type: 'Result' | 'Placement' | 'Event';
  Message: string;
  Timestamp: string;
  Priority?: number;
}

const mockNotifications: Notification[] = [
  { ID: 'd146095a-0d86-4a34-9e69-3900a14576bc', Type: 'Result', Message: 'mid-sem', Timestamp: '2026-04-22 17:51:39', Priority: 2 },
  { ID: 'b2832186-ea5a-4b7c-93a9-1f2f24806ab0', Type: 'Placement', Message: 'CSX Corporation hiring', Timestamp: '2026-04-22 17:51:18', Priority: 3 },
  { ID: '81589ada-0ad3-4f77-9554-f52fb558e09d', Type: 'Event', Message: 'farewell', Timestamp: '2026-04-22 17:51:06', Priority: 1 },
  { ID: '0055513a-1420-4bbc-8678-eefec65e1ede', Type: 'Result', Message: 'mid-sem', Timestamp: '2026-04-22 17:50:54', Priority: 2 },
  { ID: 'ea836726-c25a-4f21-a72f-544a6af8a37f', Type: 'Result', Message: 'project-review', Timestamp: '2026-04-22 17:50:42', Priority: 2 },
  { ID: 'e03cb427-8fc6-47f7-bb00-be228f60d2c', Type: 'Result', Message: 'external', Timestamp: '2026-04-22 17:50:30', Priority: 2 },
  { ID: '1cfce5ee-ad37-4894-8946-d707627176a5', Type: 'Event', Message: 'tech-fest', Timestamp: '2026-04-22 17:50:06', Priority: 1 },
];

export const fetchNotifications = async (
  token: string,
  limit?: number,
  type?: string
) => {
  const url = new URL('http://20.207.122.201/evaluation-service/notifications');
  if (limit) url.searchParams.append('limit', limit.toString());
  if (type && type !== 'All') url.searchParams.append('notification_type', type);

  try {
    const response = await axios.get(url.toString(), {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (err) {
    console.warn('API Failed, using mock data:', err);
    let filtered = type && type !== 'All' ? mockNotifications.filter(n => n.Type === type) : mockNotifications;
    if (limit) filtered = filtered.slice(0, limit);
    return { notifications: filtered, top_notifications: filtered };
  }
};
