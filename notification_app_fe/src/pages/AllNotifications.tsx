import React, { useState, useEffect } from 'react';
import { Container, Paper, Box, CircularProgress, Alert, Typography } from '@mui/material';
import NotificationList from '../components/NotificationList';
import { fetchNotifications, Notification } from '../api';

const AllNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchNotifications('demo-token');
        const notifs = data.notifications || [];
        setNotifications(notifs.sort((a: Notification, b: Notification) => 
          new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime()
        ));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        All Notifications
      </Typography>
      
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

export default AllNotifications;
