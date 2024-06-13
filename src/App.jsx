import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './App.css'
import TokenInput from './TokenInput';
import WorkflowInput from './WorkflowInput';
import { AppBar, Toolbar, Button, Typography } from '@material-ui/core';

import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import DoneIcon from '@mui/icons-material/Done';
import IconButton from '@mui/material/IconButton';
import Fab from '@mui/material/Fab';
import RefreshIcon from '@mui/icons-material/Refresh';
import Grid from '@mui/material/Unstable_Grid2';
import AlertSnackbar from './Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import { openSnackbar, closeSnackbar, setToken, setWorkflow, setDeployments, setIsApproving } from './actions';


import { connect } from 'react-redux';

function App() {
  const dispatch = useDispatch();
  const [refreshInterval, setRefreshInterval] = useState(null);

  const token = useSelector(state => state.token);
  const workflow = useSelector(state => state.workflow);
  const deployments = useSelector(state => state.deployments);
  const isApproving = useSelector(state => state.isApproving);
  const snackbarOpen = useSelector(state => state.snackbar.snackbarOpen);
  const snackbarMessage = useSelector(state => state.snackbar.snackbarMessage);
  const snackbarSeverity = useSelector(state => state.snackbar.snackbarSeverity);

  const handleTokenReceived = (receivedToken) => {
    dispatch(setToken(receivedToken));
  };

  const handleWorkflowReceived = (receivedWorkflow) => {
    dispatch(setWorkflow(receivedWorkflow));
  };

  const handleClearToken = () => {
    if (token) {
      localStorage.removeItem('token');
      dispatch(setToken(''));
      dispatch(setWorkflow(''));
      dispatch(setDeployments([]));
    }
  };

  const handleClearWorkflow = () => {
    dispatch(setWorkflow(''));
    dispatch(setIsApproving([]));
    dispatch(setDeployments([]));
  };

  const handleDeploymentRefresh = () => {
    fetchDeployments();
    dispatch(openSnackbar("Refreshing Deployments", "success"));
  };

  useEffect(() => {
    if (token && workflow) {
      fetchDeployments();
    }
    if (refreshInterval) {
      return () => clearInterval(refreshInterval);
    }

  }, [token, workflow, refreshInterval, dispatch]);

  const parseWorkflowUrl = (workflowUrl) => {
    if (typeof workflowUrl !== 'string') {
      console.error(error);
      throw new Error("Failed to parse workflow URL");
    }
  
    const urlParts = workflowUrl.split('/');
    const org = urlParts[3];
    const repo = urlParts[4];
    const run_id = urlParts[7];
    return { org, repo, run_id };
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
        dispatch(setDeployments(pendingDeployments));
        dispatch(setIsApproving(pendingDeployments.map(deployment => ({
          environment: deployment.env_name,
          status: "pending"
        }))));
        return pendingDeployments;
    } catch (error) {
        console.error(error);
        dispatch(openSnackbar("Failed to fetch pending deployments, Retry URL or Clear Token", "error"));
        handleClearWorkflow();
    }
  };

  const refreshApproved = (env_name, environment_id) => {
    const pendingDeployments = fetchDeployments();
    if (pendingDeployments.find(deployment => deployment.environment.id === environment_id && deployment.environment.name === env_name)) {
      setTimeout(() => refreshApproved(env_name, environment_id), 3000);
    }
  };

  const approveWorkflow = async (env_name, environment_id) => {
    dispatch(setIsApproving(isApproving.map((a) => a.environment === env_name ? { ...a, status: "approving" } : a)));
    const { org, repo, run_id } = parseWorkflowUrl(workflow);
    try {
      const response = await fetch(
        `https://api.github.com/repos/${org}/${repo}/actions/runs/${run_id}/pending_deployments`,
        {
          method: 'POST',
          body: JSON.stringify({ 
            environment_ids: [environment_id], 
            state: "approved",
            comment: ""
          }),
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.ok) {
        dispatch(openSnackbar("Approved Deployment", "success"));
        setTimeout(() => refreshApproved(env_name, environment_id), 3000);
      } else {
        const responseBody = await response.json();
        console.log(responseBody);
        dispatch(openSnackbar(`Failed to approve deployment: ${responseBody.errors}`, "error"));
        dispatch(openSnackbar(`Check Workflow URL and Github Token`, "warning"));
        handleClearWorkflow();
      }
    } catch (error) {
      console.error(error);
      dispatch(openSnackbar("Failed to approve deployment", "error"));
    }
  };

  return (
    <div>
      <AppBar position="fixed">
        <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
          {token && (
            <Button variant="contained" onClick={handleClearToken}>
              Clear Token
            </Button>
          )}
          {workflow && (
            <Button variant="contained" onClick={handleClearWorkflow}>
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
            <Grid container spacing={2}>
            <Grid xs={12}>
              <Typography variant="h6">
                {parseWorkflowUrl(workflow).org}/{parseWorkflowUrl(workflow).repo}
              </Typography>
            </Grid>
            <Grid xs={3}></Grid>
            <Grid xs={4}>
              <Typography variant="subtitle2">
                Run ID:
              </Typography>
              <Typography variant="subtitle1">
                {parseWorkflowUrl(workflow).run_id}
              </Typography>
            </Grid>
            <Grid xs={2}>
              <Fab color="primary" size="small"  aria-label="refresh" onClick={handleDeploymentRefresh}>
                <RefreshIcon />
              </Fab>
            </Grid>
            </Grid>
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
              <CircularProgress />
            )}
          </ListItem>
        </>
      ))}

      <AlertSnackbar
        snackbarOpen={snackbarOpen}
        snackbarMessage={snackbarMessage}
        snackbarSeverity={snackbarSeverity}
        closeSnackbar={() => dispatch(closeSnackbar())}
      />

    </div>
  );
}

const mapStateToProps = (state) => ({
  token: state.token,
  workflow: state.workflow.workflow,
  deployments: state.deployments.deployments,

});

const mapDispatchToProps = {
  openSnackbar,
  closeSnackbar,
  setToken,
  setWorkflow,
  setDeployments,
  setIsApproving,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
