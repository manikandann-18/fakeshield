import React, { useState } from 'react';
import api from '../services/api';

export default function CommentSection({ post, onUpdate }) {
  const [text, setText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const res = await api.post(`/posts/${post._id}/comment`, { text });
      onUpdate(res.data);
      setText('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mt-4 border-t pt-4">
      <h4 className="font-semibold text-sm mb-2 text-gray-700">Comments</h4>
      <div className="space-y-2 mb-3">
        {post.comments?.map((comment, index) => (
          <div key={index} className="text-sm bg-gray-50 p-2 rounded">
            <span className="font-bold mr-2">{comment.user?.username}</span>
            <span>{comment.text}</span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input 
          type="text" 
          value={text} 
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 p-2 border rounded text-sm focus:ring-1 focus:ring-blue-500"
        />
        <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
          Post
        </button>
      </form>
    </div>
  );
}
