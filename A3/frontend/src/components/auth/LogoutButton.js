import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import '../../styles/auth.css';

const LogoutButton = () => {
    const navigate = useNavigate();
    const { logout } = React.useContext(AuthContext);

    const handleLogout = () => {
        // the AuthContext logout 
        logout();
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