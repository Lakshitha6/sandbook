import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from './axiosInstance';
import PostCard from '../components/PostCard';
import './css/Profile.css';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [postsError, setPostsError] = useState(null);
  const navigate = useNavigate();

  const fetchUserData = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/getUserData');
      setUser(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      
      // If token is invalid or expired, redirect to login
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      } else {
        setError('Failed to load user data');
        setLoading(false);
      }
    }
  }, [navigate]);

  const fetchUserPosts = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/getAllPostsById');
      setPosts(response.data);
      setPostsLoading(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      
      if (error.response && error.response.status === 404) {
        setPosts([]);
        setPostsLoading(false);
      } else if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      } else {
        setPostsError('Failed to load posts');
        setPostsLoading(false);
      }
    }
  }, [navigate]);

  const handleDeletePost = async (postId) => {
    try {
      await axiosInstance.delete(`/delete/${postId}`);
      // Remove post from state
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchUserPosts();
  }, [fetchUserData, fetchUserPosts]);

  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Redirect to login page
    navigate('/');
  };

  const handleCreatePost = () => {
    navigate('/createPost');
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchUserData} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <span className="avatar-text">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <h1 className="profile-title">My Profile</h1>
        </div>
        
        <div className="profile-content">
          <div className="profile-info">
            <div className="info-item">
              <label className="info-label">Name</label>
              <p className="info-value">{user?.name || 'N/A'}</p>
            </div>
            
            <div className="info-item">
              <label className="info-label">Email</label>
              <p className="info-value">{user?.email || 'N/A'}</p>
            </div>
            
            <div className="info-item">
              <label className="info-label">User ID</label>
              <p className="info-value">#{user?.id || 'N/A'}</p>
            </div>
          </div>
          
          <div className="profile-actions">
            <button className="edit-btn" onClick={handleCreatePost}>
              Create New Post
            </button>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="posts-section">
        <div className="posts-header">
          <h2>My Posts</h2>
          <span className="posts-count">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'}
          </span>
        </div>

        {postsLoading ? (
          <div className="posts-loading">
            <div className="spinner"></div>
            <p>Loading posts...</p>
          </div>
        ) : postsError ? (
          <div className="posts-error">
            <p>{postsError}</p>
            <button onClick={fetchUserPosts} className="retry-btn">
              Retry
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="no-posts">
            <p>You haven't created any posts yet.</p>
          </div>
        ) : (
          <div className="posts-list">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={handleDeletePost}
                showDeleteButton={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}