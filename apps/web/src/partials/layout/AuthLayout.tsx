import React from "react";

export const AuthLayout = ({ children }) => {
  return (
    <div className="bg-primary-dark-blue h-screen w-screen overflow-hidden flex items-center justify-center">
      {children}
    </div>
  );
};
