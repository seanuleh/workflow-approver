import { configureStore } from '@reduxjs/toolkit';


// Define your initial state
const initialState = {
  snackbarOpen: false,
  snackbarMessage: '',
  snackbarSeverity: '',
  snackbarDuration: 0,
};

// Define your reducer function
const snackbarReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'OPEN_SNACKBAR':
      return {
        snackbarOpen: true,
        snackbarMessage: action.message,
        snackbarSeverity: action.severity,
        snackbarDuration: action.duration,
      };
    case 'CLOSE_SNACKBAR':
      return {
        snackbarOpen: false,
        snackbarMessage: '',
        snackbarSeverity: '',
        snackbarDuration: 0,
      };
    default:
      return state;
  }
};

const deploymentsReducer = (state = [], action) => {
  switch (action.type) {
    case 'SET_DEPLOYMENTS':
      return action.payload;
    default:
      return state;
  }
};

const jobsReducer = (state = [], action) => {
  switch (action.type) {
    case 'SET_JOBS':
      return action.payload;
    default:
      return state;
  }
};

const workflowReducer = (state = '', action) => {
  switch (action.type) {
    case 'SET_WORKFLOW':
      return action.payload;
    default:
      return state;
  }
};

const tokenReducer = (state = '', action) => {
  switch (action.type) {
    case 'SET_TOKEN':
      return action.payload;
    default:
      return state;
  }
};

const environmentsReducer = (state = [], action) => {
  switch (action.type) {
    case 'SET_ENVIRONMENTS':
      return action.payload;
    default:
      return state;
  }
}

// Create the Redux store
const store = configureStore({
  reducer: {
    deployments: deploymentsReducer,
    workflow: workflowReducer,
    snackbar: snackbarReducer,
    token: tokenReducer,
    jobs: jobsReducer,
    environments: environmentsReducer,
  },
});


export default store;