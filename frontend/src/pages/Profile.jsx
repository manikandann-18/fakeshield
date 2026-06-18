import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import { MapPin, Calendar, Edit3, UserCheck, UserPlus, Shield } from 'lucide-react';

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ bio: '', location: '' });

  const isMyProfile = !username || username === currentUser?.username;
  const targetUsername = username || currentUser?.username;

  useEffect(() => {
    fetchProfile();
  }, [targetUsername]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/users/${targetUsername}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileData(res.data);
      setEditForm({ bio: res.data.bio, location: res.data.location });
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('http://localhost:5000/api/users/profile', editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileData({ ...profileData, ...res.data });
      setEditing(false);
    } catch (err) {
      console.error('Error updating profile', err);
    }
  };

  const handleFollow = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/users/${profileData._id}/follow`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProfile(); // refresh followers count
    } catch (err) {
      console.error('Error following user', err);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading protocol...</div>;
  if (!profileData) return <div className="p-8 text-center text-slate-500">Entity not found.</div>;

  const isFollowing = profileData.followers?.includes(currentUser?.id);
  const avatar = profileData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileData.username}`;

  return (
    <div className="w-full pb-20">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 p-4 flex items-center">
        <span className="text-xl font-black tracking-tighter text-slate-800">{profileData.username}</span>
      </div>

      {/* Header Profile Info */}
      <div className="bg-white border-b border-slate-200 px-6 py-8">
        <div className="flex justify-between items-start">
          <img src={avatar} alt="avatar" className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-slate-100" />
          {isMyProfile ? (
            <button onClick={() => setEditing(!editing)} className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-full text-slate-700 font-bold hover:bg-slate-50 transition-colors">
              <Edit3 size={16} /> <span>Edit Profile</span>
            </button>
          ) : (
            <button onClick={handleFollow} className={`flex items-center space-x-2 px-6 py-2 rounded-full font-bold transition-colors shadow-sm ${isFollowing ? 'bg-slate-100 text-slate-800 border border-slate-200' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
              {isFollowing ? <><UserCheck size={16} /><span>Following</span></> : <><UserPlus size={16} /><span>Follow</span></>}
            </button>
          )}
        </div>

        <div className="mt-4">
          <h1 className="text-2xl font-black text-slate-900 flex items-center">
            {profileData.username} <Shield size={18} className="ml-2 text-blue-500 fill-blue-500" />
          </h1>
          <p className="text-slate-500 text-sm">@{profileData.username.toLowerCase().replace(/\s+/g, '_')}</p>
          
          {editing ? (
            <div className="mt-4 space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <textarea value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} className="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:border-blue-500" placeholder="Update your bio..." rows={3} />
              <input value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} className="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:border-blue-500" placeholder="Location..." />
              <div className="flex space-x-2 justify-end pt-2">
                <button onClick={() => setEditing(false)} className="px-4 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-full">Cancel</button>
                <button onClick={handleUpdateProfile} className="px-4 py-1.5 text-sm font-bold bg-blue-600 text-white rounded-full">Save Changes</button>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-slate-800">{profileData.bio}</p>
          )}

          <div className="flex items-center space-x-6 mt-4 text-sm text-slate-500">
            <div className="flex items-center space-x-1"><MapPin size={16} /> <span>{profileData.location}</span></div>
            <div className="flex items-center space-x-1"><Calendar size={16} /> <span>Joined {new Date(profileData.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span></div>
          </div>

          <div className="flex items-center space-x-4 mt-4 text-sm">
            <span className="text-slate-500 hover:underline cursor-pointer"><strong className="text-slate-900">{profileData.following?.length || 0}</strong> Following</span>
            <span className="text-slate-500 hover:underline cursor-pointer"><strong className="text-slate-900">{profileData.followers?.length || 0}</strong> Followers</span>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {profileData.posts?.length > 0 ? (
          profileData.posts.map(post => <PostCard key={post._id} post={post} onUpdate={fetchProfile} onDelete={fetchProfile} />)
        ) : (
          <div className="p-8 text-center text-slate-500 font-medium">No posts available.</div>
        )}
      </div>
    </div>
  );
}
