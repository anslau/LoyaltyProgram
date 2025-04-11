import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import {
  Box, Button, Container, TextField, Typography, Alert
} from '@mui/material';

export default function Registration() {
  const [utorid, setUtorid] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { token } = useContext(AuthContext);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!utorid || !name || !email) {
      setError('All fields are required.');
      return;
    }

    try {
      const resp = await fetch('http://localhost:8000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ utorid, name, email })
      });

      if (resp.status === 409) {
        throw new Error('Utorid already exists.');
      }
      if (!resp.ok) {
        throw new Error('Failed to register user.');
      }

      const data = await resp.json();
      setSuccess(`User ${data.utorid} created! Activation token: ${data.resetToken}`);
      setUtorid('');
      setName('');
      setEmail('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>Create New User</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <Box component="form" onSubmit={handleRegister} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Utorid"
          value={utorid}
          onChange={(e) => setUtorid(e.target.value)}
          required
        />
        <TextField
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <TextField
          label="UofT Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" variant="contained">Register</Button>
      </Box>
    </Container>
  );
}
