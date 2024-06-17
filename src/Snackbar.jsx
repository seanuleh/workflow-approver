import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';


const AlertSnackbar = ({ snackbarOpen, snackbarMessage, snackbarDuration, snackbarSeverity, closeSnackbar }) => {
  return (
    <Snackbar open={snackbarOpen} autoHideDuration={snackbarDuration} onClose={closeSnackbar}>
      <Alert onClose={closeSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
        <span style={{ whiteSpace: 'pre-line' }}>{snackbarMessage}</span>
      </Alert>
    </Snackbar>
  );
};


export default AlertSnackbar;