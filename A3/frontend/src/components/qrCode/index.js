import { Dialog, DialogContent, DialogTitle, IconButton, Box, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { QRCodeCanvas } from 'qrcode.react';
import React from 'react';

const qrCode = ({ open, onClose, qrData }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs">
            <Box display="flex" alignItems="center" p={2}>
                <IconButton
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <CloseIcon />
                </IconButton>
            </Box>
            <DialogContent>
                <QRCodeCanvas value={qrData} size={256} />
            </DialogContent>
            <DialogTitle>
                <Box display="flex" flexDirection="column" alignItems="center">
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Your QR Code
                    </Typography>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Scan to initiate a transaction
                    </Typography>
                </Box>
            </DialogTitle>
        </Dialog>
    );
};

export default qrCode;