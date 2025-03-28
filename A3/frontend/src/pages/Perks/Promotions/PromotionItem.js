import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';

const PromotionItem = ({ promotion }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isActive = () => {
    const now = new Date();
    const startDate = new Date(promotion.startTime);
    const endDate = new Date(promotion.endTime);
    return now >= startDate && now <= endDate;
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" component="div">
            {promotion.name}
          </Typography>
          <Chip 
            label={isActive() ? 'Active' : 'Upcoming'} 
            color={isActive() ? 'success' : 'primary'} 
            size="small" 
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {promotion.description}
        </Typography>
        
        <Box sx={{ mt: 'auto' }}>
          <Typography variant="body2">
            <strong>Type:</strong> {promotion.type}
          </Typography>
          {promotion.points > 0 && (
            <Typography variant="body2">
              <strong>Points:</strong> {promotion.points}
            </Typography>
          )}
          {promotion.rate && (
            <Typography variant="body2">
              <strong>Rate:</strong> {promotion.rate}
            </Typography>
          )}
          {promotion.minSpending && (
            <Typography variant="body2">
              <strong>Min. Spending:</strong> ${promotion.minSpending}
            </Typography>
          )}
          <Typography variant="body2">
            <strong>Valid:</strong> {formatDate(promotion.startTime)} - {formatDate(promotion.endTime)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PromotionItem;
