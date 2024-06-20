import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useDropzone } from 'react-dropzone';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const maxFileSize = 5 * 1024 * 1024; 

const CreatePost = () => {
  const { register, handleSubmit, watch, setValue } = useForm();
  const [categories, setCategories] = useState([]);
  const [isUsed, setIsUsed] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [open, setOpen] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const navigate = useNavigate();

  const watchedImages = watch('images');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories', { withCredentials: true });
        setCategories(response.data.data);
      } catch (error) {
        console.error('Ошибка при получении категорий', error);
      }
    };

    fetchCategories();

    const user = localStorage.getItem('user');
    const parsedUser = JSON.parse(user);
    if (!parsedUser) {
      navigate('/login');
    }
  }, [navigate]);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    const filePreviews = [...imagePreviews]; 
    const newFiles = new DataTransfer();
  
    if (watchedImages) {
      Array.from(watchedImages).forEach(file => newFiles.items.add(file));
    }
  
    acceptedFiles.forEach(file => {
      if (file.size > maxFileSize) {
        setError(`Файл ${file.name} слишком большой. Максимальный размер файла 5 MB.`);
        setOpen(true);
        return;
      }
  
      const reader = new FileReader();
      reader.onloadend = () => {
        filePreviews.push({ file, preview: reader.result });
        if (filePreviews.length === acceptedFiles.length + (watchedImages ? watchedImages.length : 0)) {
          setImagePreviews(filePreviews);
        }
      };
      reader.readAsDataURL(file);
      newFiles.items.add(file);
    });
  
    setValue('images', newFiles.files);
  
    rejectedFiles.forEach(file => {
      if (file.file.size > maxFileSize) {
        setError(`Файл ${file.file.name} слишком большой. Максимальный размер файла 5 MB.`);
        setOpen(true);
      } else if (!['image/jpeg', 'image/png'].includes(file.file.type)) {
        setError(`У файла ${file.file.name} неправильное расширение. Допускается добавление файлов формата PNG и JPG.`);
        setOpen(true);
      }
    });
  }, [setValue, imagePreviews, watchedImages]);
  

  const { getRootProps, getInputProps } = useDropzone({ 
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png']
    },
    maxSize: maxFileSize 
  });

  const handleRemoveImage = (index) => {
    const newImagePreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newImagePreviews);

    const newFiles = Array.from(watchedImages).filter((_, i) => i !== index);
    const dataTransfer = new DataTransfer();
    newFiles.forEach(file => dataTransfer.items.add(file));
    setValue('images', dataTransfer.files);
  };

  const onSubmit = async (data) => {
    const user = localStorage.getItem('user');
    const parsedUser = JSON.parse(user);
    if (!parsedUser) {
      setError('Пользователь не авторизован');
      setOpen(true);
      return;
    }

    const token = parsedUser.token;
    const userId = parsedUser.user.id.toString();

    const images = data.images ? Array.from(data.images) : [];

    if (images.length > 10) {
      setError('Максимальное количество фото: 10');
      setOpen(true);
      return;
    }


    try {
      const imageUrls = [];

      for (let i = 0; i < images.length; i++) {
        const formData = new FormData();
        formData.append('image', images[i]);

        const response = await axios.post('/api/upload-image', formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        });

        imageUrls.push(response.data.url);
      }

      const post = {
        title: data.title,
        description: data.description,
        category_id: data.categoryId,
        images: JSON.stringify(imageUrls),
        is_used: isUsed,
        user_id: userId,
        estimated_price: Number(data.estimatedPrice),
      };

      await axios.post('/api/post', post, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        withCredentials: true,
      });
      setSuccess('Ваше объявление было создано!');
      setError(null);
      setOpen(true);
      setTimeout(() => {
        navigate('/'); 
      }, 1500);
    } catch (error) {
      console.error('Ошибка при создании объявления', error);
      setError('Ошибка при создании объявления');
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
    <div className="max-w-md mx-auto mt-10">
      <div className="p-6 mb-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Выложите объявление</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Название
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              {...register('title')}
              maxLength={50} 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-dark-blue focus:border-dark-blue sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">Максимальная длина названия: 50 символов</p>
          </div>
          <div>
            <label htmlFor="images" className="block text-sm font-medium text-gray-700">
              Фото
            </label>
            <div
              {...getRootProps()}
              className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
            >
              <input {...getInputProps()} id="images" name="images" className="hidden"/>
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                </svg>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Нажмите для загрузки</span>
                </p>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>или перетащите файлы в эту область</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">PNG или JPG (макс. 5 МБ)</p>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">Максимальное количество фото: 10</p>
            <div className="mt-4 grid grid-cols-3 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img src={preview.preview} alt={`preview ${index}`} className="w-full h-auto object-cover rounded-md" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-corall-red text-white text-center rounded-full p-1 text-s w-7 h-8"
                  >
                    &#x2715;
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Описание
            </label>
            <textarea
              id="description"
              name="description"
              required
              {...register('description')}
              maxLength={500}  
              rows={3} 
              style={{ resize: 'none', overflow: 'hidden' }} 
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-dark-blue focus:border-dark-blue sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">Максимальная длина описания: 500 символов</p>
          </div>
          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
              Категория
            </label>
            <select
              id="categoryId"
              name="categoryId"
              required
              {...register('categoryId')}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-dark-blue focus:border-dark-blue sm:text-sm"
            >
              <option value="">Выберите категорию</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="estimatedPrice" className="block text-sm font-medium text-gray-700">
              Оценочная стоимость
            </label>
            <input
              id="estimatedPrice"
              name="estimatedPrice"
              type="number"
              required
              {...register('estimatedPrice')}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-dark-blue focus:border-dark-blue sm:text-sm"
              style={{ appearance: 'textfield' }} 
            />
            <p className="mt-1 text-xs text-gray-500">Укажите в этом поле целое число, в рублях</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Состояние</label>
            <div className="flex space-x-4">
              <button
                type="button"
                className={`py-2 px-4 border rounded-md shadow-sm text-sm font-medium ${
                  isUsed
                    ? 'bg-white text-gray-700 border-gray-300 hover:bg-dark-blue'
                    : 'bg-dark-blue text-white border-transparent hover:bg-light-blue'
                }`}
                onClick={() => setIsUsed(false)}
              >
                Новое
              </button>
              <button
                type="button"
                className={`py-2 px-4 border rounded-md shadow-sm text-sm font-medium ${
                  isUsed
                    ? 'bg-dark-blue text-white border-transparent hover:bg-light-blue'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-dark-blue'
                }`}
                onClick={() => setIsUsed(true)}
              >
                Б/у
              </button>
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-dark-blue hover:bg-light-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:dark-blue"
            >
              Выложить объявление
            </button>
          </div>
        </form>
      </div>

      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={error ? "error" : "success"} sx={{ width: '100%' }}>
          {error || success}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default CreatePost;
