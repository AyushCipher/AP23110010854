import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Box,
  Chip,
  Typography,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  NotificationImportant as NotificationIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { Notification } from '../api';
import { getReadNotifications, markAsRead } from '../utils/storage';

interface Props {
  notifications: Notification[];
}

const NotificationList: React.FC<Props> = ({ notifications }) => {
  const [readIds, setReadIds] = useState<string[]>([]);

  useEffect(() => {
    setReadIds(getReadNotifications());
  }, []);

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
    if (!readIds.includes(id)) {
      setReadIds((prev) => [...prev, id]);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Placement':
        return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
      case 'Result':
        return <NotificationIcon sx={{ color: '#2196f3' }} />;
      case 'Event':
        return <EventIcon sx={{ color: '#ff9800' }} />;
      default:
        return <NotificationIcon sx={{ color: '#999' }} />;
    }
  };

  const formatTime = (timestamp: string): string => {
    try {
      const date = new Date(timestamp.replace(' ', 'T'));
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return timestamp;
    }
  };

  if (!notifications.length) {
    return (
      <Typography sx={{ p: 4, textAlign: 'center' }} color="textSecondary">
        No notifications to display.
      </Typography>
    );
  }

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
      {notifications.map((notif, index) => {
        const isRead = readIds.includes(notif.ID);
        return (
          <React.Fragment key={notif.ID}>
            <ListItem
              component="div"
              onClick={() => handleNotificationClick(notif.ID)}
              sx={{
                cursor: 'pointer',
                backgroundColor: isRead ? 'transparent' : '#f0f7ff',
                borderLeft: isRead ? '4px solid transparent' : '4px solid #1976d2',
                '&:hover': { backgroundColor: isRead ? '#f5f5f5' : '#e3f2fd' },
                transition: 'background-color 0.2s',
                pl: 2,
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {getTypeIcon(notif.Type)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: isRead ? 400 : 600,
                        flex: 1,
                        color: isRead ? 'text.primary' : '#000',
                      }}
                    >
                      {notif.Message}
                    </Typography>
                    <Chip
                      label={notif.Type}
                      size="small"
                      variant={isRead ? 'outlined' : 'filled'}
                      sx={{
                        fontWeight: isRead ? 400 : 600,
                      }}
                    />
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      {formatTime(notif.Timestamp)}
                    </Typography>
                    {!isRead && (
                      <Chip
                        label="NEW"
                        size="small"
                        sx={{
                          height: '20px',
                          fontSize: '0.7rem',
                          backgroundColor: '#1976d2',
                          color: '#fff',
                        }}
                      />
                    )}
                  </Box>
                }
              />
            </ListItem>
            {index < notifications.length - 1 && <Divider />}
          </React.Fragment>
        );
      })}
    </List>
  );
};

export default NotificationList;
