// gestion/src/components/Button.jsx
import React from 'react';

// Props comunes: variant (primary, secondary, danger, etc.), size (sm, lg), onClick, children (el texto del botón)
function Button({ variant = 'primary', size = '', onClick, children, className = '', ...props }) {
  const baseClasses = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = size ? `btn-${size}` : '';

  return (
    <button
      type="button" // O "submit" si es para formularios
      className={`${baseClasses} ${variantClass} ${sizeClass} ${className}`}
      onClick={onClick}
      {...props} // Pasa cualquier otra prop (ej. disabled)
    >
      {children}
    </button>
  );
}

export default Button;