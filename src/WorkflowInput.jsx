import React, { useState } from 'react';
import { TextField, Button } from '@material-ui/core';

const WorkflowInput = ({ onWorkflowReceived }) => {
  const [workflow, setWorkflow] = useState('');

  const handleWorkflowChange = e => {
    setWorkflow(e.target.value);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (onWorkflowReceived) {
      onWorkflowReceived(workflow);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Workflow URL"
        value={workflow}
        onChange={handleWorkflowChange}
        margin="normal"
        fullWidth
      />
      <Button type="submit" variant="contained" color="primary">
        Submit
      </Button>
    </form>
  );
};

export default WorkflowInput;