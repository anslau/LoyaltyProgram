import React from 'react';
import { Container, Box } from '@mui/material';
import ResetConfirmForm from '../../components/auth/ResetConfirmForm';

const ResetConfirm = () => {
  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <ResetConfirmForm />
      </Box>
    </Container>
  );
};

export default ResetConfirm;
