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
        links={[
            ["/dashboard", "Dashboard"],
            ["/promotions", "Promotions"],
            ["/events/create", "Create Event", ({ activeRole }) => ["manager", "superuser"].includes(activeRole)]
        ]}
        />


      <Container className="dashboard-main">
        <Box sx={{ width: '100%', mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Upcoming Events
          </Typography>
          
          {['manager', 'superuser'].includes(activeRole) && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
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
