import React, { useContext } from 'react';
import { Box, Typography, Container, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import LogoutButton from '../../../components/auth/LogoutButton';
import EventsList from './EventsList';
import '../../../styles/auth.css';
import RoleSwitcher from '../../../components/RoleSwitcher';
import ActiveRoleContext from '../../../context/ActiveRoleContext';
import DashboardHeader from '../../../components/dashboardHeader';

const EventsPage = () => {
  const { activeRole } = useContext(ActiveRoleContext);

  return (
    <div className="dashboard-container">
        <DashboardHeader
        title="Events"
        />

      <Container className="dashboard-main" sx={{maxWidth: '800px'}}>
        <Box sx={{ width: '100%' }}>
          {['manager', 'superuser'].includes(activeRole) && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
              <Button 
                variant="contained" 
                sx={{ color: 'rgb(101, 82, 82)', backgroundColor: '#ebc2c2' }}
                component={Link} 
                to="/events/create"
              >
                Create Event
              </Button>
            </Box>
          )}
          
          <EventsList />
        </Box>
      </Container>
    </div>
  );
};

export default EventsPage;
