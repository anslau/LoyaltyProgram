import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ActiveRoleContext from '../context/ActiveRoleContext';
import RoleSwitcher from '../components/RoleSwitcher';
import LogoutButton from '../components/auth/LogoutButton';
import QRCode from '../components/qrCode';
import CashierPage from './CashierPage';
import DashboardHeader from '../components/dashboardHeader';

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
  CircularProgress, 
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const fieldStyle = {
    '& .MuiOutlinedInput-root.Mui-focused': {
      '& fieldset': {
        borderColor: 'rgb(101, 82, 82)',
      },
    },
    '& label.Mui-focused': {
      color: 'rgb(101, 82, 82)',
    },
  };

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const Dashboard = () => {
  const { token, userDetails } = useContext(AuthContext);
  const { activeRole } = useContext(ActiveRoleContext);

  // Single, unified loading + error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Points & redemption
  const [points, setPoints] = useState(0);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [unprocessedRedemption, setUnprocessedRedemption] = useState(null);

  // Last 3 transactions
  const [transactions, setTransactions] = useState([]);

  // 1) Fetch points + check for unprocessed redemption
  const fetchPointsAndRedemption = async () => {
    try {
      setError('');
      // Get user details from /users/me
      // (You already have userDetails in AuthContext, but re-checking is okay
      //  or you could rely on userDetails directly if it has .points.)
      const resp = await fetch(`${BACKEND_URL}/users/me`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!resp.ok) {
        throw new Error('Failed to get user data');
      }
      const data = await resp.json();
      setPoints(data.points || 0);

      // Check if user has an unprocessed redemption (type=redemption & !processedBy)
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
      setError(err.message);
    }
  };

  // 2) Handle redemption form
  const handleRedeem = async (e) => {
    e.preventDefault();
    setError('');
    if (!redeemAmount) {
      setError('Please enter an amount to redeem.');
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
      console.error(err);
      setError(err.message);
    }
  };

  // 3) Fetch user’s last 3 transactions
  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/users/me/transactions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Error fetching transactions');
      }
      const data = await response.json();
      const all = data.results || [];
      const recent = all.slice(-3).reverse();
      setTransactions(recent);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  useEffect(() => {
    const fetchUnprocessedRedemption = async () => {
      const resp = await fetch(`${BACKEND_URL}/users/me/transactions?type=redemption`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await resp.json();
      const pending = data.results.find(tx => tx.processedBy === null);
      setUnprocessedRedemption(pending || null);
    };
  
    fetchUnprocessedRedemption();
    
    // recheck every 5 seconds
    const interval = setInterval(fetchUnprocessedRedemption, 5000);
    return () => clearInterval(interval);
  }, []);  

  useEffect(() => {
    if (!token) return;

    const fetchAllData = async () => {
      setLoading(true);
      setError('');
      try {
        await fetchPointsAndRedemption();
        await fetchTransactions();
      } catch (err) {
        // We already set error in each function's catch
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
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
      case 'promotion':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <div className="dashboard-container">
        <DashboardHeader title="Dashboard" />



      {/* Welcome back + Role */}
      <Box sx={{
            borderRadius: 2, 
            marginBottom: 3,
            maxWidth: '800px',
            margin: '0 auto',
            px: 4,
            py: 4,}}>
        {!loading ? (
          <>
            <Typography variant="h4" sx={{ mb: 2 }}>
              Welcome back, {userDetails?.name}!
            </Typography>
            <Typography variant="h5" sx={{ mb: 2 }}>
              This is your {activeRole} dashboard.
            </Typography>
          </>
        ) : (
          <CircularProgress />
        )}

        {/* Show error if any */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {/* Points & Redemption Section */}
        <Typography variant="h6" sx={{ mt: 4 }}>
          Your Points
        </Typography>
        {!loading && (
          <Typography variant="body1" sx={{ mb: 2 }}>
            Current Balance: <strong>{points}</strong> points
          </Typography>
        )}

        {/* Redeem Form */}
        <Accordion sx={{ mt: 4 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Redeem Points</Typography>
        </AccordionSummary>
        <AccordionDetails>
            {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error}
            </Alert>
            )}

            <Box
            component="form"
            onSubmit={handleRedeem}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
            <TextField
                label="Points to Redeem"
                type="number"
                value={redeemAmount}
                onChange={(e) => setRedeemAmount(e.target.value)}
                required
                sx={fieldStyle}
            />
            <Button
                type="submit"
                variant="contained"
                sx={{ backgroundColor: '#ebc2c2', color: 'rgb(101, 82, 82)' }}
            >
                Submit
            </Button>
            </Box>
        </AccordionDetails>
        </Accordion>


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
      <Box sx={{ overflowX: 'auto', maxWidth: '800px',
        margin: '0 auto',
        px: 4,
        pb: 4,}}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Your Recent Transactions
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : transactions.length > 0 ? (
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

        {/* Cashier Functions */}
        {activeRole === 'cashier' && <CashierPage />}
      </Box>
    </div>
  );
};

export default Dashboard;