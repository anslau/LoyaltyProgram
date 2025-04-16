import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

export const getEvents = async (token, filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.name) queryParams.append('name', filters.name);
    if (filters.location) queryParams.append('location', filters.location);
    if (filters.started) queryParams.append('started', filters.started);
    if (filters.ended) queryParams.append('ended', filters.ended);
    if (filters.published) queryParams.append('published', filters.published);
    if (filters.showFull) queryParams.append('showFull', filters.showFull);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    
    const response = await axios.get(
      `${API_URL}/events?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

export const getEventById = async (token, eventId) => {
  try {
    const response = await axios.get(
      `${API_URL}/events/${eventId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching event ${eventId}:`, error);
    throw error;
  }
};

export const rsvpToEvent = async (token, eventId) => {
  try {
    const response = await axios.post(
      `${API_URL}/events/${eventId}/guests/me`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error(`Error RSVPing to event ${eventId}:`, error);
    throw error;
  }
};

export const cancelRsvp = async (token, eventId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/events/${eventId}/guests/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error(`Error canceling RSVP for event ${eventId}:`, error);
    throw error;
  }
};
