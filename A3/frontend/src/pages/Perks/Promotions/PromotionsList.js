import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Grid, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import AuthContext from '../../../context/AuthContext';
import PromotionItem from './PromotionItem';

const PromotionsList = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await axios.get('http://localhost:8000/promotions', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log('Promotions API response:', response.data);
        
        if (response.data && !Array.isArray(response.data)) {
          if (Array.isArray(response.data.promotions)) {
            setPromotions(response.data.promotions);
          } else if (Array.isArray(response.data.data)) {
            setPromotions(response.data.data);
          } else if (Array.isArray(response.data.items)) {
            setPromotions(response.data.items);
          } else if (Array.isArray(response.data.results)) {
            setPromotions(response.data.results);
          } else {
            console.error('Promotions data is not in expected format:', response.data);
            setPromotions([]);
          }
        } else if (Array.isArray(response.data)) {
          setPromotions(response.data);
        } else {
          setPromotions([]);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load promotions. Please try again later.');
        setLoading(false);
        console.error('Error fetching promotions:', err);
      }
    };

    fetchPromotions();
  }, [token]);

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

  if (!promotions || promotions.length === 0) {
    return <Typography variant="body1">No promotions available at the moment.</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Available Promotions</Typography>
      <Grid container spacing={3}>
        {Array.isArray(promotions) ? promotions.map((promotion) => (
          <Grid item xs={12} sm={6} md={4} key={promotion.id}>
            <PromotionItem promotion={promotion} />
          </Grid>
        )) : (
          <Grid item xs={12}>
            <Alert severity="warning">
              Unable to display promotions. Unexpected data format received.
            </Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default PromotionsList;
