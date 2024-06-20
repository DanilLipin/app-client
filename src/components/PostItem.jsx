import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import 'moment/locale/ru';

const PostItem = ({ post }) => {
  let firstImage = '/api/uploads/icons/general/no_photo.svg'; // Default image

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
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
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
          <span className='text-gray-600 text-sm'>Оценочная стоимость:</span>
        </div>
        <div className="mt-1">
          <span className='text-gray-600 text-sm'>{post.estimated_price} руб</span>
        </div>
        <div className="mt-2">
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
};

export default PostItem;
