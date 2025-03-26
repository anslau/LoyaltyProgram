import React from 'react';
import LogoutButton from '../components/auth/LogoutButton';
import '../styles/auth.css';

const Dashboard = () => {
    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav">
                <div className="nav-content">
                    <h1 className="dashboard-title">Dashboard</h1>
                    <LogoutButton />
                </div>
            </nav>
            <div className="dashboard-main">
                {/* dashboard content */}
            </div>
        </div>
    );
};

export default Dashboard;