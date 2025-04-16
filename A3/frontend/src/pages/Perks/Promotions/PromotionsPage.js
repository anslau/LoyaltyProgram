import React, { useContext } from 'react';
import { Box, Typography, Container, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import LogoutButton from '../../../components/auth/LogoutButton';
import PromotionsList from './PromotionsList';
import '../../../styles/auth.css';
import RoleSwitcher from '../../../components/RoleSwitcher';
import ActiveRoleContext from '../../../context/ActiveRoleContext';
import DashboardHeader from '../../../components/dashboardHeader';

// const navLinkStyle = {
//     textDecoration: 'none',
//     color: '#c48f8f',
//     fontWeight: 'bold',
//     fontSize: '0.9rem',
//   };

const PromotionsPage = () => {
  const { activeRole } = useContext(ActiveRoleContext);

  return (
    <div className="dashboard-container">
        <DashboardHeader 
            title="Promotions"
            links={[
            ["/dashboard", "Dashboard"],
            ["/events", "Events"],
            ["/users", "View All Users", ({ activeRole }) => activeRole === "manager"]
            ]}
        />
      
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
