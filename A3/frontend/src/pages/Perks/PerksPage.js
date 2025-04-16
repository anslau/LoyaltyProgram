import React, { useState, useContext } from 'react';
import { Box, Tabs, Tab, Typography, Container, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import LogoutButton from '../../components/auth/LogoutButton';
import PromotionsList from './Promotions/PromotionsList';
import EventsList from './Events/EventsList';
import RoleSwitcher from '../../components/RoleSwitcher';
import '../../styles/auth.css';
import ActiveRoleContext from '../../context/ActiveRoleContext';
import AuthContext from '../../context/AuthContext';
import DashboardHeader from '../../components/dashboardHeader';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`perks-tabpanel-${index}`}
      aria-labelledby={`perks-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const PerksPage = () => {
  const { activeRole } = useContext(ActiveRoleContext);
  const { userDetails } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <div className="dashboard-container">
            <DashboardHeader
            title="What's New"
            />
      
      <Container className="dashboard-main" sx={{maxWidth: '800px'}}>
        <Box sx={{ width: '100%'}}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="perks tabs"
              TabIndicatorProps={{ style: { backgroundColor: 'rgb(101, 82, 82)' } }}
            >
              <Tab label="Promotions" id="perks-tab-0" aria-controls="perks-tabpanel-0"
              sx={{
                '&.Mui-selected': {
                  color: 'rgb(101, 82, 82)'
                }
              }}
              />
              <Tab label="Events" id="perks-tab-1" aria-controls="perks-tabpanel-1" 
              sx={{
                '&.Mui-selected': {
                  color: 'rgb(101, 82, 82)' 
                }
              }}
              />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            {['manager', 'superuser'].includes(activeRole) && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
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
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
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
          </TabPanel>
        </Box>
      </Container>
    </div>
  );
};

export default PerksPage;
