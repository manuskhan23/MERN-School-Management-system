import { useState } from 'react';

export function DateTimeInput({ id, label, value, onChange, className = '', required = false, validateFuture = false, ...rest }) {
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const val = e.target.value;
    setError('');
    
    if (!val) {
      onChange(e);
      return;
    }

    // Check if both date and time are provided
    if (!val || val.includes('--')) {
      setError('Please select BOTH date AND time');
      return;
    }

    const selectedDate = new Date(val);
    if (isNaN(selectedDate.getTime())) {
      setError('Invalid date. Please check the values.');
      return;
    }

    // Validate future date if required
    if (validateFuture) {
      const now = new Date();
      
      if (selectedDate < now) {
        setError(`⚠️ Date must be in the future (selected: ${selectedDate.toLocaleString()})`);
        return;
      }
    }

    setError('');
    onChange(e);
  };

  const handleBlur = (e) => {
    if (!e.target.value && required) {
      setError('This field is required - select date AND time');
    }
  };

  const now = new Date();
  const minDateTime = now.toISOString().slice(0, 16);

  return (
    <div className={`field ${className}`.trim()}>
      {label && (
        <label className="label" htmlFor={id}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          className="input"
          type="datetime-local"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          min={validateFuture ? minDateTime : undefined}
          required={required}
          style={{ fontSize: '16px', padding: '8px' }}
          {...rest}
        />
      </div>
      {error && (
        <small style={{ color: '#d32f2f', marginTop: '0.25rem', display: 'block', fontWeight: 'bold' }}>
          ❌ {error}
        </small>
      )}
      <small style={{ color: '#666', marginTop: '0.5rem', display: 'block', lineHeight: '1.4' }}>
        📅 <strong>Click the field above</strong> to select date and time<br/>
        ⏰ <strong>Make sure to pick BOTH:</strong> Date (e.g., 06/02/2026) AND Time (e.g., 14:30)<br/>
        ⌚ Now: <strong>{now.toLocaleString()}</strong>
      </small>
    </div>
  );
}
