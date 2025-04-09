import React from 'react';
import { Link } from 'react-router-dom';
import LogoutButton from '../components/auth/LogoutButton';
import '../styles/auth.css';

const Dashboard = () => {
    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav">
                <div className="nav-content">
                    <h1 className="dashboard-title">Dashboard</h1>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Link to="/perks" style={{ marginRight: '20px', textDecoration: 'none', color: '#c48f8f', fontWeight: 'bold' }}>
                            What's New
                        </Link>
                        <LogoutButton />
                    </div>
                </div>
            </nav>
            <div className="dashboard-main">
                {/* dashboard content */}
            </div>
        </div>
    );
};

export default Dashboard;