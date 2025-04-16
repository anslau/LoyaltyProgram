import React from 'react';
import { Container, Box } from '@mui/material';
import ResetRequestForm from '../../components/auth/ResetRequestForm';

const ResetRequest = () => {
  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <ResetRequestForm />
      </Box>
    </Container>
  );
};

export default ResetRequest;
