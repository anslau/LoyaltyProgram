import React, { useContext, useEffect, useState } from 'react';
import { FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import AuthContext from '../context/AuthContext';
import ActiveRoleContext from '../context/ActiveRoleContext';

// Role hierarchy from lowest to highest
const ROLE_HIERARCHY = ['regular', 'organizer', 'cashier', 'manager', 'superuser'];

// Role display names
const ROLE_DISPLAY_NAMES = {
  regular: 'Regular User',
  organizer: 'Event Organizer',
  cashier: 'Cashier',
  manager: 'Manager',
  superuser: 'Super User'
};

const RoleSwitcher = () => {
  const { userDetails } = useContext(AuthContext);
  const { activeRole, changeActiveRole } = useContext(ActiveRoleContext);
  const [availableRoles, setAvailableRoles] = useState([]);

  // Determine available roles when userDetails changes
  useEffect(() => {
    if (userDetails && userDetails.role) {
      // Determine available roles based on user's highest permission
      const userRoleIndex = ROLE_HIERARCHY.indexOf(userDetails.role);
      if (userRoleIndex >= 0) {
        // User can only switch to roles at or below their permission level
        const allowedRoles = ROLE_HIERARCHY.filter((_, index) => index <= userRoleIndex);
        setAvailableRoles(allowedRoles);
      }
    }
  }, [userDetails]);

  const handleRoleChange = (event) => {
    changeActiveRole(event.target.value);
  };

  // Don't render anything if user details or active role aren't loaded yet
  if (!userDetails || !userDetails.role || !activeRole) {
    return null;
  }

  return (
    <FormControl 
      variant="outlined" 
      size="small" 
      sx={{ 
        minWidth: 150,
        marginRight: '20px',
        '& .MuiOutlinedInput-root': {
          color: '#c48f8f',
          '& fieldset': {
            borderColor: '#c48f8f',
          },
          '&:hover fieldset': {
            borderColor: '#c48f8f',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#c48f8f',
          },
        },
        '& .MuiInputLabel-root': {
          color: '#c48f8f',
        },
        '& .MuiInputLabel-root.Mui-focused': {
          color: '#c48f8f',
        },
        '& .MuiSelect-icon': {
          color: '#c48f8f',
        }
      }}
    >
      <InputLabel id="role-switcher-label">Interface</InputLabel>
      <Select
        labelId="role-switcher-label"
        id="role-switcher"
        value={activeRole}
        onChange={handleRoleChange}
        label="Interface"
        sx={{ 
          '& .MuiOutlinedInput-root.Mui-focused': {
            '& fieldset': {
              borderColor: 'rgb(101, 82, 82)', 
            },
          },
          '& label.Mui-focused': {
            color: 'rgb(101, 82, 82)', 
          }
        }}
      >
        {availableRoles.map(role => (
          <MenuItem key={role} value={role}
          sx={{
            '&.Mui-selected': { bgcolor: 'rgba(232, 180, 180, 0.19)' },
            '&.Mui-selected:hover': { bgcolor: 'rgba(232, 180, 180, 0.19)' },
          }}
          >
            {ROLE_DISPLAY_NAMES[role]}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default RoleSwitcher;
