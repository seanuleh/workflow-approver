export const parseWorkflowUrl = (workflowUrl) => {
  const urlParts = workflowUrl.split('/');
  const org = urlParts[3];
  const repo = urlParts[4];
  const run_id = urlParts[7];
  return { org, repo, run_id };
};
