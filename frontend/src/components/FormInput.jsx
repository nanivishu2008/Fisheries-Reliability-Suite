import React from 'react';

export const FormInput = ({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  options = [],
  rows = 3,
  className = '',
  ...rest
}) => {
  const inputId = id || name;

  const baseClasses =
    'w-full px-3.5 py-2 text-sm text-stone-800 bg-white border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed';

  const borderClass = error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200' : 'border-slate-300';

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {type === 'textarea' ? (
        <textarea
          id={inputId}
          name={name}
          rows={rows}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`${baseClasses} ${borderClass} resize-y`}
          {...rest}
        />
      ) : type === 'select' ? (
        <select
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`${baseClasses} ${borderClass} bg-none`}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value ?? opt} value={opt.value ?? opt}>
              {opt.label ?? opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`${baseClasses} ${borderClass}`}
          {...rest}
        />
      )}

      {error ? (
        <p className="text-xs text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};

export default FormInput;
