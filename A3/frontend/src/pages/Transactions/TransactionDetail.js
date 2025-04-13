import React from 'react';
import { useContext, useEffect, useState } from 'react';
import { Box, Typography, IconButton, Paper, Chip, Grid, Divider, CircularProgress, Button, TextField, Alert } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const TransactionDetail = () => {
    const { transactionId } = useParams();
    const navigate = useNavigate();
    const { token, user } = useContext(AuthContext);

    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // setting/unsetting suspicious
    const [suspicious, setSuspicious] = useState(transaction?.suspicious ?? false);

    // for creating an adjustment transaction for this transaction
    const [creatingAdjustment, setCreatingAdjustment] = useState(false);
    const [adjustmentError, setAdjustmentError] = useState(null);
    const [adjustmentData, setAdjustmentData] = useState({
        utorid: '',
        type: 'adjustment',
        amount: '',
        relatedId: transactionId,
        remark: '',
        promotionIds: []
    });
    const [adjustmentLoading, setAdjustmentLoading] = useState(false);
    const [adjustmentSuccess, setAdjustmentSuccess] = useState(false);

    // get the transaction
    useEffect(() => {
        setLoading(true);
        const fetchTransaction = async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/transactions/${transactionId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch transaction');
                }

                const data = await response.json();
                setTransaction(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTransaction();
    }, [transactionId, token]);

    // set suspicious state when transaction changes
    useEffect(() => {
        if (transaction) {
            setSuspicious(transaction.suspicious);
        }
    }, [transaction]);

    const handleSuspiciousChange = async () => {
        const newSuspicious = !suspicious;
        try {
            const response = await fetch(`${BACKEND_URL}/transactions/${transactionId}/suspicious`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ suspicious: newSuspicious }),
            });

            if (!response.ok) {
                throw new Error('Failed to update transaction');
            }

            const data = await response.json();
            setSuspicious(data.suspicious);
        } catch (error) {
            setError(error.message);
        }
    };

    const validateAdjustmentData = () => {
        // if (!adjustmentData.utorid) {
        //     setAdjustmentError('Utorid is required');
        //     return false;
        // }
        if (!adjustmentData.amount) {
            setAdjustmentError('Amount is required');
            return false;
        }

        return true;
    };

    // create an adjustment transaction
    const handleCreateAdjustment = async (e) => {
        e.preventDefault();
        if (!validateAdjustmentData()) {
            return;
        }

        setAdjustmentLoading(true);
        try {
            const newAdjustment = {
                utorid: transaction.utorid,
                type: "adjustment",
                relatedId: Number(transactionId),
                amount: Number(adjustmentData.amount),
                promotionIds: adjustmentData.promotionIds,
                remark: adjustmentData.remark,
            };

            const response = await fetch(`${BACKEND_URL}/transactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newAdjustment),
            });
            if (!response.ok) {
                setAdjustmentLoading(false);
                setAdjustmentSuccess(false);
                setAdjustmentError('Your promotion IDs are invalid. Please try again.');

                // reset form data
                setAdjustmentData({
                    utorid: '',
                    amount: '',
                    promotionIds: '',
                    remark: '',
                });
                return;

            }

            const data = await response.json();

            setAdjustmentData(data);
            setAdjustmentLoading(false);
            setCreatingAdjustment(false);
            setAdjustmentSuccess(true);

            setTimeout(() => {
                navigate('/transactions');
            }, 2000);

        } catch (error) {
            setAdjustmentError(error.message);
        }
    };


    // default colours for certain transaction types
    const chipColour = (type) => {
        switch (type) {
            case 'purchase': return 'success';
            case 'adjustment': return 'error';
            case 'redemption': return 'warning';
            case 'transfer': return 'info';
            case 'event': return 'primary';
            case 'promotion': return 'secondary';
            default: return 'default';
        }
    };

    return (
        <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={() => navigate('/transactions')} sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4">Transaction Details</Typography>
            </Box>

            {loading ? (
                <Typography variant="body1"><CircularProgress /></Typography>
            ) : error ? (
                <Typography variant="body1" color="error">{error}</Typography>
            ) : !transaction ? (
                <Typography variant="body1">No transaction found.</Typography>
            ) : (
                <>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                            <Box>
                                <Typography variant="h5" gutterBottom>Transaction {transactionId}</Typography>
                                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                    <Chip
                                        label={transaction.type}
                                        color={chipColour(transaction.type)}
                                        size="small"
                                    />
                                    <Chip
                                        label={suspicious ? 'Suspicious' : 'Not Suspicious'}
                                        color={suspicious ? 'error' : 'success'}
                                        variant="outlined"
                                        size="small"
                                    />
                                </Box>
                            </Box>

                            <Button onClick={handleSuspiciousChange} variant="contained" size="small">
                                {suspicious ? 'Mark as Not Suspicious' : 'Mark as Suspicious'}
                            </Button>

                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" color="text.secondary">Utorid</Typography>
                                <Typography variant="body1" paragraph>{transaction.utorid}</Typography>
                            </Grid>

                            {transaction.spent > 0 && (
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1" color="text.secondary">Spent</Typography>
                                    <Typography variant="body1">{transaction.spent || 'N/A'}</Typography>
                                </Grid>
                            )}

                            {transaction.amount > 0 && (
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1" color="text.secondary">Amount</Typography>
                                    <Typography variant="body1">{transaction.amount}</Typography>
                                </Grid>
                            )}

                            {transaction.relatedId > 0 && (
                                <Grid item xs={12} sm={4}>
                                    <Typography variant="subtitle1" color="text.secondary">RelatedId</Typography>
                                    <Typography variant="body1">{transaction.relatedId}</Typography>
                                </Grid>
                            )}

                            {transaction.promotions && (
                                <Grid item xs={12} sm={4}>
                                    <Typography variant="subtitle1" color="text.secondary">Promotions</Typography>
                                    <Typography variant="body1">{transaction.promotions}</Typography>
                                </Grid>
                            )}

                            {transaction.remark && (
                                <Grid item xs={12} sm={4}>
                                    <Typography variant="subtitle1" color="text.secondary">Remark</Typography>
                                    <Typography variant="body1">{transaction.remark}</Typography>
                                </Grid>
                            )}

                            <Grid item xs={12}>
                                <Typography variant="subtitle1" color="text.secondary">Created By</Typography>
                                <Typography variant="body1" paragraph>{transaction.createdBy}</Typography>
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 3 }}>
                            <Button
                                variant="outlined"
                                onClick={() => setCreatingAdjustment(prev => !prev)}
                            >
                                {creatingAdjustment ? 'Cancel' : 'Create New Adjustment'}
                            </Button>
                        </Box>

                        {creatingAdjustment && (
                            <Box component="form" onSubmit={handleCreateAdjustment} sx={{ mt: 3 }}>
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    value={transaction.utorid}
                                    disabled
                                    //onChange={(e) => setAdjustmentData({ ...adjustmentData, utorid: e.target.value })}
                                    label="Utorid of the user to adjust"
                                />
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    disabled
                                    value="adjustment"
                                    label="Type"
                                />
                                <TextField
                                    fullWidth
                                    type="number"
                                    margin="normal"
                                    disabled
                                    value={transactionId}
                                    label="Transaction ID"
                                />
                                <TextField
                                    label="Amount"
                                    type="number"
                                    fullWidth
                                    margin="normal"
                                    value={adjustmentData.amount}
                                    onChange={(e) => setAdjustmentData({ ...adjustmentData, amount: Number(e.target.value) })}
                                />
                                <TextField
                                    label="Promotion IDs (comma-separated)"
                                    fullWidth
                                    margin="normal"
                                    value={adjustmentData.promotionIds}
                                    onChange={(e) => setAdjustmentData({ ...adjustmentData, promotionIds: e.target.value })}
                                />
                                <TextField
                                    label="Remark"
                                    fullWidth
                                    margin="normal"
                                    value={adjustmentData.remark}
                                    onChange={(e) => setAdjustmentData({ ...adjustmentData, remark: e.target.value })}
                                />
                                <Box sx={{ mt: 2 }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={adjustmentLoading}
                                    >
                                        {adjustmentLoading ? <CircularProgress size={24} /> : 'Submit Adjustment'}
                                    </Button>
                                </Box>
                                {adjustmentError && (
                                    <Typography color="error" sx={{ mt: 1 }}>{adjustmentError}</Typography>
                                )}
                            </Box>
                        )}

                        {adjustmentSuccess && (
                            <Alert severity="success" sx={{ mt: 2 }}>
                                {adjustmentSuccess} Success! Redirecting to transactions page...
                            </Alert>
                        )}

                        {/* {adjustmentError && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {adjustmentError}
                            </Alert>
                        )} */}


                    </Paper>
                </>
            )}
        </Box>
    );

};

export default TransactionDetail;