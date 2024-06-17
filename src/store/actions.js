// actions.js

export const openSnackbar = (message, severity, duration) => {
    return {
        type: 'OPEN_SNACKBAR',
        message: message,
        severity: severity,
        duration: duration,
    };
};

export const closeSnackbar = () => {
    return {
        type: 'CLOSE_SNACKBAR',
    };
};

export const setToken = (newToken) => ({
    type: 'SET_TOKEN',
    payload: newToken,
});

export const setWorkflow = (newWorkflow) => ({
    type: 'SET_WORKFLOW',
    payload: newWorkflow,
});

export const setDeployments = (newDeployments) => ({
    type: 'SET_DEPLOYMENTS',
    payload: newDeployments,
});

export const setJobs = (newJobs) => ({
    type: 'SET_JOBS',
    payload: newJobs,
});

export const setEnvironments = (newEnvironments) => ({
    type: 'SET_ENVIRONMENTS',
    payload: newEnvironments,
});

export const setRefreshIndicator = (newRefreshIndicator) => ({
    type: 'SET_REFRESH_INDICATOR',
    payload: newRefreshIndicator,
});
