import { useDispatch, useSelector } from 'react-redux';
import { setToken, setWorkflow, setRefreshIndicator, setDeployments, setJobs, openSnackbar, closeSnackbar, setEnvironments } from './actions';

export const useHandlers = () => {
  const dispatch = useDispatch();
  const workflow = useSelector(state => state.workflow);
  const token = useSelector(state => state.token);
  const jobs = useSelector(state => state.jobs);
  const refreshIndicator = useSelector(state => state.refreshIndicator);
  const environments = useSelector(state => state.environments);

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
    dispatch(setDeployments([]));
  };

  const handleDeploymentRefresh = () => {
    fetchDeployments();
    dispatch(openSnackbar("Refreshing Deployments", "success", 1000));
  };

  const handlePageLoad = async () => {
    fetchDeployments();  
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

  const parseTargetUrl = (targetUrl) => {
    if (typeof targetUrl !== 'string') {
      console.error(error);
      throw new Error("Failed to parse workflow URL");
    }

    const urlParts = targetUrl.split('/');
    const jobIdIndex = urlParts.findIndex(part => part === 'job') + 1;
    const jobId = jobIdIndex > 0 ? urlParts[jobIdIndex] : null;
  
    if (!jobId) {
      throw new Error("Job ID not found in URL");
    }
  
    return jobId;
  };

  const fetchDeployments = async () => {
    try {
      dispatch(setRefreshIndicator(true));
      const jobs = await getWorklowJobs();
      const environments = await getEnvironments();
      const workflowSha = await getWorfklowSha();
      let deploymentLocal = await getDeploymentsForSha(workflowSha, jobs, environments);
      dispatch(setDeployments([]));
      console.log(deploymentLocal[0].status)
      dispatch(setDeployments(deploymentLocal));
      dispatch(setRefreshIndicator(false));
      return deploymentLocal;
    } catch (error) {
      console.error(error);
      dispatch(openSnackbar(`Failed to fetch deployments, Retry URL or Clear Token\n${error.message}`, "error", 5000));
      handleClearWorkflow();
    }
  };

  const getDeploymentsForSha = async (workflowSha, jobs) => {
    const { org, repo, run_id } = parseWorkflowUrl(workflow);
    const url = `https://api.github.com/repos/${org}/${repo}/deployments?sha=${workflowSha}`;
    let response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Deployments: ${response.status}`);
    }

    let data = await response.json();
    let deploymentSimple = data.map((deployment) => ({
      id: deployment.id,
      environment: deployment.environment,
    }));

    let deploymentsWithStatus = await Promise.all(deploymentSimple.map(async (deployment) => ({
      id: deployment.id,
      environment: deployment.environment,
      status: await getDeploymentStatus(deployment.id),
    })));

    let deploymentsComplete = await Promise.all(deploymentsWithStatus.map(async (deployment) => ({
      id: deployment.id,
      environment: deployment.environment,
      status: deployment.status.state,
      jobName: await getJobName(deployment.status.target_url, jobs),
    })));

    console.log(deploymentsComplete)

    return deploymentsComplete;
  };

  const getJobName = (target_url, jobs) => {
    const jobId = parseTargetUrl(target_url);
    const job = jobs.find(job => job.id == jobId);
    return job.name;
  };

  const getDeploymentStatus = async (deploymentId) => {
    const { org, repo, run_id } = parseWorkflowUrl(workflow);
    const url = `https://api.github.com/repos/${org}/${repo}/deployments/${deploymentId}/statuses?timestamp=${new Date().getTime()}`;
    let response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Deployment Status: ${response.status}`);
    }

    let data = await response.json();
    // if the first status is inactive, return the second status
    let status = data[0].state == 'inactive' ? data[1] : data[0]
    return status;
  };

  const getWorfklowSha = async () => {
    const { org, repo, run_id } = parseWorkflowUrl(workflow);
    const url = `https://api.github.com/repos/${org}/${repo}/actions/runs/${run_id}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch jobs: ${response.status}`);
    }

    const data = await response.json();
    return data.head_sha;
  };


  const getWorklowJobs = async (jobs) => {
    const { org, repo, run_id } = parseWorkflowUrl(workflow);
    const url = `https://api.github.com/repos/${org}/${repo}/actions/runs/${run_id}/jobs`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Deployment Status: ${response.status}`);
    }

    const data = await response.json();
    dispatch(setJobs(data.jobs));
    return data.jobs;
  };


  const getEnvironments = async () => {
    const { org, repo, run_id } = parseWorkflowUrl(workflow);
    const url = `https://api.github.com/repos/${org}/${repo}/environments`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Environemnts: ${response.status}`);
    }

    const data = await response.json();
    dispatch(setEnvironments(data.environments));
    return data.environments;
  };


  const approveWorkflow = async (env_name) => {
    try {
      const { org, repo, run_id } = parseWorkflowUrl(workflow);
      const environment_id = await getEnvironmentId(env_name);

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
        dispatch(openSnackbar(`Approved Deployment to ${env_name}`, "success", 3000));
      } else {
        const responseBody = await response.json();
        dispatch(openSnackbar(`Failed to approve deployment\nRetry URL or Clear Token\n${responseBody.message}`, "error", 5000));
        handleClearWorkflow();
      }
    } catch (error) {
      console.error(error);
      dispatch(openSnackbar(`Failed to approve deployment\nRetry URL or Clear Token\n${error.message}`, "error", 5000));
    }
  };

  const getEnvironmentId = async (env_name) => {
    const environment = environments.find(env => env.name == env_name);
    return environment.id;
  }

  return { handleTokenReceived, handlePageLoad, handleWorkflowReceived, handleClearToken, handleClearWorkflow, getWorklowJobs, handleDeploymentRefresh, fetchDeployments, approveWorkflow, parseWorkflowUrl };
};