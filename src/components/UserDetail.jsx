import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/ru';
import { useUser } from './UserContext';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userDetail, setUserDetail] = useState(null);
  const [activePosts, setActivePosts] = useState([]);
  const [archivedPosts, setArchivedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const { user: currentUser, logout } = useUser();
  const [showActivePosts, setShowActivePosts] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await axios.get(`/api/user/${id}`);
        setUserDetail(userResponse.data.data);

        // Проверка авторизации пользователя
        if (currentUser && currentUser.user.id === userResponse.data.data.id) {
          setIsOwner(true);
        } else {
          setIsOwner(false);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const fetchUserPosts = async () => {
      try {
        const postsResponse = await axios.get(`/api/user/${id}/posts`);
        const posts = postsResponse.data.data;

        if (isOwner) {
          setActivePosts(posts.filter(post => !post.is_archive));
        } else {
          setActivePosts(posts.filter(post => !post.is_archive && post.is_submit));
        }

        setArchivedPosts(posts.filter(post => post.is_archive));
      } catch (error) {
        console.error('Error fetching user posts:', error);
      }
    };

    fetchUserData();
    fetchUserPosts();
    setLoading(false);
  }, [id, currentUser, isOwner]);

  const handleLogout = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      await axios.get('/api/logout', {
        headers: {
          'Authorization': `Bearer ${storedUser.token}`,
        },
        withCredentials: true,
      });
      logout(); // вызов функции logout из контекста
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
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

  if (!userDetail) {
    return <div className="text-center">Пользователь не найден</div>;
  }

  const renderPosts = (posts) => {
    return posts.map((post) => {
      let firstImage = '/api/uploads/icons/general/no_photo.svg';
      try {
        if (post.images) {
          const cleanedString = post.images.slice(1, -1).replace(/\\"/g, '"');
          const withoutBrackets = cleanedString.replace(/^\[|\]$/g, '');
          const images = JSON.parse(`[${withoutBrackets}]`);

          if (Array.isArray(images) && images.length > 0) {
            firstImage = images[0];
          }
        }
      } catch (error) {
        console.error('Error parsing images:', error);
      }

      return (
        <div key={post.id} className="bg-white shadow-md rounded-lg overflow-hidden relative">
          <div className="bg-gray-200 w-full aspect-w-1 aspect-h-1 flex items-center justify-center relative">
            {firstImage && (
              <img src={firstImage} alt={post.title} className="h-full w-full object-contain" />
            )}
            {!post.is_submit && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="text-white text-xl font-bold">На проверке</span>
              </div>
            )}
          </div>
          <div className="p-4">
            <h2 className="text-xl font-bold mb-2">
              {post.is_submit ? (
                <Link to={`/posts/${post.id}`} className="hover:underline" style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                  {post.title}
                </Link>
              ) : (
                <span className="text-gray-500" style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{post.title}</span>
              )}
            </h2>
            <div className="mt-2 flex items-center">
              {post.user?.profile_photo && (
                <img
                  src={post.user.profile_photo}
                  alt={`${post.user.first_name} ${post.user.last_name}`}
                  className="w-10 h-10 rounded-full mr-2 object-cover"
                />
              )}
              <span className="text-gray-600 text-sm">{post.user?.first_name} {post.user?.last_name}</span>
            </div>
            <div className="mt-4">
              <Link to={`/categorie/${post.category?.id}`} className="text-gray-600 text-sm hover:underline">
                {post.category?.name}
              </Link>
            </div>
            <div className="mt-2">
              <span className="text-gray-600 text-sm">{moment(post.created_at).format('LLL')}</span>
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <img
              src={userDetail.profile_photo}
              alt={`${userDetail.first_name} ${userDetail.last_name}`}
              className="w-24 h-24 rounded-full object-cover mr-4"
            />
            <div>
              <h1 className="text-2xl font-bold">{userDetail.first_name} {userDetail.last_name}</h1>
              <p className="text-gray-600">Дата регистрации: {moment(userDetail.created_at).format('LLL')}</p>
              <p>Email: {userDetail.email}</p>
              <p>Телефон: {userDetail.phone}</p>
            </div>
          </div>
          {isOwner && (
            <div className="ml-auto flex flex-col items-center w-full md:w-48">
              <button
                onClick={() => navigate('/create-post')}
                className="bg-dark-blue text-white px-4 py-2 rounded-md mb-2 w-full"
              >
                Выложить объявление
              </button>
              <button
                onClick={() => navigate('/chats')}
                className="bg-dark-blue text-white px-4 py-2 rounded-md mb-2 w-full"
              >
                Ваши чаты
              </button>
              <button
                onClick={handleLogout}
                className="bg-corall-red text-white px-4 py-2 rounded-md w-full"
              >
                Выйти из аккаунта
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="text-center text-lg md:text-xl mb-6">
        <button
          className={`mx-4 my-2 px-4 py-2 rounded-md ${showActivePosts ? 'bg-dark-blue text-white' : 'bg-gray-200 text-black'}`}
          onClick={() => setShowActivePosts(true)}
        >
          Активные объявления
        </button>
        <button
          className={`mx-4 my-2 px-4 py-2 rounded-md ${!showActivePosts ? 'bg-dark-blue text-white' : 'bg-gray-200 text-black'}`}
          onClick={() => setShowActivePosts(false)}
        >
          Архивные объявления
        </button>
      </div>

      {showActivePosts ? (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {renderPosts(activePosts)}
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {renderPosts(archivedPosts)}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetail;
