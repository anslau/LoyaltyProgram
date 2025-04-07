import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';

// MUI imports
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  Alert,
  Snackbar,
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function CashierPage() {
  const { token } = useContext(AuthContext);

  // State for creating a purchase transaction
  const [purchaseUtorid, setPurchaseUtorid] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [promoIds,       setPromoIds]       = useState('');

  // State for redemption processing
  const [redemptionId, setRedemptionId] = useState('');

  // Success & error states (each step can produce a success or an error)
  const [purchaseError, setPurchaseError] = useState('');
  const [purchaseSuccess, setPurchaseSuccess] = useState('');
  const [redemptionError, setRedemptionError] = useState('');
  const [redemptionSuccess, setRedemptionSuccess] = useState('');

  // CREATE PURCHASE TRANSACTION\
  const handlePurchase = async (e) => {
    e.preventDefault();
    // Clear alerts
    setPurchaseError('');
    setPurchaseSuccess('');

    if (!purchaseUtorid || !purchaseAmount) {
      setPurchaseError('Please fill out all fields for purchase.');
      return;
    }

    try {
      const resp = await fetch('http://localhost:8000/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            type:'purchase',
            utorid: purchaseUtorid,
            spent: parseFloat(purchaseAmount),
            promotionIds: promoIds
                .split(',')
                .map(s=>s.trim())
                .filter(Boolean)
                .map(Number)
        }),
      });
      if (!resp.ok) {
        if (resp.status === 400) {
          throw new Error('Invalid purchase data (could be promotions or invalid amounts).');
        }
        throw new Error('Failed to create purchase transaction.');
      }
      const data = await resp.json();
      // Data should be the newly created transaction.
      // Let’s just say success:
      setPurchaseSuccess(`Purchase #${data.id} created! Earned points: ${data.amount}`);

      // Clear form
      setPurchaseUtorid('');
      setPurchaseAmount('');
    } catch (err) {
      setPurchaseError(err.message);
    }
  };

  // PROCESS A REDEMPTION
  const handleProcessRedemption = async (e) => {
    e.preventDefault();
    // Clear alerts
    setRedemptionError('');
    setRedemptionSuccess('');

    if (!redemptionId) {
      setRedemptionError('Please enter a Redemption Transaction ID.');
      return;
    }

    try {
      const resp = await fetch(`http://localhost:8000/transactions/${redemptionId}/processed`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ processed: true }),
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

      // Clear form
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



// Create Purchase Transaction:
// A simple form that asks for the customer utorid, the amount spent, plus any promotion IDs.
// Sends a POST /transactions with type: "purchase", spent: <amount>, utorid: <customer>.

// Process a Redemption:
// A text field where the cashier can type or paste the redemption’s transaction ID (or scan the user’s QR code).
// Calls PATCH /transactions/:transactionId/processed with {"processed": true}.


// Make sure backend is serving on one port (e.g. 8000) and React app is on 3000. 
// In backend index.js where we are using app.use(cors()), 
// ensure the origin matches http://localhost:3000 (or vice versa).

// If running the frontend on port 3001, then:

// app.use(cors({
//   origin: 'http://localhost:3001',
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true
// }));
// And in the frontend code, fetch calls should point to http://localhost:8000/ or whichever port backend actually listens on.