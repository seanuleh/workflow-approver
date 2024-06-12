import React, { useState, useEffect } from 'react';
import './App.css'
import TokenInput from './TokenInput';
import WorkflowInput from './WorkflowInput';
import { AppBar, Toolbar, Button, Typography } from '@material-ui/core';


function App() {
  const [token, setToken] = useState('');
  const [workflow, setWorkflow] = useState('');

  const handleTokenReceived = (receivedToken) => {
    setToken(receivedToken);
  };

  const handleWorkflowReceived = (receivedWorkflow) => {
    setWorkflow(receivedWorkflow);
  };

  const handleClearToken = () => {
    if (token) {
      localStorage.removeItem('token');
      setToken('');
      setWorkflow('');
    }
  };

  const handleClearWorkflow = () => {
    setWorkflow('');
  };

  return (
    <div>
      <AppBar position="fixed">
        <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
          {token && (
            <Button variant="outlined" onClick={handleClearToken}>
              Clear Token
            </Button>
          )}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <p style={{ marginRight: '1rem', textAlign: 'center' }}>
              {workflow}
            </p>
          </div>
          {workflow && (
            <Button variant="outlined" onClick={handleClearWorkflow}>
              Clear Workflow
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {!token && (
        <>
          <TokenInput onTokenReceived={handleTokenReceived} />
        </>
      )}
      {token && !workflow && (
        <WorkflowInput onWorkflowReceived={handleWorkflowReceived} />
      )}
      {token && workflow && (
        <p>Go Fetch Shit</p>
      )}
    </div>
  );
}

export default App
