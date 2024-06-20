import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import PostItem from './PostItem';

const SearchResults = () => {
  const location = useLocation();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get('query');

    const fetchResults = async () => {
      try {
        const response = await axios.get(`/api/search-posts?query=${query}`);
        setResults(response.data.data);
        setLoading(false);
      } catch (error) {
        setError('Ошибка при выполнении поиска');
        setLoading(false);
      }
    };

    fetchResults();
  }, [location.search]);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Результаты поиска</h1>
      {results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {results.map((post) => (
            <PostItem key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p>Нет результатов</p>
      )}
    </div>
  );
};

export default SearchResults;
