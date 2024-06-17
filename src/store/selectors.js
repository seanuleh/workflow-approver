import { useSelector } from 'react-redux';

export const useToken = () => useSelector(state => state.token);
export const useWorkflow = () => useSelector(state => state.workflow);
export const useDeployments = () => useSelector(state => state.deployments);
export const useJobs = () => useSelector(state => state.jobs);
export const useRefreshIndicator = () => useSelector(state => state.refreshIndicator);
export const useEnvironments = () => useSelector(state => state.environments);
export const useSnackbarOpen = () => useSelector(state => state.snackbar.snackbarOpen);
export const useSnackbarMessage = () => useSelector(state => state.snackbar.snackbarMessage);
export const useSnackbarSeverity = () => useSelector(state => state.snackbar.snackbarSeverity);
export const useSnackbarDuration = () => useSelector(state => state.snackbar.snackbarDuration);