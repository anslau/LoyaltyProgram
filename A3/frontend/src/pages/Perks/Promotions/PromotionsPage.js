import React, { useContext } from 'react';
import { Box, Typography, Container, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import LogoutButton from '../../../components/auth/LogoutButton';
import PromotionsList from './PromotionsList';
import '../../../styles/auth.css';
import RoleSwitcher from '../../../components/RoleSwitcher';
import ActiveRoleContext from '../../../context/ActiveRoleContext';

const PromotionsPage = () => {
  const { activeRole } = useContext(ActiveRoleContext);

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-content">
          <h1 className="dashboard-title">Promotions</h1>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link to="/dashboard" style={{ marginRight: '20px', textDecoration: 'none', color: '#c48f8f', fontWeight: 'bold' }}>
              Dashboard
            </Link>
            <Link to="/events" style={{ marginRight: '20px', textDecoration: 'none', color: '#c48f8f', fontWeight: 'bold' }}>
              Events
            </Link>
            <RoleSwitcher />
            <LogoutButton />
          </div>
        </div>
      </nav>
      
      <Container className="dashboard-main">
        <Box sx={{ width: '100%', mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Available Promotions
          </Typography>
          
          {['manager', 'superuser'].includes(activeRole) && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button 
                variant="contained"
                sx={{ color: 'rgb(101, 82, 82)', backgroundColor: '#ebc2c2' }}
                component={Link} 
                to="/promotions/create"
              >
                Create Promotion
              </Button>
            </Box>
          )}
          
          <PromotionsList />
        </Box>
      </Container>
    </div>
  );
};

export default PromotionsPage;
