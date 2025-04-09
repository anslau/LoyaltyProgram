import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext'; 
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode.react'; 
import { Button, TextField, Typography, Alert, Box } from '@mui/material';

function PointsDashboard() {
  const { token } = useContext(AuthContext);

  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // For redemption
  const [redeemAmount, setRedeemAmount] = useState('');
  const [unprocessedRedemption, setUnprocessedRedemption] = useState(null);

  // Fetch user data so we can display points.
  // We also check if there's an unprocessed redemption in their transaction list
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError('');

        // Get /users/me to find current user’s points
        const resp = await fetch('http://localhost:3000/users/me', {
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

        // Next, check if user has any unprocessed redemption:
        //   - We do GET /users/me/transactions?type=redemption
        //   - Filter to see if processedBy is null
        //     or if some boolean indicates unprocessed
        const tResp = await fetch(
          'http://localhost:3000/users/me/transactions?type=redemption&limit=20',
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
        // we look for a redemption that has not been processed
        // i.e. it won't have processedBy or redeemed or something
        const unprocessed = tData.results.find(
          (tx) => !tx.processedBy // or check "redeemed" field if it’s null
        );
        if (unprocessed) {
          setUnprocessedRedemption(unprocessed);
        } else {
          setUnprocessedRedemption(null);
        }

      } catch (err) {
        console.error(err);
        setError(err.message || 'Error fetching user data');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUserData();
    }
  }, [token]);

  // Handle creating a redemption request
  const handleRedeem = async (e) => {
    e.preventDefault();
    setError('');
    if (!redeemAmount) {
      setError('Please enter an amount to redeem');
      return;
    }
    try {
      const resp = await fetch('http://localhost:3000/users/me/transactions', {
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
          throw new Error('Redemption request exceeds your points balance');
        }
        throw new Error('Failed to create redemption');
      }
      const data = await resp.json();
      // This is the newly created redemption transaction
      setUnprocessedRedemption(data);
      // clear the input
      setRedeemAmount('');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4">Points Dashboard</Typography>
      {error && <Alert severity="error">{error}</Alert>}

      <Typography variant="h6" sx={{ mt: 2 }}>
        Current Balance: {points} points
      </Typography>

      {/* (1) Redeem Points Form */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1">Redeem Points</Typography>
        <form onSubmit={handleRedeem}>
          <TextField
            label="Points to Redeem"
            value={redeemAmount}
            onChange={(e) => setRedeemAmount(e.target.value)}
            type="number"
            sx={{ mr: 2, width: 200 }}
          />
          <Button type="submit" variant="contained">
            Submit Redemption
          </Button>
        </form>
      </Box>

      {/* (2) Show Unprocessed Redemption QR */}
      {unprocessedRedemption && (
        <Box sx={{ mt: 3 }}>
          <Alert severity="info">
            You have a pending redemption request (Transaction #{unprocessedRedemption.id}).
            A cashier can scan this QR code or look it up to process it.
          </Alert>

          <QRCode
            value={String(unprocessedRedemption.id)}
            size={128}
            includeMargin
          />
        </Box>
      )}
    </Box>
  );
}

export default PointsDashboard;

// Fetch the user’s latest data (to get their points).
// Fetching user points: We call GET /users/me to fetch the current user’s up-to-date points balance.

// Checking for unprocessed redemption: 
// We fetch own transactions with GET /users/me/transactions?type=redemption. 
// If any are unprocessed, we store the first one in unprocessedRedemption.

// Let them submit a “redemption” request via POST /users/me/transactions.
// If a redemption is unprocessed, display a QR code for that transaction.

// Creating a redemption: Submitting the form calls POST /users/me/transactions 
// with {type: "redemption", amount: <...>}, which (if successful) returns the newly 
// created redemption transaction. Store it in unprocessedRedemption, to immediately display its QR code.

// QR Code: 
// For generating a QR code in React, we can use the qrcode.react library. 
// install it with npm install qrcode.react.
// The QRCode component from qrcode.react simply encodes the transaction ID. 
// The cashier then can look it up or scan it to process the redemption.
