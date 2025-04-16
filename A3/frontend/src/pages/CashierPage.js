// src/pages/CashierPage.js
import React, { useState, useContext, useEffect } from 'react';
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
  
  const [pendingRequests, setPendingRequests] = useState([]);

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

  const handleAccept = async (id) => {
    try {
      const resp = await fetch(`${BACKEND_URL}/transactions/${id}/processed`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ processed: true })
      });
  
      if (!resp.ok) throw new Error('Failed to accept redemption request');
  
      setPendingRequests(prev => prev.filter(req => req.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

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
      setPurchaseSuccess(`Purchase #${data.id} created! Earned points: ${data.earned}`);
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


  useEffect(() => {
    console.log('Token in CashierPage:', token);
    fetch(`${BACKEND_URL}/transactions/pending`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }   
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch pending redemption requests');
        }
        return res.json();
      })
      .then((data) => {
        setPendingRequests(data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);
  
  return (
    <Box sx={{ maxWidth: 600, margin: '0 auto', mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
            Transaction/Redemption
        </Typography>

        {/* pending redemptions */}

        <section className="pending-redemptions">
            <h3>Pending Redemption Requests</h3>
            {pendingRequests.length === 0 ? (
                <p>No pending redemption requests.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f2f2f2', textAlign: 'left' }}>
                    <th style={{ padding: '8px' }}>Transaction ID</th>
                    <th style={{ padding: '8px' }}>User</th>
                    <th style={{ padding: '8px' }}>Type</th>
                    <th style={{ padding: '8px' }}>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {pendingRequests.map((request) => (
                    <tr key={request.id} style={{ borderBottom: '1px solid #ddd' }}>
                        <td style={{ padding: '8px' }}>{request.id}</td>
                        <td style={{ padding: '8px' }}>{request.utorid || request.createdBy || '—'}</td>
                        <td style={{ padding: '8px', textTransform: 'capitalize' }}>{request.type}</td>
                        <td style={{ padding: '8px' }}>{request.amount}</td>
                        <td style={{ padding: '8px' }}>
                        </td>
                        <td style={{ padding: '8px' }}>
                        <Button
                            size="small"
                            variant="contained"
                            color="success"
                            sx={{ mr: 1 }}
                            onClick={() => handleAccept(request.id)}
                        >
                            Accept
                        </Button>
                        </td>

                    </tr>
                    ))}
                </tbody>
                </table>
            )}
            </section>


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
                sx={{
                  '& .MuiOutlinedInput-root.Mui-focused': {
                      '& fieldset': {
                          borderColor: 'rgb(101, 82, 82)',
                      },
                  },
                  '& label.Mui-focused': {
                      color: 'rgb(101, 82, 82)',
                  }
                }}
                />
                <TextField
                label="Amount Spent (e.g. 19.99)"
                type="number"
                value={purchaseAmount}
                onChange={(e) => setPurchaseAmount(e.target.value)}
                required
                sx={{
                  '& .MuiOutlinedInput-root.Mui-focused': {
                      '& fieldset': {
                          borderColor: 'rgb(101, 82, 82)',
                      },
                  },
                  '& label.Mui-focused': {
                      color: 'rgb(101, 82, 82)',
                  }
                }}
                />
                <TextField
                    label="Promotion IDs (comma‑sep, optional)"
                    value={promoIds}
                    onChange={(e) => setPromoIds(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root.Mui-focused': {
                          '& fieldset': {
                              borderColor: 'rgb(101, 82, 82)',
                          },
                      },
                      '& label.Mui-focused': {
                          color: 'rgb(101, 82, 82)',
                      }
                    }}
                />
                <Button variant="contained" type="submit" sx={{ backgroundColor: '#ebc2c2', color: 'rgb(101, 82, 82)' }}>
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
                sx={{
                  '& .MuiOutlinedInput-root.Mui-focused': {
                      '& fieldset': {
                          borderColor: 'rgb(101, 82, 82)',
                      },
                  },
                  '& label.Mui-focused': {
                      color: 'rgb(101, 82, 82)',
                  }
                }}
            />
            <Button variant="contained" type="submit" sx={{ backgroundColor: '#ebc2c2', color: 'rgb(101, 82, 82)' }}>
                Process
            </Button>
            </Box>
            </AccordionDetails>
        </Accordion>
    </Box>
  );
}

export default CashierPage;
