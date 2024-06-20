import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'moment/locale/ru';
import PostItem from './PostItem';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('created_at_desc');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`/api/posts?sort=${sort}`);
        setPosts(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setLoading(false);
      }
    };

    fetchPosts();
  }, [sort]);

  const handleSortChange = (e) => {
    setSort(e.target.value);
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

  return (
    <div className="bg-white min-h-screen container mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold mb-2 sm:mb-0">Все объявления</h1>
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {posts.map((post) => (
          <PostItem key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Home;
