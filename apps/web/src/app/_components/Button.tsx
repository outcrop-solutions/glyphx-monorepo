'use client';
/* eslint-disable react/display-name */
const Button = ({children, className, ...rest}) => {
  return (
    <button
      className={`flex items-center bg-primary-yellow text-secondary-space-blue justify-around px-5 py-2 rounded disabled:opacity-75 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

Button.Secondary = ({children, className, ...rest}) => {
  return (
    <button
      className={`flex items-center bg-gray justify-around px-5 py-2 rounded disabled:opacity-75 text-white ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
