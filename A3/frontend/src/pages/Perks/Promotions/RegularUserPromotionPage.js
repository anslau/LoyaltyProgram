import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import LogoutButton from '../../../components/auth/LogoutButton';
import PromotionsList from './PromotionsList';
import '../../../styles/auth.css';
import RoleSwitcher from '../../../components/RoleSwitcher';
import DashboardHeader from '../../../components/dashboardHeader';


const RegularUserPromotionPage = () => {
  return (
    <div className="dashboard-container">
            <DashboardHeader
            title="What's New"
            />
      
      <Container className="dashboard-main">
        <Box sx={{ width: '100%', mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Available Promotions
          </Typography>
          
          <PromotionsList />
        </Box>
      </Container>
    </div>
  );
};

export default RegularUserPromotionPage;
