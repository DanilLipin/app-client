import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from './UserContext';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

const AdminPanel = () => {
  const { user } = useUser();
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNonSubmitPosts = async () => {
      try {
        const response = await axios.get('/api/admin/non-submit-posts', {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        setPosts(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching non-submit posts:', error);
        setError('Не удалось загрузить объявления');
        setLoading(false);
      }
    };

    fetchNonSubmitPosts();
  }, [user.token]);

  const handleSubmitPost = async (id) => {
    try {
      await axios.put(`/api/admin/post/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      setPosts((prevPosts) => prevPosts.filter(post => post.id !== id));
    } catch (error) {
      console.error('Error submitting post:', error);
      setError('Не удалось подтвердить объявление');
    }
  };

  const handleDeletePost = async (id) => {
    try {
      await axios.delete(`/api/delete-post/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      setPosts((prevPosts) => prevPosts.filter(post => post.id !== id));
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Не удалось удалить объявление');
    }
  };

  const parseImages = (imagesString) => {
    let imagesArray = ['/api/uploads/icons/general/no_photo.svg']; // Default image
    try {
      if (imagesString) {
        const cleanedString = imagesString.slice(1, -1).replace(/\\"/g, '"');
        const withoutBrackets = cleanedString.replace(/^\[|\]$/g, '');
        const images = JSON.parse(`[${withoutBrackets}]`);

        if (Array.isArray(images) && images.length > 0) {
          imagesArray = images;
        }
      }
    } catch (error) {
      console.error('Error parsing images:', error);
    }
    return imagesArray;
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Неподтвержденные объявления</h2>
      {posts.length === 0 ? (
        <div>Нет неподтвержденных объявлений</div>
      ) : (
        <ul className="space-y-4">
          {posts.map((post) => (
            <li key={post.id} className="flex flex-col md:flex-row justify-between items-center p-4 bg-white rounded shadow-md">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSubmitPost(post.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-submrine-green"
                    >
                      ✔
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-corall-red"
                    >
                      ✘
                    </button>
                  </div>
                </div>
                <div className="flex justify-left mb-2 w-64 h-64">
                  <Carousel
                    showThumbs={false}
                    dynamicHeight={true}
                    className="relative overflow-hidden max-w-xs max-h-xs"
                  >
                    {parseImages(post.images).map((image, index) => (
                      <div key={index} className="relative w-64 h-64">
                        <img
                          src={image}
                          alt={`${post.title} ${index + 1}`}
                          className="absolute top-0 left-0 w-full h-full object-contain bg-gray-200"
                        />
                      </div>
                    ))}
                  </Carousel>
                </div>
                <p className="text-black">Описание:</p>
                <p className="text-black" style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {post.description}
                </p>
                <p className="text-black">Категория: {post.category.name}</p>
                <p className="text-black">Пользователь: {post.user.first_name} {post.user.last_name}</p>
              </div>

            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminPanel;
