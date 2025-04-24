import React, { useState, useEffect } from 'react';
import classes from './DisabilitySelector.module.css'; // Create this CSS file

export default function DisabilitySelector({ selectedDisability, onDisabilityChange, disabled }) {
  const [disabilities, setDisabilities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDisabilities() {
      setIsLoading(true);
      setError(null);
      try {
        // Ensure this matches your backend URL
        const response = await fetch('http://localhost:8000/disabilities');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Ensure 'None' is the first option if present
        const sortedData = data.sort((a, b) => {
          if (a.id === 'none') return -1;
          if (b.id === 'none') return 1;
          return a.name.localeCompare(b.name);
        });
        setDisabilities(sortedData);
      } catch (e) {
        setError('Failed to load disability options.');
        console.error("Fetch disabilities error:", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDisabilities();
  }, []);

  // Handle change for select dropdown
  const handleSelectChange = (event) => {
    onDisabilityChange(event.target.value);
  };

  if (isLoading) {
    return <p>Loading disabilities...</p>;
  }

  if (error) {
    return <p className={classes.errorText}>{error}</p>;
  }

  return (
    <div className={classes.selectorContainer}>
      <label htmlFor="disability-select" className={classes.label}>Select Known Disability (if any):</label>
      <select
        id="disability-select"
        value={selectedDisability || 'none'} // Default to 'none' if null/undefined
        onChange={handleSelectChange}
        className={classes.selectInput}
        disabled={disabled}
      >
        {disabilities.map((disability) => (
          <option key={disability.id} value={disability.id}>
            {disability.name}
          </option>
        ))}
      </select>
    </div>
  );
}