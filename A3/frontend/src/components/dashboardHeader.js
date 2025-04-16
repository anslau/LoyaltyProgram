import React, { useContext } from 'react';
import { Box, Typography, IconButton, Drawer, List, ListItem, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';
import RoleSwitcher from './RoleSwitcher';
import LogoutButton from './auth/LogoutButton';
import AuthContext from '../context/AuthContext';
import ActiveRoleContext from '../context/ActiveRoleContext';

const navLinkStyle = {
  textDecoration: 'none',
  color: '#c48f8f',
  fontWeight: 'bold',
  fontSize: '0.9rem',
};

const DashboardHeader = ({ title, links }) => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const { userDetails } = useContext(AuthContext);
  const { activeRole } = useContext(ActiveRoleContext);

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  // Role-aware global filtering
  const filteredLinks = links.filter(([path, label, condition]) => {
    if (typeof condition === 'function') {
      return condition({ userDetails, activeRole });
    }
    return true;
  });

  // Add "Profile" link for any logged-in user
  const finalLinks = [
    ...filteredLinks,
    ["/profile", "Profile"]
  ];

  return (
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
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{title}</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={toggleDrawer(true)} sx={{ color: '#c48f8f' }}>
            <MenuIcon />
          </IconButton>

          <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
            <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
              <List>
                {finalLinks.map(([path, label]) => (
                  <ListItem button key={path} component={Link} to={path}>
                    <ListItemText primary={label} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Drawer>

          <RoleSwitcher />
          <LogoutButton />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardHeader;
