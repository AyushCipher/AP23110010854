import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Box, 
  CircularProgress, 
  Alert, 
  Typography,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';
import NotificationList from '../components/NotificationList';
import { fetchNotifications, Notification } from '../api';

const PriorityNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('All');
  const [limit, setLimit] = useState<number>(10);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchNotifications('demo-token', limit, filter);
        const notifs = data.notifications || data.top_notifications || [];
        
        const sorted = notifs.sort((a: Notification, b: Notification) => {
          if (a.Priority !== b.Priority) {
            return (b.Priority || 0) - (a.Priority || 0);
          }
          return new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime();
        });
        
        setNotifications(sorted);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [filter, limit]);

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
  };

  const handleLimitChange = (event: SelectChangeEvent<number>) => {
    setLimit(event.target.value as number);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        Priority Notifications
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
              Filter by Type
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {['All', 'Placement', 'Result', 'Event'].map((f) => (
                <Chip
                  key={f}
                  label={f}
                  onClick={() => handleFilterChange(f)}
                  color={filter === f ? 'primary' : 'default'}
                  variant={filter === f ? 'filled' : 'outlined'}
                  clickable
                />
              ))}
            </Box>
          </Box>

          <Box sx={{ minWidth: 120 }}>
            <FormControl size="small" fullWidth>
              <InputLabel id="limit-label">Display Limit</InputLabel>
              <Select
                labelId="limit-label"
                value={limit}
                label="Display Limit"
                onChange={handleLimitChange}
              >
                <MenuItem value={5}>Top 5</MenuItem>
                <MenuItem value={10}>Top 10</MenuItem>
                <MenuItem value={20}>Top 20</MenuItem>
                <MenuItem value={50}>Top 50</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ overflow: 'hidden' }}>
          <NotificationList notifications={notifications} />
        </Paper>
      )}
    </Container>
  );
};

export default PriorityNotifications;
