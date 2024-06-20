import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/ru';

const CategoryPosts = () => {
  const { id } = useParams();
  const [posts, setPosts] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState('created_at_desc');

  useEffect(() => {
    const fetchCategoryAndPosts = async () => {
      try {
        const postsResponse = await axios.get(`/api/category/${id}?sort=${sort}`);
        setPosts(postsResponse.data);

        const categoriesResponse = await axios.get('/api/categories');
        const category = categoriesResponse.data.data.find(category => category.id === parseInt(id));
        
        if (category) {
          setCategoryName(category.name);
        } else {
          setError('Категория не найдена');
        }

        setLoading(false);
      } catch (error) {
        setError('Ошибка при загрузке данных');
        setLoading(false);
      }
    };

    fetchCategoryAndPosts();
  }, [id, sort]);

  const handleSortChange = (e) => {
    setSort(e.target.value);
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto mt-10 sm:mt-5 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold mb-2 sm:mb-0">Объявления категории: {categoryName}</h1>
        <div className="w-full sm:w-auto mt-2 sm:mt-0 sm:ml-2 sm:mr-2">
          <label htmlFor="sort" className="mr-2 block sm:inline">Сортировать по:</label>
          <select
            id="sort"
            value={sort}
            onChange={handleSortChange}
            className="border px-2 py-1 rounded w-full sm:w-auto"
          >
            <option value="created_at_desc">Новые</option>
            <option value="created_at_asc">Старые</option>
            <option value="estimated_price_desc">По убыванию цены</option>
            <option value="estimated_price_asc">По возрастанию цены</option>
          </select>
        </div>
      </div>
      {posts.length === 0 ? (
        <div>Нет объявлений в этой категории</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {posts.map((post) => {
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
              <div key={post.id} className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="bg-gray-200 w-full aspect-w-1 aspect-h-1 flex items-center justify-center">
                  {firstImage && (
                    <img src={firstImage} alt={post.title} className="h-full w-full object-contain" />
                  )}
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-2">
                    <Link to={`/posts/${post.id}`} className="hover:underline" style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                      {post.title}
                    </Link>
                  </h2>
                  <div className="mt-2 flex items-center">
                    {post.user?.profile_photo && (
                      <img
                        src={post.user.profile_photo}
                        alt={`${post.user.first_name} ${post.user.last_name}`}
                        className="w-10 h-10 rounded-full mr-2 object-cover"
                      />
                    )}
                    <Link to={`/user/${post.user?.id}`} className="text-gray-600 text-sm hover:underline">
                      {post.user.first_name} {post.user.last_name}
                    </Link>
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
          })}
        </div>
      )}
    </div>
  );
};

export default CategoryPosts;
