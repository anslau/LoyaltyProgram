import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import AuthContext from '../../context/AuthContext';

const OrganizerEvents = () => {
  const { token, user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        /* backend prolly exposes a filter like ?organizer=me.
           If not, we fall back to pulling everything we’re allowed to see
           and client‑side filtering. */
        const r = await fetch('http://localhost:8000/events?limit=100&organizer=me', {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });

        if (!r.ok) throw new Error('Unable to fetch events');
        const data = await r.json();

        const mine =
          data.results?.filter(ev =>
            ev.organizers?.some(o => o.utorid === user.utorid)) || [];

        setEvents(mine);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    if (token) load();
  }, [token, user]);

  if (loading) return <CircularProgress />;
  if (error)   return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>My Events</Typography>

      {events.length === 0
        ? <Typography>You’re not an organizer for any event… yet!</Typography>
        : events.map(ev => (
            <Card key={ev.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">{ev.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(ev.startTime).toLocaleString()} – 
                  {new Date(ev.endTime).toLocaleString()}
                </Typography>
                <Typography variant="body2">{ev.location}</Typography>
                <Link to={`/organizer/events/${ev.id}`}>Manage</Link>
              </CardContent>
            </Card>
          ))}
    </Box>
  );
};

export default OrganizerEvents;
