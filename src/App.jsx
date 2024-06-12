import React, { useState, useEffect } from 'react';
import './App.css'
import TokenInput from './TokenInput';
import WorkflowInput from './WorkflowInput';
import { AppBar, Toolbar, Button, Typography } from '@material-ui/core';
import { parseWorkflowUrl } from './utils';

import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import DoneIcon from '@mui/icons-material/Done';
import IconButton from '@mui/material/IconButton';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';

function App() {
  const [token, setToken] = useState('');
  const [workflow, setWorkflow] = useState('');
  const [isApproving, setIsApproving] = useState([]);
  const [deployments, setDeployments] = useState([]);

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
      setDeployments([]);
    }
  };

  const handleClearWorkflow = () => {
    setWorkflow('');
    setIsApproving([]);
    setDeployments([]);
  };

  const fetchDeployments = async () => {
    try {
      const { org, repo, run_id } = parseWorkflowUrl(workflow);
      const response = await fetch(
        `https://api.github.com/repos/${org}/${repo}/actions/runs/${run_id}/pending_deployments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      const pendingDeployments = data.map(
        (deployment) => {
          return { ...deployment, env_name: deployment.environment.name };
        }
      );
      setDeployments(pendingDeployments);

      // Create a Map to track which Runs we are approving
      const approvingDeployments = pendingDeployments.map((deployment) => {
        return {
          environment: deployment.env_name,
          status: "pending"
        }
      })
      setIsApproving(approvingDeployments);
      return pendingDeployments;
    } catch (error) {
      console.error(error);
    }
  };


  const approveWorkflow = async (env_name, environment_id) => {
    const { org, repo, run_id } = parseWorkflowUrl(workflow);
    try {
      const response = await fetch(
        `https://api.github.com/repos/${org}/${repo}/actions/runs/${run_id}/pending_deployments`,
        {
          method: 'POST',
          body: JSON.stringify({ 
            environment_ids: [environment_id], 
            state: "approved",
            comment: "LGTM"
          }),
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.ok) {
        setIsApproving(isApproving.map((a) => a.environment === env_name ? { ...a, status: "approving" } : a));
      }
    } catch (error) {
      console.error(error);
    }
  };


  useEffect(() => {
    if (token && workflow) {
      fetchDeployments();
    }
  }, [token, workflow]);


  return (
    <div>
      <AppBar position="fixed">
        <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
          {token && (
            <Button variant="outlined" onClick={handleClearToken}>
              Clear Token
            </Button>
          )}
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

      {workflow && (
        <>
            <Typography variant="h6">
              {parseWorkflowUrl(workflow).org}/{parseWorkflowUrl(workflow).repo}
            </Typography>
            <Typography variant="subtitle2">
              Run ID:
            </Typography>
            <Typography variant="subtitle1">
              {parseWorkflowUrl(workflow).run_id}
            </Typography>
        </>
      )}

      {deployments && deployments.map((deployment) => (
        <>
          <ListItem key={deployment.env_name} spacing={5}>
            <ListItemText primary={deployment.env_name} />
            {isApproving.find((a) => a.environment === deployment.env_name && a.status === "pending") ? (
              <IconButton aria-label="approve" onClick={() => {
                approveWorkflow(deployment.env_name, deployment.environment.id);
              }}>
                <DoneIcon />
              </IconButton>
            ) : null}
            {isApproving.find((a) => a.environment === deployment.env_name && a.status === "approving") && (
              <HourglassBottomIcon />
            )}
          </ListItem>
        </>
      ))}
    </div>
  );
}

export default App
