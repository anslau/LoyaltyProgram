import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, Paper } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const ResetConfirmForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    utorid: '',
    resetToken: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W])[A-Za-z\d\W]{8,20}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.utorid.trim() || !formData.resetToken.trim() || 
        !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!validatePassword(formData.password)) {
      setError('Password must be 8-20 characters with at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${BACKEND_URL}/auth/resets/${formData.resetToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          utorid: formData.utorid,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Reset Your Password
      </Typography>
      
      {success ? (
        <Box>
          <Alert severity="success" sx={{ mb: 2 }}>
            Password reset successful! You will be redirected to the login page.
          </Alert>
          <Button 
            component={Link} 
            to="/login"
            variant="contained" 
            fullWidth
            sx={{backgroundColor: '#ebc2c2', color: 'rgb(101, 82, 82)'}}
          >
            Go to Login
          </Button>
        </Box>
      ) : (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            Enter your UTORid, reset token, and new password.
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
            value={formData.utorid}
            onChange={handleChange}
            disabled={loading}
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
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="resetToken"
            label="Reset Token"
            name="resetToken"
            value={formData.resetToken}
            onChange={handleChange}
            disabled={loading}
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
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="New Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            helperText="8-20 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character"
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
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading}
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
          
          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button 
              component={Link} 
              to="/reset-request"
              sx={{ px: 4, color: 'rgb(101, 82, 82)'}}
            >
              Back to Request Token
            </Button>
            <Button 
              type="submit"
              variant="contained" 
              color="primary"
              disabled={loading || !formData.utorid.trim() || !formData.resetToken.trim() || 
                !formData.password || !formData.confirmPassword}
              sx={{backgroundColor: '#ebc2c2', color: 'rgb(101, 82, 82)'}}
            >
              {loading ? 'Processing...' : 'Reset Password'}
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default ResetConfirmForm;
