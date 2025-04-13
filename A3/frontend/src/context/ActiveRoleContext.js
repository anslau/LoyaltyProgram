import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthContext from './AuthContext';

// Create ActiveRoleContext
export const ActiveRoleContext = createContext();

// ActiveRoleProvider component to wrap app
export const ActiveRoleProvider = ({ children }) => {
  const { userDetails } = useContext(AuthContext);
  const [activeRole, setActiveRole] = useState(null);

  // Initialize active role when userDetails changes
  useEffect(() => {
    if (userDetails && userDetails.role) {
      // Check if there's a stored active role in localStorage
      const storedRole = localStorage.getItem('activeRole');
      
      // Verify the stored role is valid for this user (not higher than their actual role)
      const roleHierarchy = ['regular', 'cashier', 'manager', 'superuser'];
      const userRoleIndex = roleHierarchy.indexOf(userDetails.role);
      const storedRoleIndex = roleHierarchy.indexOf(storedRole);
      
      // Use stored role if valid, otherwise use user's actual role
      if (storedRole && storedRoleIndex >= 0 && storedRoleIndex <= userRoleIndex) {
        setActiveRole(storedRole);
      } else {
        setActiveRole(userDetails.role);
        localStorage.setItem('activeRole', userDetails.role);
      }
    }
  }, [userDetails]);

  // Function to change the active role
  const changeActiveRole = (newRole) => {
    setActiveRole(newRole);
    localStorage.setItem('activeRole', newRole);
  };

  return (
    <ActiveRoleContext.Provider value={{ activeRole, changeActiveRole }}>
      {children}
    </ActiveRoleContext.Provider>
  );
};

export default ActiveRoleContext;
