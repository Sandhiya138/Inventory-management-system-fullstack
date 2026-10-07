import React, { useState } from 'react';
import { Icon } from '../icons/Icons';

export const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  icon,
  iconRight,
  onRightIconClick,
  disabled = false,
  className = '',
  helperText,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';
  const inputType = isPasswordField ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label className="form-label" htmlFor={name}>
          <span>
            {label} {required && <span className="required">*</span>}
          </span>
        </label>
      )}
      <div className="input-icon-wrapper">
        {icon && <span className="input-icon-left"><Icon name={icon} size={16} /></span>}
        <input
          id={name}
          name={name}
          type={inputType}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`input ${error ? 'error' : ''} ${icon ? 'input-with-left-icon' : ''} ${
            isPasswordField || iconRight ? 'input-with-right-icon' : ''
          }`}
          {...props}
        />
        {isPasswordField ? (
          <span
            className="input-icon-right"
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            <Icon name={showPassword ? 'eye-off' : 'eye'} size={16} />
          </span>
        ) : iconRight ? (
          <span className="input-icon-right" onClick={onRightIconClick}>
            <Icon name={iconRight} size={16} />
          </span>
        ) : null}
      </div>
      {error && <span className="form-error">{error}</span>}
      {!error && helperText && <span className="text-muted text-xs">{helperText}</span>}
    </div>
  );
};
