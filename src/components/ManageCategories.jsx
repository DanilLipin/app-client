import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useDropzone } from 'react-dropzone';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data.data);
    } catch (error) {
      console.error('Ошибка при получении категорий:', error);
    }
  };

  const handleCreateOrUpdateCategory = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await axios.put(`/api/admin/update-category/${editingId}`, { name, image: iconUrl });
        setSuccess('Категория успешно обновлена');
      } else {
        await axios.post('/api/admin/create-category', { name, image: iconUrl });
        setSuccess('Категория успешно создана');
      }
      setName('');
      setIconUrl('');
      setEditingId(null);
      fetchCategories();
    } catch (error) {
      setError('Произошла ошибка, попробуйте снова');
    } finally {
      setOpen(true);
    }
  };

  const handleEditCategory = (category) => {
    setName(category.name);
    setIconUrl(category.image);
    setEditingId(category.id);
  };

  const handleDeleteCategory = async (id) => {
    try {
      await axios.delete(`/api/admin/delete-category/${id}`);
      setSuccess('Категория успешно удалена');
      fetchCategories();
    } catch (error) {
      setError('Произошла ошибка, попробуйте снова');
    } finally {
      setOpen(true);
    }
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('/api/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setIconUrl(response.data.url);
    } catch (error) {
      setError('Ошибка при загрузке файла');
      setOpen(true);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'image/svg+xml',
    maxFiles: 1,
  });

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Управление категориями</h2>
      <form onSubmit={handleCreateOrUpdateCategory} className="mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Название категории
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-dark-blue focus:border-dark-blue"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Иконка категории
          </label>
          <div
            {...getRootProps()}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-dark-blue focus:border-dark-blue"
            style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Перетащите файл сюда ...</p>
            ) : (
              <p>Перетащите файл сюда или нажмите, чтобы выбрать файл (только SVG)</p>
            )}
          </div>
          {iconUrl && (
            <div className="mt-2">
              <img src={iconUrl} alt="Иконка категории" className="w-20 h-20" />
            </div>
          )}
        </div>
        <button
          type="submit"
          className="bg-dark-blue hover:bg-dark-blue text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-blue-200"
        >
          {editingId ? 'Обновить категорию' : 'Создать категорию'}
        </button>
      </form>

      <div>
        <h3 className="text-xl font-bold mb-4">Список категорий</h3>
        <ul>
          {categories.map((category) => (
            <li key={category.id} className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <img src={category.image} alt={category.name} className="w-6 h-6 mr-2" />
                <span>{category.name}</span>
              </div>
              <div>
                <button
                  onClick={() => handleEditCategory(category)}
                  className="bg-dark-blue hover:bg-dark-blue text-white font-bold py-1 px-2 rounded mr-2"
                >
                  Редактировать
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="bg-corall-red hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                >
                  Удалить
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={error ? 'error' : 'success'} sx={{ width: '100%' }}>
          {error || success}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ManageCategories;
