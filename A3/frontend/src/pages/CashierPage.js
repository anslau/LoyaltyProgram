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
  Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

function CashierPage() {
  const { token } = useContext(AuthContext);

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

  // Handler for creating a purchase transaction
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
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Cashier Functions
      </Typography>
      <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
        {/* Create Purchase Accordion */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="purchase-content" id="purchase-header">
            <Typography>Create Purchase Transaction</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {purchaseError && <Alert severity="error" sx={{ mb: 2 }}>{purchaseError}</Alert>}
            {purchaseSuccess && <Alert severity="success" sx={{ mb: 2 }}>{purchaseSuccess}</Alert>}
            <Box component="form" onSubmit={handlePurchase} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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

        {/* Process Redemption Accordion */}
        <Accordion sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="redemption-content" id="redemption-header">
            <Typography>Process Redemption</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {redemptionError && <Alert severity="error" sx={{ mb: 2 }}>{redemptionError}</Alert>}
            {redemptionSuccess && <Alert severity="success" sx={{ mb: 2 }}>{redemptionSuccess}</Alert>}
            <Box component="form" onSubmit={handleProcessRedemption} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Redemption Transaction ID"
                value={redemptionId}
                onChange={(e) => setRedemptionId(e.target.value)}
                required
              />
              <Button variant="contained" type="submit">
                Process Redemption
              </Button>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Paper>
    </Box>
  );
}

export default CashierPage;
