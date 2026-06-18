import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import { Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [tab, setTab] = useState('foryou');
  const [currentUserData, setCurrentUserData] = useState(null);
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [postsRes, userRes] = await Promise.all([
        axios.get('http://localhost:5000/api/posts', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`http://localhost:5000/api/users/${user.username}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setPosts(postsRes.data);
      setCurrentUserData(userRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleNewPost = (post) => {
    setPosts([post, ...posts]);
  };

  const handleUpdatePost = (updatedPost) => {
    setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
  };

  const handleDeletePost = (postId) => {
    setPosts(posts.filter(p => p._id !== postId));
  };

  const displayedPosts = tab === 'following' && currentUserData
    ? posts.filter(p => 
        currentUserData.following?.includes(p.author?._id) || 
        currentUserData.followers?.includes(p.author?._id) || 
        p.author?._id === currentUserData._id
      )
    : posts;

  return (
    <div className="w-full">
      {/* Top Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 p-4 flex items-center justify-between">
        <span className="text-xl font-black tracking-tighter text-slate-800">Global Feed</span>
        <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold border border-emerald-200">
          <Activity size={12} className="animate-pulse mr-1" />
          <span>LIVE SQLITE STREAM</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white">
        <button onClick={() => setTab('foryou')} className={`flex-1 py-4 text-center text-sm font-bold relative transition-colors ${tab === 'foryou' ? 'text-slate-800' : 'text-slate-500 hover:text-slate-800'}`}>
          For You
          {tab === 'foryou' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-blue-600 rounded-full" />}
        </button>
        <button onClick={() => setTab('following')} className={`flex-1 py-4 text-center text-sm font-bold relative transition-colors ${tab === 'following' ? 'text-slate-800' : 'text-slate-500 hover:text-slate-800'}`}>
          Following
          {tab === 'following' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-blue-600 rounded-full" />}
        </button>
      </div>

      <CreatePost onPostCreated={handleNewPost} />
      
      <div className="divide-y divide-slate-100 pb-20">
        {displayedPosts.map(post => (
          <PostCard key={post._id} post={post} onUpdate={handleUpdatePost} onDelete={handleDeletePost} />
        ))}
        {displayedPosts.length === 0 && (
          <div className="p-8 text-center text-slate-500 font-medium">No posts available here.</div>
        )}
      </div>
    </div>
  );
}
