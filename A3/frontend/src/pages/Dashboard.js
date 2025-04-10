import React from 'react';
import { Link } from 'react-router-dom';
import LogoutButton from '../components/auth/LogoutButton';
import '../styles/auth.css';
import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { Grid, Card, CardContent, Typography, Chip } from '@mui/material';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const Dashboard = () => {
    const [transactions, setTransactions] = useState([]);
    const { token } = useContext(AuthContext);

    // fetching the three most recent transactions for the dashboard
    useEffect(() => {
        fetch(`${BACKEND_URL}/users/me/transactions`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                const allTransactions = data.results;
                const recentTransactions = allTransactions.slice(-3).reverse();
                setTransactions(recentTransactions);
            })
            .catch((error) => {
                console.error('Error fetching transactions:', error);
            }
        )
    }, []);

    const chipColour = (type) => {
        switch (type) {
            case 'purchase':
                return 'success';
            case 'adjustment':
                return 'error';
            case 'redemption':
                return 'warning';
            case 'transfer':
                return 'info';
            case 'event':
                return 'primary';
            case 'promotion':
                return 'secondary';
        }
    };

    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav">
                <div className="nav-content">
                    <h1 className="dashboard-title">Dashboard</h1>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Link to="/perks" style={{ marginRight: '20px', textDecoration: 'none', color: '#1976d2', fontWeight: 'bold' }}>
                            What's New
                        </Link>
                        <LogoutButton />
                    </div>
                </div>
            </nav>
            <div className="dashboard-main">
                <h2 className="dashboard-transactions">Your Recent Transactions</h2>
                <div className="transactions-list">
                    {transactions.length > 0 ? (
                        <Grid container spacing={3}>
                        {transactions.map((transaction) => (
                            <Grid item xs={12} sm={6} md={4} key={transaction.id} marginBottom={3}>
                                <Card sx={{ height: '100%' }}>
                                    <CardContent>
                                        <Typography variant="h6" component="div">
                                            Transaction ID: {transaction.id}
                                            <Chip
                                                label={transaction.type}
                                                color={chipColour(transaction.type)}
                                                size= "small"
                                                sx={{ marginLeft: '10px' }}
                                            />
                                        </Typography>

                                        <Typography variant="body2">
                                            <strong>Spent:</strong> {transaction.spent || 'N/A'}
                                        </Typography>

                                        <Typography variant="body2">
                                            <strong>Amount:</strong> {transaction.amount}
                                        </Typography>

                                        <Typography variant="body2">
                                            <strong>Promotions:</strong> {transaction.promotions || 'N/A'}
                                        </Typography>

                                        <Typography variant="body2">
                                            <strong>Remark:</strong> {transaction.remark || 'N/A'}
                                        </Typography>

                                        <Typography variant="body2">
                                            <strong>Created by:</strong> {transaction.createdBy}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                        </Grid>
                    ) : (
                        <p>No recent transactions available.</p>
                    )}
                    <Link to="/users/me/transactions" style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 'bold' }}>
                        View All of Your Transactions
                    </Link>
                    <Link to="/transactions" style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 'bold', marginLeft: '20px' }}>
                        View All Transactions
                    </Link>
                    <Link to="/users" style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 'bold', marginLeft: '20px' }}>
                        View All Users
                    </Link>
                    <Link to="/transfer" style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 'bold', marginLeft: '20px' }}>
                        Transfer Points
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;