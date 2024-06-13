import { useDispatch, useSelector } from 'react-redux';
import { setToken, setWorkflow, setDeployments, setIsApproving, openSnackbar, closeSnackbar } from './actions';

export const useHandlers = () => {
  const dispatch = useDispatch();
  const workflow = useSelector(state => state.workflow);
  const token = useSelector(state => state.token);
  const isApproving = useSelector(state => state.isApproving);

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
    if (pendingDeployments.size > 0 && pendingDeployments.find(deployment => deployment.environment.id === environment_id && deployment.environment.name === env_name)) {
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
        dispatch(openSnackbar(`Failed to approve deployment: ${responseBody.errors}`, "error"));
        dispatch(openSnackbar(`Check Workflow URL and Github Token`, "warning"));
        handleClearWorkflow();
      }
    } catch (error) {
      console.error(error);
      dispatch(openSnackbar("Failed to approve deployment", "error"));
    }
  };

  return { handleTokenReceived, handleWorkflowReceived, handleClearToken, handleClearWorkflow, handleDeploymentRefresh, fetchDeployments, refreshApproved, approveWorkflow, parseWorkflowUrl };
};