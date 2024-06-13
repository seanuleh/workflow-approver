// actions.js

export const openSnackbar = (message, severity) => {
    return {
        type: 'OPEN_SNACKBAR',
        message: message,
        severity: severity,
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

export const setIsApproving = (newIsApproving) => ({
    type: 'SET_IS_APPROVING',
    payload: newIsApproving,
});

