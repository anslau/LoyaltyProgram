import { useState, useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import { Box, Grid, Paper, Typography, TextField, Button, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const TransferPoints = () => {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();
    const [sender, setSender] = useState('');
    const [transferData, setTransferData] = useState({
        type: 'transfer',
        amount: '',
        remark: '',
        recipientId: ''
    });

    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    // get the logged in user details
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/users/me`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user');
                }

                const data = await response.json();
                setSender(data);

            } catch (error) {
                setError(error.message);
            }
        };
        fetchUser();
    }, [token]);

    // check that the user has enough points
    const validatePoints = (points) => {
        return sender.points >= Number(points);
    }

    // check the user inputs are valid
    const validateInputs = () => {
        if (Number(transferData.recipientId) < 0){
            setError('Recipient ID must be a positive number');
            return false;
        }
        if (Number(transferData.amount) < 0) {
            setError('Amount must be a positive number');
            return false;
        }
        return true;
    }

    // handle the transfer points
    const handleTransfer = async (e) => {
        e.preventDefault();

        if (!validatePoints(transferData.amount)) {
            setError('Insufficient points to transfer');
            return;
        }

        if (!validateInputs()) {
            return;
        }

        setLoading(true);

        try {
            const payload = {
                type: 'transfer',
                amount: Number(transferData.amount),
                remark: transferData.remark || '',
            };
            console.log('Payload:', payload);
            
            const recipientId = transferData.recipientId;

            const response = await fetch(`${BACKEND_URL}/users/${recipientId}/transactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.message);
                return;
            }
            const data = await response.json();
            setSuccess(true);

            setTimeout(() => {
                navigate('/dashboard');
            }
            , 2000);

        } catch (error) {
            setError(error.message);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
            <Paper elevation={3} sx={{ padding: 2 }}>
                <Box component={'form'} onSubmit={handleTransfer} sx={{ mt: 3 }}>
                    <Typography variant="h5" gutterBottom>Transfer Points</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={8}>
                            <TextField
                                label="Recipient ID"
                                value={transferData.recipientId}
                                type="number"
                                onChange={(e) => {
                                    setTransferData({ ...transferData, recipientId: e.target.value });
                                    setError('');
                                    setSuccess(false);
                                }}
                                slotProps=
                                {{
                                    input: {
                                        min: 0,
                                    },
                                }}
                                fullWidth
                                required
                                sx={{ mb: 1,
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
                        </Grid>

                        <Grid item xs={12} sm={8}>
                            <TextField
                                label="Transaction Type"
                                value={transferData.type}
                                type="text"
                                disabled
                                fullWidth
                                sx={{ mb: 1,
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
                        </Grid>

                        <Grid item xs={12} sm={8}>
                            <TextField
                                label="Amount"
                                value={transferData.amount}
                                type="number"
                                onChange={(e) => {
                                    setTransferData({ ...transferData, amount: e.target.value });
                                    setError('');
                                    setSuccess(false);
                                }}
                                slotProps=
                                {{
                                    input: {
                                        min: 0,
                                    },
                                }}
                                fullWidth
                                required
                                sx={{ mb: 1,
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
                        </Grid>

                        <Grid item xs={12} sm={8}>
                            <TextField
                                label="Remark"
                                value={transferData.remark}
                                onChange={(e) => {
                                    setTransferData({ ...transferData, remark: e.target.value });
                                    setError('');
                                    setSuccess(false);
                                }}
                                fullWidth
                                sx={{ mb: 1,
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
                        </Grid>

                        <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/dashboard')}
                                disabled={loading}
                                sx={{ px: 4, color: 'rgb(101, 82, 82)', borderColor: 'rgb(101, 82, 82)' }}
                            >
                                Back
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={loading}
                                sx={{backgroundColor: '#ebc2c2', color: 'rgb(101, 82, 82)'}}
                            >
                                {loading ? 'Transferring...' : 'Transfer'}
                            </Button>
                        </Grid>
                    </Grid>

                    {error && (
                        <Grid item xs={12} sx={{ mt: 2 }}>
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {error}
                            </Alert>
                        </Grid>
                    )}

                    {success && (
                        <Grid item xs={12} sx={{ mt: 2 }}>
                            <Alert severity="success" sx={{ mt: 2 }}>
                                Points transferred successfully! Redirecting to dashboard...
                            </Alert>
                        </Grid>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export default TransferPoints;