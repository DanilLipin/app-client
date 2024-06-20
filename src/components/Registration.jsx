import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import InputMask from 'react-input-mask';


const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null); 
  const [open, setOpen] = useState(false); 
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      setError("Пароль должен быть больше шести символов!");
      setSuccess(null);
      setOpen(true);
      return;
    }

    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      setSuccess(null);
      setOpen(true);
      return;
    }

    try {
      const response = await axios.post('/api/registration', {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        phone,
      });

      if (response.data.user) {
        setSuccess('Регистрация прошла успешно!'); 
        setError(null);
        setOpen(true);
        setTimeout(() => {
          navigate('/login'); 
        }, 1500); 
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data.message);
      } else {
        setError('Произошла ошибка, попробуйте снова');
      }
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
    <div className="flex justify-center items-center min-h-screen bg-light-blue p-4 sm:p-0">
      <div className="w-full max-w-md bg-white p-8 border border-gray-300 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Регистрация</h2>
        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
              Имя
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-dark-blue focus:border-dark-blue"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
              Фамилия
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-dark-blue focus:border-dark-blue"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-dark-blue focus:border-dark-blue"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
              Номер телефона
            </label>
            <InputMask
              mask="+7 (999) 999-9999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            >
              {() => (
                <input
                  type="text"
                  id="phone"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-dark-blue focus:border-dark-blue"
                />
              )}
            </InputMask>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Пароль
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-dark-blue focus:border-dark-blue"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
              Подтвердите пароль
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-dark-blue focus:border-dark-blue"
            />
          </div>
          <div className="mb-4">
            <label className="flex items-center text-gray-700 text-m mb-2">
              <input
                type="checkbox"
                required
                className="mr-2 focus:ring-dark-blue"
              />
              Согласие на обработку персональных данных
            </label>
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="w-full bg-dark-blue hover:bg-light-blue text-white hover:text-dark-blue font-bold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-blue-200"
            >
              Зарегистрироваться
            </button>
          </div>
        </form>
        <div className="mt-4 text-center">
          <p className="text-gray-700">
            У вас уже есть аккаунт? <Link to="/login" className="text-dark-blue hover:underline">Войти</Link>
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

export default Register;
