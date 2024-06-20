import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Загрузка пользователя из localStorage при инициализации
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const logout = () => {
    // Удаление пользователя из состояния и localStorage при выходе
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUser = (userData) => {
    // Обновление пользователя в состоянии и localStorage
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  useEffect(() => {
    // Установка пользователя в localStorage при изменении состояния
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, updateUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
