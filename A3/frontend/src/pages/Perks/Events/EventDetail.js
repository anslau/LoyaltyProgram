import React, { useState, useEffect, useContext } from 'react';
import ActiveRoleContext from '../../../context/ActiveRoleContext';
import {
  Container, Box, Typography, Paper, Button, Chip,
  Divider, CircularProgress, Alert, AlertTitle,
  TextField, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, Grid, IconButton,
  FormControlLabel, Switch, Card, CardContent, Stack,
  List, ListItem, ListItemText, ListItemAvatar, Avatar,
  ListSubheader, Collapse, Tooltip, Fab, ListItemIcon
} from '@mui/material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  SupervisorAccount as OrganizerIcon,
  ExpandLess,
  ExpandMore,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  Add as AddIcon,
  EmojiEvents as EmojiEventsIcon
} from '@mui/icons-material';
import AuthContext from '../../../context/AuthContext';
import LogoutButton from '../../../components/auth/LogoutButton';
import '../../../styles/auth.css';

const EventDetail = () => {
  const { activeRole } = useContext(ActiveRoleContext);
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAttending, setIsAttending] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(null);
  const [rsvpError, setRsvpError] = useState(null);
  const [refreshEvent, setRefreshEvent] = useState(false);

  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [editFormErrors, setEditFormErrors] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(null);
  const [updateError, setUpdateError] = useState(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Participants list state
  const [showOrganizers, setShowOrganizers] = useState(true);
  const [showGuests, setShowGuests] = useState(true);

  // Add guest dialog state
  const [addGuestDialogOpen, setAddGuestDialogOpen] = useState(false);
  const [addGuestUtorid, setAddGuestUtorid] = useState('');
  const [addGuestLoading, setAddGuestLoading] = useState(false);
  const [addGuestError, setAddGuestError] = useState(null);
  const [addGuestSuccess, setAddGuestSuccess] = useState(null);

  // Remove guest state
  const [removeGuestLoading, setRemoveGuestLoading] = useState(false);

  // Add organizer dialog state
  const [addOrganizerDialogOpen, setAddOrganizerDialogOpen] = useState(false);
  const [addOrganizerUtorid, setAddOrganizerUtorid] = useState('');
  const [addOrganizerLoading, setAddOrganizerLoading] = useState(false);
  const [addOrganizerError, setAddOrganizerError] = useState(null);
  const [addOrganizerSuccess, setAddOrganizerSuccess] = useState(null);

  // Award points dialog state
  const [awardPointsDialogOpen, setAwardPointsDialogOpen] = useState(false);
  const [awardPointsLoading, setAwardPointsLoading] = useState(false);
  const [awardPointsError, setAwardPointsError] = useState(null);
  const [awardPointsSuccess, setAwardPointsSuccess] = useState(null);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [awardAmount, setAwardAmount] = useState('');
  const [awardAllGuests, setAwardAllGuests] = useState(false);

  // Remove organizer state
  const [removeOrganizerLoading, setRemoveOrganizerLoading] = useState(false);

  const { token, user, userDetails } = useContext(AuthContext);
  const navigate = useNavigate();
  console.log(event)

  // Determine if the current user is an organizer
  const isCurrentUserOrganizer = event?.organizers?.some(org => org.id === user?.id);

  // Roles that are allowed to manage events
  const canManageEventRoles = ['organizer', 'manager', 'superuser'];

  // Is the user’s activeRole in the set of organizer-level roles?
  const canManageByRole = canManageEventRoles.includes(activeRole);

  // Combine “organizer-level role” AND “associated with event” if you want that logic:
  const canManageParticipants = canManageByRole || isCurrentUserOrganizer; 


  // Set isManager to true to allow anyone to edit/delete
  const isManager = true;
  // const isManager = ['manager', 'superuser'].includes(user?.role) || event?.organizers?.some(o => o.utorid === user?.utorid);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/events/${eventId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setEvent(response.data);

        // Initialize edit form data
        setEditFormData({
          name: response.data.name,
          description: response.data.description,
          location: response.data.location,
          startTime: new Date(response.data.startTime).toISOString().slice(0, 16),
          endTime: new Date(response.data.endTime).toISOString().slice(0, 16),
          capacity: response.data.capacity || '',
          points: response.data.pointsAwarded || 0,
          published: response.data.published
        });

        // Use the new flag from the backend to determine attendance status
        if (response.data.isCurrentUserGuest !== undefined) {
          setIsAttending(response.data.isCurrentUserGuest);
        } else {
          // Fallback for safety, though the backend should always send it now
          setIsAttending(false);
        }

        setLoading(false);
      } catch (err) {
        setError('Failed to load event details. Please try again later.');
        setLoading(false);
        console.error('Error fetching event details:', err);
      }
    };

    if (token && eventId) { // Ensure token and eventId are present
      fetchEventDetails();
    } else if (!token) {
      setError('Authentication token not found. Please log in.');
      setLoading(false);
    }
  }, [eventId, token, user?.id, refreshEvent]); // Add safe navigation for user.id

  const handleAwardPoints = async () => {
    setAwardPointsLoading(true);
    setAwardPointsError(null);
    setAwardPointsSuccess(null);
    
    try {
      // Check if the amount is a positive integer
      const amount = parseInt(awardAmount, 10);
      if (isNaN(amount) || amount <= 0 || !Number.isInteger(amount)) {
        throw new Error('Points must be a positive integer');
      }
      
      // Call API to send reward request
      const response = await axios.post(
        `http://localhost:8000/events/${eventId}/transactions`,
        {
          type: "event",
          utorid: awardAllGuests ? undefined : selectedGuest.utorid,
          amount: amount
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Set success status
      const successMessage = awardAllGuests 
        ? `Successfully awarded ${amount} points to all guests!` 
        : `Successfully awarded ${selectedGuest.name || selectedGuest.utorid} ${amount} points!`;
      setAwardPointsSuccess(successMessage);
      
      // Clean up status
      setTimeout(() => {
        setAwardPointsDialogOpen(false);
        setAwardPointsSuccess(null);
        setSelectedGuest(null);
        setAwardAmount('');
        setAwardAllGuests(false);
      }, 2000);
      
    } catch (err) {
      console.error('Award points error:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'An error occurred while awarding points';
      setAwardPointsError(errorMessage);
    } finally {
      setAwardPointsLoading(false);
      setRefreshEvent(!refreshEvent);
    }
  };

  const handleRSVP = async () => {
    setRsvpLoading(true);
    setRsvpSuccess(null);
    setRsvpError(null);

    try {
      if (isAttending) {
        // Cancel RSVP
        await axios.delete(`http://localhost:8000/events/${eventId}/guests/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Update state and UI
        setIsAttending(false);
        setRsvpSuccess('You have successfully cancelled your RSVP.');

        // Remove user from guests list *safely*
        setEvent(prev => {
          // Check if prev.guests exists and is an array before filtering
          const currentGuests = Array.isArray(prev?.guests) ? prev.guests : [];
          const updatedGuests = currentGuests.filter(g => g.userId !== user.id && g.id !== user.id); // Check both userId and id just in case

          // Ensure numGuests is updated correctly, even if guests array was initially empty/undefined
          const currentNumGuests = prev?.numGuests || 0;

          return {
            ...prev,
            guests: updatedGuests, // Will be empty if user was the only one shown
            // Decrement numGuests, ensuring it doesn't go below 0
            numGuests: Math.max(0, currentNumGuests - 1)
          };
        });

      } else {
        // RSVP to event
        // Use the response data which might contain the added guest info
        const response = await axios.post(`http://localhost:8000/events/${eventId}/guests/me`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Update state and UI
        setIsAttending(true);
        setRsvpSuccess("You have successfully RSVP'd to this event!");

        // Add current user to guests list if not already there
        setEvent(prev => {
          // Initialize guests array if it doesn't exist or isn't an array
          const currentGuests = Array.isArray(prev?.guests) ? [...prev.guests] : [];

          // Check if the user is already in the guest list (client-side check)
          const userAlreadyInList = currentGuests.some(g => (g.userId === user.id || g.id === user.id));

          if (!userAlreadyInList) {
            // Prefer data from API response if available, otherwise use context data
            const guestToAdd = response.data?.guestAdded || {
              id: user.id,
              userId: user.id, // Ensure userId is present if needed elsewhere
              name: userDetails?.name || user.name || 'Guest',
              utorid: userDetails?.utorid || user.utorid || 'unknown'
            };
            currentGuests.push(guestToAdd);
          }

          // Use numGuests from API response if available, otherwise increment
          const updatedNumGuests = response.data?.numGuests !== undefined
            ? response.data.numGuests
            : (prev?.numGuests || 0) + (userAlreadyInList ? 0 : 1);


          return {
            ...prev,
            guests: currentGuests,
            numGuests: updatedNumGuests
          };
        });
      }
    } catch (err) {
      console.error('RSVP error:', err);
      // Try to get a more specific error message from the response
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'An error occurred while processing your RSVP.';
      setRsvpError(errorMessage);
    } finally {
      setRsvpLoading(false);
      // Clear messages after a delay
      setTimeout(() => {
        setRsvpSuccess(null);
        setRsvpError(null);
      }, 3000);
    }
  };

  const handleEditToggle = () => {
    setIsEditMode(!isEditMode);
    setUpdateSuccess(null);
    setUpdateError(null);

    // Reset form data to current event values
    if (event) {
      setEditFormData({
        name: event.name,
        description: event.description,
        location: event.location,
        startTime: new Date(event.startTime).toISOString().slice(0, 16),
        endTime: new Date(event.endTime).toISOString().slice(0, 16),
        capacity: event.capacity || '',
        points: event.pointsAwarded || 0,
        published: event.published
      });
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value, checked, type } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear validation error when field is edited
    if (editFormErrors[name]) {
      setEditFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateEditForm = () => {
    const errors = {};
    const now = new Date();
    const startDate = new Date(editFormData.startTime);
    const endDate = new Date(editFormData.endTime);

    if (!editFormData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!editFormData.description.trim()) {
      errors.description = 'Description is required';
    }

    if (!editFormData.location.trim()) {
      errors.location = 'Location is required';
    }

    if (!editFormData.startTime) {
      errors.startTime = 'Start time is required';
    } else if (startDate < now) {
      errors.startTime = 'Start time must be in the future';
    }

    if (!editFormData.endTime) {
      errors.endTime = 'End time is required';
    } else if (startDate >= endDate) {
      errors.endTime = 'End time must be after start time';
    }

    if (editFormData.capacity && (isNaN(editFormData.capacity) || Number(editFormData.capacity) < 0 || !Number.isInteger(Number(editFormData.capacity)))) {
      errors.capacity = 'Capacity must be a positive integer';
    }

    if (isNaN(editFormData.points) || Number(editFormData.points) < 0 || !Number.isInteger(Number(editFormData.points))) {
      errors.points = 'Points must be a positive integer';
    }

    setEditFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateEvent = async () => {
    if (!validateEditForm()) {
      return;
    }

    setUpdateLoading(true);
    setUpdateSuccess(null);
    setUpdateError(null);

    try {
      const payload = {
        name: editFormData.name,
        description: editFormData.description,
        location: editFormData.location,
        startTime: new Date(editFormData.startTime).toISOString(),
        endTime: new Date(editFormData.endTime).toISOString(),
        capacity: editFormData.capacity ? Number(editFormData.capacity) : null,
        points: Number(editFormData.points),
        published: editFormData.published
      };

      const response = await axios.patch(`http://localhost:8000/events/${eventId}`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      setEvent(response.data);
      setUpdateSuccess('Event updated successfully!');

      // Exit edit mode after successful update
      setTimeout(() => {
        setIsEditMode(false);
        setUpdateSuccess(null);
      }, 2000);
    } catch (err) {
      setUpdateError(err.response?.data?.message || 'Failed to update event. Please try again.');
      console.error('Update event error:', err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteEvent = async () => {
    setDeleteLoading(true);

    try {
      await axios.delete(`http://localhost:8000/events/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Close dialog and navigate back to events list
      handleDeleteDialogClose();
      navigate('/perks');
    } catch (err) {
      setUpdateError(err.response?.data?.message || 'Failed to delete event. Please try again.');
      console.error('Delete event error:', err);
      setDeleteLoading(false);
      handleDeleteDialogClose();
    }
  };

  const handleAddGuestDialogOpen = () => {
    setAddGuestDialogOpen(true);
    setAddGuestUtorid('');
    setAddGuestError(null);
    setAddGuestSuccess(null);
  };

  const handleAddGuestDialogClose = () => {
    setAddGuestDialogOpen(false);
  };

  const handleAddGuest = async () => {
    if (!addGuestUtorid.trim()) {
      setAddGuestError('UTORid is required');
      return;
    }

    setAddGuestLoading(true);
    setAddGuestError(null);
    setAddGuestSuccess(null);

    try {
      const response = await axios.post(`http://localhost:8000/events/${eventId}/guests`,
        { utorid: addGuestUtorid.trim() },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Update the event data with the new guest
      const updatedEvent = { ...event };
      if (!updatedEvent.guests) {
        updatedEvent.guests = [];
      }
      updatedEvent.guests.push(response.data);
      updatedEvent.numGuests = (updatedEvent.numGuests || 0) + 1;
      setEvent(updatedEvent);

      setAddGuestSuccess(`${response.data.name} has been added to the event`);

      // Clear the input field after successful addition
      setAddGuestUtorid('');

      // Close dialog after a short delay
      setTimeout(() => {
        handleAddGuestDialogClose();
        setAddGuestSuccess(null);
      }, 2000);
    } catch (err) {
      setAddGuestError(err.response?.data?.message || 'Failed to add guest. Please try again.');
      console.error('Add guest error:', err);
    } finally {
      setAddGuestLoading(false);
    }
  };

  const handleRemoveGuest = async (userId) => {
    setRemoveGuestLoading(true);

    try {
      await axios.delete(`http://localhost:8000/events/${eventId}/guests/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Update the event data by removing the guest
      const updatedEvent = { ...event };
      updatedEvent.guests = updatedEvent.guests.filter(guest => guest.id !== userId);
      updatedEvent.numGuests = (updatedEvent.numGuests || 0) - 1;
      setEvent(updatedEvent);

      setUpdateSuccess('Guest has been removed from the event');

      // Clear success message after a delay
      setTimeout(() => {
        setUpdateSuccess(null);
      }, 3000);
    } catch (err) {
      setUpdateError(err.response?.data?.message || 'Failed to remove guest. Please try again.');
      console.error('Remove guest error:', err);

      // Clear error message after a delay
      setTimeout(() => {
        setUpdateError(null);
      }, 3000);
    } finally {
      setRemoveGuestLoading(false);
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

  const handleAddOrganizerDialogOpen = () => {
    setAddOrganizerDialogOpen(true);
    setAddOrganizerUtorid('');
    setAddOrganizerError(null);
    setAddOrganizerSuccess(null);
  };

  const handleAddOrganizerDialogClose = () => {
    setAddOrganizerDialogOpen(false);
  };

  const handleAddOrganizer = async () => {
    if (!addOrganizerUtorid.trim()) {
      setAddOrganizerError('UTORid is required');
      return;
    }

    setAddOrganizerLoading(true);
    setAddOrganizerError(null);
    setAddOrganizerSuccess(null);

    try {
      const response = await axios.post(`http://localhost:8000/events/${eventId}/organizers`,
        { utorid: addOrganizerUtorid.trim() },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Update the event data with the new organizer
      const updatedEvent = { ...event };
      if (!updatedEvent.organizers) {
        updatedEvent.organizers = [];
      }
      updatedEvent.organizers.push(response.data);
      setEvent(updatedEvent);

      setAddOrganizerSuccess('Organizer added successfully!');

      // Clear the input after success
      setAddOrganizerUtorid('');

      // Close dialog after a delay
      setTimeout(() => {
        handleAddOrganizerDialogClose();
        setAddOrganizerSuccess(null);
      }, 2000);
    } catch (err) {
      setAddOrganizerError(err.response?.data?.message || 'Failed to add organizer. Please try again.');
      console.error('Add organizer error:', err);
    } finally {
      setAddOrganizerLoading(false);
    }
  };

  const handleRemoveOrganizer = async (userId) => {
    setRemoveOrganizerLoading(true);

    try {
      await axios.delete(`http://localhost:8000/events/${eventId}/organizers/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Update the event data by removing the organizer
      const updatedEvent = { ...event };
      updatedEvent.organizers = updatedEvent.organizers.filter(organizer => organizer.id !== userId);
      setEvent(updatedEvent);

      setUpdateSuccess('Organizer has been removed from the event');

      // Clear success message after a delay
      setTimeout(() => {
        setUpdateSuccess(null);
      }, 3000);
    } catch (err) {
      setUpdateError(err.response?.data?.message || 'Failed to remove organizer. Please try again.');
      console.error('Remove organizer error:', err);

      // Clear error message after a delay
      setTimeout(() => {
        setUpdateError(null);
      }, 3000);
    } finally {
      setRemoveOrganizerLoading(false);
    }
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

  if (!event) {
    return <Container><Typography>Event not found.</Typography></Container>;
  }

  const status = getEventStatus();
  const canRSVP = !hasEventEnded() && (!isEventFull() || isAttending);


  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-content">
          <h1 className="dashboard-title">Event Details</h1>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link to="/perks" style={{ marginRight: '20px', textDecoration: 'none', color: '#c48f8f', fontWeight: 'bold' }}>
              Back to Events
            </Link>
            <LogoutButton />
          </div>
        </div>
      </nav>
      <Container className="dashboard-main">
        <Box sx={{ my: 4 }}>
          {isEditMode ? (
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                  Edit Event
                </Typography>
                <Button variant="outlined" onClick={handleEditToggle} sx={{ px: 4, color: 'rgb(101, 82, 82)', borderColor: 'rgb(101, 82, 82)' }}>
                  Cancel
                </Button>
              </Box>

              {updateSuccess && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  {updateSuccess}
                </Alert>
              )}

              {updateError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {updateError}
                </Alert>
              )}

              <Stack spacing={4}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                      Basic Information
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          id="name"
                          name="name"
                          label="Event Name"
                          value={editFormData.name}
                          onChange={handleEditFormChange}
                          error={!!editFormErrors.name}
                          helperText={editFormErrors.name}
                          variant="outlined"
                          sx={{
                            mb: 1,
                            '& .MuiOutlinedInput-root.Mui-focused': {
                              '& fieldset': {
                                borderColor: 'rgb(101, 82, 82)',
                              },
                            },
                            '& label.Mui-focused': {
                              color: 'rgb(101, 82, 82)',
                            }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          id="description"
                          name="description"
                          label="Description"
                          multiline
                          rows={4}
                          value={editFormData.description}
                          onChange={handleEditFormChange}
                          error={!!editFormErrors.description}
                          helperText={editFormErrors.description}
                          variant="outlined"
                          sx={{
                            mb: 1,
                            '& .MuiOutlinedInput-root.Mui-focused': {
                              '& fieldset': {
                                borderColor: 'rgb(101, 82, 82)',
                              },
                            },
                            '& label.Mui-focused': {
                              color: 'rgb(101, 82, 82)',
                            }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          id="location"
                          name="location"
                          label="Location"
                          value={editFormData.location}
                          onChange={handleEditFormChange}
                          error={!!editFormErrors.location}
                          helperText={editFormErrors.location}
                          variant="outlined"
                          sx={{
                            mb: 1,
                            '& .MuiOutlinedInput-root.Mui-focused': {
                              '& fieldset': {
                                borderColor: 'rgb(101, 82, 82)',
                              },
                            },
                            '& label.Mui-focused': {
                              color: 'rgb(101, 82, 82)',
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Card variant="outlined" sx={{ p: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                      Event Details
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          id="capacity"
                          name="capacity"
                          label="Capacity (optional)"
                          type="number"
                          value={editFormData.capacity}
                          onChange={handleEditFormChange}
                          error={!!editFormErrors.capacity}
                          helperText={editFormErrors.capacity || "Leave empty for unlimited capacity"}
                          InputProps={{ inputProps: { min: 0 } }}
                          variant="outlined"
                          sx={{
                            mb: 1,
                            '& .MuiOutlinedInput-root.Mui-focused': {
                              '& fieldset': {
                                borderColor: 'rgb(101, 82, 82)',
                              },
                            },
                            '& label.Mui-focused': {
                              color: 'rgb(101, 82, 82)',
                            }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          fullWidth
                          id="points"
                          name="points"
                          label="Points"
                          type="number"
                          value={editFormData.points}
                          onChange={handleEditFormChange}
                          error={!!editFormErrors.points}
                          helperText={editFormErrors.points || "Points awarded to attendees"}
                          InputProps={{ inputProps: { min: 0 } }}
                          variant="outlined"
                          sx={{
                            mb: 1,
                            '& .MuiOutlinedInput-root.Mui-focused': {
                              '& fieldset': {
                                borderColor: 'rgb(101, 82, 82)',
                              },
                            },
                            '& label.Mui-focused': {
                              color: 'rgb(101, 82, 82)',
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Card variant="outlined" sx={{ p: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                      Time Period
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          required
                          id="startTime"
                          name="startTime"
                          label="Start Time"
                          type="datetime-local"
                          value={editFormData.startTime}
                          onChange={handleEditFormChange}
                          error={!!editFormErrors.startTime}
                          helperText={editFormErrors.startTime}
                          InputLabelProps={{ shrink: true }}
                          variant="outlined"
                          sx={{
                            mb: 1,
                            '& .MuiOutlinedInput-root.Mui-focused': {
                              '& fieldset': {
                                borderColor: 'rgb(101, 82, 82)',
                              },
                            },
                            '& label.Mui-focused': {
                              color: 'rgb(101, 82, 82)',
                            }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          required
                          id="endTime"
                          name="endTime"
                          label="End Time"
                          type="datetime-local"
                          value={editFormData.endTime}
                          onChange={handleEditFormChange}
                          error={!!editFormErrors.endTime}
                          helperText={editFormErrors.endTime}
                          InputLabelProps={{ shrink: true }}
                          variant="outlined"
                          sx={{
                            mb: 1,
                            '& .MuiOutlinedInput-root.Mui-focused': {
                              '& fieldset': {
                                borderColor: 'rgb(101, 82, 82)',
                              },
                            },
                            '& label.Mui-focused': {
                              color: 'rgb(101, 82, 82)',
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Card variant="outlined" sx={{ p: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                      Publication Status
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={editFormData.published}
                          onChange={handleEditFormChange}
                          name="published"
                          color="#c48f8f"
                        />
                      }
                      label={editFormData.published ? "Published (visible to users)" : "Draft (not visible to users)"}
                    />
                  </CardContent>
                </Card>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpdateEvent}
                    disabled={updateLoading}
                    size="large"
                    sx={{ px: 4, backgroundColor: '#ebc2c2', color: 'rgb(101, 82, 82)' }}
                  >
                    {updateLoading ? 'Updating...' : 'Update Event'}
                  </Button>
                </Box>
              </Stack>
            </Paper>
          ) : (
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h4" component="h1">
                  {event.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip
                    label={status.label}
                    color={status.color}
                    size="medium"
                    sx={{ mr: 2 }}
                  />
                {(canManageByRole || isCurrentUserOrganizer) && (
                    <Box>
                        <IconButton color="primary" onClick={handleEditToggle} title="Edit" sx={{ color: '#c48f8f' }}>
                            <EditIcon />
                        </IconButton>
                        <IconButton color="error" onClick={handleDeleteDialogOpen} title="Delete">
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                )}
                </Box>
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
                      {event.capacity ? `${event.numGuests ?? 0}/${event.capacity}` : 'Unlimited'}
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
                  <Box>
                    <Typography variant="subtitle2">Published</Typography>
                    <Chip
                      label={event.published ? 'Published' : 'Draft'}
                      color={event.published ? 'success' : 'default'}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>
              </Box>

              <Box sx={{ my: 4, position: 'relative' }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Participants
                
                </Typography>
                <IconButton
                  onClick={() => {
                    setAwardPointsDialogOpen(true);
                    setAwardPointsLoading(false);
                    setAwardPointsError(null);
                    setAwardPointsSuccess(null);
                    setSelectedGuest(null);
                    setAwardAmount('');
                    setAwardAllGuests(true);
                  }}
                  title="Award points to all guests"
                >
                  <EmojiEventsIcon sx={{ color: '#c48f8f' }} />
                </IconButton>
                </Box>
                <Card variant="outlined">
                  <List
                    subheader={
                      <ListItem
                        button
                        onClick={() => setShowOrganizers(!showOrganizers)}
                        sx={{ bgcolor: 'background.paper' }}
                        secondaryAction={
                            (canManageByRole || isCurrentUserOrganizer) && (
                              <Tooltip title="Add organizer">
                                <IconButton
                                  edge="end"
                                  aria-label="add organizer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddOrganizerDialogOpen();
                                  }}
                                >
                                  <PersonAddIcon sx={{ color: '#c48f8f' }} />
                                </IconButton>
                              </Tooltip>
                            )
                        }
                          
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <OrganizerIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Organizers"
                          secondary={`${event.organizers?.length || 0} organizer${event.organizers?.length !== 1 ? 's' : ''}`}
                        />
                        {showOrganizers ? <ExpandLess /> : <ExpandMore />}
                      </ListItem>
                    }
                  >
                    <Collapse in={showOrganizers} timeout="auto">
                      {event.organizers && event.organizers.length > 0 ? (
                        event.organizers.map((organizer) => (
                          <ListItem
                            key={organizer.id}
                            sx={{ pl: 4 }}
                            secondaryAction={
                                (canManageByRole || isCurrentUserOrganizer) && (
                                <Tooltip title="Remove organizer">
                                  <IconButton
                                    edge="end"
                                    aria-label="remove organizer"
                                    onClick={() => handleRemoveOrganizer(organizer.id)}
                                    disabled={removeOrganizerLoading}
                                  >
                                    <PersonRemoveIcon color="error" />
                                  </IconButton>
                                </Tooltip>
                              )
                            }                        
                          >
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: 'primary.dark', color: '#fff' }}>
                                {organizer.name && typeof organizer.name === 'string' && organizer.name.length > 0
                                  ? organizer.name.charAt(0).toUpperCase()
                                  : <PersonIcon />}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={organizer.name || 'Unknown Organizer'}
                              secondary={organizer.utorid}
                            />
                          </ListItem>
                        ))
                      ) : (
                        <ListItem sx={{ pl: 4 }}>
                          <ListItemText primary="No organizers assigned" />
                        </ListItem>
                      )}
                    </Collapse>
                  </List>

                  <Divider />

                  <List
                    subheader={
                      <ListItem
                        button
                        onClick={() => setShowGuests(!showGuests)}
                        sx={{ bgcolor: 'background.paper' }}
                        secondaryAction={
                            (canManageByRole || isCurrentUserOrganizer) && (
                            <Tooltip title="Add guest">
                              <IconButton
                                edge="end"
                                aria-label="add guest"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent toggling the collapse
                                  handleAddGuestDialogOpen();
                                }}
                              >
                                <PersonAddIcon sx={{ color: '#c48f8f' }} />
                              </IconButton>
                            </Tooltip>
                          )
                        }
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'secondary.main' }}>
                            <PersonIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Guests"
                          secondary={`${event.guests?.length || 0} attendee${event.guests?.length !== 1 ? 's' : ''}`}
                        />
                        {showGuests ? <ExpandLess /> : <ExpandMore />}
                      </ListItem>
                    }
                  >
                    <Collapse in={showGuests} timeout="auto">
                      {event.guests && event.guests.length > 0 ? (
                        event.guests.map((guest) => (
                          <ListItem
                            key={guest.id}
                            sx={{ pl: 4 }}
                            secondaryAction={
                                (canManageByRole || isCurrentUserOrganizer) && (
                                <>
                                  <Tooltip title="Award points">
                                    <IconButton
                                      edge="end"
                                      aria-label="award points"
                                      onClick={() => {
                                        setAwardPointsDialogOpen(true);
                                        setAwardPointsLoading(false);
                                        setAwardPointsError(null);
                                        setAwardPointsSuccess(null);
                                        setSelectedGuest(guest);
                                        setAwardAmount('');
                                      }}
                                    >
                                      <EmojiEventsIcon sx={{ color: '#c48f8f' }} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Remove guest">
                                    <IconButton
                                      edge="end"
                                      aria-label="remove guest"
                                      onClick={() => handleRemoveGuest(guest.id)}
                                      disabled={removeGuestLoading}
                                    >
                                      <PersonRemoveIcon color="error" />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )
                            }
                          >
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: 'secondary.main', color: '#fff' }}>
                                {guest.name && typeof guest.name === 'string' && guest.name.length > 0
                                  ? guest.name.charAt(0).toUpperCase()
                                  : <PersonIcon />}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={guest.name || 'Unknown Guest'}
                              secondary={guest.utorid}
                            />
                          </ListItem>
                        ))
                      ) : (
                        <ListItem sx={{ pl: 4 }}>
                          <ListItemText primary="No guests registered yet" />
                        </ListItem>
                      )}
                    </Collapse>
                  </List>
                </Card>
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

              {updateError && (
                <Alert severity="error" sx={{ my: 2 }}>
                  {updateError}
                </Alert>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button
                  variant="contained"
                  color={isAttending ? "error" : "primary"}
                  size="large"
                  onClick={handleRSVP}
                  disabled={rsvpLoading || isCurrentUserOrganizer}
                  sx={{ minWidth: 200, backgroundColor: '#ebc2c2', color: 'rgb(101, 82, 82)' }}
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

              {isCurrentUserOrganizer && (
                <Typography variant="caption" display="block" align="center" sx={{ mt: 1, color: 'text.secondary' }}>
                  Organizers cannot RSVP to their own events.
                </Typography>
              )}
            </Paper>
          )}
        </Box>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteDialogClose}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title">
            Delete Event
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              Are you sure you want to delete this event? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteDialogClose} disabled={deleteLoading} sx={{ color: 'rgb(101, 82, 82)' }}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteEvent}
              color="error"
              disabled={deleteLoading}
              variant="contained"
              sx={{ backgroundColor: '#ebc2c2', color: 'rgb(101, 82, 82)' }}
            >
              {deleteLoading ? <CircularProgress size={24} /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Guest Dialog */}
        <Dialog
          open={addGuestDialogOpen}
          onClose={handleAddGuestDialogClose}
          aria-labelledby="add-guest-dialog-title"
        >
          <DialogTitle id="add-guest-dialog-title">
            Add Guest to Event
          </DialogTitle>
          <DialogContent>
            {addGuestSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {addGuestSuccess}
              </Alert>
            )}
            {addGuestError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {addGuestError}
              </Alert>
            )}
            <DialogContentText sx={{ mb: 2 }}>
              Enter the UTORid of the user you want to add to this event.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="utorid"
              label="UTORid"
              type="text"
              fullWidth
              variant="outlined"
              value={addGuestUtorid}
              onChange={(e) => setAddGuestUtorid(e.target.value)}
              error={!!addGuestError}
              disabled={addGuestLoading}
              sx={{
                mb: 1,
                '& .MuiOutlinedInput-root.Mui-focused': {
                  '& fieldset': {
                    borderColor: 'rgb(101, 82, 82)',
                  },
                },
                '& label.Mui-focused': {
                  color: 'rgb(101, 82, 82)',
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleAddGuestDialogClose} disabled={addGuestLoading} sx={{ color: 'rgb(101, 82, 82)' }}>
              Cancel
            </Button>
            <Button
              onClick={handleAddGuest}
              color="primary"
              disabled={addGuestLoading || !addGuestUtorid.trim()}
              variant="contained"
              sx={{ backgroundColor: '#ebc2c2', color: 'rgb(101, 82, 82)' }}
            >
              {addGuestLoading ? <CircularProgress size={24} /> : 'Add Guest'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Organizer Dialog */}
        <Dialog
          open={addOrganizerDialogOpen}
          onClose={handleAddOrganizerDialogClose}
          aria-labelledby="add-organizer-dialog-title"
        >
          <DialogTitle id="add-organizer-dialog-title">
            Add Organizer to Event
          </DialogTitle>
          <DialogContent>
            {addOrganizerSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {addOrganizerSuccess}
              </Alert>
            )}
            {addOrganizerError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {addOrganizerError}
              </Alert>
            )}
            <DialogContentText sx={{ mb: 2 }}>
              Enter the UTORid of the user you want to add as an organizer to this event.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="organizer-utorid"
              label="UTORid"
              type="text"
              fullWidth
              variant="outlined"
              value={addOrganizerUtorid}
              onChange={(e) => setAddOrganizerUtorid(e.target.value)}
              error={!!addOrganizerError}
              disabled={addOrganizerLoading}
              sx={{
                mb: 1,
                '& .MuiOutlinedInput-root.Mui-focused': {
                  '& fieldset': {
                    borderColor: 'rgb(101, 82, 82)',
                  },
                },
                '& label.Mui-focused': {
                  color: 'rgb(101, 82, 82)',
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleAddOrganizerDialogClose} disabled={addOrganizerLoading} sx={{ color: 'rgb(101, 82, 82)' }}>
              Cancel
            </Button>
            <Button
              onClick={handleAddOrganizer}
              color="primary"
              disabled={addOrganizerLoading || !addOrganizerUtorid.trim()}
              variant="contained"
              sx={{ backgroundColor: '#ebc2c2', color: 'rgb(101, 82, 82)' }}
            >
              {addOrganizerLoading ? <CircularProgress size={24} /> : 'Add Organizer'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Award Points Dialog */}
        <Dialog
          open={awardPointsDialogOpen}
          onClose={() => {
            setAwardPointsDialogOpen(false);
            setAwardPointsLoading(false);
            setAwardPointsError(null);
            setAwardPointsSuccess(null);
            setSelectedGuest(null);
            setAwardAmount('');
            setAwardAllGuests(false);
          }}
          aria-labelledby="award-points-dialog-title"
        >
          <DialogTitle id="award-points-dialog-title">Award Points</DialogTitle>
          <DialogContent>
            {awardPointsSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {awardPointsSuccess}
              </Alert>
            )}
            {awardPointsError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {awardPointsError}
              </Alert>
            )}
            <DialogContentText sx={{ mb: 2 }}>
              {awardAllGuests 
                ? "How many points would you like to award to all guests?"
                : `How many points would you like to award to <strong>${selectedGuest?.name || selectedGuest?.utorid || 'user'}</strong>?`
              }
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="amount"
              label="Points"
              type="number"
              fullWidth
              variant="outlined"
              value={awardAmount}
              onChange={(e) => setAwardAmount(e.target.value)}
              inputProps={{ min: 1 }}
              error={!!awardPointsError}
              disabled={awardPointsLoading}
              sx={{
                mb: 1,
                '& .MuiOutlinedInput-root.Mui-focused': {
                  '& fieldset': {
                    borderColor: 'rgb(101, 82, 82)',
                  },
                },
                '& label.Mui-focused': {
                  color: 'rgb(101, 82, 82)',
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => {
                setAwardPointsDialogOpen(false);
                setAwardPointsError(null);
                setAwardPointsSuccess(null);
                setSelectedGuest(null);
                setAwardAmount('');
                setAwardAllGuests(false);
              }} 
              disabled={awardPointsLoading}
              sx={{ color: 'rgb(101, 82, 82)' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAwardPoints}
              color="primary"
              disabled={awardPointsLoading || !awardAmount}
              variant="contained"
              sx={{ backgroundColor: '#ebc2c2', color: 'rgb(101, 82, 82)' }}
            >
              {awardPointsLoading ? <CircularProgress size={24} /> : 'Award'}
            </Button>
          </DialogActions>
        </Dialog>
        
      </Container>
    </div>
  );
};

export default EventDetail;