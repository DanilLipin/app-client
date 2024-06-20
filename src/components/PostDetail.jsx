import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/ru';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Carousel } from 'react-responsive-carousel';
import { useSnackbar } from 'notistack';
import Modal from 'react-modal';
import './ModalStyles.css';

Modal.setAppElement('#root');

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [similarPosts, setSimilarPosts] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isInChat, setIsInChat] = useState(false); // Добавляем состояние для проверки принадлежности к чату

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`/api/post/${id}`);
        setPost(response.data.data);

        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser && storedUser.user && String(storedUser.user.id) === response.data.data.user_id) {
          setIsOwner(true);
        }
        if (storedUser && storedUser.token) {
          setIsAuthenticated(true);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching post:', error);
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  useEffect(() => {
    const checkPostInChat = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser || !storedUser.token) {
        enqueueSnackbar('Пользователь неавторизован', { variant: 'error' });
        return;
      }

      const token = storedUser.token;

      try {
        const response = await axios.get(`/api/check-post-chat/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          withCredentials: true,
        });
        setIsInChat(response.data.belongs_to_chat);
      } catch (error) {
        console.error('Error checking post chat status:', error);
      }
    };

    if (isOwner) {
      checkPostInChat();
    }
  }, [id, isOwner, enqueueSnackbar, isInChat]);

  const handleDelete = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser || !storedUser.token) {
        enqueueSnackbar('Пользователь неавторизован', { variant: 'error' });
        return;
      }

      const token = storedUser.token;

      const response = await axios.delete(`/api/delete-post/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        withCredentials: true,
      });

      const serverMessage = response.data.message || 'Объявление успешно удалено';
      enqueueSnackbar(serverMessage, { variant: 'success' });
      
      setTimeout(() => {
        navigate(`/user/${post.user.id}`);
      }, 1500);
      
    } catch (error) {
      console.error('Ошибка при удалении объявления:', error);

      const errorMessage = error.response?.data?.message || 'Ошибка при удалении объявления';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  // Новая функция для мягкого удаления объявления
  const handleSoftDelete = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser || !storedUser.token) {
        enqueueSnackbar('Пользователь неавторизован', { variant: 'error' });
        return;
      }

      const token = storedUser.token;

      const response = await axios.put(`/api/soft-delete/${id}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        withCredentials: true,
      });

      const serverMessage = response.data.message || 'Объявление успешно перемещено в архив';
      enqueueSnackbar(serverMessage, { variant: 'success' });
      
      setTimeout(() => {
        navigate(`/user/${post.user.id}`);
      }, 1500);

    } catch (error) {
      console.error('Ошибка при перемещении объявления в архив:', error);

      const errorMessage = error.response?.data?.message || 'Ошибка при перемещении объявления в архив';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const fetchSimilarPosts = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser || !storedUser.token) {
        enqueueSnackbar('Пользователь неавторизован', { variant: 'error' });
        navigate('/login');
        return;
      }

      const userId = storedUser.user.id;
      const response = await axios.get(`/api/user/${userId}/posts-similar-price`, {
        params: { estimatedPrice: post.estimated_price },
        headers: { 'Authorization': `Bearer ${storedUser.token}` },
      });

      setSimilarPosts(response.data.data);
    } catch (error) {
      console.error('Ошибка при получении похожих объявлений:', error);
      enqueueSnackbar('Ошибка при получении похожих объявлений', { variant: 'error' });
    }
  };

  const handleOfferExchange = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchSimilarPosts();
      setModalIsOpen(true);
    }
  };

  const handleCreateChat = async (similarPostId) => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser || !storedUser.token) {
        enqueueSnackbar('Пользователь неавторизован', { variant: 'error' });
        navigate('/login');
        return;
      }

      const response = await axios.post('/api/create-chat', {
        post1_id: post.id,
        post2_id: similarPostId,
      }, {
        headers: { 'Authorization': `Bearer ${storedUser.token}` },
      });

      const chatId = response.data.data.id;
      navigate(`/chat/${chatId}`);
    } catch (error) {
      console.error('Ошибка при создании чата:', error);
      enqueueSnackbar('Ошибка при создании чата', { variant: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    );
  }

  if (!post) {
    return <div className="text-center">Объявление не найдено</div>;
  }

  let images = [];
  try {
    if (post.images) {
      const cleanedString = post.images.slice(1, -1).replace(/\\"/g, '"');
      const withoutBrackets = cleanedString.replace(/^\[|\]$/g, '');
      images = JSON.parse(`[${withoutBrackets}]`);
    }
  } catch (error) {
    console.error('Error parsing images:', error);
  }

  const handlePhoneClick = () => {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      window.location.href = `tel:${post.user.phone}`;
    } else {
      alert(`Для звонка наберите номер: ${post.user.phone}`);
    }
  };

  const getFirstImage = (images) => {
    let firstImage = '/api/uploads/icons/general/no_photo.svg';

    try {
      if (images) {
        const cleanedString = images.slice(1, -1).replace(/\\"/g, '"');
        const withoutBrackets = cleanedString.replace(/^\[|\]$/g, '');
        const parsedImages = JSON.parse(`[${withoutBrackets}]`);

        if (Array.isArray(parsedImages) && parsedImages.length > 0) {
          firstImage = parsedImages[0];
        }
      }
    } catch (error) {
      console.error('Error parsing images:', error);
    }

    return firstImage;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold" style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{post.title}</h1>
      </div>
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/2">
          {images.length > 0 ? (
            <Carousel showThumbs={false} dynamicHeight={true}>
              {images.map((image, index) => (
                <div key={index} className="relative w-full h-0" style={{ paddingBottom: '100%' }}>
                  <img
                    src={image}
                    alt={`${post.title} ${index + 1}`}
                    className="absolute top-0 left-0 w-full h-full object-contain bg-gray-200"
                  />
                </div>
              ))}
            </Carousel>
          ) : (
            <img
              src="/api/uploads/icons/general/no_photo.svg"
              alt="No photos"
              className="w-full h-full object-contain bg-gray-200"
            />
          )}
        </div>
        <div className="md:w-1/4 md:pl-4 flex flex-col mt-2 ml-2">
          <div className="flex items-center mb-4">
            <div className="mt-2 flex items-center">
              {post.user?.profile_photo && (
                <img
                  src={post.user.profile_photo}
                  alt={`${post.user.first_name} ${post.user.last_name}`}
                  className="w-12 h-12 rounded-full mr-3 object-cover"
                />
              )}
            </div>
            <div>
              <Link to={`/user/${post.user?.id}`} className="text-gray-800 font-semibold text-lg">
                {post.user.first_name} {post.user.last_name}
              </Link>
              <div className="text-gray-600 text-base">{moment(post.created_at).format('LLL')}</div>
            </div>
          </div>
          <div className="text-gray-700 mb-4">
            <span>Категория: </span>
            <Link to={`/categorie/${post.category?.id}`} className="text-gray-600 text-lg font-semibold hover:underline">
              {post.category?.name}
            </Link>
          </div>
          <div className="text-gray-700 mb-4">
            <span>Состояние: </span>
            <span className="text-gray-800 text-lg font-semibold">
              {post.is_used ? 'Б/у' : 'Новое'}
            </span>
          </div>
          <div className="text-gray-700 mb-4">
            <span>Оценочная стоимость: </span>
            <span className="text-gray-800 text-lg font-semibold">{post.estimated_price} руб.</span>
          </div>
        </div>
        <div className="md:w-1/4 flex flex-col space-y-2">
          {post.is_archive ? (
            <div className="w-full text-center bg-gray-300 text-gray-700 font-bold py-4 px-4 rounded">
              Объявление в архиве
            </div>
          ) : isOwner ? (
            isInChat ? (
              <>
                <div className="w-full text-center bg-gray-300 text-gray-700 font-bold py-4 px-4 rounded">
                  Вы не можете редактировать объявление
                </div>
                <button className="w-full bg-corall-red text-white font-bold py-4 px-4 rounded" onClick={handleSoftDelete}>
                  Удалить объявление
                </button>
              </>
            ) : (
              <>
                <Link to={`/posts/${id}/edit`}>
                  <button className="w-full bg-dark-blue text-white font-bold py-4 px-4 rounded">
                    Редактировать объявление
                  </button>
                </Link>
                <button className="w-full bg-corall-red text-white font-bold py-4 px-4 rounded" onClick={handleDelete}>
                  Удалить объявление
                </button>
              </>
            )
          ) : (
            <>
              <button onClick={handlePhoneClick} className="w-full bg-submarine-green text-white font-bold py-4 px-4 rounded">
                {post.user.phone}
              </button>
              <button className="w-full bg-dark-blue text-white font-bold py-4 px-4 rounded" onClick={handleOfferExchange}>
                Предложить обмен
              </button>
            </>
          )}
        </div>
      </div>
      <div className="mt-4">
        <h2 className="text-xl font-bold mb-2">Описание</h2>
        <p style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{post.description}</p>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Похожие объявления"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <div className="modal-header">
          <h2 className="text-xl font-bold mb-2">Ваши объявления, подходящие под обмен</h2>
          <button onClick={() => setModalIsOpen(false)} className="modal-close-button">
            <img src="/api/uploads/icons/general/close.svg" alt="Close" className="h-6 w-6"/>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {similarPosts.map((similarPost) => (
            <div key={similarPost.id} className="border rounded p-4 hover:bg-gray-100 hover:shadow-lg cursor-pointer" onClick={() => handleCreateChat(similarPost.id)}>
              <div className="bg-gray-200 w-full aspect-w-1 aspect-h-1 flex items-center justify-center mb-4">
                <img
                  src={getFirstImage(similarPost.images)}
                  alt={similarPost.title}
                  className="h-full w-full object-contain"
                />
              </div>
              <h3 className="text-lg font-semibold mb-2">{similarPost.title}</h3>
              <p className="text-gray-700 mb-2">Оценочная стоимость: {similarPost.estimated_price} руб.</p>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default PostDetail;