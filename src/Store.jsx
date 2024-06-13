import { configureStore } from '@reduxjs/toolkit';


// Define your initial state
const initialState = {
  snackbarOpen: false,
  snackbarMessage: '',
  snackbarSeverity: '',
};

// Define your reducer function
const snackbarReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'OPEN_SNACKBAR':
      return {
        ...state,
        snackbarOpen: true,
        snackbarMessage: action.message,
        snackbarSeverity: action.severity,
      };
    case 'CLOSE_SNACKBAR':
      return {
        ...state,
        snackbarOpen: false,
        snackbarMessage: '',
        snackbarSeverity: '',
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

const workflowReducer = (state = '', action) => {
    switch (action.type) {
      case 'SET_WORKFLOW':
        return action.payload;
      default:
        return state;
    }
  };

  const isApprovingReducer = (state = [], action) => {
    switch (action.type) {
      case 'SET_IS_APPROVING':
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
  

// Create the Redux store
const store = configureStore({
    reducer: {
      deployments: deploymentsReducer,
      workflow: workflowReducer,
      snackbar: snackbarReducer,
      token: tokenReducer,
      isApproving: isApprovingReducer,
    },
});
  

export default store;