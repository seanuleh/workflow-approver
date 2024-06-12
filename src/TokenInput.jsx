import React, { useState, useEffect } from 'react';
import { Container, TextField, Button } from '@material-ui/core';

const TokenInput = ({ onTokenReceived }) => {
  const [token, setToken] = useState('');
  const [tokenExists, setTokenExists] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setTokenExists(true);
      onTokenReceived(storedToken);
    }
  }, []);

  const handleTokenChange = e => {
    setToken(e.target.value);
  };

  const handleTokenSubmit = e => {
    e.preventDefault();
    localStorage.setItem('token', token);
    onTokenReceived(token);
  };

  return (
    <Container>
      {!tokenExists && (
        <form onSubmit={handleTokenSubmit}>
          <TextField
            label="Github Token"
            value={token}
            onChange={handleTokenChange}
            margin="normal"
            fullWidth
          />
          <Button variant="contained" color="primary" type="submit">
            Submit
          </Button>
        </form>
      )}
    </Container>
  );
};

export default TokenInput;