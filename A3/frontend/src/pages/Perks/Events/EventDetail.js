import React, { useState, useEffect, useContext } from 'react';
import { 
  Container, Box, Typography, Paper, Button, Chip, 
  Divider, CircularProgress, Alert, AlertTitle 
} from '@mui/material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../../context/AuthContext';
import LogoutButton from '../../../components/auth/LogoutButton';
import '../../../styles/auth.css';

const EventDetail = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAttending, setIsAttending] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(null);
  const [rsvpError, setRsvpError] = useState(null);
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/events/${eventId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setEvent(response.data);
        
        if (response.data.guests) {
          const isUserAttending = response.data.guests.some(
            guest => guest.userId === user.id
          );
          setIsAttending(isUserAttending);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load event details. Please try again later.');
        setLoading(false);
        console.error('Error fetching event details:', err);
      }
    };

    fetchEventDetails();
  }, [eventId, token, user.id, API_BASE_URL]);

  const handleRSVP = async () => {
    setRsvpLoading(true);
    setRsvpSuccess(null);
    setRsvpError(null);
    
    try {
      if (isAttending) {
        await axios.delete(`${API_BASE_URL}/events/${eventId}/guests/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setIsAttending(false);
        setRsvpSuccess('You have successfully cancelled your RSVP.');
      } else {
        await axios.post(`${API_BASE_URL}/events/${eventId}/guests/me`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setIsAttending(true);
        setRsvpSuccess('You have successfully RSVP\'d to this event!');
        
        setEvent(prev => ({
          ...prev,
          numGuests: prev.numGuests + 1
        }));
      }
    } catch (err) {
      setRsvpError(err.response?.data?.message || 'Failed to process your RSVP. Please try again.');
      console.error('RSVP error:', err);
    } finally {
      setRsvpLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isEventFull = () => {
    if (!event.capacity) return false;
    return event.numGuests >= event.capacity;
  };

  const hasEventStarted = () => {
    const now = new Date();
    const startDate = new Date(event.startTime);
    return now >= startDate;
  };

  const hasEventEnded = () => {
    const now = new Date();
    const endDate = new Date(event.endTime);
    return now > endDate;
  };

  const getEventStatus = () => {
    if (hasEventEnded()) return { label: 'Ended', color: 'error' };
    if (hasEventStarted()) return { label: 'In Progress', color: 'warning' };
    if (isEventFull()) return { label: 'Full', color: 'error' };
    return { label: 'Upcoming', color: 'success' };
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <nav className="dashboard-nav">
          <div className="nav-content">
            <h1 className="dashboard-title">Event Details</h1>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Link to="/perks" style={{ marginRight: '20px', textDecoration: 'none', color: '#1976d2', fontWeight: 'bold' }}>
                Back to What's New
              </Link>
              <LogoutButton />
            </div>
          </div>
        </nav>
        <Container className="dashboard-main">
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress />
          </Box>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <nav className="dashboard-nav">
          <div className="nav-content">
            <h1 className="dashboard-title">Event Details</h1>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Link to="/perks" style={{ marginRight: '20px', textDecoration: 'none', color: '#1976d2', fontWeight: 'bold' }}>
                Back to What's New
              </Link>
              <LogoutButton />
            </div>
          </div>
        </nav>
        <Container className="dashboard-main">
          <Alert severity="error" sx={{ my: 4 }}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
          <Button onClick={() => navigate('/perks')} variant="outlined">
            Back to Events
          </Button>
        </Container>
      </div>
    );
  }

  const status = getEventStatus();
  const canRSVP = !hasEventEnded() && (!isEventFull() || isAttending);

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-content">
          <h1 className="dashboard-title">Event Details</h1>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link to="/perks" style={{ marginRight: '20px', textDecoration: 'none', color: '#1976d2', fontWeight: 'bold' }}>
              Back to What's New
            </Link>
            <LogoutButton />
          </div>
        </div>
      </nav>
      <Container className="dashboard-main">
        <Box sx={{ my: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h4" component="h1">
                {event.name}
              </Typography>
              <Chip 
                label={status.label} 
                color={status.color} 
                size="medium" 
              />
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body1" paragraph>
              {event.description}
            </Typography>
            
            <Box sx={{ my: 3 }}>
              <Typography variant="h6">Event Details</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, my: 2 }}>
                <Box>
                  <Typography variant="subtitle2">Location</Typography>
                  <Typography variant="body1">{event.location}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2">Points Awarded</Typography>
                  <Typography variant="body1">{event.pointsAwarded}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2">Start Time</Typography>
                  <Typography variant="body1">{formatDate(event.startTime)}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2">End Time</Typography>
                  <Typography variant="body1">{formatDate(event.endTime)}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2">Capacity</Typography>
                  <Typography variant="body1">
                    {event.capacity ? `${event.numGuests}/${event.capacity}` : 'Unlimited'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2">Status</Typography>
                  <Chip 
                    label={isAttending ? 'You are attending' : 'Not attending'} 
                    color={isAttending ? 'success' : 'default'} 
                    size="small" 
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Box>
            </Box>
            
            {rsvpSuccess && (
              <Alert severity="success" sx={{ my: 2 }}>
                {rsvpSuccess}
              </Alert>
            )}
            
            {rsvpError && (
              <Alert severity="error" sx={{ my: 2 }}>
                {rsvpError}
              </Alert>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button 
                variant="contained" 
                color={isAttending ? "error" : "primary"}
                size="large" 
                onClick={handleRSVP}
                disabled={!canRSVP || rsvpLoading}
                sx={{ minWidth: 200 }}
              >
                {rsvpLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  isAttending ? "Cancel RSVP" : "RSVP to Event"
                )}
              </Button>
            </Box>
            
            {!canRSVP && !isAttending && (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                align="center" 
                sx={{ mt: 2 }}
              >
                {hasEventEnded() 
                  ? "This event has already ended." 
                  : "This event is at full capacity."}
              </Typography>
            )}
          </Paper>
        </Box>
      </Container>
    </div>
  );
};

export default EventDetail;
