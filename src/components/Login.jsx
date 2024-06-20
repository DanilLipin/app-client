import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useUser } from './UserContext'; 

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Login = () => {
  const { updateUser } = useUser(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null); 
  const [open, setOpen] = useState(false); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('/api/login', {
        email,
        password,
      });

      const { token, user } = response.data;
      updateUser({ token, user }); 

      setSuccess('Вы успешно вошли в систему!'); 
      setError(null); 
      setOpen(true); 

      setTimeout(() => {
        if (user.is_admin) {
          console.log(user.is_admin)
          navigate(`/admin`);
        } else {
          navigate(`/user/${user.id}`);
        }
      }, 1500); 
    } catch (error) {
      console.error('Ошибка при входе', error);
      const errorMessage = error.response?.data?.message || 'Ошибка при входе. Пожалуйста, проверьте свои учетные данные и попробуйте снова.';
      setError(errorMessage); 
      setSuccess(null); 
      setOpen(true); 
    }
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-light-blue p-4 sm:p-0">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Вход</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Электронная почта
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-dark-blue focus:border-dark-blue sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Пароль
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-dark-blue focus:border-dark-blue sm:text-sm"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:text-dark-blue bg-dark-blue hover:bg-light-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Войти
            </button>
          </div>
        </form>
        <div className="mt-4 text-center">
          <p className="text-gray-700">
            У вас ещё нет аккаунта? <Link to="/registration" className="text-dark-blue hover:underline">Зарегистрируйтесь!</Link>
          </p>
        </div>
      </div>

      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={error ? "error" : "success"} sx={{ width: '100%' }}>
          {error || success}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Login;
