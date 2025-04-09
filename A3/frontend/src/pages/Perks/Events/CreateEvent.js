import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Container, 
  Paper, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Grid,
  Alert,
  FormHelperText,
  Card,
  CardContent,
  Stack,
  Switch,
  FormControlLabel
} from '@mui/material';
import AuthContext from '../../../context/AuthContext';

const CreateEvent = () => {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    startTime: '',
    endTime: '',
    capacity: '',
    points: 0,
    published: false
  });
  
  const [formErrors, setFormErrors] = useState({
    name: '',
    description: '',
    location: '',
    startTime: '',
    endTime: '',
    capacity: '',
    points: ''
  });
  
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    setFormErrors({
      ...formErrors,
      [name]: ''
    });
  };
  
  const validateForm = () => {
    let valid = true;
    const newErrors = { ...formErrors };
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      valid = false;
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
      valid = false;
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
      valid = false;
    }
    
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
      valid = false;
    }
    
    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
      valid = false;
    }
    
    const startDate = new Date(formData.startTime);
    const endDate = new Date(formData.endTime);
    const now = new Date();
    
    if (isNaN(startDate.getTime())) {
      newErrors.startTime = 'Invalid date format';
      valid = false;
    }
    
    if (isNaN(endDate.getTime())) {
      newErrors.endTime = 'Invalid date format';
      valid = false;
    }
    
    if (startDate < now) {
      newErrors.startTime = 'Start time must be in the future';
      valid = false;
    }
    
    if (startDate >= endDate) {
      newErrors.endTime = 'End time must be after start time';
      valid = false;
    }
    
    if (formData.capacity && (isNaN(formData.capacity) || Number(formData.capacity) < 0 || !Number.isInteger(Number(formData.capacity)))) {
      newErrors.capacity = 'Capacity must be a positive integer';
      valid = false;
    }
    
    if (isNaN(formData.points) || Number(formData.points) < 0 || !Number.isInteger(Number(formData.points))) {
      newErrors.points = 'Points must be a positive integer';
      valid = false;
    }
    
    setFormErrors(newErrors);
    return valid;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const payload = {
        ...formData,
        capacity: formData.capacity ? Number(formData.capacity) : null,
        points: Number(formData.points),
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString()
      };
      
      const response = await fetch('http://localhost:8000/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create event');
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/perks');
      }, 2000);
    } catch (err) {
      setError(err.message || 'An error occurred while creating the event');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ bgcolor: '#ebc2c2', color: 'rgb(101, 82, 82)', p: 3 }}>
          <Typography variant="h4" component="h1">
            Create New Event
          </Typography>
        </Box>
        
        <Box sx={{ p: 4 }}>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }}>Event created successfully! Redirecting...</Alert>}
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
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
                        value={formData.name}
                        onChange={handleChange}
                        error={!!formErrors.name}
                        helperText={formErrors.name}
                        variant="outlined"
                        sx={{ mb: 1,
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
                        value={formData.description}
                        onChange={handleChange}
                        error={!!formErrors.description}
                        helperText={formErrors.description}
                        variant="outlined"
                        sx={{ 
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
                        value={formData.location}
                        onChange={handleChange}
                        error={!!formErrors.location}
                        helperText={formErrors.location}
                        variant="outlined"
                        sx={{ 
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
                        value={formData.capacity}
                        onChange={handleChange}
                        error={!!formErrors.capacity}
                        helperText={formErrors.capacity || "Leave empty for unlimited capacity"}
                        InputProps={{ inputProps: { min: 0 } }}
                        variant="outlined"
                        sx={{ 
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
                        value={formData.points}
                        onChange={handleChange}
                        error={!!formErrors.points}
                        helperText={formErrors.points || "Points awarded to attendees"}
                        InputProps={{ inputProps: { min: 0 } }}
                        variant="outlined"
                        sx={{ 
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
                        value={formData.startTime}
                        onChange={handleChange}
                        error={!!formErrors.startTime}
                        helperText={formErrors.startTime}
                        InputLabelProps={{ shrink: true }}
                        variant="outlined"
                        sx={{ 
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
                        value={formData.endTime}
                        onChange={handleChange}
                        error={!!formErrors.endTime}
                        helperText={formErrors.endTime}
                        InputLabelProps={{ shrink: true }}
                        variant="outlined"
                        sx={{ 
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
                        checked={formData.published}
                        onChange={handleChange}
                        name="published"
                        color="#ebc2c2"
                      />
                    }
                    label={formData.published ? "Published (visible to users)" : "Draft (not visible to users)"}
                  />
                </CardContent>
              </Card>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/perks')}
                  disabled={loading}
                  size="large"
                  sx={{ px: 4, color: 'rgb(101, 82, 82)', borderColor: 'rgb(101, 82, 82)' }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading || success}
                  size="large"
                  sx={{ px: 4, color: 'rgb(101, 82, 82)', backgroundColor: '#ebc2c2' }}
                >
                  {loading ? 'Creating...' : 'Create Event'}
                </Button>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateEvent;
