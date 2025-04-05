import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Welcome to the Auth Section</h2>
      {children}
    </div>
  );
};

export default AuthLayout;
