import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/auth.css';

const LogoutButton = () => {
    const navigate = useNavigate();
    const { setToken } = useAuth();

    const handleLogout = () => {
        // remove the token from localStorage
        localStorage.removeItem('token');
        // reset auth context
        setToken(null);
        // redirect to login page
        navigate('/login');
    };

    return (
        <button
            onClick={handleLogout}
            className="logout-button"
        >
            Logout
        </button>
    );
};

export default LogoutButton; 