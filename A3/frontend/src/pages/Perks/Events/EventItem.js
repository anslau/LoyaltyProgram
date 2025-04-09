import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Button } from '@mui/material';

const EventItem = ({ event, onClick }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isFull = () => {
    if (!event.capacity) return false;
    return event.numGuests >= event.capacity;
  };

  const hasStarted = () => {
    const now = new Date();
    const startDate = new Date(event.startTime);
    return now >= startDate;
  };

  const hasEnded = () => {
    const now = new Date();
    const endDate = new Date(event.endTime);
    return now > endDate;
  };

  const getEventStatus = () => {
    if (hasEnded()) return { label: 'Ended', color: 'error' };
    if (hasStarted()) return { label: 'In Progress', color: 'warning' };
    if (isFull()) return { label: 'Full', color: 'error' };
    return { label: 'Upcoming', color: 'success' };
  };

  const status = getEventStatus();

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" component="div">
            {event.name}
          </Typography>
          <Chip 
            label={status.label} 
            color={status.color} 
            size="small" 
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {event.description}
        </Typography>
        
        <Box sx={{ mt: 'auto' }}>
          <Typography variant="body2">
            <strong>Location:</strong> {event.location}
          </Typography>
          <Typography variant="body2">
            <strong>Start:</strong> {formatDate(event.startTime)}
          </Typography>
          <Typography variant="body2">
            <strong>End:</strong> {formatDate(event.endTime)}
          </Typography>
          {event.capacity && (
            <Typography variant="body2">
              <strong>Capacity:</strong> {event.numGuests}/{event.capacity}
            </Typography>
          )}
          {event.pointsAwarded > 0 && (
            <Typography variant="body2">
              <strong>Points:</strong> {event.pointsAwarded}
            </Typography>
          )}
        </Box>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            size="small" 
            onClick={onClick}
            disabled={hasEnded() || isFull()}
          >
            View Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default EventItem;
