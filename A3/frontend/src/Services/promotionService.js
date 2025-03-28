import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const getPromotions = async (token, filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.name) queryParams.append('name', filters.name);
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.started) queryParams.append('started', filters.started);
    if (filters.ended) queryParams.append('ended', filters.ended);
    
    const response = await axios.get(
      `${API_URL}/promotions?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching promotions:', error);
    throw error;
  }
};

export const getPromotionById = async (token, promotionId) => {
  try {
    const response = await axios.get(
      `${API_URL}/promotions/${promotionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching promotion ${promotionId}:`, error);
    throw error;
  }
};
