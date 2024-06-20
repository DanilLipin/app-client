import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import 'moment/locale/ru';

const UserChats = () => {
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const userId = storedUser ? storedUser.user.id : null;
  const token = storedUser ? storedUser.token : null;
  const navigate = useNavigate();

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get(`/api/user/${userId}/chats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          withCredentials: true,
        });
        setChats(response.data.chats);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user chats:', error);
        setLoading(false);
      }
    };

    if (userId && token) {
      fetchChats();
    } else {
      navigate('/login');
    }
  }, [userId, token, navigate]);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Ваши чаты</h1>
      {chats.length === 0 ? (
        <p>У вас пока нет чатов. Предложите кому-нибудь обмен!</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {chats.map((chat) => (
            <li 
              key={chat.id} 
              className="py-4 rounded-lg border border-gray-300 shadow-md p-4 mb-4 hover:bg-gray-100 hover:shadow-lg cursor-pointer"
              onClick={() => navigate(`/chat/${chat.id}`)}
            >
              <div className="mt-2">
                <div className="flex items-center mt-2">
                  {chat.Posts.map((post, index) => {
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
                      <React.Fragment key={post.id}>
                        <div className="mr-2">
                          {firstImage && (
                            <img src={firstImage} alt={`Post ${post.id}`} className="w-32 h-32 object-cover rounded-md" />
                          )}
                          <p className="mt-2 text-gray-800" style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>{post.title}</p>
                        </div>
                        {index === 0 && chat.Posts.length > 1 && (
                          <img src="/api/uploads/icons/general/arrows.svg" alt="Arrow" className="mx-2 w-8 h-8" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
                <span className="text-gray-600 text-sm">{moment(chat.created_at).format('LLL')}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserChats;
