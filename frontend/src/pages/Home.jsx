import { useState, useEffect } from 'react';
import axiosInstance from './axiosInstance';
import './css/Home.css';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFriendPosts();
  }, []);

  const fetchFriendPosts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosInstance.get('/friends/posts');
      setPosts(response.data);
    } catch (err) {
      console.error('Error fetching friend posts:', err);
      if (err.response?.status === 404) {
        setPosts([]);
        setError('No posts from friends found');
      } else {
        setError('Failed to load posts');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  const refreshPosts = () => {
    fetchFriendPosts();
  };

  if (loading) {
    return (
      <div className="homefeed-container">
        <div className="homefeed-header">
          <div className="homefeed-header-text">
            <h1>Home Feed</h1>
          </div>
        </div>
        <div className="homefeed-loading-container">
          <div className="homefeed-loading-spinner"></div>
          <p>Loading your feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="homefeed-container">
      <div className="homefeed-header">
        <div className="homefeed-header-text">
          <h1>Home Feed</h1>
        </div>
        <button className="homefeed-refresh-btn" onClick={refreshPosts}>
          <span className="homefeed-refresh-icon">↻</span>
          Refresh
        </button>
      </div>

      {error && posts.length === 0 && (
        <div className="homefeed-empty-feed">
          <div className="homefeed-empty-icon">📱</div>
          <h3>Your feed is empty</h3>
          <p>{error}</p>
          <button className="homefeed-refresh-btn" onClick={refreshPosts}>
            Try Again
          </button>
        </div>
      )}

      {posts.length > 0 && (
        <div className="homefeed-posts-container">
          {posts.map((post, index) => (
            <div key={index} className="homefeed-postcard">
              <div className="homefeed-postcard-header">
                <div className="homefeed-useravatar">
                  {getInitials(post.friend_name)}
                </div>
                <div className="homefeed-postmeta">
                  <h3 className="homefeed-username">{post.friend_name}</h3>
                  <span className="homefeed-posttime">{formatDate(post.created_at)}</span>
                </div>
              </div>
              
              <div className="homefeed-postcontent">
                {post.title && <h2 className="homefeed-posttitle">{post.title}</h2>}
                <p className="homefeed-posttext">{post.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && posts.length > 0 && (
        <div className="homefeed-error-banner">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}