import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';


const AlertSnackbar = ({ snackbarOpen, snackbarMessage, snackbarSeverity, closeSnackbar }) => {
  return (
    <Snackbar open={snackbarOpen} autoHideDuration={2000} onClose={closeSnackbar}>
      <Alert onClose={closeSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
        {snackbarMessage}
      </Alert>
    </Snackbar>
  );
};


export default AlertSnackbar;