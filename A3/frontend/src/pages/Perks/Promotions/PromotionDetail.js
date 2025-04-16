import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  IconButton,
  Chip
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import AuthContext from '../../../context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const PromotionDetail = () => {
  const { promotionId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useContext(AuthContext);
  
  const [promotion, setPromotion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Edit mode state
  const [editMode, setEditMode] = useState(false);
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
  const [formErrors, setFormErrors] = useState({});
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Temporarily allowing all users to edit/delete
  const isManager = true; // Removing role check
  
  useEffect(() => {
    const fetchPromotion = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${BACKEND_URL}/promotions/${promotionId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch promotion details');
        }
        
        const data = await response.json();
        setPromotion(data);
        
        // Initialize form data for editing
        const startTime = new Date(data.startTime);
        const endTime = new Date(data.endTime);
        
        setFormData({
          name: data.name || '',
          description: data.description || '',
          type: data.type || '',
          startTime: startTime.toISOString().slice(0, 16),
          endTime: endTime.toISOString().slice(0, 16),
          minSpending: data.minSpending !== null ? data.minSpending : '',
          rate: data.rate !== null ? data.rate : '',
          points: data.points || 0
        });
        
        setLoading(false);
      } catch (err) {
        setError(err.message || 'An error occurred while fetching promotion details');
        setLoading(false);
      }
    };
    
    fetchPromotion();
  }, [promotionId, token]);
  
  const handleEditToggle = () => {
    setEditMode(!editMode);
    // Reset form errors when toggling edit mode
    setFormErrors({});
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    let valid = true;
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
      valid = false;
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
      valid = false;
    }
    
    if (!formData.type) {
      errors.type = 'Type is required';
      valid = false;
    }
    
    if (!formData.startTime) {
      errors.startTime = 'Start time is required';
      valid = false;
    }
    
    if (!formData.endTime) {
      errors.endTime = 'End time is required';
      valid = false;
    }
    
    const startDate = new Date(formData.startTime);
    const endDate = new Date(formData.endTime);
    
    if (startDate > endDate) {
      errors.endTime = 'End time must be after start time';
      valid = false;
    }
    
    if (formData.minSpending && (isNaN(formData.minSpending) || Number(formData.minSpending) < 0)) {
      errors.minSpending = 'Minimum spending must be a positive number';
      valid = false;
    }
    
    if (formData.rate && (isNaN(formData.rate) || Number(formData.rate) < 0)) {
      errors.rate = 'Rate must be a positive number';
      valid = false;
    }
    
    if (isNaN(formData.points) || Number(formData.points) < 0) {
      errors.points = 'Points must be a positive number';
      valid = false;
    }
    
    setFormErrors(errors);
    return valid;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const payload = {
        ...formData,
        minSpending: formData.minSpending ? Number(formData.minSpending) : null,
        rate: formData.rate ? Number(formData.rate) : null,
        points: Number(formData.points),
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString()
      };
      
      const response = await fetch(`${BACKEND_URL}/promotions/${promotionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update promotion');
      }
      
      const updatedPromotion = await response.json();
      setPromotion(updatedPromotion);
      setEditMode(false);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'An error occurred while updating the promotion');
      setLoading(false);
    }
  };
  
  const handleDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };
  
  const handleDeletePromotion = async () => {
    setDeleteLoading(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/promotions/${promotionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete promotion');
      }
      
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      
      // Navigate back to promotions list
      navigate('/perks');
    } catch (err) {
      setError(err.message || 'An error occurred while deleting the promotion');
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const isActive = () => {
    if (!promotion) return false;
    
    const now = new Date();
    const startDate = new Date(promotion.startTime);
    const endDate = new Date(promotion.endTime);
    
    return now >= startDate && now <= endDate;
  };
  
  if (loading && !promotion) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error && !promotion) {
    return <Alert severity="error">{error}</Alert>;
  }
  
  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/perks')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">Promotion Details</Typography>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      {promotion && (
        <Paper elevation={3} sx={{ p: 3 }}>
          {!editMode ? (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                  <Typography variant="h5" gutterBottom>{promotion.name}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip 
                      label={isActive() ? 'Active' : new Date() < new Date(promotion.startTime) ? 'Upcoming' : 'Ended'} 
                      color={isActive() ? 'success' : new Date() < new Date(promotion.startTime) ? 'primary' : 'default'} 
                      size="small" 
                    />
                    <Chip 
                      label={promotion.type} 
                      variant="outlined" 
                      size="small" 
                    />
                  </Box>
                </Box>
                
                <Box>
                  <IconButton color="primary" onClick={handleEditToggle} title="Edit" sx={{ color: '#c48f8f'}}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={handleDeleteDialogOpen} title="Delete">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" color="text.secondary">Description</Typography>
                  <Typography variant="body1" paragraph>{promotion.description}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" color="text.secondary">Start Time</Typography>
                  <Typography variant="body1">{formatDate(promotion.startTime)}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" color="text.secondary">End Time</Typography>
                  <Typography variant="body1">{formatDate(promotion.endTime)}</Typography>
                </Grid>
                
                {promotion.points > 0 && (
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle1" color="text.secondary">Points</Typography>
                    <Typography variant="body1">{promotion.points}</Typography>
                  </Grid>
                )}
                
                {promotion.minSpending !== null && (
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle1" color="text.secondary">Minimum Spending</Typography>
                    <Typography variant="body1">${promotion.minSpending}</Typography>
                  </Grid>
                )}
                
                {promotion.rate !== null && (
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle1" color="text.secondary">Rate</Typography>
                    <Typography variant="body1">{promotion.rate}</Typography>
                  </Grid>
                )}
              </Grid>
            </>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              <Typography variant="h5" gutterBottom>Edit Promotion</Typography>
              
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
                    id="description"
                    name="description"
                    label="Description"
                    multiline
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    error={!!formErrors.description}
                    helperText={formErrors.description}
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
                  <FormControl fullWidth required error={!!formErrors.type} sx={{'& .MuiOutlinedInput-root.Mui-focused': {
                    '& fieldset': {
                      borderColor: 'rgb(101, 82, 82)', 
                    },
                  },
                  '& label.Mui-focused': {
                    color: 'rgb(101, 82, 82)', 
                  } 
                }}>
                    <InputLabel id="type-label">Promotion Type</InputLabel>
                    <Select
                      labelId="type-label"
                      id="type"
                      name="type"
                      value={formData.type}
                      label="Promotion Type"
                      onChange={handleChange}
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
                      <MenuItem value="automatic"
                      sx={{
                        '&.Mui-selected': { bgcolor: 'rgba(232, 180, 180, 0.19)' },
                        '&.Mui-selected:hover': { bgcolor: 'rgba(232, 180, 180, 0.19)' },
                      }}
                      >Automatic</MenuItem>
                      <MenuItem value="one-time"
                      sx={{
                        '&.Mui-selected': { bgcolor: 'rgba(232, 180, 180, 0.19)' },
                        '&.Mui-selected:hover': { bgcolor: 'rgba(232, 180, 180, 0.19)' },
                      }}
                      >One-time</MenuItem>
                    </Select>
                    {formErrors.type && (
                      <Typography variant="caption" color="error">
                        {formErrors.type}
                      </Typography>
                    )}
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
                    id="startTime"
                    name="startTime"
                    label="Start Time"
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={handleChange}
                    error={!!formErrors.startTime}
                    helperText={formErrors.startTime}
                    InputLabelProps={{ shrink: true }}
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
                    id="minSpending"
                    name="minSpending"
                    label="Minimum Spending"
                    type="number"
                    value={formData.minSpending}
                    onChange={handleChange}
                    error={!!formErrors.minSpending}
                    helperText={formErrors.minSpending || "Leave empty if not applicable"}
                    InputProps={{ inputProps: { min: 0, step: 0.01 } }}
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
                
                <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleEditToggle}
                    disabled={loading}
                    sx={{ px: 4, color: 'rgb(101, 82, 82)', borderColor: 'rgb(101, 82, 82)' }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    sx={{backgroundColor: '#ebc2c2', color: 'rgb(101, 82, 82)'}}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      )}
      
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Delete Promotion
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this promotion? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeletePromotion} 
            color="error" 
            autoFocus
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PromotionDetail;
