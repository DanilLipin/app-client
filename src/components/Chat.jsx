import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import 'moment/locale/ru';

const Chat = () => {
  const { id } = useParams();
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const userId = storedUser ? storedUser.user.id : null;
  const token = storedUser ? storedUser.token : null;
  const navigate = useNavigate();

  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const [exchangeConfirmed, setExchangeConfirmed] = useState(false);
  const [exchangeStatus, setExchangeStatus] = useState('В процессе');

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const response = await axios.get(`/api/chat/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          withCredentials: true,
        });
        setChat(response.data.chat);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching chat:', error);
        setLoading(false);
      }
    };

    if (userId && token) {
      fetchChat();
    } else {
      navigate('/login');
    }
  }, [id, userId, token, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      const fetchNewMessages = async () => {
        try {
          const response = await axios.get(`/api/chat/${id}/messages`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            withCredentials: true,
          });

          setChat((prevChat) => ({
            ...prevChat,
            messages: response.data.messages,
          }));
        } catch (error) {
          console.error('Error fetching new messages:', error);
        }
      };

      if (userId && token) {
        fetchNewMessages();
      }
    }, 3000); 
    return () => clearInterval(interval);
  }, [id, userId, token]);

  useEffect(() => {
    const fetchExchangeStatus = async () => {
      try {
        const response = await axios.get(`/api/exchange/${id}/${userId}/status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          withCredentials: true,
        });
        const status = response.data.status;
        setExchangeStatus(status);
        setExchangeConfirmed(status === 'Обмен завершен');

      } catch (error) {
        console.error('Ошибка при получении статуса обмена:', error);
      }
    };

    if (userId && token && chat) {
      fetchExchangeStatus();
    }
  }, [id, userId, token, chat]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      setError('Сообщение не может быть пустым');
      return;
    }

    try {
      await axios.post('/api/message', {
        content: newMessage,
        sender_id: userId,
        chat_room_id: parseInt(id, 10),
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        withCredentials: true,
      });

      setChat((prevChat) => ({
        ...prevChat,
        messages: [...prevChat.messages, { content: newMessage, sender_id: userId, user: storedUser.user, created_at: new Date() }]
      }));
      setNewMessage('');
    } catch (error) {
      console.error('Ошибка при отправке сообщения', error);
      setError('Ошибка при отправке сообщения');
    }
  };

  const handleConfirmExchange = async () => {
    try {
      const response = await axios.post(`/api/exchange/${userId}/confirm`, {
        chat_room_id: parseInt(id, 10),
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        withCredentials: true,
      });

      setExchangeStatus(response.data.status);
      if (response.data.status === 'Обмен завершен') {
        const userPost = chat.Posts.find(post => post.user_id === String(userId));
        const otherPost = chat.Posts.find(post => post.user_id !== String(userId));

        if (userPost && otherPost) {
          await axios.post(`/api/archive-posts/${userPost.id}/${otherPost.id}`, {}, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            withCredentials: true,
          });
        }
        setExchangeConfirmed(true);
      }
    } catch (error) {
      console.error('Ошибка при подтверждении обмена:', error);
      setError('Ошибка при подтверждении обмена');
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (!chat) {
    return <div>Чат не найден</div>;
  }

  const renderImages = (post) => {
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

    return <img src={firstImage} alt={post.title} className="h-full w-full object-contain" />;
  };

  const userPost = chat.Posts.find(post => post.user_id === String(userId));
  const otherPost = chat.Posts.find(post => post.user_id !== String(userId));

  return (
    <div className="container mx-auto px-4 py-8 relative" style={{ paddingBottom: '200px' }}>
      <h1 className="text-2xl font-bold mb-4 hidden md:block">Чат c пользователем {otherPost.user.first_name} {otherPost.user.last_name}</h1>
      <div className="flex flex-col md:flex-row justify-between items-start mb-6 bg-white shadow-md rounded-lg p-4">
        {otherPost && (
          <div className="w-1/6 bg-white mb-4 md:mb-0">
            <div className="bg-gray-200 w-full aspect-w-1 aspect-h-1 flex items-center justify-center mb-4 overflow-hidden rounded-lg">
              {renderImages(otherPost)}
            </div>
            <div className="text-center md:text-left hidden md:block">
              <h2 className="text-xl font-bold mb-2">{otherPost.title}</h2>
              <div className="flex flex-col items-center md:flex-row">
                {otherPost.user && (
                  <>
                    <img
                      src={otherPost.user.profile_photo || '/api/uploads/icons/general/profile.svg'}
                      alt={`${otherPost.user.first_name} ${otherPost.user.last_name}`}
                      className="w-10 h-10 rounded-full mb-2 md:mb-0 md:mr-2 object-cover"
                    />
                    <span>{otherPost.user.first_name} {otherPost.user.last_name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        {userPost && (
          <div className="w-1/6 bg-white mb-4 md:mb-0">
            <div className="bg-gray-200 w-full aspect-w-1 aspect-h-1 flex items-center justify-center mb-4 overflow-hidden rounded-lg">
              {renderImages(userPost)}
            </div>
            <div className="text-center md:text-right hidden md:block">
              <h2 className="text-xl font-bold mb-2">{userPost.title}</h2>
              <div className="flex flex-col items-center md:flex-row-reverse">
                {userPost.user && (
                  <>
                    <img
                      src={userPost.user.profile_photo || '/api/uploads/icons/general/profile.svg'}
                      alt={`${userPost.user.first_name} ${userPost.user.last_name}`}
                      className="w-10 h-10 rounded-full mb-2 md:mb-0 md:ml-2 object-cover"
                    />
                    <span>{userPost.user.first_name} {userPost.user.last_name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="divide-y divide-gray-200 mb-6 overflow-auto" style={{ paddingBottom: '120px' }}>
        {chat.messages.map((message) => (
          <div
            key={message.id}
            className={`py-4 ${message.sender_id === userId ? 'text-right' : 'text-left'}`}
          >
            <div className={`flex ${message.sender_id === userId ? 'justify-end' : ''} items-center`}>
              {message.sender && (
                <>
                  {message.sender_id !== userId && (
                    <img
                      src={message.sender.profile_photo || '/api/uploads/icons/general/no_photo.svg'}
                      alt={`${message.sender.first_name} ${message.sender.last_name}`}
                      className="w-8 h-8 rounded-full mr-2 object-cover"
                    />
                  )}
                  <span className="font-semibold">{message.sender.first_name} {message.sender.last_name}</span>
                  {message.sender_id === userId && (
                    <img
                      src={message.sender.profile_photo || '/api/uploads/icons/general/no_photo.svg'}
                      alt={`${message.sender.first_name} ${message.sender.last_name}`}
                      className="w-8 h-8 rounded-full ml-2 object-cover"
                    />
                  )}
                </>
              )}
              <span className="text-sm text-gray-600 ml-2">{moment(message.created_at).format('LLL')}</span>
            </div>
            <p className={`mt-2 ${message.sender_id === userId ? 'bg-light-blue' : 'bg-gray-100'} p-2 rounded-md inline-block`} style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {message.content}
            </p>
          </div>
        ))}
      </div>
      <div className="fixed bottom-0 left-0 w-full bg-white p-4 border-t border-gray-300 shadow-lg">
        <div className="flex items-start">
          <div className="flex-grow">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Введите сообщение"
              maxLength={500}
              rows={1}
              style={{ resize: 'none', overflow: 'hidden' }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="ml-2 flex items-center">
            <button
              onClick={handleSendMessage}
              className="py-2 px-3 rounded-full shadow-sm text-white bg-light-blue hover:bg-white"
              style={{ height: '3rem', width: '3rem' }}
            >
              <img src="/api/uploads/icons/general/paperplane.svg" alt="Send" className="w-6 h-6"/>
            </button>
          </div>
        </div>
        {error && (
          <div className="text-red-500 text-sm mt-2">
            {error}
          </div>
        )}
        {!exchangeConfirmed && (
          <div className="mt-6">
            <button
              onClick={handleConfirmExchange}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-submarine-green"
              disabled={exchangeStatus === 'Обмен подтвержден, ожидается подтверждение от другого пользователя'}
            >
              Подтвердить обмен
            </button>
            <div className="text-sm mt-2">
              {exchangeStatus}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
