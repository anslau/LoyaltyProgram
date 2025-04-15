// src/pages/Dashboard.js
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import LogoutButton from '../components/auth/LogoutButton';
import RoleSwitcher from '../components/RoleSwitcher';
import AuthContext from '../context/AuthContext';
import ActiveRoleContext from '../context/ActiveRoleContext';

import {
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Box,
  Alert,
  TextField,
  CircularProgress
} from '@mui/material';

import QRCode from 'qrcode.react';
import CashierPage from './CashierPage';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const Dashboard = () => {
  const { token, user } = useContext(AuthContext);
  const { activeRole } = useContext(ActiveRoleContext);

  // For points & redemption
  const [points, setPoints] = useState(0);
  const [loadingPoints, setLoadingPoints] = useState(false);
  const [pointsError, setPointsError] = useState('');
  const [redeemAmount, setRedeemAmount] = useState('');
  const [unprocessedRedemption, setUnprocessedRedemption] = useState(null);

  // For user’s 3 most recent transactions
  const [transactions, setTransactions] = useState([]);

  // Fetch user points & check for unprocessed redemption
  useEffect(() => {
    if (!token) return;
    const fetchPointsAndRedemption = async () => {
      try {
        setLoadingPoints(true);
        setPointsError('');

        // 1) Get user data
        const resp = await fetch(`${BACKEND_URL}/users/me`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!resp.ok) {
          throw new Error('Failed to get user data');
        }
        const userData = await resp.json();
        setPoints(userData.points || 0);

        // 2) Check for unprocessed redemption
        const tResp = await fetch(
          `${BACKEND_URL}/users/me/transactions?type=redemption&limit=20`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!tResp.ok) {
          throw new Error('Failed to get redemption transactions');
        }
        const tData = await tResp.json();
        const unprocessed = tData.results.find((tx) => !tx.processedBy);
        setUnprocessedRedemption(unprocessed || null);
      } catch (err) {
        console.error(err);
        setPointsError(err.message);
      } finally {
        setLoadingPoints(false);
      }
    };
    fetchPointsAndRedemption();
  }, [token]);

  // Handle redemption form
  const handleRedeem = async (e) => {
    e.preventDefault();
    setPointsError('');
    if (!redeemAmount) {
      setPointsError('Please enter an amount to redeem.');
      return;
    }
    try {
      const resp = await fetch(`${BACKEND_URL}/users/me/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: 'redemption',
          amount: parseInt(redeemAmount, 10),
        }),
      });
      if (!resp.ok) {
        if (resp.status === 400) {
          throw new Error('Redemption exceeds your points balance');
        }
        throw new Error('Failed to create redemption');
      }
      const data = await resp.json();
      setUnprocessedRedemption(data);
      setRedeemAmount('');
    } catch (err) {
      setPointsError(err.message);
    }
  };

  // Fetch user’s last 3 transactions
  useEffect(() => {
    if (!token) return;
    fetch(`${BACKEND_URL}/users/me/transactions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const text = await response.text();
        return text ? JSON.parse(text) : { results: [] };
      })
      .then((data) => {
        const allTransactions = data.results || [];
        const recent = allTransactions.slice(-3).reverse();
        setTransactions(recent);
      })
      .catch((error) => {
        console.error('Error fetching transactions:', error);
      });
  }, [token]);

  // Helper to color-code transaction chips
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
      default:
        return 'default';
    }
  };

  return (
    <div className="dashboard-container">
      {/* Navigation Bar */}
      <nav className="dashboard-nav">
        <div className="nav-content">
          <h1 className="dashboard-title">Dashboard</h1>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link
              to="/perks"
              style={{
                marginRight: '20px',
                textDecoration: 'none',
                color: '#c48f8f',
                fontWeight: 'bold',
              }}
            >
              What's New
            </Link>
            <RoleSwitcher />
            <Link
              to="/profile"
              style={{
                marginRight: '20px',
                textDecoration: 'none',
                color: '#1976d2',
                fontWeight: 'bold',
              }}
            >
              Profile
            </Link>
            <LogoutButton />
          </div>
        </div>
      </nav>

      {/* Points + Redemption Section */}
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Your Points
        </Typography>
        {loadingPoints ? (
          <CircularProgress />
        ) : (
          <Typography variant="body1" sx={{ mb: 2 }}>
            Current Balance: <strong>{points}</strong> points
          </Typography>
        )}
        {pointsError && <Alert severity="error">{pointsError}</Alert>}

        {/* Redeem Form */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1">Redeem Points</Typography>
          <form onSubmit={handleRedeem}>
            <TextField
              label="Points to Redeem"
              type="number"
              value={redeemAmount}
              onChange={(e) => setRedeemAmount(e.target.value)}
              sx={{ mr: 2, width: 200 }}
            />
            <Button type="submit" variant="contained">
              Submit
            </Button>
          </form>
        </Box>

        {/* Show Unprocessed Redemption (QR) */}
        {unprocessedRedemption && (
          <Box sx={{ mt: 3 }}>
            <Alert severity="info">
              You have a pending redemption request (Transaction #
              {unprocessedRedemption.id}). A cashier can process it.
            </Alert>
            <QRCode
              value={String(unprocessedRedemption.id)}
              size={128}
              includeMargin
            />
          </Box>
        )}
      </Box>

      {/* Recent Transactions */}
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Your Recent Transactions
        </Typography>
        {transactions.length > 0 ? (
          <Grid container spacing={3} sx={{ mb: 2 }}>
            {transactions.map((tx) => (
              <Grid item xs={12} sm={6} md={4} key={tx.id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6">
                      Transaction ID: {tx.id}
                      <Chip
                        label={tx.type}
                        color={chipColour(tx.type)}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                    <Typography variant="body2">
                      <strong>Spent:</strong> {tx.spent || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Amount:</strong> {tx.amount}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Promotions:</strong> {tx.promotions || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Remark:</strong> {tx.remark || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Created by:</strong> {tx.createdBy}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography sx={{ mb: 2 }}>
            No recent transactions available.
          </Typography>
        )}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
          <Link
            to="/users/me/transactions"
            style={{
              textDecoration: 'none',
              color: '#1976d2',
              fontWeight: 'bold',
            }}
          >
            View All of Your Transactions
          </Link>
          
          {activeRole && ['cashier', 'manager', 'superuser'].includes(activeRole) && (
            <Link
              to="/transactions"
              style={{
                textDecoration: 'none',
                color: '#1976d2',
                fontWeight: 'bold',
              }}
            >
              View All Transactions
            </Link>
          )}

          <Link
            to="/promotions"
            style={{
              textDecoration: 'none',
              color: '#1976d2',
              fontWeight: 'bold',
            }}
          >
            View All Promotions
          </Link>

          <Link
            to="/events"
            style={{
              textDecoration: 'none',
              color: '#1976d2',
              fontWeight: 'bold',
            }}
          >
            View All Events
          </Link>

        {activeRole && activeRole === 'organizer' && (
        <Link
            to="/organizer/events"
            style={{
            textDecoration: 'none',
            color: '#1976d2',
            fontWeight: 'bold',
            }}
        >
            Organizer Events
        </Link>
        )}

          {activeRole && ['manager', 'superuser'].includes(activeRole) && (
            <Link
              to="/users"
              style={{
                textDecoration: 'none',
                color: '#1976d2',
                fontWeight: 'bold',
              }}
            >
              View All Users
            </Link>
          )}

          <Link
            to="/transfer"
            style={{
              textDecoration: 'none',
              color: '#1976d2',
              fontWeight: 'bold',
            }}
          >
            Transfer Points
          </Link>
        </Box>

        {activeRole === 'cashier' && <CashierPage />}
      </Box>
    </div>
  );
};

export default Dashboard;
