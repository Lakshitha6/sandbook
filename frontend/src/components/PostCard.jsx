import './PostCard.css';

export default function PostCard({ post, onDelete, showDeleteButton = false }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      onDelete(post.id);
    }
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <h3 className="post-title">{post.title}</h3>
        <span className="post-date">{formatDate(post.created_at)}</span>
      </div>
      
      <div className="post-content">
        <p>{post.content}</p>
      </div>
      
      {showDeleteButton && (
        <div className="post-actions">
          <button 
            onClick={handleDelete} 
            className="delete-btn"
            title="Delete post"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}