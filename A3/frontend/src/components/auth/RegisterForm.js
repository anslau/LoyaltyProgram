import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

function RegisterForm() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [utorid, setUtorid] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResetToken('');
    setSuccessMsg('');

    if (!utorid || !name || !email) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    try {
      const resp = await fetch(`${BACKEND_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // must be cashier or manager
        },
        body: JSON.stringify({ utorid, name, email }),
      });
      if (!resp.ok) {
        if (resp.status === 409) {
          throw new Error(`User with UTORid '${utorid}' already exists`);
        }
        const errData = await resp.json();
        throw new Error(errData.error || 'Failed to create user');
      }
      const data = await resp.json();

      // data.resetToken is presumably the token for activation
      setResetToken(data.resetToken);
      setSuccessMsg(`User '${utorid}' registered successfully!`);
      navigate(`/reset-request/${data.resetToken}?utorid=${utorid}`);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleRegister}
      sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}
    >
      <Typography variant="h5" gutterBottom>
        Register New User
      </Typography>

      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}
      {successMsg && (
        <Alert severity="success" sx={{ my: 2 }}>
          {successMsg}
        </Alert>
      )}

      <TextField
        label="UTORid"
        fullWidth
        sx={{ mb: 2 }}
        value={utorid}
        onChange={(e) => setUtorid(e.target.value)}
      />
      <TextField
        label="Name"
        fullWidth
        sx={{ mb: 2 }}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <TextField
        label="Email"
        type="email"
        fullWidth
        sx={{ mb: 2 }}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Button
        type="submit"
        variant="contained"
        disabled={loading}
        sx={{ mt: 1 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Register'}
      </Button>

      {resetToken && (
        <Alert severity="info" sx={{ my: 2 }}>
          Activation token: <strong>{resetToken}</strong>
          <br />
          The new user can set their password via
          <code> /auth/resets/{'{resetToken}'}</code>.
        </Alert>
      )}
    </Box>
  );
}

export default RegisterForm;
