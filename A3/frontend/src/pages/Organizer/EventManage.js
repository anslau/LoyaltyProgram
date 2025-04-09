import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import {
  Box, Typography, TextField, Button, Alert,
  Accordion, AccordionSummary, AccordionDetails, Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const EventManage = () => {
  const { token } = useContext(AuthContext);
  const { id }   = useParams();

  const [event, setEvent]   = useState(null);
  const [edit,  setEdit]    = useState({});
  const [msg,   setMsg]     = useState('');
  const [error, setError]   = useState('');

  /* fetch / refresh */
  const refresh = async () => {
    try {
      const r = await fetch(`http://localhost:8000/events/${id}`, {
        headers: { 'ContentType': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error('Could not load event');
      setEvent(await r.json());
    } catch (e) { setError(e.message); }
  };
  useEffect(() => { if (token) refresh(); }, [token]);  // eslintdisableline

  /* update basics */
  const handleSave = async () => {
    try {
      setMsg(''); setError('');
      const r = await fetch(`http://localhost:8000/events/${id}`, {
        method: 'PATCH',
        headers: { 'ContentType': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(edit),
      });
      if (!r.ok) throw new Error('Update failed');
      await refresh(); setEdit({}); setMsg('Event updated!');
    } catch (e) { setError(e.message); }
  };

  /* add guest */
  const [guestId, setGuestId] = useState('');
  const addGuest = async () => {
    try {
      const r = await fetch(`http://localhost:8000/events/${id}/guests`, {
        method: 'POST',
        headers: { 'ContentType': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ utorid: guestId }),
      });
      if (!r.ok) throw new Error('Add‑guest failed');
      setGuestId(''); await refresh(); setMsg('Guest added!');
    } catch (e) { setError(e.message); }
  };

  /* award points */
  const [awardId, setAwardId]     = useState('');
  const [awardAmt, setAwardAmt]   = useState('');
  const award = async () => {
    try {
      const payload = { type: 'event', amount: parseInt(awardAmt, 10) };
      if (awardId.trim()) payload.utorid = awardId.trim();

      const r = await fetch(`http://localhost:8000/events/${id}/transactions`, {
        method: 'POST',
        headers: { 'ContentType': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error('Award failed');
      setAwardId(''); setAwardAmt(''); setMsg('Points awarded!'); await refresh();
    } catch (e) { setError(e.message); }
  };

  if (!event) return error ? <Alert severity="error">{error}</Alert> : <Typography>Loading…</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Manage – {event.name}</Typography>
      {msg    && <Alert severity="success" sx={{ mb:2 }}>{msg}</Alert>}
      {error  && <Alert severity="error"   sx={{ mb:2 }}>{error}</Alert>}

      {/* edit basics */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Edit Event</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {['name','location','description'].map(f => (
            <TextField key={f} label={f.charAt(0).toUpperCase()+f.slice(1)}
              defaultValue={event[f]} fullWidth multiline={f==='description'}
              sx={{ mb:2 }} onChange={e=>setEdit({...edit,[f]:e.target.value})}/>
          ))}
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </AccordionDetails>
      </Accordion>

      {/* add guest */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Add Guest</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TextField label="Guest utorid" value={guestId}
                     onChange={e=>setGuestId(e.target.value)} sx={{ mr:2 }}/>
          <Button variant="contained" onClick={addGuest}>Add</Button>
        </AccordionDetails>
      </Accordion>

      {/* award points */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Award Points</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" sx={{ mb:1 }}>
            Leave “utorid” blank to award everyone who RSVP’d.
          </Typography>
          <TextField label="Recipient utorid (optional)" value={awardId}
                     onChange={e=>setAwardId(e.target.value)} sx={{ mr:2 }}/>
          <TextField label="Points" type="number" value={awardAmt}
                     onChange={e=>setAwardAmt(e.target.value)} sx={{ mr:2 }}/>
          <Button variant="contained" onClick={award}>Award</Button>
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my:3 }}/>

      {/* guest list */}
      <Typography variant="h6" gutterBottom>
        Guests ({event.guests?.length || 0})
      </Typography>
      {event.guests?.map(g => (
        <Typography key={g.id}>{g.utorid} – {g.name}</Typography>
      ))}
    </Box>
  );
};

export default EventManage;
