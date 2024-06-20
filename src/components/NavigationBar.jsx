import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from './UserContext';

const NavigationBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUser();

  const [categories, setCategories] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories');
        setCategories(response.data.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  if (location.pathname === '/login' || location.pathname === '/registration') {
    return null;
  }

  const handleSearch = (event) => {
    event.preventDefault();
    const query = event.target.elements.search.value;
    if (query.trim()) {
      navigate(`/search?query=${query}`);
    }
  };

  return (
    <nav className="bg-dark-blue p-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center text-light-blue font-bold text-5xl">
          <span className="mr-2 hidden sm:inline">CHANGE</span>
          <img src="/api/uploads/icons/general/arrows-light.svg" alt="Logo" className="w-12 h-12 object-contain" />
        </Link>

        {user && user.user.is_admin ? (
          <div className="flex items-center space-x-4">
            <Link to="/admin" className="text-light-blue hover:underline">Модерация объявлений</Link>
            <Link to="/admin/categories" className="text-light-blue hover:underline">Управление категориями</Link>
            <Link to="/admin/create-admin" className="text-light-blue hover:underline">Добавление администратора</Link>
          </div>
        ) : (
          <>
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-12 h-12 ml-4 flex items-center justify-center"
              >
                <img src="/api/uploads/icons/general/menu-light.svg" alt="Menu" className="w-full h-full" />
              </button>
              {isDropdownOpen && (
                <div className="absolute mt-2 w-64 bg-white rounded-md shadow-lg z-10">
                  <ul>
                    {categories.map((category) => (
                      <li key={category.id} className="flex items-center">
                        {category.image ? (
                          <img src={category.image} alt={category.name} className="w-8 h-8 mx-2 object-contain" />
                        ) : (
                          <div className="w-8 h-8 bg-gray-200 mx-2"></div>
                        )}
                        <Link
                          to={`/categorie/${category.id}`}
                          className="block px-4 py-2 text-gray-800 hover:bg-gray-200 flex-1"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          {category.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <form onSubmit={handleSearch} className="flex-1 mx-4 flex items-center">
              <input
                type="text"
                name="search"
                placeholder="Найдите что-нибудь!"
                className="w-full p-2 rounded-l-md border border-gray-300"
              />
              <button type="submit" className="p-2 bg-light-blue text-dark-blue rounded-r-md">
                Поиск
              </button>
            </form>
          </>
        )}

        <div className="flex items-center ml-4">
          {user ? (
            user.user.is_admin ? (
              <div className="flex items-center">
                {user.user.profile_photo ? (
                  <img src={user.user.profile_photo} alt={`${user.user.first_name}`} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-20 h-10 bg-white rounded-full flex items-center justify-center">
                    <img src="/api/uploads/icons/general/profile.svg" alt="Profile" className="w-8 h-8 object-contain" />
                  </div>
                )}
                <span className="ml-2 text-light-blue hidden sm:inline">{user.user.first_name} {user.user.last_name}</span>
                <button
                  onClick={logout}
                  className="ml-4 py-2 px-4 bg-corall-red text-white rounded-md hover:bg-red-700"
                >
                  Выйти
                </button>
              </div>
            ) : (
              <Link to={`/user/${user.user.id}`} className="flex items-center">
                {user.user.profile_photo ? (
                  <img src={user.user.profile_photo} alt={`${user.user.first_name}`} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-20 h-10 bg-white rounded-full flex items-center justify-center">
                    <img src="/api/uploads/icons/general/profile.svg" alt="Profile" className="w-8 h-8 object-contain" />
                  </div>
                )}
                <span className="ml-2 text-light-blue hidden sm:inline">{user.user.first_name} {user.user.last_name}</span>
              </Link>
            )
          ) : (
            <Link to="/login" className="flex items-center text-light-blue">
              <div className="w-20 h-10 bg-white rounded-full flex items-center justify-center">
                <img src="/api/uploads/icons/general/profile.svg" alt="Profile" className="w-8 h-8 object-contain" />
              </div>
              <span className="ml-2 hidden sm:inline">Войти</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
