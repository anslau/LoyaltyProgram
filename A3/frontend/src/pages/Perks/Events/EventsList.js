import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Grid, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../../context/AuthContext';
import EventItem from './EventItem';

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:8000/events?published=true', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log('Events API response:', response.data);
        
        if (response.data && !Array.isArray(response.data)) {
          if (Array.isArray(response.data.events)) {
            setEvents(response.data.events);
          } else if (Array.isArray(response.data.data)) {
            setEvents(response.data.data);
          } else if (Array.isArray(response.data.items)) {
            setEvents(response.data.items);
          } else if (Array.isArray(response.data.results)) {
            setEvents(response.data.results);
          } else {
            console.error('Events data is not in expected format:', response.data);
            setEvents([]);
          }
        } else if (Array.isArray(response.data)) {
          setEvents(response.data);
        } else {
          setEvents([]);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load events. Please try again later.');
        setLoading(false);
        console.error('Error fetching events:', err);
      }
    };

    fetchEvents();
  }, [token]);

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!events || events.length === 0) {
    return <Typography variant="body1">No events available at the moment.</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Upcoming Events</Typography>
      <Grid container spacing={3}>
        {Array.isArray(events) ? events.map((event) => (
          <Grid item xs={12} sm={6} md={4} key={event.id}>
            <EventItem event={event} onClick={() => handleEventClick(event.id)} />
          </Grid>
        )) : (
          <Grid item xs={12}>
            <Alert severity="warning">
              Unable to display events. Unexpected data format received.
            </Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default EventsList;
