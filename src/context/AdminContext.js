import React, { createContext, useContext, useState } from 'react';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [adminSettings, setAdminSettings] = useState({});
  return (
    <AdminContext.Provider value={{ adminSettings, setAdminSettings }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  return context;
};
