import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, Paper } from '@mui/material';
import { Link } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const ResetRequestForm = () => {
  const [utorid, setUtorid] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!utorid.trim()) {
      setError('UTORid is required');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${BACKEND_URL}/auth/resets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ utorid })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to request password reset');
      }

      setResetToken(data.resetToken);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Reset Password
      </Typography>
      
      {success ? (
        <Box>
          <Alert severity="success" sx={{ mb: 2 }}>
            Reset token generated successfully!
          </Alert>
          <Typography variant="body1" gutterBottom>
            Please copy the reset token below to reset your password:
          </Typography>
          <Paper 
            elevation={1} 
            sx={{ 
              p: 2, 
              backgroundColor: '#f5f5f5', 
              mb: 2, 
              overflowX: 'auto',
              wordBreak: 'break-all'
            }}
          >
            <Typography variant="body2" fontFamily="monospace">
              {resetToken}
            </Typography>
          </Paper>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button 
              component={Link} 
              to="/login"
              sx={{ color: 'rgb(101, 82, 82)' }}
            >
              Back to Login
            </Button>
            <Button 
              component={Link} 
              to={`/reset-confirm/${resetToken}`} 
              variant="contained" 
              sx={{backgroundColor: '#ebc2c2', color: 'rgb(101, 82, 82)'}}
            >
              Continue to Reset Password
            </Button>
          </Box>
        </Box>
      ) : (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            Enter your UTORid to receive a password reset token.
          </Typography>
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="utorid"
            label="UTORid"
            name="utorid"
            autoComplete="username"
            autoFocus
            value={utorid}
            onChange={(e) => setUtorid(e.target.value)}
            disabled={loading}
            error={!!error}
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
          
          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button 
              component={Link} 
              to="/login"
              sx={{ color: 'rgb(101, 82, 82)' }}
            >
              Back to Login
            </Button>
            <Button 
              type="submit"
              variant="contained" 
              color="primary"
              disabled={loading || !utorid.trim()}
              sx={{backgroundColor: '#ebc2c2', color: 'rgb(101, 82, 82)'}}
            >
              {loading ? 'Processing...' : 'Get Reset Token'}
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default ResetRequestForm;
