import React, { useContext } from 'react';
import { Box, Typography, Container, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import LogoutButton from '../../../components/auth/LogoutButton';
import PromotionsList from './PromotionsList';
import '../../../styles/auth.css';
import RoleSwitcher from '../../../components/RoleSwitcher';
import ActiveRoleContext from '../../../context/ActiveRoleContext';

const navLinkStyle = {
    textDecoration: 'none',
    color: '#c48f8f',
    fontWeight: 'bold',
    fontSize: '0.9rem',
  };

const PromotionsPage = () => {
  const { activeRole } = useContext(ActiveRoleContext);

  return (
    <div className="dashboard-container">
        <Box sx={{ maxWidth: '800px', margin: '0 auto' }}>
        <Box
            className="dashboard-nav"
            sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
            paddingY: 2,
            paddingX: 3,
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            borderRadius: 2,
            marginBottom: 3,
            backgroundColor: '#ffffff',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Promotions
            </Typography>
            <Link to="/dashboard" style={navLinkStyle}>Dashboard</Link>
            <Link to="/events" style={navLinkStyle}>Events</Link>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <RoleSwitcher />
            <LogoutButton />
            </Box>
        </Box>
        </Box>

      
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
