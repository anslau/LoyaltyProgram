import React, { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

// Set this to true to bypass authentication in development
const BYPASS_AUTH = process.env.REACT_APP_BYPASS_AUTH === 'true';

const ProtectedRoute = ({ children, roles = [] }) => {
    // TEMPORARY: Skip authentication for testing
    /*
    if (children) {
        return children;
    }
    return <Outlet />;
    */
    
    // Comment out the authentication logic during testing
    const { token, user, expiresAt, logout, loading } = React.useContext(AuthContext);
    console.log("ProtectedRoute: token =", token);
    console.log("ProtectedRoute: expiresAt =", expiresAt, " Current Date =", new Date());

    if (loading) return <div>Loading...</div>;
    
    const isTokenValid = token && new Date(expiresAt) > new Date();

    // useEffect(() => {
    //     if (!loading && !(token && new Date(expiresAt) > new Date())) {
    //       logout();
    //     }
    // }, [loading, token, expiresAt, logout]);

  
    if (!isTokenValid) {
      return <Navigate to="/login" />;
    }

    // user authentication
    // if (!user) {
    //     return <Navigate to="/login" />;
    // }
    
    // role-based authorization
    // if (roles.length > 0 && !roles.includes(user.role)) {
    //     return <Navigate to="/unauthorized" />;  # not implemented
    // }
    //
    // Usage:
    // <Route element={<ProtectedRoute roles={['Manager', 'Superuser']} />}>
    //     <Route path="/admin" element={<AdminDashboard />} />
    // </Route>

    // if this component is used as a wrapper (with children)
    if (children) {
        return children;
    }

    // if this component is used as an outlet wrapper
    return <Outlet />;
};

export default ProtectedRoute; 