import React from 'react';

const TokenDisplay = ({ token, label }) => (
  <div>
    <h1>{label}:</h1>
    <p>{token}</p>
  </div>
);

export default TokenDisplay;