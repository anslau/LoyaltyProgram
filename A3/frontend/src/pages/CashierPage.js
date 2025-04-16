// src/pages/CashierPage.js
import React, { useState, useContext, useEffect } from 'react';
import QrCode from '../components/qrCode';
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
  Card, 
  CardContent
} from '@mui/material';

import { useNavigate } from 'react-router-dom';
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

  // QR code
  const [qrCodeOpen, setQrCodeOpen] = useState(false);

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
    const fetchPendingRedemption = async () => {
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
    };

    fetchPendingRedemption();
    const interval = setInterval(fetchPendingRedemption, 100000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    
<Box sx={{ maxWidth: 800, ml: 0, mr: 2, my: 4 }}>
  <Typography variant="h6" sx={{ mb: 3 }}>
    Cashier Tools
  </Typography>

   {/* Register New User Button */}
   <Button
    variant="outlined"
    onClick={() => navigate('/register')}
    sx={{
      mb: 4,
      px: 4,
      color: 'rgb(101, 82, 82)',
      borderColor: 'rgb(101, 82, 82)',
      '&:hover': { backgroundColor: '#c48f8f' },
    }}
  >
    Register New User
  </Button>

  {/* Pending Redemptions Section */}
  <Card sx={{ mb: 4 }}>
    <CardContent>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Pending Redemption Requests
      </Typography>
      {pendingRequests.length === 0 ? (
        <Alert severity="info">No pending redemption requests at this time.</Alert>
      ) : (
        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2', textAlign: 'left' }}>
                <th style={{ padding: '8px', textAlign: 'center'  }}>Transaction ID</th>
                <th style={{ padding: '8px', textAlign: 'center'  }}>User</th>
                <th style={{ padding: '8px', textAlign: 'center'  }}>Type</th>
                <th style={{ padding: '8px', textAlign: 'center'  }}>Amount</th>
                <th style={{ padding: '8px', textAlign: 'center'  }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests
                .filter((tx) => tx.type === 'redemption')
                .map((request) => (
                  <tr key={request.id}>
                    <td 
                    onClick={() => setQrCodeOpen(true)}
                    style={{
                        padding: '8px',
                        color: '#de9c9c',             
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontWeight: 500,
                        transition: 'color 0.3s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#d88888'}  
                    onMouseLeave={e => e.currentTarget.style.color = '#de9c9c'}
                    >
                    <div style={{ textAlign: 'center' }}>{request.id} </div>
                    </td>

                    <QrCode open={qrCodeOpen} onClose={() => setQrCodeOpen(false)} redemption={request} />
                    <td style={{ padding: '8px', textAlign: 'center'  }}>{request.utorid || request.createdBy || '—'}</td>
                    <td style={{ padding: '8px', textAlign: 'center'  }}>{request.type}</td>
                    <td style={{ padding: '8px', textAlign: 'center'  }}>{request.amount}</td>
                    <td style={{ padding: '8px', textAlign: 'center'  }}>
                    <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleAccept(request.id)}
                        style={{
                            backgroundColor: '#c48f8f',
                            color: '#f9f9f9',
                            textTransform: 'none',
                            fontWeight: 500
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#a36d6d'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#c48f8f'}
                        >
                        Process
                        </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </Box>
      )}
    </CardContent>
  </Card>

  {/* Accordion: Process Redemption by ID */}
  <Accordion>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography>Process Redemption by ID</Typography>
    </AccordionSummary>
    <AccordionDetails>
      {redemptionError && <Alert severity="error" sx={{ mb: 2 }}>{redemptionError}</Alert>}
      {redemptionSuccess && <Alert severity="success" sx={{ mb: 2 }}>{redemptionSuccess}</Alert>}
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
          sx={fieldStyle}
        />
        <Button
          variant="contained"
          type="submit"
          sx={{ backgroundColor: '#ebc2c2', color: 'rgb(101, 82, 82)' }}
        >
          Process
        </Button>
      </Box>
    </AccordionDetails>
  </Accordion>

    {/* Accordion: Create Purchase */}
    <Accordion>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography>Create Purchase Transaction</Typography>
    </AccordionSummary>
    <AccordionDetails>
      {purchaseError && <Alert severity="error" sx={{ mb: 2 }}>{purchaseError}</Alert>}
      {purchaseSuccess && <Alert severity="success" sx={{ mb: 2 }}>{purchaseSuccess}</Alert>}
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
          sx={fieldStyle}
        />
        <TextField
          label="Amount Spent (e.g. 19.99)"
          type="number"
          value={purchaseAmount}
          onChange={(e) => setPurchaseAmount(e.target.value)}
          required
          sx={fieldStyle}
        />
        <TextField
          label="Promotion IDs (comma‑sep, optional)"
          value={promoIds}
          onChange={(e) => setPromoIds(e.target.value)}
          sx={fieldStyle}
        />
        <Button
          variant="contained"
          type="submit"
          sx={{ backgroundColor: '#ebc2c2', color: 'rgb(101, 82, 82)' }}
        >
          Submit Purchase
        </Button>
      </Box>
    </AccordionDetails>
  </Accordion>
  
</Box>

  );
}

export default CashierPage;
