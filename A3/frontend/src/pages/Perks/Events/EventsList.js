import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  CircularProgress, 
  Alert, 
  TextField, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel, 
  Pagination, 
  IconButton,
  InputAdornment,
  Chip,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Paper,
  Stack
} from '@mui/material';
import { Search as SearchIcon, FilterList as FilterListIcon, SortRounded as SortIcon } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../../context/AuthContext';
import EventItem from './EventItem';
import ActiveRoleContext from '../../../context/ActiveRoleContext';

const EventsList = () => {
  const { activeRole } = useContext(ActiveRoleContext);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(6);
  
  // Filter state
  const [filters, setFilters] = useState({
    name: '',
    location: '',
    started: '',
    ended: '',
    published: 'true',
    showFull: '',
    orderBy: 'startTime',
    order: 'asc'
  });
  
  // Sorting state
  const [sortBy, setSortBy] = useState('startTime');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Filter visibility
  const [showFilters, setShowFilters] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      // Add pagination params
      if (page) queryParams.append('page', page);
      if (limit) queryParams.append('limit', limit);
      
      // Add filter params - only include valid fields as per backend validation
      if (filters.name) queryParams.append('name', filters.name);
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.started) queryParams.append('started', filters.started);
      if (filters.ended) queryParams.append('ended', filters.ended);
      if (filters.published) queryParams.append('published', filters.published);
      if (filters.showFull) queryParams.append('showFull', filters.showFull);
      if (filters.orderBy) queryParams.append('orderBy', filters.orderBy);
      if (filters.order) queryParams.append('order', filters.order);

      // update the url with the filtering params
      const query = queryParams.toString();
      const newUrl = `/events?${query ? `${query}` : ''}`;
      if (window.location.pathname + window.location.search !== newUrl) {
        window.history.pushState(null, '', newUrl);
      }
      
      const response = await axios.get(`http://localhost:8000/events?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Handle different response formats
      let fetchedEvents = [];
      let total = 0;
      
      if (response.data && !Array.isArray(response.data)) {
        if (Array.isArray(response.data.events)) {
          fetchedEvents = response.data.events;
          total = response.data.total || fetchedEvents.length;
        } else if (Array.isArray(response.data.data)) {
          fetchedEvents = response.data.data;
          total = response.data.total || fetchedEvents.length;
        } else if (Array.isArray(response.data.items)) {
          fetchedEvents = response.data.items;
          total = response.data.total || fetchedEvents.length;
        } else if (Array.isArray(response.data.results)) {
          fetchedEvents = response.data.results;
          total = response.data.total || fetchedEvents.length;
        } else {
          console.error('Events data is not in expected format:', response.data);
          fetchedEvents = [];
          total = 0;
        }
      } else if (Array.isArray(response.data)) {
        fetchedEvents = response.data;
        total = fetchedEvents.length;
      }
      
      setEvents(fetchedEvents);
      setTotalPages(Math.ceil(total / limit) || 1);
      setLoading(false);
    } catch (err) {
      setError('Failed to load events. Please try again later.');
      setLoading(false);
      console.error('Error fetching events:', err);
    }
  };
  
  // Fetch events when dependencies change
  useEffect(() => {
    fetchEvents();
  }, [token, page, limit, sortBy, sortOrder]);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
    const timer = setTimeout(() => {
      fetchEvents();
    }, 500); // Debounce filter changes
    
    return () => clearTimeout(timer);
  }, [filters]);

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };
  
  const handlePageChange = (event, value) => {
    setPage(value);
  };
  
  const handleStatusChange = (event) => {
    const { value } = event.target;
    
    // Reset both started and ended since backend doesn't allow both
    const newFilters = {
      ...filters,
      started: '',
      ended: ''
    };
    
    // Set the appropriate filter based on selection
    if (value === 'active') {
      newFilters.started = 'true';
    } else if (value === 'upcoming') {
      newFilters.started = 'false';
    } else if (value === 'ended') {
      newFilters.ended = 'true';
    }
    
    setFilters(newFilters);
  };
  
  const handleFilterChange = (event) => {
    const { name, value, checked, type } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked.toString() : value
    }));
  };
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  const clearFilters = () => {
    setFilters({
      name: '',
      location: '',
      started: '',
      ended: '',
      published: 'true',
      showFull: ''
    });
  };
  
  const handleSortChange = (field) => {
    if (sortBy === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      setFilters(prev => ({
        ...prev,
        orderBy: field,
        order: sortOrder === 'asc' ? 'desc' : 'asc'
      }));
    } else {
      // Set new sort field and default to ascending
      setSortBy(field);
      setSortOrder('asc');
      setFilters(prev => ({
        ...prev,
        orderBy: field,
        order: 'asc'
      }));
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Events</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <IconButton 
              color={showFilters ? 'rgb(101, 82, 82)' : 'default'} 
              onClick={toggleFilters}
              aria-label="toggle filters"
            >
              <FilterListIcon />
            </IconButton>
            
            <FormControl variant="outlined" size="small" sx={{ minWidth: 180, '& .MuiOutlinedInput-root.Mui-focused': {
                    '& fieldset': {
                      borderColor: 'rgb(101, 82, 82)', 
                    },
                  },
                  '& label.Mui-focused': {
                    color: 'rgb(101, 82, 82)', 
                  } 
                }}
            >
              <InputLabel id="event-status-select-label">Status</InputLabel>
              <Select
                labelId="event-status-select-label"
                id="event-status-select"
                value={filters.started === 'true' ? 'active' : filters.started === 'false' ? 'upcoming' : filters.ended === 'true' ? 'ended' : 'all'}
                onChange={handleStatusChange}
                label="Status"
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
                <MenuItem value="all"
                sx={{
                  '&.Mui-selected': { bgcolor: 'rgba(232, 180, 180, 0.19)' },
                  '&.Mui-selected:hover': { bgcolor: 'rgba(232, 180, 180, 0.19)' },
                }}
                >All Events</MenuItem>
                <MenuItem value="active"
                sx={{
                  '&.Mui-selected': { bgcolor: 'rgba(232, 180, 180, 0.19)' },
                  '&.Mui-selected:hover': { bgcolor: 'rgba(232, 180, 180, 0.19)' },
                }}
                >Active</MenuItem>
                <MenuItem value="upcoming"
                sx={{
                  '&.Mui-selected': { bgcolor: 'rgba(232, 180, 180, 0.19)' },
                  '&.Mui-selected:hover': { bgcolor: 'rgba(232, 180, 180, 0.19)' },
                }}
                >Upcoming</MenuItem>
                <MenuItem value="ended"
                sx={{
                  '&.Mui-selected': { bgcolor: 'rgba(232, 180, 180, 0.19)' },
                  '&.Mui-selected:hover': { bgcolor: 'rgba(232, 180, 180, 0.19)' },
                }}
                >Ended</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        
        {showFilters && (
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Filters</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  name="name"
                  label="Search by Name"
                  variant="outlined"
                  size="small"
                  value={filters.name}
                  onChange={handleFilterChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
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
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  name="location"
                  label="Search by Location"
                  variant="outlined"
                  size="small"
                  value={filters.location}
                  onChange={handleFilterChange}
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
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small" sx={{ 
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
                  <InputLabel id="event-status-filter-label">Event Status</InputLabel>
                  <Select
                    labelId="event-status-filter-label"
                    id="event-status-filter"
                    value={filters.started === 'true' ? 'active' : filters.started === 'false' ? 'upcoming' : filters.ended === 'true' ? 'ended' : 'all'}
                    onChange={handleStatusChange}
                    label="Event Status"
                  >
                    <MenuItem value="all"
                    sx={{
                      '&.Mui-selected': { bgcolor: 'rgba(232, 180, 180, 0.19)' },
                      '&.Mui-selected:hover': { bgcolor: 'rgba(232, 180, 180, 0.19)' },
                    }}
                    >All Statuses</MenuItem>
                    <MenuItem value="active"
                    sx={{
                      '&.Mui-selected': { bgcolor: 'rgba(232, 180, 180, 0.19)' },
                      '&.Mui-selected:hover': { bgcolor: 'rgba(232, 180, 180, 0.19)' },
                    }}
                    >Active</MenuItem>
                    <MenuItem value="upcoming"
                    sx={{
                      '&.Mui-selected': { bgcolor: 'rgba(232, 180, 180, 0.19)' },
                      '&.Mui-selected:hover': { bgcolor: 'rgba(232, 180, 180, 0.19)' },
                    }}
                    >Upcoming</MenuItem>
                    <MenuItem value="ended"
                    sx={{
                      '&.Mui-selected': { bgcolor: 'rgba(232, 180, 180, 0.19)' },
                      '&.Mui-selected:hover': { bgcolor: 'rgba(232, 180, 180, 0.19)' },
                    }}
                    >Ended</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filters.showFull === 'true'}
                      onChange={(e) => setFilters({...filters, showFull: e.target.checked ? 'true' : ''})}
                      name="showFull"
                      sx={{
                        '&.Mui-checked': {
                          color: '#ebc2c2',
                        }
                      }}
                    />
                  }
                  label="Show Full Events"
                />
              </Grid>
              
              {['manager', 'superuser'].includes(activeRole) && (
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filters.published === 'true'}
                      onChange={(e) => setFilters({...filters, published: e.target.checked ? 'true' : ''})}
                      name="published"
                      sx={{
                        '&.Mui-checked': {
                          color: '#ebc2c2',
                        }
                      }}
                    />
                  }
                  label="Published Events Only"
                />
              </Grid>
              )}
              
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Typography variant="subtitle2" sx={{ mr: 2, alignSelf: 'center' }}>Sort by:</Typography>
                  <Chip 
                    label="Start Time" 
                    variant={sortBy === 'startTime' ? 'filled' : 'outlined'}
                    color={sortBy === 'startTime' ? 'rgb(101, 82, 82)' : 'default'}
                    onClick={() => handleSortChange('startTime')}
                    icon={sortBy === 'startTime' ? <SortIcon sx={{ transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'none' }} /> : null}
                    sx={{ cursor: 'pointer' }}
                  />
                  <Chip 
                    label="Name" 
                    variant={sortBy === 'name' ? 'filled' : 'outlined'}
                    color={sortBy === 'name' ? 'rgb(101, 82, 82)' : 'default'}
                    onClick={() => handleSortChange('name')}
                    icon={sortBy === 'name' ? <SortIcon sx={{ transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'none' }} /> : null}
                    sx={{ cursor: 'pointer' }}
                  />
                  <Chip 
                    label="Location" 
                    variant={sortBy === 'location' ? 'filled' : 'outlined'}
                    color={sortBy === 'location' ? 'rgb(101, 82, 82)' : 'default'}
                    onClick={() => handleSortChange('location')}
                    icon={sortBy === 'location' ? <SortIcon sx={{ transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'none' }} /> : null}
                    sx={{ cursor: 'pointer' }}
                  />
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Chip 
                label="Clear Filters" 
                variant="outlined" 
                onClick={clearFilters} 
                sx={{ cursor: 'pointer' }}
              />
            </Box>
          </Paper>
        )}
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : !events || events.length === 0 ? (
        <Alert severity="info" sx={{ my: 4 }}>
          No events match your current filters. Try adjusting your search criteria.
        </Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {events.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <EventItem event={event} onClick={() => handleEventClick(event.id)} />
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={handlePageChange} 
              color="#c48f8f" 
              showFirstButton 
              showLastButton
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default EventsList;
