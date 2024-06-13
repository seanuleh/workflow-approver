import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { connect } from 'react-redux';

import { openSnackbar, closeSnackbar, setToken, setWorkflow, setDeployments, setIsApproving } from './store/actions';
import { useHandlers } from './store/handlers';

import './App.css'
import TokenInput from './TokenInput';
import WorkflowInput from './WorkflowInput';
import AlertSnackbar from './Snackbar';

import { AppBar, Toolbar, Button, Typography } from '@material-ui/core';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import DoneIcon from '@mui/icons-material/Done';
import IconButton from '@mui/material/IconButton';
import Fab from '@mui/material/Fab';
import RefreshIcon from '@mui/icons-material/Refresh';
import Grid from '@mui/material/Unstable_Grid2';
import CircularProgress from '@mui/material/CircularProgress';

function App() {
  const dispatch = useDispatch();

  const token = useSelector(state => state.token);
  const workflow = useSelector(state => state.workflow);
  const deployments = useSelector(state => state.deployments);
  const isApproving = useSelector(state => state.isApproving);
  const snackbarOpen = useSelector(state => state.snackbar.snackbarOpen);
  const snackbarMessage = useSelector(state => state.snackbar.snackbarMessage);
  const snackbarSeverity = useSelector(state => state.snackbar.snackbarSeverity);

  const { handleTokenReceived, handleWorkflowReceived, handleClearToken, handleClearWorkflow, handleDeploymentRefresh, fetchDeployments, refreshApproved, approveWorkflow, parseWorkflowUrl } = useHandlers();

  useEffect(() => {
    if (token && workflow) {
      fetchDeployments();
    }
  }, [token, workflow, dispatch]);

  return (
    <>
      {/* Render Header */}
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

      {/* Handle Token Inputs */}
      {!token && (
        <TokenInput onTokenReceived={handleTokenReceived} />
      )}
      {token && !workflow && (
        <WorkflowInput onWorkflowReceived={handleWorkflowReceived} />
      )}

      {/* Render Workflow Header */}
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
              <Fab color="primary" size="small" aria-label="refresh" onClick={handleDeploymentRefresh}>
                <RefreshIcon />
              </Fab>
            </Grid>
          </Grid>
        </>
      )}

      {/* Render Deployment Approval List */}
      {deployments && deployments.map((deployment) => (
        <React.Fragment key={deployment.env_name}>
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
        </React.Fragment>
      ))}

      <AlertSnackbar
        snackbarOpen={snackbarOpen}
        snackbarMessage={snackbarMessage}
        snackbarSeverity={snackbarSeverity}
        closeSnackbar={() => dispatch(closeSnackbar())}
      />
    </>
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
