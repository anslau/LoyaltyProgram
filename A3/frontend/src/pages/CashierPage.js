// src/pages/CashierPage.js
import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  Alert,
} from '@mui/material';

import { useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

function CashierPage() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  // States for creating a purchase transaction
  const [purchaseUtorid, setPurchaseUtorid] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [promoIds, setPromoIds] = useState('');
  const [purchaseError, setPurchaseError] = useState('');
  const [purchaseSuccess, setPurchaseSuccess] = useState('');

  // States for processing a redemption
  const [redemptionId, setRedemptionId] = useState('');
  const [redemptionError, setRedemptionError] = useState('');
  const [redemptionSuccess, setRedemptionSuccess] = useState('');

  // CREATE PURCHASE TRANSACTION
  const handlePurchase = async (e) => {
    e.preventDefault();
    setPurchaseError('');
    setPurchaseSuccess('');

    if (!purchaseUtorid || !purchaseAmount) {
      setPurchaseError('Please fill out all fields for purchase.');
      return;
    }

    try {
      const resp = await fetch(`${BACKEND_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'purchase',
          utorid: purchaseUtorid,
          spent: parseFloat(purchaseAmount),
          promotionIds: promoIds
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
            .map(Number)
        })
      });

      if (!resp.ok) {
        if (resp.status === 400) {
          throw new Error('Invalid purchase data (could be promotions or invalid amounts).');
        }
        throw new Error('Failed to create purchase transaction.');
      }

      const data = await resp.json();
      setPurchaseSuccess(`Purchase #${data.id} created! Earned points: ${data.amount}`);
      setPurchaseUtorid('');
      setPurchaseAmount('');
      setPromoIds('');
      setPromoIds('');
    } catch (err) {
      setPurchaseError(err.message);
    }
  };

  // Handler for processing a redemption transaction
  const handleProcessRedemption = async (e) => {
    e.preventDefault();
    setRedemptionError('');
    setRedemptionSuccess('');

    if (!redemptionId) {
      setRedemptionError('Please enter a Redemption Transaction ID.');
      return;
    }

    try {
      const resp = await fetch(`${BACKEND_URL}/transactions/${redemptionId}/processed`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ processed: true })
      });

      if (!resp.ok) {
        if (resp.status === 400) {
          throw new Error('Transaction not eligible for processing (maybe not redemption or already processed).');
        } else if (resp.status === 404) {
          throw new Error('Redemption transaction not found.');
        }
        throw new Error('Failed to process redemption.');
      }

      const data = await resp.json();
      setRedemptionSuccess(`Redemption #${data.id} processed successfully for user: ${data.utorid}.`);
      setRedemptionId('');
    } catch (err) {
      setRedemptionError(err.message);
    }
  };

  
  return (
    <Box sx={{ maxWidth: 600, margin: '0 auto', mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
            Cashier Dashboard
        </Typography>

        {/* New Button to navigate to user registration */}
        <Button
            variant="outlined"
            sx={{
            mt: 2,
            mb: 4,
            px: 4,
            color: 'rgb(101, 82, 82)',
            borderColor: 'rgb(101, 82, 82)',
            '&:hover': { backgroundColor: '#c48f8f' }
            }}
            onClick={() => navigate('/register')}
        >
            Register New User
        </Button>

        {/* ACCORDION 1: CREATE PURCHASE */}
        <Accordion>
            <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
            >
            <Typography>Create Purchase Transaction</Typography>
            </AccordionSummary>
            <AccordionDetails>
            {purchaseError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                {purchaseError}
                </Alert>
            )}
            {purchaseSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                {purchaseSuccess}
                </Alert>
            )}

            <Box
                component="form"
                onSubmit={handlePurchase}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
                <TextField
                label="Customer Utorid"
                value={purchaseUtorid}
                onChange={(e) => setPurchaseUtorid(e.target.value)}
                required
                />
                <TextField
                label="Amount Spent (e.g. 19.99)"
                type="number"
                value={purchaseAmount}
                onChange={(e) => setPurchaseAmount(e.target.value)}
                required
                />
                <TextField
                    label="Promotion IDs (comma‑sep, optional)"
                    value={promoIds}
                    onChange={(e) => setPromoIds(e.target.value)}
                />
                <Button variant="contained" type="submit">
                Submit Purchase
                </Button>
            </Box>
            </AccordionDetails>
        </Accordion>

        {/* ACCORDION 2: PROCESS REDEMPTION */}
        <Accordion>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2a-content"
                id="panel2a-header"
            >
            <Typography>Process Redemption</Typography>
            </AccordionSummary>
            <AccordionDetails>
            {redemptionError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                {redemptionError}
                </Alert>
            )}
            {redemptionSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                {redemptionSuccess}
                </Alert>
            )}

            <Box
                component="form"
                onSubmit={handleProcessRedemption}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
                
            <TextField
                label="Redemption Transaction ID"
                value={redemptionId}
                onChange={(e) => setRedemptionId(e.target.value)}
                required
            />
            <Button variant="contained" type="submit">
                Process
            </Button>
            </Box>
            </AccordionDetails>
        </Accordion>
    </Box>
  );
}

export default CashierPage;
