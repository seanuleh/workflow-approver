import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { connect } from 'react-redux';

import { openSnackbar, closeSnackbar, setToken, setWorkflow, setDeployments, setJobs, setEnvironments } from './store/actions';
import { useHandlers } from './store/handlers';

import './App.css'
import TokenInput from './TokenInput';
import WorkflowInput from './WorkflowInput';
import AlertSnackbar from './Snackbar';

import { AppBar, Toolbar, Button, Typography } from '@material-ui/core';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Fab from '@mui/material/Fab';
import RefreshIcon from '@mui/icons-material/Refresh';
import Grid from '@mui/material/Unstable_Grid2';

import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import PendingIcon from '@mui/icons-material/Pending';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RunCircleIcon from '@mui/icons-material/RunCircle';
import NotStartedIcon from '@mui/icons-material/NotStarted';
import AddTaskIcon from '@mui/icons-material/AddTask';


import { useToken, useWorkflow, useDeployments, useEnvironments,useSnackbarOpen, useJobs, useSnackbarMessage, useSnackbarSeverity, useSnackbarDuration } from './store/selectors';

function App() {
  const dispatch = useDispatch();

  const token = useToken();
  const workflow = useWorkflow();
  const deployments = useDeployments();
  const snackbarOpen = useSnackbarOpen();
  const snackbarMessage = useSnackbarMessage();
  const snackbarSeverity = useSnackbarSeverity();
  const snackbarDuration = useSnackbarDuration();
  

  const { handleTokenReceived, handleAutoRefresh, handleWorkflowReceived, handlePageLoad, handleClearToken, handleClearWorkflow, handleDeploymentRefresh, approveWorkflow, parseWorkflowUrl } = useHandlers();

  useEffect(() => {
    if (token && workflow) {
      handlePageLoad();
    }
  }, [token, workflow, dispatch]);

  useEffect(() => {
    let intervalId = null; // Declare a variable to hold the interval ID
  
    if (workflow && deployments.length > 0) {
      if (!deployments.every(deployment => deployment.status == "success")) {
        intervalId = setInterval(() => {
          handlePageLoad();
        }, 3000);
      }

      if (deployments.every(deployment => deployment.status === "success")) {
        clearInterval(intervalId);
      }
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [token, workflow, deployments, dispatch]); // Dependencies array

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
        <React.Fragment key={deployment.id}>
          <ListItem key={deployment.id} spacing={5}>
            <ListItemAvatar>
              <Avatar>
                {(deployment.status == "waiting") ? (
                  <NotStartedIcon />
                ) : null}
                {(deployment.status == "queued") ? (
                  <PendingIcon />
                ) : null}
                {(deployment.status == "in_progress") ? (
                  <RunCircleIcon />
                ) : null}
                {(deployment.status == "success") ? (
                  <CheckCircleOutlineIcon />
                ) : null}
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={deployment.environment} secondary={
              <span>
                {`${deployment.jobName}`}
                <br />
                {`${deployment.status}`}
              </span>
            }/>
            {(deployment.status == "waiting") ? (
              <IconButton aria-label="approve" onClick={() => {
                approveWorkflow(deployment.environment);
              }}>
                <AddTaskIcon />
              </IconButton>
            ) : null}
          </ListItem>
        </React.Fragment>
      ))}

      <AlertSnackbar
        snackbarOpen={snackbarOpen}
        snackbarMessage={snackbarMessage}
        snackbarSeverity={snackbarSeverity}
        snackbarDuration={snackbarDuration}
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
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
