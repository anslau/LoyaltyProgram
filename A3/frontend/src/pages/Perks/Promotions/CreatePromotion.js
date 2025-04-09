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
  Divider,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import AuthContext from '../../../context/AuthContext';

const CreatePromotion = () => {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    startTime: '',
    endTime: '',
    minSpending: '',
    rate: '',
    points: 0
  });
  
  const [formErrors, setFormErrors] = useState({
    name: '',
    description: '',
    type: '',
    startTime: '',
    endTime: '',
    minSpending: '',
    rate: '',
    points: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
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
    
    if (!formData.type) {
      newErrors.type = 'Type is required';
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
    
    if (formData.minSpending && (isNaN(formData.minSpending) || Number(formData.minSpending) < 0)) {
      newErrors.minSpending = 'Minimum spending must be a positive number';
      valid = false;
    }
    
    if (formData.rate && (isNaN(formData.rate) || Number(formData.rate) < 0)) {
      newErrors.rate = 'Rate must be a positive number';
      valid = false;
    }
    
    if (isNaN(formData.points) || Number(formData.points) < 0) {
      newErrors.points = 'Points must be a positive number';
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
      const startDate = new Date(formData.startTime);
      const endDate = new Date(formData.endTime);
      
      const payload = {
        ...formData,
        minSpending: formData.minSpending ? Number(formData.minSpending) : null,
        rate: formData.rate ? Number(formData.rate) : null,
        points: Number(formData.points),
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString()
      };
      
      const response = await fetch('http://localhost:8000/promotions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create promotion');
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/perks');
      }, 2000);
    } catch (err) {
      setError(err.message || 'An error occurred while creating the promotion');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ bgcolor: '#ebc2c2', color: 'rgb(101, 82, 82)', p: 3 }}>
          <Typography variant="h4" component="h1">
            Create New Promotion
          </Typography>
        </Box>
        
        <Box sx={{ p: 4 }}>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }}>Promotion created successfully! Redirecting...</Alert>}
          
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
                        label="Promotion Name"
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
                  </Grid>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ p: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                    Promotion Details
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth required error={!!formErrors.type} 
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
                      >
                        <InputLabel id="type-label">Promotion Type</InputLabel>
                        <Select
                          labelId="type-label"
                          id="type"
                          name="type"
                          value={formData.type}
                          label="Promotion Type"
                          onChange={handleChange}
                        >
                          <MenuItem value="automatic">Automatic</MenuItem>
                          <MenuItem value="one-time">One-time</MenuItem>
                        </Select>
                        {formErrors.type && <FormHelperText>{formErrors.type}</FormHelperText>}
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="points"
                        name="points"
                        label="Points"
                        type="number"
                        value={formData.points}
                        onChange={handleChange}
                        error={!!formErrors.points}
                        helperText={formErrors.points}
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
                    Conditions & Rewards
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="minSpending"
                        name="minSpending"
                        label="Minimum Spending"
                        type="number"
                        value={formData.minSpending}
                        onChange={handleChange}
                        error={!!formErrors.minSpending}
                        helperText={formErrors.minSpending || "Leave empty if not applicable"}
                        InputProps={{ inputProps: { min: 0, step: 0.01 } }}
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
                        id="rate"
                        name="rate"
                        label="Rate"
                        type="number"
                        value={formData.rate}
                        onChange={handleChange}
                        error={!!formErrors.rate}
                        helperText={formErrors.rate || "Leave empty if not applicable"}
                        InputProps={{ inputProps: { min: 0, step: 0.01 } }}
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
                  {loading ? 'Creating...' : 'Create Promotion'}
                </Button>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreatePromotion;
