const Button = ({ children, className, ...rest }) => {
  return (
    <button
      className={`flex items-center bg-primary-yellow justify-center px-5 py-2 space-x-3 rounded disabled:opacity-75 text-secondary-space-blue ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
